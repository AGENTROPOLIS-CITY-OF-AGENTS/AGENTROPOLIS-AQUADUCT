import { createHash } from 'node:crypto';

export const CAPABILITIES = Object.freeze(['SEND', 'BRIDGE', 'SWAP', 'UNIFIED_BALANCE', 'ONRAMP', 'EARN']);

export const STATUS = Object.freeze({
  PENDING: 'PENDING',
  SETTLED: 'SETTLED',
  FAILED: 'FAILED',
  REFUSED: 'REFUSED'
});

export const ARC_TESTNET_CHAIN_ID = 5042002;
export const ARC_MAINNET_CHAIN_ID = 5042;

export const ARC_CHAINS = Object.freeze({
  [ARC_TESTNET_CHAIN_ID]: Object.freeze({
    chain_id: ARC_TESTNET_CHAIN_ID,
    name: 'Arc Testnet',
    role: 'proving',
    allowed: true,
    gas_asset: 'USDC',
    usdc_interfaces: Object.freeze(['native', 'erc20'])
  }),
  [ARC_MAINNET_CHAIN_ID]: Object.freeze({
    chain_id: ARC_MAINNET_CHAIN_ID,
    name: 'Arc Mainnet',
    role: 'production',
    allowed: false,
    rpc: 'https://rpc.mainnet.arc.io',
    explorer: 'https://explorer.arc.io',
    gas_asset: 'USDC',
    usdc_interfaces: Object.freeze(['native', 'erc20'])
  })
});

export const LIVE_HARNESS_FLAG = 'AQUADUCT_LIVE_HARNESS';
export const LIVE_HARNESS_DISABLED = `live harness disabled: set ${LIVE_HARNESS_FLAG}=1 and install @circle-fin/app-kit @circle-fin/adapter-viem-v2 viem as an operator step`;

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value) {
  return createHash('sha256').update(typeof value === 'string' ? value : canonicalJson(value)).digest('hex');
}

export function record({ status, state, tx_ref = null, fee_quotes = [], net_amount = 0, ...extra }) {
  return { status, state, tx_ref, fee_quotes, net_amount, ...extra };
}

export function refusal(state, reason, extra = {}) {
  return record({ status: STATUS.REFUSED, state, refusal_reason: reason, ...extra });
}

export function chainRefusal(intent) {
  const chainId = intent?.payload?.chain_id;
  const chain = ARC_CHAINS[chainId];
  if (!chain) return refusal('CHAIN_UNKNOWN', `chain ${chainId} is not configured for the harness`, { chain_id: chainId ?? null });
  if (!chain.allowed) {
    return refusal('MAINNET_DISABLED', `chain ${chainId} (${chain.name}) is metadata-only; live execution is disabled`, {
      chain_id: chainId
    });
  }
  return null;
}

function assertIntent(intent) {
  for (const key of ['intent_id', 'kind', 'actor_ref', 'mandate_ref', 'payload']) {
    if (intent?.[key] === undefined || intent[key] === null) throw new TypeError(`intent.${key} is required`);
  }
}

function totalFee(feeQuotes) {
  return feeQuotes.reduce((sum, fee) => sum + fee.amount, 0);
}

const BRIDGE_STATES = ['BURNED', 'ATTESTED', 'MINTED'];

export class MockCircleAppKitProvider {
  #capabilities;
  #seed;
  #balances = new Map();
  #executions = new Map();
  #bridges = new Map();
  #positions = new Map();
  #counter = 0;

