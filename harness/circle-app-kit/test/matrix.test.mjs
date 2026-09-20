import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MockCircleAppKitProvider } from '../provider.mjs';
import { FORGE_PROOF_ENVELOPE_ID, PROMOTION, PROOF_CLASSES, runConformance, validateEvidenceBundle, validateProofEnvelope } from '../conformance.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const fixed = { run_id: 'run:sample', created_at: '2026-01-01T00:00:00.000Z' };

const bundle = await runConformance(new MockCircleAppKitProvider(), fixed);

test('full matrix passes against the mock provider', () => {
  const failed = bundle.matrix.filter((m) => m.status !== 'PASS');
  assert.deepEqual(failed, []);
  const ids = bundle.matrix.map((m) => m.id);
  for (const id of ['send', 'bridge', 'swap', 'unified-balance', 'onramp', 'earn', 'bridge-partial-recovery', 'quote-binding', '54t-containment', 'mainnet-refused']) {
    assert.ok(ids.includes(id), id);
  }
});

test('evidence bundle validates and never grants authority', () => {
  assert.deepEqual(validateEvidenceBundle(bundle), []);
  assert.equal(bundle.grants_authority, false);
  assert.equal(bundle.promotion, PROMOTION);
  assert.equal(bundle.chain_id, 5042002);
  assert.equal(bundle.proof_envelope_schema, FORGE_PROOF_ENVELOPE_ID);
  const text = JSON.stringify(bundle);
  assert.ok(text.includes('"grants_authority":false'));
  assert.ok(!text.includes('"grants_authority":true'));
});

test('every proof is Forge-envelope shaped with grants_authority false', () => {
  assert.ok(bundle.proofs.length > 0);
  for (const proof of bundle.proofs) {
    assert.deepEqual(validateProofEnvelope(proof), [], proof.proof_id);
    assert.equal(proof.grants_authority, false);
    assert.equal(proof.verifier_ref, 'aquaduct-harness');
  }
  const emitted = new Set(bundle.proofs.map((p) => p.proof_class));
  for (const cls of PROOF_CLASSES) assert.ok(emitted.has(cls), `missing ${cls}`);
});

test('proof shape checker rejects authority-granting or malformed proofs', () => {
  const [good] = bundle.proofs;
  assert.ok(validateProofEnvelope({ ...good, grants_authority: true }).includes('grants_authority must be false'));
  assert.ok(validateProofEnvelope({ ...good, proof_class: 'ProofOfAuthority' }).some((e) => e.startsWith('unknown proof_class')));
  assert.ok(validateProofEnvelope({ ...good, evidence_refs: ['nope'] }).includes('evidence_refs must be sha256 refs'));
});

test('run is deterministic for a fixed run_id and timestamp', async () => {
  const again = await runConformance(new MockCircleAppKitProvider(), fixed);
  assert.deepEqual(again, bundle);
});

test('committed evidence/SAMPLE.json matches a fresh mock run', () => {
  const sample = JSON.parse(fs.readFileSync(path.join(root, 'evidence/SAMPLE.json'), 'utf8'));
  assert.deepEqual(sample, bundle);
});

test('secrets never appear in the evidence bundle', () => {
  const text = JSON.stringify(bundle);
  assert.ok(!text.includes('0xdead'));
  assert.ok(!text.includes('word word'));
});
