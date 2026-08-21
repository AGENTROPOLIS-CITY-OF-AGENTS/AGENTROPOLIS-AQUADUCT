import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const CONFIG_URL = "./config/hermes-botmode.aqueduct.json";
const canvas = document.querySelector("#botmode3d");
const stateEl = document.querySelector("#botmodeState");
const agentsEl = document.querySelector("#botmodeAgents");
const workflowEl = document.querySelector("#botmodeWorkflow");
const configEl = document.querySelector("#botmodeConfig");
const gatewayEl = document.querySelector("#botmodeGateway");
const focusBtn = document.querySelector("#botmodeFocus");
const resetBtn = document.querySelector("#botmodeReset");

let config;
let scene;
let camera;
let renderer;
let world;
let hub;
let agentMeshes = [];
let routeLines = [];
let activeAgentId = null;
let workflowIndex = 0;
let animationFrame;

function safeText(value) {
  return String(value ?? "--");
}

async function loadConfig() {
  const response = await fetch(CONFIG_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`Bot Mode config ${response.status}`);
  return response.json();
}

function renderState() {
  if (!stateEl || !config) return;
  const runtime = config.runtime || {};
  const authority = config.authority || {};
  const gateway = runtime.gateway || {};
  stateEl.innerHTML = `
    <span>PROFILE</span><strong>${safeText(config.profileId)}</strong>
    <span>DISTRICT</span><strong>${safeText(config.district)}</strong>
    <span>RUNTIME</span><strong>${safeText(runtime.kind)}</strong>
    <span>SCOPE</span><strong>${safeText(runtime.scope).toUpperCase()}</strong>
    <span>STATUS</span><strong>${safeText(runtime.status).toUpperCase()}</strong>
    <span>MAINNET</span><strong class="warn">${authority.mainnetAllowed ? "ALLOWED" : "DENY"}</strong>
    <span>GATEWAY</span><strong>${gateway.enabled ? "LIVE" : "VISUAL ONLY"}</strong>
  `;
  if (gatewayEl) gatewayEl.textContent = gateway.enabled ? "GATEWAY LIVE" : "PUBLIC TELEMETRY / NO EXECUTION";
}

function renderAgents() {
  if (!agentsEl || !config) return;
  agentsEl.innerHTML = config.agents.map((agent) => `
    <button class="bot-agent" type="button" data-agent-id="${agent.id}" style="--agent-color:${agent.color}">
      <span class="bot-agent-dot" aria-hidden="true"></span>
      <span><b>${agent.name}</b><br><small>${agent.role}</small></span>
      <small>${agent.responsibilities.length}</small>
    </button>
  `).join("");
  agentsEl.querySelectorAll(".bot-agent").forEach((button) => {
    button.addEventListener("click", () => focusAgent(button.dataset.agentId));
  });
}

function renderWorkflow() {
  if (!workflowEl || !config) return;
  workflowEl.innerHTML = config.workflow.map((step, index) => `
    <div class="bot-step ${index === workflowIndex ? "active" : ""}" data-step="${index}">${step}</div>
  `).join("");
}

function renderConfig() {
  if (!configEl || !config) return;
  const display = {
    profileId: config.profileId,
    mandate: config.authority?.mandate,
    tools: config.approvedCapabilities?.tools,
    workflow: config.workflow,
    receiptRequired: config.receipt?.required,
    receiptFields: config.receipt?.fields,
  };
  configEl.textContent = JSON.stringify(display, null, 2);
}

function hexToNumber(hex) {
  return Number.parseInt(hex.replace("#", ""), 16);
}

function createLabelSprite(text, color = "#28efff") {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = "rgba(2,5,8,.82)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.fillRect(8, 12, 496, 104);
  ctx.strokeRect(8, 12, 496, 104);
  ctx.fillStyle = color;
  ctx.font = "700 32px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 65);
  const texture = new THREE.CanvasTexture(c);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(5.2, 1.3, 1);
  return sprite;
}

