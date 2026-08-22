import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const clamp01 = (value) => Math.min(1, Math.max(0, value));

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function interpolateKeyframes(keyframes, progress) {
  const p = clamp01(progress);
  let a = keyframes[0];
  let b = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length - 1; i += 1) {
    if (p >= keyframes[i].t && p <= keyframes[i + 1].t) {
      a = keyframes[i];
      b = keyframes[i + 1];
      break;
    }
  }

  const span = Math.max(0.000001, b.t - a.t);
  const local = clamp01((p - a.t) / span);

  return {
    position: a.position.map((value, index) => lerp(value, b.position[index], local)),
    target: a.target.map((value, index) => lerp(value, b.target[index], local)),
    fov: lerp(a.fov, b.fov, local),
  };
}

function findBeat(timeline, progress) {
  return timeline.beats.find((beat) => progress >= beat.start && progress <= beat.end)
    || timeline.beats[timeline.beats.length - 1];
}

function applyUiOpacity(id, value) {
  const map = {
    hero: ".hero-copy",
    chainwells: "#faucets",
    botmode: "#botmode",
    portal: ".hero-actions",
  };
  const selector = map[id];
  if (!selector) return;
  const element = document.querySelector(selector);
  if (!element) return;
  element.style.opacity = String(clamp01(value));
}

function applyBinding(binding, localProgress, context) {
  const easedProgress = localProgress;
  const hasRange = typeof binding.from === "number" && typeof binding.to === "number";
  const value = hasRange ? lerp(binding.from, binding.to, easedProgress) : binding.value;

  if (binding.target === "camera.path" && typeof value === "number") {
    context.setCameraProgress(value);
    return;
  }

  if (binding.target.startsWith("ui.") && binding.target.endsWith(".opacity") && typeof value === "number") {
    const id = binding.target.split(".")[1];
    applyUiOpacity(id, value);
    return;
  }

  if (binding.target === "light.utility.intensity" && typeof value === "number") {
    context.setUtilityIntensity(value);
    return;
  }

  if (binding.target.startsWith("agent.") && binding.target.endsWith(".state")) {
    const id = binding.target.split(".")[1];
    context.setAgentState(id, String(value));
    return;
  }

  if (binding.target.startsWith("district.") && binding.target.endsWith(".state")) {
    const id = binding.target.split(".")[1];
    context.setDistrictState(id, String(value));
  }
}

async function loadJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
  return response.json();
}

export async function createScrollScene({
  manifestUrl,
  camera,
  utilityLight,
  onAgentState = () => {},
  onDistrictState = () => {},
  onBeat = () => {},
}) {
  const manifest = await loadJson(manifestUrl);
  const manifestBase = new URL(".", new URL(manifestUrl, window.location.href));
  const cameraUrl = new URL(manifest.camera, manifestBase).href;
  const timelineUrl = new URL(manifest.timeline, manifestBase).href;
  const [cameraPath, timeline] = await Promise.all([loadJson(cameraUrl), loadJson(timelineUrl)]);

  let currentBeat = null;
  let mounted = false;
  let cleanup = () => {};
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lookTarget = new THREE.Vector3();

  function setCameraProgress(progress) {
    const frame = interpolateKeyframes(cameraPath.keyframes, reducedMotion ? Math.round(progress * 4) / 4 : progress);
    camera.position.set(...frame.position);
    lookTarget.set(...frame.target);
    camera.fov = frame.fov;
    camera.updateProjectionMatrix();
    camera.lookAt(lookTarget);
  }

  function setUtilityIntensity(value) {
    if (!utilityLight) return;
    utilityLight.intensity = 50 + clamp01(value) * 70;
  }

  function update(progress) {
    const normalized = clamp01(progress);
    const beat = findBeat(timeline, normalized);
    if (!beat) return;

    if (currentBeat !== beat.id) {
      currentBeat = beat.id;
      document.documentElement.dataset.sceneBeat = currentBeat;
      onBeat({ id: currentBeat, progress: normalized });
    }

    const span = Math.max(0.000001, beat.end - beat.start);
    const localProgress = clamp01((normalized - beat.start) / span);
    (beat.bindings || []).forEach((binding) => applyBinding(binding, localProgress, {
      setCameraProgress,
      setUtilityIntensity,
      setAgentState: onAgentState,
      setDistrictState: onDistrictState,
    }));
  }

  function nativeProgress() {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - innerHeight);
    return clamp01(scrollY / max);
  }

  function mount() {
    if (mounted) return;
    mounted = true;

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (gsap && ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      const trigger = ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => update(self.progress),
      });
      update(trigger.progress || 0);
      cleanup = () => trigger.kill();
      return;
    }

    const onScroll = () => update(nativeProgress());
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    cleanup = () => removeEventListener("scroll", onScroll);
  }

  function destroy() {
    cleanup();
    mounted = false;
  }

  return { manifest, timeline, cameraPath, mount, destroy, update };
}
