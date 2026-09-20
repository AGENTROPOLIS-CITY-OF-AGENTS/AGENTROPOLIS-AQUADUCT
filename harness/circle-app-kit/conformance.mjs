import { ARC_MAINNET_CHAIN_ID, ARC_TESTNET_CHAIN_ID, CAPABILITIES, STATUS, sha256 } from './provider.mjs';

export const FORGE_PROOF_ENVELOPE_ID = 'https://agentropolis.dev/forge/proof-envelope.v1.json';
export const VERIFIER_REF = 'aquaduct-harness';
export const PROMOTION = 'REQUIRES_FORGE_AND_AEGIS';

export const PROOF_CLASSES = Object.freeze([
  'ProofOfCapability',
  'ProofOfRoute',
  'ProofOfQuote',
  'ProofOfExecution',
  'ProofOfBalanceChange',
  'ProofOfSettlement',
  'ProofOfOutcome',
  'ProofOfRefusal',
  'ProofOfFiscalDiscipline',
  'ProofOfPartialExecution',
  'ProofOfRecovery'
]);

const FORBIDDEN_INTENT_KEYS = ['private_key', 'privatekey', 'mnemonic', 'seed_phrase', 'seedphrase', 'signer_secret', 'api_key'];

export function containmentViolations(value, path = 'intent') {
  if (Array.isArray(value)) return value.flatMap((v, i) => containmentViolations(v, `${path}[${i}]`));
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, v]) => {
    const here = FORBIDDEN_INTENT_KEYS.includes(key.toLowerCase()) ? [`${path}.${key}`] : [];
    return [...here, ...containmentViolations(v, `${path}.${key}`)];
  });
}

export function validateProofEnvelope(proof) {
  const errors = [];
  const required = [
    'proof_id',
    'proof_class',
    'agent_entity_ref',
    'intent_ref',
    'mandate_ref',
    'evidence_refs',
    'verifier_ref',
    'policy_version_ref',
    'created_at',
    'status',
    'grants_authority'
  ];
  for (const key of required) if (!(key in proof)) errors.push(`missing ${key}`);
  for (const key of ['execution_envelope_ref', 'security_attestation_ref']) if (!(key in proof)) errors.push(`missing nullable ${key}`);
  if (!PROOF_CLASSES.includes(proof.proof_class)) errors.push(`unknown proof_class ${proof.proof_class}`);
  if (!['VERIFIED', 'FAILED'].includes(proof.status)) errors.push(`invalid status ${proof.status}`);
  if (proof.grants_authority !== false) errors.push('grants_authority must be false');
  if (!Array.isArray(proof.evidence_refs) || proof.evidence_refs.some((r) => !/^sha256:[0-9a-f]{64}$/.test(r))) {
    errors.push('evidence_refs must be sha256 refs');
  }
  if (proof.verifier_ref !== VERIFIER_REF) errors.push(`verifier_ref must be ${VERIFIER_REF}`);
  return errors;
}

export function validateEvidenceBundle(bundle) {
  const errors = [];
  for (const key of ['run_id', 'provider_ref', 'chain_id', 'matrix', 'proofs', 'grants_authority', 'promotion', 'created_at']) {
    if (!(key in bundle)) errors.push(`missing ${key}`);
  }
  if (bundle.grants_authority !== false) errors.push('grants_authority must be false');
  if (bundle.promotion !== PROMOTION) errors.push(`promotion must be ${PROMOTION}`);
  if (bundle.chain_id !== ARC_TESTNET_CHAIN_ID) errors.push('chain_id must be Arc testnet');
  if (bundle.proof_envelope_schema !== FORGE_PROOF_ENVELOPE_ID) errors.push('proof_envelope_schema must reference the Forge envelope');
  for (const proof of bundle.proofs ?? []) errors.push(...validateProofEnvelope(proof).map((e) => `${proof.proof_id}: ${e}`));
  return errors;
}

function intent(kind, id, payload, overrides = {}) {
  return {
    intent_id: `intent:${id}`,
    kind,
    actor_ref: 'agententity:harness-actor',
    mandate_ref: 'mandate:harness-sandbox',
    payload: { chain_id: ARC_TESTNET_CHAIN_ID, asset: 'USDC', ...payload },
    ...overrides
  };
}