function buildScene() {
  if (!canvas || !config) return;
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030406, 0.03);
  camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 10.5, 19);
  camera.lookAt(0, 2.5, 0);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  world = new THREE.Group();
  scene.add(world);

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(7.7, 8.25, 0.5, 64),
    new THREE.MeshStandardMaterial({ color: 0x080b11, metalness: 0.82, roughness: 0.22, emissive: 0x210207, emissiveIntensity: 0.18 })
  );
  platform.position.y = -0.2;
  world.add(platform);

  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(6.8, 6.8, 0.08, 64),
    new THREE.MeshPhysicalMaterial({ color: 0x073e4b, emissive: 0x28efff, emissiveIntensity: 0.18, transparent: true, opacity: 0.45, roughness: 0.18 })
  );
  inner.position.y = 0.08;
  world.add(inner);

  [2.5, 4.6, 6.6].forEach((radius, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, index === 2 ? 0.055 : 0.025, 8, 96),
      new THREE.MeshBasicMaterial({ color: index === 1 ? 0x28efff : 0xff2738, transparent: true, opacity: index === 2 ? 0.72 : 0.42 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.13 + index * 0.04;
    world.add(ring);
  });

  hub = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.55, 4.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x0b1119, metalness: 0.86, roughness: 0.16, emissive: 0xff2738, emissiveIntensity: 0.22 })
  );
  base.position.y = 2.25;
  hub.add(base);

  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.86, 0),
    new THREE.MeshStandardMaterial({ color: 0x28efff, emissive: 0x28efff, emissiveIntensity: 1.05, metalness: 0.2, roughness: 0.12 })
  );
  core.position.y = 5.15;
  hub.add(core);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.07, 12, 80),
    new THREE.MeshBasicMaterial({ color: 0x28efff, transparent: true, opacity: 0.9 })
  );
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 5.15;
  hub.add(halo);

  const halo2 = halo.clone();
  halo2.scale.setScalar(1.45);
  halo2.material = new THREE.MeshBasicMaterial({ color: 0xff2738, transparent: true, opacity: 0.45 });
  halo2.position.y = 5.15;
  hub.add(halo2);

  const botLabel = createLabelSprite("HERMES BOT MODE", "#ff6572");
  botLabel.position.set(0, 7.2, 0);
  hub.add(botLabel);
  world.add(hub);

  agentMeshes = [];
  routeLines = [];
  const radius = 5.4;
  config.agents.forEach((agent, index) => {
    const angle = (index / config.agents.length) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const group = new THREE.Group();
    group.userData.agentId = agent.id;

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.92, 1.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x0b1016, metalness: 0.78, roughness: 0.2, emissive: hexToNumber(agent.color), emissiveIntensity: 0.14 })
    );
    pedestal.position.y = 0.85;
    group.add(pedestal);

    const orb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.43, 1),
      new THREE.MeshStandardMaterial({ color: hexToNumber(agent.color), emissive: hexToNumber(agent.color), emissiveIntensity: 0.95, metalness: 0.1, roughness: 0.18 })
    );
    orb.position.y = 1.85;
    group.add(orb);

    const label = createLabelSprite(agent.name, agent.color);
    label.scale.set(3.8, 0.95, 1);
    label.position.y = 2.75;
    group.add(label);
    group.position.set(x, 0, z);
    world.add(group);
    agentMeshes.push(group);

    const points = [new THREE.Vector3(0, 1.2, 0), new THREE.Vector3(x * 0.5, 0.55, z * 0.5), new THREE.Vector3(x, 0.25, z)];
    const curve = new THREE.CatmullRomCurve3(points);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 36, 0.035, 6, false),
      new THREE.MeshBasicMaterial({ color: hexToNumber(agent.color), transparent: true, opacity: 0.45 })
    );
    world.add(tube);
    routeLines.push(tube);
  });

  const ambient = new THREE.AmbientLight(0x95c7dd, 0.48);
  scene.add(ambient);
  const redLight = new THREE.PointLight(0xff2738, 45, 30, 2);
  redLight.position.set(-5, 8, 5);
  scene.add(redLight);
  const cyanLight = new THREE.PointLight(0x28efff, 52, 32, 2);
  cyanLight.position.set(6, 9, 3);
  scene.add(cyanLight);
  const warm = new THREE.PointLight(0xff7a18, 18, 20, 2);
  warm.position.set(-4, 3, -6);
  scene.add(warm);

  const grid = new THREE.GridHelper(28, 28, 0xff2738, 0x142b33);
  grid.position.y = -0.47;
  grid.material.transparent = true;
  grid.material.opacity = 0.22;
  world.add(grid);

  resize();
  animate();
}

function focusAgent(agentId) {
  activeAgentId = agentId;
  document.querySelectorAll(".bot-agent").forEach((button) => {
    button.classList.toggle("active", button.dataset.agentId === agentId);
  });
  agentMeshes.forEach((group) => {
    const active = group.userData.agentId === agentId;
    group.scale.setScalar(active ? 1.22 : 1);
  });
  const target = agentMeshes.find((group) => group.userData.agentId === agentId);
  if (target) {
    camera.position.set(target.position.x * 1.45, 7.3, target.position.z * 1.45 + 7.5);
    camera.lookAt(target.position.x * 0.72, 1.7, target.position.z * 0.72);
  }
}

function resetView() {
  activeAgentId = null;
  document.querySelectorAll(".bot-agent").forEach((button) => button.classList.remove("active"));
  agentMeshes.forEach((group) => group.scale.setScalar(1));
  camera.position.set(0, 10.5, 19);
  camera.lookAt(0, 2.5, 0);
}

function resize() {
  if (!renderer || !camera || !canvas) return;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function animate() {
  if (!renderer || !scene || !camera) return;
  animationFrame = requestAnimationFrame(animate);
  const t = performance.now() * 0.001;
  if (hub) {
    hub.children.forEach((child, index) => {
      if (child.geometry?.type === "TorusGeometry") child.rotation.z = t * (index % 2 ? 0.22 : -0.16);
    });
  }
  agentMeshes.forEach((group, index) => {
    const orb = group.children[1];
    if (orb) {
      orb.rotation.x = t * 0.7 + index;
      orb.rotation.y = t * 0.9 + index * 0.4;
      orb.position.y = 1.85 + Math.sin(t * 1.8 + index) * 0.11;
    }
  });
  routeLines.forEach((line, index) => {
    line.material.opacity = 0.28 + (Math.sin(t * 2.4 + index) + 1) * 0.16;
  });
  workflowIndex = Math.floor(t / 1.4) % config.workflow.length;
  document.querySelectorAll(".bot-step").forEach((step, index) => step.classList.toggle("active", index === workflowIndex));
  renderer.render(scene, camera);
}

async function init() {
  if (!canvas) return;
  try {
    config = await loadConfig();
    renderState();
    renderAgents();
    renderWorkflow();
    renderConfig();
    buildScene();
    if (focusBtn) focusBtn.addEventListener("click", () => focusAgent(config.agents[0]?.id));
    if (resetBtn) resetBtn.addEventListener("click", resetView);
    window.addEventListener("resize", resize);
  } catch (error) {
    if (stateEl) stateEl.innerHTML = `<span>BOT MODE</span><strong class="warn">CONFIG ERROR</strong>`;
    if (configEl) configEl.textContent = error instanceof Error ? error.message : String(error);
    console.error("AQUEDUCT Bot Mode failed to initialize", error);
  }
}

window.addEventListener("beforeunload", () => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
});

init();
