#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { CircleAppKitProvider, MockCircleAppKitProvider } from './provider.mjs';
import { runConformance, validateEvidenceBundle } from './conformance.mjs';

const { values } = parseArgs({
  options: {
    provider: { type: 'string', default: 'mock' },
    out: { type: 'string', default: 'evidence' },
    'run-id': { type: 'string' },
    'created-at': { type: 'string' }
  }
});

function createProvider(name) {
  if (name === 'mock') return new MockCircleAppKitProvider();
  if (name === 'circle-app-kit') return new CircleAppKitProvider();
  throw new Error(`unknown provider ${name}`);
}

const provider = createProvider(values.provider);
if (provider instanceof CircleAppKitProvider) await provider.load();

const bundle = await runConformance(provider, {
  run_id: values['run-id'],
  created_at: values['created-at']
});
const errors = validateEvidenceBundle(bundle);
if (errors.length) {
  console.error(`evidence bundle invalid:\n${errors.join('\n')}`);
  process.exit(2);
}

fs.mkdirSync(values.out, { recursive: true });
const file = path.join(values.out, `${bundle.run_id.replaceAll(/[^A-Za-z0-9_.-]/g, '_')}.json`);
fs.writeFileSync(file, `${JSON.stringify(bundle, null, 2)}\n`);
console.log(`${file} scenarios=${bundle.summary.scenarios} passed=${bundle.summary.passed} failed=${bundle.summary.failed} grants_authority=false promotion=${bundle.promotion}`);
process.exit(bundle.summary.failed === 0 ? 0 : 1);