export async function runConformance(provider, options = {}) {
  const {
    run_id = `run:${Date.now()}`,
    created_at = new Date().toISOString(),
    agent_entity_ref = 'agententity:harness-actor',
    policy_version_ref = 'policy:aquaduct-harness-v1',
    security_attestation_ref = null
  } = options;

  const proofs = [];
  const matrix = [];
  let proofCounter = 0;

  const proof = (proof_class, subject, records, status = 'VERIFIED', extra = {}) => {
    proofCounter += 1;
    const list = Array.isArray(records) ? records : [records];
    const p = {
      proof_id: `proof:${run_id}:${String(proofCounter).padStart(3, '0')}`,
      proof_class,
      agent_entity_ref,
      intent_ref: subject?.intent_id ?? null,
      mandate_ref: subject?.mandate_ref ?? 'mandate:harness-sandbox',
      execution_envelope_ref: subject?.execution_envelope_ref ?? null,
      evidence_refs: list.map((r) => `sha256:${sha256(r)}`),
      verifier_ref: VERIFIER_REF,
      policy_version_ref,
      security_attestation_ref,
      created_at,
      status,
      grants_authority: false,
      ...extra
    };
    proofs.push(p);
    return p.proof_id;
  };

  const guarded = async (fn, subject) => {
    const violations = containmentViolations(subject);
    if (violations.length) {
      return {
        status: STATUS.REFUSED,
        state: 'CONTAINMENT_BREACH',
        tx_ref: null,
        fee_quotes: [],
        net_amount: 0,
        refusal_reason: `54T containment: forbidden keys ${violations.join(', ')}`,
        reached_provider: false
      };
    }
    return fn();
  };

  const scenario = async (id, capability, checks) => {
    const entry = { id, capability, checks: [], proof_ids: [], status: 'PASS' };
    const ctx = {
      check(name, ok, detail = null) {
        entry.checks.push({ name, ok: Boolean(ok), detail });
        if (!ok) entry.status = 'FAIL';
      },
      proof(...args) {
        const id = proof(...args);
        entry.proof_ids.push(id);
        return id;
      },
      guarded
    };
    try {
      await checks(ctx);
    } catch (error) {
      ctx.check('no-throw', false, error.message);
    }
    matrix.push(entry);
  };

  const declared = provider.capabilities();
  const exercised = new Set();

  await scenario('provider-discovery', 'DISCOVERY', (t) => {
    const unknown = declared.filter((c) => !CAPABILITIES.includes(c));
    t.check('declared-capabilities-known', unknown.length === 0, unknown);
    t.proof('ProofOfCapability', null, { provider_ref: provider.provider_ref, declared });
  });

  await scenario('send', 'SEND', async (t) => {
    exercised.add('SEND');
    const i = intent('SEND', 'send-1', { amount: 25, recipient: 'agententity:recipient', maxTotalFee: 0.05 });
    const before = await provider.balance(i.actor_ref);
    const q = await t.guarded(() => provider.quote(i), i);
    t.check('quote-pending', q.status === STATUS.PENDING && q.quote_hash);
    t.proof('ProofOfQuote', i, q);
    const x = await t.guarded(() => provider.execute(i, q.quote_hash), i);
    t.check('execute-settled', x.status === STATUS.SETTLED && x.tx_ref);
    t.check('recipient-bound', x.recipient === i.payload.recipient);
    t.check('gas-in-usdc', x.fee_quotes.every((f) => f.asset === 'USDC'));
    t.check('deterministic-finality', x.finality === 'deterministic');
    t.proof('ProofOfExecution', i, x, x.status === STATUS.SETTLED ? 'VERIFIED' : 'FAILED');
    const after = await provider.balance(i.actor_ref);
    t.check('balance-delta', before.net_amount - after.net_amount === i.payload.amount, { before: before.net_amount, after: after.net_amount });
    t.proof('ProofOfBalanceChange', i, [before, after]);
    t.proof('ProofOfSettlement', i, x);
    const replay = await provider.execute(i, q.quote_hash);
    t.check('replay-idempotent', replay.replayed === true && replay.tx_ref === x.tx_ref);
    const afterReplay = await provider.balance(i.actor_ref);
    t.check('replay-no-double-spend', afterReplay.net_amount === after.net_amount);
    t.proof('ProofOfOutcome', i, replay);
  });

  await scenario('send-dual-usdc', 'SEND', async (t) => {
    const native = intent('SEND', 'send-native', { amount: 1, recipient: 'agententity:r', usdc_interface: 'native' });
    const erc20 = intent('SEND', 'send-erc20', { amount: 1, recipient: 'agententity:r', usdc_interface: 'erc20' });
    const qn = await provider.quote(native);
    const qe = await provider.quote(erc20);
    t.check('both-interfaces-quoted', qn.status === STATUS.PENDING && qe.status === STATUS.PENDING);
    t.check('normalized-net-amount', qn.net_amount === qe.net_amount);
    t.check('interface-bound-in-quote', qn.quote_hash !== qe.quote_hash);
    t.proof('ProofOfRoute', native, [qn, qe]);
  });

  await scenario('quote-binding', 'SEND', async (t) => {
    const i = intent('SEND', 'send-bind', { amount: 5, recipient: 'agententity:r' });
    const x = await provider.execute(i, `${'0'.repeat(64)}`);
    t.check('mismatched-quote-refused', x.status === STATUS.REFUSED && x.state === 'QUOTE_MISMATCH');
    t.proof('ProofOfRefusal', i, x);
    const expired = intent('SEND', 'send-expired', { amount: 5, recipient: 'agententity:r', quote_ttl_s: 0 });
    const q = await provider.quote(expired);
    const xe = await provider.execute(expired, q.quote_hash);
    t.check('expired-quote-refused', xe.status === STATUS.REFUSED && xe.state === 'QUOTE_EXPIRED');
    t.proof('ProofOfRefusal', expired, xe);
  });

  await scenario('signer-unavailable', 'SEND', async (t) => {
    const i = intent('SEND', 'send-nosigner', { amount: 5, recipient: 'agententity:r', signer_available: false });
    const q = await provider.quote(i);
    const x = await provider.execute(i, q.quote_hash);
    t.check('refused-without-signer', x.status === STATUS.REFUSED && x.state === 'SIGNER_UNAVAILABLE');
    t.proof('ProofOfRefusal', i, x);
  });

  await scenario('bridge', 'BRIDGE', async (t) => {
    exercised.add('BRIDGE');
    const i = intent('BRIDGE', 'bridge-1', { amount: 100, dest_chain_id: 84532, recipient: 'agententity:r', maxTotalFee: 1 });
    const q = await provider.quote(i);
    t.check('route-quoted', q.status === STATUS.PENDING && q.quote.dest_chain_id === 84532);
    t.proof('ProofOfRoute', i, q);
    t.proof('ProofOfQuote', i, q);
    const burned = await provider.execute(i, q.quote_hash);
    t.check('pending-after-burn', burned.status === STATUS.PENDING && burned.state === 'BURNED');
    t.proof('ProofOfExecution', i, burned);
    const attested = await provider.poll(i.intent_id);
    t.check('pending-after-attest', attested.status === STATUS.PENDING && attested.state === 'ATTESTED');
    const minted = await provider.poll(i.intent_id);
    t.check('settled-after-mint', minted.status === STATUS.SETTLED && minted.state === 'MINTED' && minted.net_amount > 0);
    t.check('pending-vs-settled-distinct', burned.tx_ref !== minted.tx_ref);
    t.proof('ProofOfSettlement', i, [burned, attested, minted]);
  });

  await scenario('bridge-partial-recovery', 'BRIDGE', async (t) => {
    const seeded = provider.withSeed ? provider.withSeed({ bridgeFailAfterBurn: true }) : provider;
    const i = intent('BRIDGE', 'bridge-partial', { amount: 40, dest_chain_id: 84532, recipient: 'agententity:r' });
    const q = await seeded.quote(i);
    const burned = await seeded.execute(i, q.quote_hash);
    const failed = await seeded.poll(i.intent_id);
    t.check('partial-failure-observed', failed.status === STATUS.FAILED && failed.partial === true && failed.persisted_state === 'BURNED');
    t.proof('ProofOfPartialExecution', i, [burned, failed], 'VERIFIED');
    const restart = await seeded.restart(i.intent_id);
    t.check('restart-refused', restart.status === STATUS.REFUSED && restart.state === 'RESTART_FORBIDDEN');
    t.proof('ProofOfRefusal', i, restart);
    const resumed = await seeded.resume(i.intent_id);
    t.check('resume-continues-from-persisted-state', resumed.status === STATUS.PENDING && resumed.state === 'ATTESTED' && resumed.resumed_from === 'BURNED');
    const minted = await seeded.poll(i.intent_id);
    t.check('resume-settles', minted.status === STATUS.SETTLED);
    t.proof('ProofOfRecovery', i, [resumed, minted], minted.status === STATUS.SETTLED ? 'VERIFIED' : 'FAILED');
  });

  await scenario('swap', 'SWAP', async (t) => {
    exercised.add('SWAP');
    const i = intent('SWAP', 'swap-1', { amount: 50, output_asset: 'EURC', maxSlippageBps: 50, maxTotalFee: 1 });
    const q = await provider.quote(i);
    t.check('quote-within-slippage', q.status === STATUS.PENDING);
    t.proof('ProofOfQuote', i, q);
    const x = await provider.execute(i, q.quote_hash);
    t.check('swap-settled', x.status === STATUS.SETTLED && x.output_asset === 'EURC');
    t.proof('ProofOfExecution', i, x);
    t.proof('ProofOfFiscalDiscipline', i, { maxSlippageBps: 50, observed: x.slippage_bps, fee_quotes: x.fee_quotes });
  });

  await scenario('swap-slippage-breach', 'SWAP', async (t) => {
    const seeded = provider.withSeed ? provider.withSeed({ swapSlippageBps: 500 }) : provider;
    const i = intent('SWAP', 'swap-breach', { amount: 50, output_asset: 'EURC', maxSlippageBps: 50 });
    const q = await seeded.quote(i);
    t.check('slippage-breach-refused', q.status === STATUS.REFUSED && q.state === 'SLIPPAGE_BREACH');
    t.proof('ProofOfRefusal', i, q);
    t.proof('ProofOfFiscalDiscipline', i, q);
  });

  await scenario('fee-limit', 'BRIDGE', async (t) => {
    const i = intent('BRIDGE', 'bridge-fee', { amount: 1000, dest_chain_id: 84532, recipient: 'agententity:r', maxTotalFee: 0.5 });
    const q = await provider.quote(i);
    t.check('fee-limit-refused', q.status === STATUS.REFUSED && q.state === 'FEE_LIMIT_EXCEEDED');
    t.proof('ProofOfRefusal', i, q);
    t.proof('ProofOfFiscalDiscipline', i, q);
  });

  await scenario('unified-balance', 'UNIFIED_BALANCE', async (t) => {
    exercised.add('UNIFIED_BALANCE');
    const dep = intent('UNIFIED_BALANCE_DEPOSIT', 'ub-dep', { amount: 30 });
    const qd = await provider.quote(dep);
    const xd = await provider.execute(dep, qd.quote_hash);
    t.check('deposit-settled', xd.status === STATUS.SETTLED && xd.state === 'DEPOSITED');
    t.proof('ProofOfExecution', dep, xd);
    const unified = await provider.balance(`unified:${dep.actor_ref}`);
    t.check('unified-balance-reconciles', unified.net_amount === xd.net_amount, unified.net_amount);
    t.proof('ProofOfBalanceChange', dep, unified);
    const spend = intent('UNIFIED_BALANCE_SPEND', 'ub-spend', { amount: 10, recipient: 'agententity:merchant' });
    const qs = await provider.quote(spend);
    const xs = await provider.execute(spend, qs.quote_hash);
    t.check('spend-settled', xs.status === STATUS.SETTLED && xs.state === 'SPENT');
    t.check('delegated-authority-bound', xs.delegated_authority_ref === spend.mandate_ref);
    t.proof('ProofOfExecution', spend, xs);
    const over = intent('UNIFIED_BALANCE_SPEND', 'ub-over', { amount: 10000, recipient: 'agententity:merchant' });
    const qo = await provider.quote(over);
    const xo = await provider.execute(over, qo.quote_hash);
    t.check('overspend-fails', xo.status === STATUS.FAILED);
    t.proof('ProofOfOutcome', over, xo, 'VERIFIED');
  });

  await scenario('onramp', 'ONRAMP', async (t) => {
    exercised.add('ONRAMP');
    const i = intent('ONRAMP', 'onramp-1', { amount: 100, fiat: 'USD' });
    const s = await provider.onrampSession(i);
    const ok = s.status === STATUS.PENDING && s.state === 'SESSION_CREATED';
    const refusedNoKey = s.status === STATUS.REFUSED && s.state === 'MISSING_API_KEY';
    t.check('session-or-refusal', ok || refusedNoKey, s.state);
    if (ok) t.check('secret-handle-not-secret', typeof s.api_key_handle === 'string' && !/^[A-Za-z0-9+/=]{32,}$/.test(s.api_key_handle));
    t.proof(ok ? 'ProofOfExecution' : 'ProofOfRefusal', i, s);
  });

  await scenario('onramp-missing-key', 'ONRAMP', async (t) => {
    const seeded = provider.withSeed ? provider.withSeed({ apiKeyHandle: null }) : provider;
    const i = intent('ONRAMP', 'onramp-nokey', { amount: 100, fiat: 'USD' });
    const s = await seeded.onrampSession(i);
    t.check('missing-key-refused', s.status === STATUS.REFUSED && s.state === 'MISSING_API_KEY');
    t.proof('ProofOfRefusal', i, s);
  });

  await scenario('earn', 'EARN', async (t) => {
    exercised.add('EARN');
    const dep = intent('EARN_DEPOSIT', 'earn-dep', { amount: 20, maxPosition: 100 });
    const preview = await provider.earnPreview(dep);
    t.check('preview-pending', preview.status === STATUS.PENDING && preview.state === 'PREVIEWED');
    t.proof('ProofOfQuote', dep, preview);
    const xd = await provider.earnDeposit(dep);
    t.check('deposit-settled', xd.status === STATUS.SETTLED && xd.position > 0);
    t.proof('ProofOfExecution', dep, xd);
    const wd = intent('EARN_WITHDRAW', 'earn-wd', { amount: 5 });
    const xw = await provider.earnWithdraw(wd);
    t.check('withdraw-settled', xw.status === STATUS.SETTLED && xw.position === xd.position - 5);
    t.proof('ProofOfExecution', wd, xw);
    t.proof('ProofOfOutcome', wd, [xd, xw]);
    const over = intent('EARN_DEPOSIT', 'earn-over', { amount: 500, maxPosition: 100 });
    const po = await provider.earnPreview(over);
    t.check('position-limit-refused', po.status === STATUS.REFUSED && po.state === 'POSITION_LIMIT_EXCEEDED');
    t.proof('ProofOfFiscalDiscipline', over, po);
  });

  await scenario('mainnet-refused', 'CHAIN', async (t) => {
    const i = intent('SEND', 'mainnet-send', { chain_id: ARC_MAINNET_CHAIN_ID, amount: 1, recipient: 'agententity:r' });
    const q = await provider.quote(i);
    const x = await provider.execute(i, q.quote_hash ?? 'none');
    t.check('mainnet-quote-refused', q.status === STATUS.REFUSED && q.state === 'MAINNET_DISABLED');
    t.check('mainnet-execute-refused', x.status === STATUS.REFUSED && x.state === 'MAINNET_DISABLED');
    t.proof('ProofOfRefusal', i, [q, x]);
  });

  await scenario('54t-containment', 'CONTAINMENT', async (t) => {
    const i = intent('SEND', 'leaky', { amount: 1, recipient: 'agententity:r', private_key: '0xdead' });
    const j = intent('SEND', 'leaky-nested', { amount: 1, recipient: 'agententity:r', signer: { mnemonic: 'word word' } });
    let reached = 0;
    const spy = () => {
      reached += 1;
      return provider.quote(i);
    };
    const r1 = await t.guarded(spy, i);
    const r2 = await t.guarded(spy, j);
    t.check('refused-before-provider', reached === 0 && r1.status === STATUS.REFUSED && r2.status === STATUS.REFUSED);
    t.check('containment-state', r1.state === 'CONTAINMENT_BREACH' && r2.state === 'CONTAINMENT_BREACH');
    t.proof('ProofOfRefusal', i, r1);
    t.proof('ProofOfRefusal', j, r2);
  });

  await scenario('capability-coverage', 'DISCOVERY', (t) => {
    const missing = declared.filter((c) => !exercised.has(c));
    const undeclared = [...exercised].filter((c) => !declared.includes(c));
    t.check('declared-all-exercised', missing.length === 0, missing);
    t.check('exercised-all-declared', undeclared.length === 0, undeclared);
    t.proof('ProofOfCapability', null, { declared, exercised: [...exercised].sort() }, missing.length === 0 ? 'VERIFIED' : 'FAILED');
  });

  const bundle = {
    run_id,
    provider_ref: provider.provider_ref,
    chain_id: ARC_TESTNET_CHAIN_ID,
    created_at,
    verifier_ref: VERIFIER_REF,
    policy_version_ref,
    proof_envelope_schema: FORGE_PROOF_ENVELOPE_ID,
    grants_authority: false,
    promotion: PROMOTION,
    summary: {
      scenarios: matrix.length,
      passed: matrix.filter((m) => m.status === 'PASS').length,
      failed: matrix.filter((m) => m.status === 'FAIL').length,
      proofs: proofs.length
    },
    matrix,
    proofs
  };
  return bundle;
}
