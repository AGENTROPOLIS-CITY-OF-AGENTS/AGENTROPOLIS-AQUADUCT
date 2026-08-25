import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const GSAP_URL = "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js";
const SCROLL_TRIGGER_URL = "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js";

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      }
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });
}

async function ensureScrollTrigger() {
  if (!window.gsap) await loadScript(GSAP_URL);
  if (!window.ScrollTrigger) await loadScript(SCROLL_TRIGGER_URL);
  return Boolean(window.gsap && window.ScrollTrigger);
}

function easeProgress(name, progress) {
  const p = clamp01(progress);
  if (!name || name === "none" || name === "linear") return p;
  if (window.gsap?.parseEase) {
    try {
      return clamp01(window.gsap.parseEase(name)(p));
    } catch {
      return p;
    }
  }
  if (name === "power1.out") return 1 - (1 - p) * (1 - p);
  if (name === "power1.in") return p * p;
  if (name === "power1.inOut") return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  return p;
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
    hero: ".city-stage-head",
    chainwells: "#faucets .section-head",
    botmode: "#botmode .botmode-head",
    portal: ".utility-cta",
  };
  const selector = map[id];
  if (!selector) return;
  const element = document.querySelector(selector);
  if (!element) return;
  element.style.opacity = String(clamp01(value));
}

function applyBinding(binding, localProgress, context) {
  const eased = easeProgress(binding.ease, localProgress);
  const hasRange = typeof binding.from === "number" && typeof binding.to === "number";
  const value = hasRange ? lerp(binding.from, binding.to, eased) : binding.value;

  if (binding.target === "camera.path" && typeof value === "number") {
    context.setCameraProgress(value);
    return;
  }

  if (binding.target.startsWith("ui.") && binding.target.endsWith(".opacity") && typeof value === "number") {
    applyUiOpacity(binding.target.split(".")[1], value);
    return;
  }

  if (binding.target === "light.utility.intensity" && typeof value === "number") {
    context.setUtilityIntensity(value);
    return;
  }

  if (binding.target.startsWith("agent.") && binding.target.endsWith(".state")) {
    context.setAgentState(binding.target.split(".")[1], String(value));
    return;
  }

  if (binding.target.startsWith("district.") && binding.target.endsWith(".state")) {
    context.setDistrictState(binding.target.split(".")[1], String(value));
  }
}

async function loadJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
  return response.json();
}

function validateTimeline(timeline) {
  if (!Array.isArray(timeline?.beats) || timeline.beats.length === 0) throw new Error("Scroll timeline has no beats");
  let previousEnd = 0;
  timeline.beats.forEach((beat, index) => {
    if (typeof beat.start !== "number" || typeof beat.end !== "number" || beat.start < 0 || beat.end > 1 || beat.end <= beat.start) {
      throw new Error(`Invalid scroll beat range at index ${index}`);
    }
    if (index > 0 && beat.start < previousEnd - 0.000001) throw new Error(`Overlapping scroll beat at ${beat.id}`);
    previousEnd = beat.end;
  });
}

function validateCameraPath(cameraPath) {
  const frames = cameraPath?.keyframes;
  if (!Array.isArray(frames) || frames.length < 2) throw new Error("Camera path requires at least two keyframes");
  let previousT = -1;
  frames.forEach((frame, index) => {
    if (typeof frame.t !== "number" || frame.t < previousT || !Array.isArray(frame.position) || !Array.isArray(frame.target)) {
      throw new Error(`Invalid camera keyframe at index ${index}`);
    }
    previousT = frame.t;
  });
  if (frames[0].t !== 0 || frames[frames.length - 1].t !== 1) throw new Error("Camera path must cover 0.0 through 1.0");
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
  validateCameraPath(cameraPath);
  validateTimeline(timeline);

  let currentBeat = null;
  let mounted = false;
  let cleanup = () => {};
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lookTarget = new THREE.Vector3();

  function setCameraProgress(progress) {
    const stepped = reducedMotion ? Math.round(clamp01(progress) * 4) / 4 : progress;
    const frame = interpolateKeyframes(cameraPath.keyframes, stepped);
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

  async function mount() {
    if (mounted) return;
    mounted = true;

    let hasScrollTrigger = false;
    try {
      hasScrollTrigger = await ensureScrollTrigger();
    } catch (error) {
      console.warn("ScrollTrigger unavailable; using native scroll fallback", error);
    }

    if (hasScrollTrigger) {
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const trigger = ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.35,
        invalidateOnRefresh: true,
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
