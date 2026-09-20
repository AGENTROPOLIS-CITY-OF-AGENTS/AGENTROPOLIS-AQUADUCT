import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ARC_CHAINS,
  ARC_MAINNET_CHAIN_ID,
  ARC_TESTNET_CHAIN_ID,
  CAPABILITIES,
  CircleAppKitProvider,
  LIVE_HARNESS_DISABLED,
  MockCircleAppKitProvider,
  STATUS
} from '../provider.mjs';
import { containmentViolations, runConformance } from '../conformance.mjs';

const intent = (kind, payload, id = `intent:${kind}`) => ({
  intent_id: id,
  kind,
  actor_ref: 'agententity:a',
  mandate_ref: 'mandate:m',
  payload: { chain_id: ARC_TESTNET_CHAIN_ID, asset: 'USDC', ...payload }
});

test('Arc chain config: testnet allowed, mainnet metadata present but disabled', () => {
  assert.equal(ARC_CHAINS[ARC_TESTNET_CHAIN_ID].allowed, true);
  const mainnet = ARC_CHAINS[ARC_MAINNET_CHAIN_ID];
  assert.equal(mainnet.allowed, false);
  assert.equal(mainnet.rpc, 'https://rpc.mainnet.arc.io');
  assert.equal(mainnet.explorer, 'https://explorer.arc.io');
});

test('mainnet 5042 intents are REFUSED with a ProofOfRefusal on every surface', async () => {
  const p = new MockCircleAppKitProvider();
  const i = intent('SEND', { chain_id: ARC_MAINNET_CHAIN_ID, amount: 1, recipient: 'r' });
  for (const rec of [p.quote(i), p.execute(i, 'x'), p.onrampSession(i), p.earnPreview(i), p.earnDeposit(i), p.earnWithdraw(i)]) {
    assert.equal(rec.status, STATUS.REFUSED);
    assert.equal(rec.state, 'MAINNET_DISABLED');
  }
  const bundle = await runConformance(p, { run_id: 'r', created_at: 't' });
  const entry = bundle.matrix.find((m) => m.id === 'mainnet-refused');
  assert.equal(entry.status, 'PASS');
  const proofs = bundle.proofs.filter((pr) => entry.proof_ids.includes(pr.proof_id));
  assert.ok(proofs.every((pr) => pr.proof_class === 'ProofOfRefusal'));
});

test('live CircleAppKitProvider refuses to load without AQUADUCT_LIVE_HARNESS=1', async () => {
  const p = new CircleAppKitProvider({ env: {}, apiKeyHandle: null });
  assert.equal(p.liveEnabled, false);
  await assert.rejects(p.load(), { message: LIVE_HARNESS_DISABLED });
  await assert.rejects(p.quote(intent('SEND', { amount: 1, recipient: 'r' })), { message: LIVE_HARNESS_DISABLED });
  assert.deepEqual(p.capabilities(), ['SEND', 'BRIDGE', 'SWAP', 'UNIFIED_BALANCE']);
});

test('live provider still refuses mainnet before attempting to load the SDK', async () => {
  const p = new CircleAppKitProvider({ env: {} });
  const rec = await p.quote(intent('SEND', { chain_id: ARC_MAINNET_CHAIN_ID, amount: 1, recipient: 'r' }));
  assert.equal(rec.status, STATUS.REFUSED);
});

test('quote binding: mismatched bound quote hash is REFUSED', () => {
  const p = new MockCircleAppKitProvider();
  const i = intent('SEND', { amount: 1, recipient: 'r' });
  const q = p.quote(i);
  assert.equal(p.execute(i, `${q.quote_hash}0`).state, 'QUOTE_MISMATCH');
  assert.equal(p.execute(i, undefined).state, 'QUOTE_MISMATCH');
  assert.equal(p.execute(i, q.quote_hash).status, STATUS.SETTLED);
});

test('RETRY THE STATE, NOT THE MONEY: replayed execute never double spends', () => {
  const p = new MockCircleAppKitProvider();
  const i = intent('SEND', { amount: 10, recipient: 'r' });
  const q = p.quote(i);
  const first = p.execute(i, q.quote_hash);
  const second = p.execute(i, q.quote_hash);
  assert.equal(second.replayed, true);
  assert.equal(second.tx_ref, first.tx_ref);
  assert.equal(p.balance(i.actor_ref).net_amount, 990);
});

