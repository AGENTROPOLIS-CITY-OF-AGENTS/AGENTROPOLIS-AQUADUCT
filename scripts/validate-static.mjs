import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const required = [
  'index.html',
  'styles.css',
  'botmode.css',
  'ui-2027.css',
  'app.js',
  'botmode.js',
  'ui-2027.js',
  'scroll-scene.js',
  'spatial-runtime.js',
  'spatial-runtime-manifest.json',
  'config/hermes-botmode.aqueduct.json',
  'scenes/aqueduct-agent-city/manifest.json',
  'scenes/aqueduct-agent-city/camera/camera-path.json',
  'scenes/aqueduct-agent-city/timeline/scroll-timeline.json'
];

function fail(message) {
  console.error(`DEPLOY BLOCKED: ${message}`);
  process.exitCode = 1;
}

function readJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
  } catch (error) {
    fail(`${rel} is not valid JSON: ${error.message}`);
    return null;
  }
}

for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) fail(`missing required file ${rel}`);
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const ref of ['styles.css','botmode.css','ui-2027.css','app.js','botmode.js','ui-2027.js']) {
  if (!html.includes(ref)) fail(`index.html does not reference ${ref}`);
}

const uiSource = fs.readFileSync(path.join(root, 'ui-2027.js'), 'utf8');
if (!uiSource.includes('import "./spatial-runtime.js"')) fail('ui-2027.js must import spatial-runtime.js so source equals deployed artifact');

for (const rel of ['app.js','botmode.js','ui-2027.js','scroll-scene.js','spatial-runtime.js']) {
  try {
    execFileSync(process.execPath, ['--check', path.join(root, rel)], { stdio: 'pipe' });
  } catch (error) {
    fail(`${rel} failed JavaScript syntax validation\n${error.stderr?.toString() || error.message}`);
  }
}

const manifest = readJson('scenes/aqueduct-agent-city/manifest.json');
const camera = readJson('scenes/aqueduct-agent-city/camera/camera-path.json');
const timeline = readJson('scenes/aqueduct-agent-city/timeline/scroll-timeline.json');
const botConfig = readJson('config/hermes-botmode.aqueduct.json');
readJson('spatial-runtime-manifest.json');

if (manifest) {
  if (manifest.schema !== 'agentropolis.spatial-scene.v1') fail('scene manifest schema mismatch');
  if (manifest.id !== 'aqueduct-agent-city') fail('scene id mismatch');
  if (manifest.district !== 'utility-grid') fail('scene must use canonical utility-grid district id');
  if (!['P','D','V'].includes(manifest.sourceClass)) fail('scene sourceClass must be P, D, or V');
  if (manifest.sourceClass === 'D' && !manifest.assets?.depth) fail('Class D requires a depth asset and decode metadata');
  if (manifest.sourceClass === 'V' && !manifest.spatialEvidence?.trueCameraTranslation) fail('Class V requires true spatial translation evidence');
  if (manifest.fallback?.reducedMotion !== 'static-viewpoints') fail('reduced-motion fallback must be declared');
  if (manifest.fallback?.noWebGL !== 'html') fail('no-WebGL HTML fallback must be declared');
  if (manifest.verification?.evaluator !== 'BE') fail('scene verification evaluator must be BE');
}

if (camera) {
  const frames = camera.keyframes || [];
  if (camera.version !== 'agentropolis.camera-path.v1') fail('camera path version mismatch');
  if (frames.length < 2) fail('camera path needs at least two keyframes');
  if (frames[0]?.t !== 0 || frames.at(-1)?.t !== 1) fail('camera keyframes must cover 0..1');
  for (let i = 1; i < frames.length; i += 1) {
    if (!(frames[i].t > frames[i - 1].t)) fail('camera keyframe t values must be strictly increasing');
    if (!Array.isArray(frames[i].position) || frames[i].position.length !== 3) fail(`camera keyframe ${i} position invalid`);
    if (!Array.isArray(frames[i].target) || frames[i].target.length !== 3) fail(`camera keyframe ${i} target invalid`);
  }
}

if (timeline) {
  const beats = timeline.beats || [];
  if (timeline.version !== 'agentropolis.scroll.v1') fail('timeline version mismatch');
  if (timeline.scene !== 'aqueduct-agent-city') fail('timeline scene mismatch');
  if (!beats.length) fail('timeline needs beats');
  if (beats[0]?.start !== 0 || beats.at(-1)?.end !== 1) fail('timeline must cover 0..1');
  for (let i = 0; i < beats.length; i += 1) {
    const beat = beats[i];
    if (!(beat.start >= 0 && beat.end <= 1 && beat.end > beat.start)) fail(`invalid beat range: ${beat.id}`);
    if (i > 0 && Math.abs(beat.start - beats[i - 1].end) > 1e-9) fail(`timeline gap/overlap before beat ${beat.id}`);
    for (const binding of beat.bindings || []) {
      if (!binding.target) fail(`beat ${beat.id} has binding without target`);
      if (binding.target === 'camera.path' && !(typeof binding.from === 'number' && typeof binding.to === 'number')) fail(`beat ${beat.id} camera.path needs numeric from/to`);
    }
  }
}

if (botConfig) {
  if (botConfig.authority?.mainnetAllowed !== false) fail('Bot Mode mainnetAllowed must remain false');
  if (botConfig.runtime?.gateway?.publicTelemetryOnly !== true) fail('Bot Mode public gateway must be telemetry-only');
}

if (!process.exitCode) console.log('AQUEDUCT static deployment gate: PASS');
