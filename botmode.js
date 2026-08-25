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
let team = [];
let activeAgentId = null;
let workflowIndex = 0;
let visible = false;
let observer;
let animationFrame;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = matchMedia("(max-width: 820px)").matches;

const safeText = (value) => String(value ?? "--");
const hexToNumber = (hex) => Number.parseInt(hex.replace("#", ""), 16);

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
    <span>GATEWAY</span><strong>${gateway.enabled ? "LIVE" : "VISUAL ONLY"}</strong>`;
  if (gatewayEl) gatewayEl.textContent = gateway.enabled ? "GATEWAY LIVE" : "PUBLIC TELEMETRY / NO EXECUTION";
}

function renderAgents() {
  if (!agentsEl || !config) return;
  agentsEl.innerHTML = config.agents.map((agent) => `
    <button class="bot-agent" type="button" data-agent-id="${agent.id}" style="--agent-color:${agent.color}">
      <span class="bot-agent-dot" aria-hidden="true"></span>
      <span><b>${agent.name}</b><br><small>${agent.role}</small></span>
      <small>${agent.responsibilities.length}</small>
    </button>`).join("");
  agentsEl.querySelectorAll(".bot-agent").forEach((button) => button.addEventListener("click", () => focusAgent(button.dataset.agentId)));
}

function renderWorkflow() {
  if (!workflowEl || !config) return;
  workflowEl.innerHTML = config.workflow.map((step, index) => `<button class="bot-step ${index === workflowIndex ? "active" : ""}" type="button" data-step="${index}">${step}</button>`).join("");
  workflowEl.querySelectorAll(".bot-step").forEach((button) => button.addEventListener("click", () => {
    workflowIndex = Number(button.dataset.step || 0);
    updateWorkflowUi();
  }));
}

function updateWorkflowUi() {
  document.querySelectorAll(".bot-step").forEach((step, index) => step.classList.toggle("active", index === workflowIndex));
  team.forEach((member, index) => {
    const active = index === workflowIndex % Math.max(1, team.length);
    member.userData.statusRing.material.opacity = active ? .95 : .22;
    member.userData.statusRing.scale.setScalar(active ? 1.22 : 1);
  });
}

function renderConfig() {
  if (!configEl || !config) return;
  configEl.textContent = JSON.stringify({
    profileId: config.profileId,
    mandate: config.authority?.mandate,
    tools: config.approvedCapabilities?.tools,
    workflow: config.workflow,
    receiptRequired: config.receipt?.required,
    receiptFields: config.receipt?.fields
  }, null, 2);
}

function createHumanoid(agent, index) {
  const color = hexToNumber(agent.color);
  const group = new THREE.Group();
  group.userData.agentId = agent.id;
  const dark = new THREE.MeshStandardMaterial({ color:0x0d151d, metalness:.72, roughness:.28 });
  const accent = new THREE.MeshStandardMaterial({ color:0x14202b, emissive:color, emissiveIntensity:.65, metalness:.62, roughness:.22 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(.2, 16, 12), accent); head.position.y=1.18;
  const visor = new THREE.Mesh(new THREE.BoxGeometry(.22,.06,.04), new THREE.MeshBasicMaterial({ color })); visor.position.set(0,1.22,.185);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.17,.46,4,8), dark); torso.position.y=.73;
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(.055,.34,3,7), accent); const armR=armL.clone(); armL.position.set(-.23,.74,0); armR.position.set(.23,.74,0);
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(.065,.4,3,7), dark); const legR=legL.clone(); legL.position.set(-.1,.28,0); legR.position.set(.1,.28,0);
  const statusRing = new THREE.Mesh(new THREE.TorusGeometry(.52,.025,7,40), new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.22 })); statusRing.rotation.x=Math.PI/2; statusRing.position.y=.04;
  group.add(head,visor,torso,armL,armR,legL,legR,statusRing);
  group.userData.armL=armL; group.userData.armR=armR; group.userData.legL=legL; group.userData.legR=legR; group.userData.statusRing=statusRing; group.userData.phase=index*.9;
  group.traverse((child)=>{if(child.isMesh)child.castShadow=true;});
  return group;
}

function buildScene() {
  if (!canvas || !config) return;
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03050a,.026);
  camera = new THREE.PerspectiveCamera(48,1,.1,100);
  camera.position.set(0,8.8,15.5); camera.lookAt(0,1.5,0);
  renderer = new THREE.WebGLRenderer({ canvas, antialias:!mobile, alpha:true, powerPreference:"high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1,mobile?1.1:1.45)); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
  world = new THREE.Group(); scene.add(world);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(7.4,7.9,.58,48),new THREE.MeshStandardMaterial({ color:0x080d13, emissive:0x051018, emissiveIntensity:.16, metalness:.82, roughness:.24 })); base.position.y=-.32; world.add(base);
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(6.9,6.9,.09,48),new THREE.MeshStandardMaterial({ color:0x0b131b, emissive:0x28efff, emissiveIntensity:.05, metalness:.68, roughness:.38 })); deck.position.y=.02; world.add(deck);

  const command = new THREE.Group();
  const commandTower = new THREE.Mesh(new THREE.CylinderGeometry(.65,.9,3.6,10),new THREE.MeshStandardMaterial({ color:0x101721, emissive:0xff2738, emissiveIntensity:.28, metalness:.85, roughness:.18 })); commandTower.position.y=1.85; command.add(commandTower);
  const commandCore = new THREE.Mesh(new THREE.OctahedronGeometry(.5,0),new THREE.MeshStandardMaterial({ color:0x28efff, emissive:0x28efff, emissiveIntensity:1.1, roughness:.1 })); commandCore.position.y=4; command.add(commandCore); world.add(command);

  team=[];
  const radius=4.8;
  config.agents.forEach((agent,index)=>{
    const angle=index/config.agents.length*Math.PI*2-Math.PI/2;
    const member=createHumanoid(agent,index);
    member.position.set(Math.cos(angle)*radius,.08,Math.sin(angle)*radius);
    member.rotation.y=-angle+Math.PI/2;
    world.add(member); team.push(member);
    const path=new THREE.CatmullRomCurve3([new THREE.Vector3(0,.2,0),new THREE.Vector3(member.position.x*.5,.12,member.position.z*.5),new THREE.Vector3(member.position.x,.12,member.position.z)]);
    world.add(new THREE.Mesh(new THREE.TubeGeometry(path,28,.018,5,false),new THREE.MeshBasicMaterial({ color:hexToNumber(agent.color),transparent:true,opacity:.28 })));
  });

  scene.add(new THREE.HemisphereLight(0xaadfff,0x08090d,.8));
  const cyan=new THREE.PointLight(0x28efff,55,28); cyan.position.set(5,8,4); scene.add(cyan);
  const red=new THREE.PointLight(0xff2738,45,26); red.position.set(-4,7,4); scene.add(red);
  const warm=new THREE.PointLight(0xff7a18,14,18); warm.position.set(-3,3,-5); scene.add(warm);
  const grid=new THREE.GridHelper(22,22,0x183845,0x0d1a22); grid.position.y=-.62; grid.material.transparent=true; grid.material.opacity=.18; world.add(grid);

  resize(); updateWorkflowUi(); setupVisibility(); animate();
}

function setupVisibility() {
  const shell = canvas?.closest('.botmode-canvas-shell') || canvas;
  observer = new IntersectionObserver((entries)=>{visible=entries.some((entry)=>entry.isIntersecting);},{rootMargin:"20% 0px",threshold:.01});
  if (shell) observer.observe(shell);
}

function focusAgent(agentId) {
  activeAgentId=agentId;
  document.querySelectorAll('.bot-agent').forEach((button)=>button.classList.toggle('active',button.dataset.agentId===agentId));
  team.forEach((member)=>member.scale.setScalar(member.userData.agentId===agentId?1.28:1));
  const target=team.find((member)=>member.userData.agentId===agentId);
  if(target){camera.position.set(target.position.x*1.35,5.4,target.position.z*1.35+5.4);camera.lookAt(target.position.x,.85,target.position.z);}
}

function resetView() {
  activeAgentId=null;
  document.querySelectorAll('.bot-agent').forEach((button)=>button.classList.remove('active'));
  team.forEach((member)=>member.scale.setScalar(1));
  camera.position.set(0,8.8,15.5); camera.lookAt(0,1.5,0);
}

function resize() {
  if(!renderer||!camera||!canvas)return;
  const rect=canvas.getBoundingClientRect(); const width=Math.max(1,rect.width); const height=Math.max(1,rect.height);
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,matchMedia('(max-width: 820px)').matches?1.1:1.45)); renderer.setSize(width,height,false); camera.aspect=width/height; camera.updateProjectionMatrix();
}

function animate() {
  animationFrame=requestAnimationFrame(animate);
  if(!renderer||!scene||!camera||!visible||document.hidden)return;
  const t=performance.now()*.001;
  if(!reducedMotion){
    world.rotation.y=Math.sin(t*.12)*.035;
    team.forEach((member,index)=>{
      const phase=t*3.5+member.userData.phase;
      member.userData.armL.rotation.x=Math.sin(phase)*.18;
      member.userData.armR.rotation.x=-Math.sin(phase)*.18;
      member.userData.legL.rotation.x=-Math.sin(phase)*.12;
      member.userData.legR.rotation.x=Math.sin(phase)*.12;
      member.position.y=.08+Math.abs(Math.sin(phase*.5))*.018;
      if(index===workflowIndex%team.length)member.userData.statusRing.rotation.z=t*.6;
    });
  }
  renderer.render(scene,camera);
}

async function init() {
  if(!canvas)return;
  try{
    config=await loadConfig(); renderState(); renderAgents(); renderWorkflow(); renderConfig(); buildScene();
    focusBtn?.addEventListener('click',()=>focusAgent(config.agents[0]?.id)); resetBtn?.addEventListener('click',resetView); addEventListener('resize',resize);
  }catch(error){if(stateEl)stateEl.innerHTML='<span>BOT MODE</span><strong class="warn">CONFIG ERROR</strong>';if(configEl)configEl.textContent=error instanceof Error?error.message:String(error);console.error('AQUEDUCT Bot Mode failed to initialize',error);}
}

addEventListener('beforeunload',()=>{if(animationFrame)cancelAnimationFrame(animationFrame);observer?.disconnect();renderer?.dispose();});
init();