  constructor({ capabilities = CAPABILITIES, seed = {} } = {}) {
    this.#capabilities = [...capabilities];
    this.#seed = {
      bridgeFailAfterBurn: false,
      swapSlippageBps: 0,
      apiKeyHandle: 'CIRCLE_API_KEY_HANDLE',
      initialBalance: 1000,
      ...seed
    };
  }

  withSeed(seed) {
    return new MockCircleAppKitProvider({ capabilities: this.#capabilities, seed: { ...this.#seed, ...seed } });
  }

  get provider_ref() {
    return 'mock-circle-app-kit';
  }

  capabilities() {
    return [...this.#capabilities];
  }

  #txRef(prefix) {
    this.#counter += 1;
    return `${prefix}:${sha256(`${this.provider_ref}:${prefix}:${this.#counter}`).slice(0, 16)}`;
  }

  #balanceOf(ref) {
    if (!this.#balances.has(ref)) this.#balances.set(ref, ref.startsWith('unified:') ? 0 : this.#seed.initialBalance);
    return this.#balances.get(ref);
  }

  #adjust(ref, delta) {
    this.#balances.set(ref, this.#balanceOf(ref) + delta);
  }

  #feesFor(intent) {
    const amount = intent.payload.amount ?? 0;
    switch (intent.kind) {
      case 'SEND':
        return [{ kind: 'gas', asset: 'USDC', amount: 0.01 }];
      case 'BRIDGE':
        return [
          { kind: 'gas', asset: 'USDC', amount: 0.01 },
          { kind: 'bridge', asset: 'USDC', amount: Math.max(0.05, amount * 0.001) }
        ];
      case 'SWAP':
        return [
          { kind: 'gas', asset: 'USDC', amount: 0.01 },
          { kind: 'provider', asset: 'USDC', amount: Math.max(0.02, amount * 0.003) }
        ];
      case 'UNIFIED_BALANCE_DEPOSIT':
      case 'UNIFIED_BALANCE_SPEND':
        return [{ kind: 'gas', asset: 'USDC', amount: 0.005 }];
      case 'EARN_DEPOSIT':
      case 'EARN_WITHDRAW':
        return [{ kind: 'gas', asset: 'USDC', amount: 0.01 }];
      default:
        return [];
    }
  }

  quote(intent) {
    assertIntent(intent);
    const refused = chainRefusal(intent);
    if (refused) return refused;
    const fees = this.#feesFor(intent);
    const fee = totalFee(fees);
    const amount = intent.payload.amount ?? 0;
    const { maxTotalFee, maxSlippageBps } = intent.payload;
    if (maxTotalFee !== undefined && fee > maxTotalFee) {
      return refusal('FEE_LIMIT_EXCEEDED', `total fee ${fee} exceeds maxTotalFee ${maxTotalFee}`, { fee_quotes: fees });
    }
    let slippageBps = 0;
    if (intent.kind === 'SWAP') {
      slippageBps = this.#seed.swapSlippageBps;
      if (maxSlippageBps !== undefined && slippageBps > maxSlippageBps) {
        return refusal('SLIPPAGE_BREACH', `expected slippage ${slippageBps}bps exceeds maxSlippageBps ${maxSlippageBps}`, {
          fee_quotes: fees,
          slippage_bps: slippageBps
        });
      }
    }
    const net = Math.round((amount - fee) * (1 - slippageBps / 10000) * 1e6) / 1e6;
    const quote = {
      intent_id: intent.intent_id,
      kind: intent.kind,
      chain_id: intent.payload.chain_id,
      dest_chain_id: intent.payload.dest_chain_id ?? null,
      recipient: intent.payload.recipient ?? null,
      amount,
      fee_quotes: fees,
      net_amount: net,
      slippage_bps: slippageBps,
      usdc_interface: intent.payload.usdc_interface ?? 'native'
    };
    return record({
      status: STATUS.PENDING,
      state: 'QUOTED',
      fee_quotes: fees,
      net_amount: net,
      quote,
      quote_hash: sha256(quote),
      expires_at: intent.payload.quote_ttl_s === 0 ? 'EXPIRED' : 'VALID'
    });
  }

  execute(intent, boundQuoteHash) {
    assertIntent(intent);
    const refused = chainRefusal(intent);
    if (refused) return refused;
    if (this.#executions.has(intent.intent_id)) {
      return { ...this.#executions.get(intent.intent_id), replayed: true };
    }
    const quote = this.quote(intent);
    if (quote.status === STATUS.REFUSED) return quote;
    if (!boundQuoteHash || boundQuoteHash !== quote.quote_hash) {
      return refusal('QUOTE_MISMATCH', 'bound quote hash does not match the quote derived from this intent', {
        quote_hash: quote.quote_hash
      });
    }
    if (quote.expires_at === 'EXPIRED') return refusal('QUOTE_EXPIRED', 'bound quote has expired');
    if (intent.payload.signer_available === false) return refusal('SIGNER_UNAVAILABLE', 'scoped signer handle unavailable');

    const amount = intent.payload.amount ?? 0;
    let result;
    switch (intent.kind) {
      case 'SEND': {
        if (this.#balanceOf(intent.actor_ref) < amount) {
          result = record({ status: STATUS.FAILED, state: 'INSUFFICIENT_BALANCE', fee_quotes: quote.fee_quotes });
          break;
        }
        this.#adjust(intent.actor_ref, -amount);
        this.#adjust(intent.payload.recipient, quote.net_amount);
        result = record({
          status: STATUS.SETTLED,
          state: 'FINALIZED',
          tx_ref: this.#txRef('arc-tx'),
          fee_quotes: quote.fee_quotes,
          net_amount: quote.net_amount,
          recipient: intent.payload.recipient,
          finality: 'deterministic'
        });
        break;
      }
      case 'BRIDGE': {
        this.#adjust(intent.actor_ref, -amount);
        const bridge = { stateIndex: 0, quote, failed: false };
        this.#bridges.set(intent.intent_id, bridge);
        result = this.#bridgeRecord(intent.intent_id);
        break;
      }
      case 'SWAP': {
        this.#adjust(intent.actor_ref, -amount);
        result = record({
          status: STATUS.SETTLED,
          state: 'SWAPPED',
          tx_ref: this.#txRef('arc-swap'),
          fee_quotes: quote.fee_quotes,
          net_amount: quote.net_amount,
          output_asset: intent.payload.output_asset ?? 'USDC',
          slippage_bps: quote.quote.slippage_bps
        });
        break;
      }
      case 'UNIFIED_BALANCE_DEPOSIT': {
        this.#adjust(intent.actor_ref, -amount);
        this.#adjust(`unified:${intent.actor_ref}`, quote.net_amount);
        result = record({
          status: STATUS.SETTLED,
          state: 'DEPOSITED',
          tx_ref: this.#txRef('arc-ub'),
          fee_quotes: quote.fee_quotes,
          net_amount: quote.net_amount
        });
        break;
      }
      case 'UNIFIED_BALANCE_SPEND': {
        const unified = `unified:${intent.actor_ref}`;
        if (this.#balanceOf(unified) < amount) {
          result = record({ status: STATUS.FAILED, state: 'INSUFFICIENT_UNIFIED_BALANCE', fee_quotes: quote.fee_quotes });
          break;
        }
        this.#adjust(unified, -amount);
        this.#adjust(intent.payload.recipient, quote.net_amount);
        result = record({
          status: STATUS.SETTLED,
          state: 'SPENT',
          tx_ref: this.#txRef('arc-ub'),
          fee_quotes: quote.fee_quotes,
          net_amount: quote.net_amount,
          delegated_authority_ref: intent.mandate_ref
        });
        break;
      }
      default:
        result = refusal('UNSUPPORTED_KIND', `kind ${intent.kind} is not executable via execute()`);
    }
    if (result.status !== STATUS.REFUSED) this.#executions.set(intent.intent_id, result);
    return result;
  }

  #bridgeRecord(intentId) {
    const bridge = this.#bridges.get(intentId);
    const state = BRIDGE_STATES[bridge.stateIndex];
    if (bridge.failed) {
      return record({
        status: STATUS.FAILED,
        state: `${state}_ATTESTATION_UNAVAILABLE`,
        tx_ref: bridge.burn_tx,
        fee_quotes: bridge.quote.fee_quotes,
        net_amount: 0,
        partial: true,
        persisted_state: state
      });
    }
    if (!bridge.burn_tx) bridge.burn_tx = this.#txRef('arc-burn');
    const settled = state === 'MINTED';
    return record({
      status: settled ? STATUS.SETTLED : STATUS.PENDING,
      state,
      tx_ref: settled ? (bridge.mint_tx ??= this.#txRef('dest-mint')) : bridge.burn_tx,
      fee_quotes: bridge.quote.fee_quotes,
      net_amount: settled ? bridge.quote.net_amount : 0,
      dest_chain_id: bridge.quote.quote.dest_chain_id,
      partial: !settled
    });
  }

  poll(intentId) {
    const bridge = this.#bridges.get(intentId);
    if (!bridge) return refusal('UNKNOWN_EXECUTION', `no persisted execution for ${intentId}`);
    if (bridge.failed) return this.#bridgeRecord(intentId);
    if (bridge.stateIndex === 0 && this.#seed.bridgeFailAfterBurn) {
      bridge.failed = true;
      return this.#bridgeRecord(intentId);
    }
    if (bridge.stateIndex < BRIDGE_STATES.length - 1) bridge.stateIndex += 1;
    const rec = this.#bridgeRecord(intentId);
    if (rec.status === STATUS.SETTLED) this.#executions.set(intentId, rec);
    return rec;
  }

  resume(intentId) {
    const bridge = this.#bridges.get(intentId);
    if (!bridge) return refusal('UNKNOWN_EXECUTION', `no persisted execution for ${intentId}`);
    if (!bridge.failed) return refusal('NOTHING_TO_RESUME', 'execution is not in a failed partial state');
    bridge.failed = false;
    this.#seed.bridgeFailAfterBurn = false;
    const rec = this.poll(intentId);
    return { ...rec, resumed_from: BRIDGE_STATES[0] };
  }

  restart(intentId) {
    const bridge = this.#bridges.get(intentId);
    if (!bridge) return refusal('UNKNOWN_EXECUTION', `no persisted execution for ${intentId}`);
    return refusal('RESTART_FORBIDDEN', 'funds already burned; retry the state, not the money', {
      persisted_state: BRIDGE_STATES[bridge.stateIndex]
    });
  }

  balance(ref) {
    return record({ status: STATUS.SETTLED, state: 'OBSERVED', net_amount: this.#balanceOf(ref), ref });
  }

  onrampSession(intent) {
    assertIntent(intent);
    const refused = chainRefusal(intent);
    if (refused) return refused;
    if (!this.#seed.apiKeyHandle) {
      return refusal('MISSING_API_KEY', 'onramp requires a Circle Console API key handle (server-side only)');
    }
    return record({
      status: STATUS.PENDING,
      state: 'SESSION_CREATED',
      tx_ref: this.#txRef('onramp-session'),
      net_amount: intent.payload.amount ?? 0,
      api_key_handle: this.#seed.apiKeyHandle,
      handoff: 'regulated-user'
    });
  }

  earnPreview(intent) {
    assertIntent(intent);
    const refused = chainRefusal(intent);
    if (refused) return refused;
    const amount = intent.payload.amount ?? 0;
    const { maxPosition } = intent.payload;
    const position = this.#positions.get(intent.actor_ref) ?? 0;
    if (maxPosition !== undefined && position + amount > maxPosition) {
      return refusal('POSITION_LIMIT_EXCEEDED', `position ${position + amount} exceeds maxPosition ${maxPosition}`);
    }
    return record({
      status: STATUS.PENDING,
      state: 'PREVIEWED',
      net_amount: amount,
      apy_bps: 350,
      projected_position: position + amount
    });
  }

  earnDeposit(intent) {
    const preview = this.earnPreview(intent);
    if (preview.status === STATUS.REFUSED) return preview;
    const amount = intent.payload.amount ?? 0;
    const fees = this.#feesFor(intent);
    this.#adjust(intent.actor_ref, -amount);
    const position = (this.#positions.get(intent.actor_ref) ?? 0) + amount - totalFee(fees);
    this.#positions.set(intent.actor_ref, position);
    return record({
      status: STATUS.SETTLED,
      state: 'DEPOSITED',
      tx_ref: this.#txRef('earn'),
      fee_quotes: fees,
      net_amount: amount - totalFee(fees),
      position
    });
  }

  earnWithdraw(intent) {
    assertIntent(intent);
    const refused = chainRefusal(intent);
    if (refused) return refused;
    const amount = intent.payload.amount ?? 0;
    const position = this.#positions.get(intent.actor_ref) ?? 0;
    if (amount > position) return record({ status: STATUS.FAILED, state: 'INSUFFICIENT_POSITION', net_amount: 0 });
    const fees = this.#feesFor(intent);
    this.#positions.set(intent.actor_ref, position - amount);
    this.#adjust(intent.actor_ref, amount - totalFee(fees));
    return record({
      status: STATUS.SETTLED,
      state: 'WITHDRAWN',
      tx_ref: this.#txRef('earn'),
      fee_quotes: fees,
      net_amount: amount - totalFee(fees),
      position: position - amount
    });
  }
}

export class CircleAppKitProvider {
  #apiKeyHandle;
  #sdk = null;

  constructor({ apiKeyHandle = process.env.CIRCLE_API_KEY_HANDLE ?? null, env = process.env } = {}) {
    this.#apiKeyHandle = apiKeyHandle;
    this.env = env;
  }

  get provider_ref() {
    return 'circle-app-kit';
  }

  get liveEnabled() {
    return this.env[LIVE_HARNESS_FLAG] === '1';
  }

  async load() {
    if (!this.liveEnabled) throw new Error(LIVE_HARNESS_DISABLED);
    if (!this.#sdk) {
      const [appKit, viemAdapter, viem] = await Promise.all([
        import('@circle-fin/app-kit'),
        import('@circle-fin/adapter-viem-v2'),
        import('viem')
      ]);
      this.#sdk = { appKit, viemAdapter, viem, apiKeyHandle: this.#apiKeyHandle ? '[handle set]' : null };
    }
    return this.#sdk;
  }

  capabilities() {
    return ['SEND', 'BRIDGE', 'SWAP', 'UNIFIED_BALANCE', ...(this.#apiKeyHandle ? ['ONRAMP', 'EARN'] : [])];
  }

  async #guarded(intent) {
    if (intent) {
      assertIntent(intent);
      const refused = chainRefusal(intent);
      if (refused) return refused;
    }
    await this.load();
    throw new Error('CircleAppKitProvider live adapter is a skeleton; implement against the loaded SDK');
  }

  quote(intent) {
    return this.#guarded(intent);
  }

  execute(intent) {
    return this.#guarded(intent);
  }

  poll() {
    return this.#guarded();
  }

  resume() {
    return this.#guarded();
  }

  restart() {
    return this.#guarded();
  }

  balance() {
    return this.#guarded();
  }

  onrampSession(intent) {
    return this.#guarded(intent);
  }

  earnPreview(intent) {
    return this.#guarded(intent);
  }

  earnDeposit(intent) {
    return this.#guarded(intent);
  }

  earnWithdraw(intent) {
    return this.#guarded(intent);
  }
}