test('bridge: PENDING first, SETTLED via poll', () => {
  const p = new MockCircleAppKitProvider();
  const i = intent('BRIDGE', { amount: 10, dest_chain_id: 84532, recipient: 'r' });
  const x = p.execute(i, p.quote(i).quote_hash);
  assert.equal(x.status, STATUS.PENDING);
  assert.equal(x.state, 'BURNED');
  assert.equal(p.poll(i.intent_id).status, STATUS.PENDING);
  assert.equal(p.poll(i.intent_id).status, STATUS.SETTLED);
});

test('partial bridge recovery: resume continues from persisted state, restart is refused', () => {
  const p = new MockCircleAppKitProvider({ seed: { bridgeFailAfterBurn: true } });
  const i = intent('BRIDGE', { amount: 10, dest_chain_id: 84532, recipient: 'r' });
  p.execute(i, p.quote(i).quote_hash);
  const failed = p.poll(i.intent_id);
  assert.equal(failed.status, STATUS.FAILED);
  assert.equal(failed.partial, true);
  assert.equal(p.restart(i.intent_id).state, 'RESTART_FORBIDDEN');
  const resumed = p.resume(i.intent_id);
  assert.equal(resumed.resumed_from, 'BURNED');
  assert.equal(resumed.state, 'ATTESTED');
  assert.equal(p.poll(i.intent_id).status, STATUS.SETTLED);
  assert.equal(p.balance(i.actor_ref).net_amount, 990);
});

test('fee and slippage constraints are enforced at quote time', () => {
  const p = new MockCircleAppKitProvider({ seed: { swapSlippageBps: 120 } });
  assert.equal(p.quote(intent('SWAP', { amount: 10, maxSlippageBps: 100 })).state, 'SLIPPAGE_BREACH');
  assert.equal(p.quote(intent('SWAP', { amount: 10, maxSlippageBps: 200 })).status, STATUS.PENDING);
  assert.equal(p.quote(intent('SEND', { amount: 10, recipient: 'r', maxTotalFee: 0.001 })).state, 'FEE_LIMIT_EXCEEDED');
});

test('missing API key handle refuses ONRAMP', () => {
  const p = new MockCircleAppKitProvider({ seed: { apiKeyHandle: null } });
  assert.equal(p.onrampSession(intent('ONRAMP', { amount: 1 })).state, 'MISSING_API_KEY');
  assert.equal(new MockCircleAppKitProvider().onrampSession(intent('ONRAMP', { amount: 1 })).state, 'SESSION_CREATED');
});

test('54T containment: intents carrying private_key or mnemonic are refused before the provider', async () => {
  assert.deepEqual(containmentViolations({ payload: { private_key: 'x' } }), ['intent.payload.private_key']);
  assert.deepEqual(containmentViolations({ payload: { signer: { mnemonic: 'x' } } }), ['intent.payload.signer.mnemonic']);
  assert.deepEqual(containmentViolations(intent('SEND', { amount: 1 })), []);
  const bundle = await runConformance(new MockCircleAppKitProvider(), { run_id: 'r', created_at: 't' });
  assert.equal(bundle.matrix.find((m) => m.id === '54t-containment').status, 'PASS');
});

test('CAPABILITY != AUTHORITY: capability discovery mismatch fails the matrix without touching authority', async () => {
  const p = new MockCircleAppKitProvider({ capabilities: [...CAPABILITIES, 'MINT_AUTHORITY'] });
  const bundle = await runConformance(p, { run_id: 'r', created_at: 't' });
  assert.equal(bundle.matrix.find((m) => m.id === 'provider-discovery').status, 'FAIL');
  assert.equal(bundle.grants_authority, false);
  assert.equal(bundle.promotion, 'REQUIRES_FORGE_AND_AEGIS');
});

test('TEST PASS != PRODUCTION AUTHORITY: a fully passing run still requires Forge and AEGIS', async () => {
  const bundle = await runConformance(new MockCircleAppKitProvider(), { run_id: 'r', created_at: 't' });
  assert.equal(bundle.summary.failed, 0);
  assert.equal(bundle.grants_authority, false);
  assert.equal(bundle.promotion, 'REQUIRES_FORGE_AND_AEGIS');
  assert.ok(bundle.proofs.every((p) => p.grants_authority === false));
});
