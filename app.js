import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { createScrollScene } from "./scroll-scene.js";

const chains = [
  { id:"ethereum-sepolia", name:"Ethereum", network:"Sepolia", asset:"ETH", family:"EVM", category:"evm", mark:"ETH", mode:"Provider utility", adapter:"EVMAdapter", color:0x8ea1ff, faucet:"https://ethereum.org/en/developers/docs/networks/", docs:"https://ethereum.org/en/developers/docs/networks/", note:"Sepolia testnet utility station." },
  { id:"base-sepolia", name:"Base", network:"Base Sepolia", asset:"ETH", family:"EVM / OP Stack", category:"evm", mark:"BASE", mode:"Provider utility", adapter:"BaseAdapter", color:0x3478ff, faucet:"https://docs.base.org/base-chain/tools/network-faucets", docs:"https://docs.base.org/base-chain/network-information", note:"Base Sepolia testnet utility station." },
  { id:"op-sepolia", name:"Optimism", network:"OP Sepolia", asset:"ETH", family:"EVM / OP Stack", category:"evm", mark:"OP", mode:"Superchain utility", adapter:"SuperchainAdapter", color:0xff344d, faucet:"https://console.optimism.io/faucet", docs:"https://docs.optimism.io/chain/networks", note:"OP Sepolia testnet utility station." },
  { id:"arbitrum-sepolia", name:"Arbitrum", network:"Arbitrum Sepolia", asset:"ETH", family:"EVM / Arbitrum", category:"evm", mark:"ARB", mode:"Provider utility", adapter:"ArbitrumAdapter", color:0x37b5ff, faucet:"https://docs.arbitrum.io/", docs:"https://docs.arbitrum.io/", note:"Arbitrum Sepolia testnet utility station." },
  { id:"polygon-amoy", name:"Polygon", network:"Amoy", asset:"POL", family:"EVM / Polygon", category:"evm", mark:"POL", mode:"Provider utility", adapter:"PolygonAdapter", color:0x9b55ff, faucet:"https://docs.polygon.technology/tools/gas/matic-faucet/", docs:"https://docs.polygon.technology/pos/reference/rpc-endpoints/", note:"Polygon Amoy testnet utility station." },
  { id:"avalanche-fuji", name:"Avalanche", network:"Fuji C-Chain", asset:"AVAX", family:"EVM / Avalanche", category:"evm", mark:"AVAX", mode:"Web utility", adapter:"AvalancheAdapter", color:0xff4b55, faucet:"https://core.app/tools/testnet-faucet/", docs:"https://build.avax.network/docs/quick-start/networks/fuji-testnet", note:"Avalanche Fuji testnet utility station." },
  { id:"bsc-testnet", name:"BNB Chain", network:"BSC Testnet", asset:"tBNB", family:"EVM / BNB", category:"evm", mark:"BNB", mode:"Web utility", adapter:"BnbAdapter", color:0xf3ba2f, faucet:"https://www.bnbchain.org/en/testnet-faucet", docs:"https://docs.bnbchain.org/bnb-smart-chain/developers/network-config/", note:"BNB testnet utility station." },
  { id:"litvm-liteforge", name:"LitVM", network:"LiteForge", asset:"zkLTC", family:"EVM / LitVM", category:"evm", mark:"LTC", mode:"Testnet utility", adapter:"LitVMAdapter", color:0xbac5d0, faucet:"https://liteforge.explorer.caldera.xyz/", docs:"https://liteforge.explorer.caldera.xyz/", note:"Digital Silver Borough test lane." },
  { id:"solana-devnet", name:"Solana", network:"Devnet", asset:"SOL", family:"Solana", category:"non-evm", mark:"SOL", mode:"Programmatic utility", adapter:"SolanaAdapter", color:0x14f195, faucet:"https://faucet.solana.com/", docs:"https://solana.com/docs/references/clusters", note:"Solana Devnet utility station." },
  { id:"xrpl-testnet", name:"XRPL", network:"Testnet", asset:"XRP", family:"XRPL", category:"non-evm", mark:"XRP", mode:"SDK utility", adapter:"XrplAdapter", color:0xe7f4ff, faucet:"https://xrpl.org/resources/dev-tools/xrp-faucets", docs:"https://xrpl.org/docs/concepts/networks-and-servers/parallel-networks", note:"XRPL Testnet utility station." },
  { id:"stellar-testnet", name:"Stellar", network:"Testnet", asset:"XLM", family:"Stellar", category:"non-evm", mark:"XLM", mode:"Friendbot utility", adapter:"StellarAdapter", color:0x28efff, faucet:"https://developers.stellar.org/docs/data/apis/horizon/api-reference/resources/create-account", docs:"https://developers.stellar.org/docs/networks", note:"Stellar Testnet utility station." },
  { id:"sui-testnet", name:"Sui", network:"Testnet", asset:"SUI", family:"Move / Sui", category:"non-evm", mark:"SUI", mode:"Client utility", adapter:"SuiAdapter", color:0x6fbcf0, faucet:"https://faucet.sui.io/", docs:"https://docs.sui.io/guides/developer/getting-started/connect", note:"Sui Testnet utility station." },
  { id:"aptos-testnet", name:"Aptos", network:"Testnet", asset:"APT", family:"Move / Aptos", category:"non-evm", mark:"APT", mode:"API utility", adapter:"AptosAdapter", color:0x78f0cf, faucet:"https://aptos.dev/network/faucet", docs:"https://aptos.dev/network/nodes/networks", note:"Aptos Testnet utility station." },
  { id:"polkadot-paseo", name:"Polkadot", network:"Paseo", asset:"PAS", family:"Substrate", category:"non-evm", mark:"DOT", mode:"Community utility", adapter:"SubstrateAdapter", color:0xff4da6, faucet:"https://docs.polkadot.com/develop/networks/", docs:"https://docs.polkadot.com/develop/networks/", note:"Paseo utility station." },
  { id:"monero-stagenet", name:"VEILWELL", network:"Monero Stagenet", asset:"sXMR", family:"Monero / Privacy", category:"privacy", mark:"XMR", mode:"Privacy utility", adapter:"MoneroAdapter", color:0xff7a18, faucet:"https://docs.getmonero.org/infrastructure/networks/", docs:"https://docs.getmonero.org/infrastructure/networks/", note:"Privacy-sensitive utility station with Stagenet-first policy." }
];

const districts = [
  { name:"HERMES TOWER", x:0, z:0, color:0xff2738, height:10 },
  { name:"IDENTITY PLAZA", x:-8, z:-6, color:0xff5364, height:6 },
  { name:"UTILITY GRID", x:8, z:-6, color:0x28efff, height:7 },
  { name:"DOCKING DISTRICT", x:-9, z:7, color:0x8ea1ff, height:7 },
  { name:"ENTERTAINMENT", x:0, z:9, color:0xac5cff, height:7 },
  { name:"GAMING DISTRICT", x:9, z:7, color:0x14f195, height:6 }
];

const stationSlots = [[-14,-10],[-9,-11],[-4,-11],[2,-11],[7,-11],[13,-9],[-14,-3],[-14,4],[-11,10],[-5,12],[1,12],[7,12],[13,8],[14,1],[13,-5]];
const bootLines = [
  "boot://hermes3d-agent-city",
  "scene contract: agentropolis.spatial-scene.v1",
  "experience tier: 2 / procedural 3D",
  "scroll: camera operator",
  `chainwell stations: ${chains.length}`,
  "agent traffic: online",
  "governor: FLOWKEEPER",
  "registry: WALLET ATLAS",
  "evaluator: BE",
  "privacy utility: VEILWELL / XMR STAGENET",
  "ready: traversable city scene"
];

const terminal = document.querySelector("#typewriter");
const chainCount = document.querySelector("#chainCount");
const faucetGrid = document.querySelector("#faucetGrid");
const detailPanel = document.querySelector("#detailPanel");
const closeDetail = document.querySelector("#closeDetail");
const filters = document.querySelectorAll(".filter");
if (chainCount) chainCount.textContent = String(chains.length);

function typeBootSequence() {
  if (!terminal) return;
  let lineIndex = 0;
  let charIndex = 0;
  let output = "";
  const tick = () => {
    const line = bootLines[lineIndex];
    output += line[charIndex] || "";
    terminal.textContent = output + "_";
    charIndex += 1;
    if (charIndex > line.length) {
      output += "\n";
      lineIndex += 1;
      charIndex = 0;
    }
    if (lineIndex < bootLines.length) setTimeout(tick, charIndex === 0 ? 130 : 13);
    else terminal.textContent = output + "\nSCENE READY";
  };
  tick();
}

function renderCards(filter = "all") {
  if (!faucetGrid) return;
  const visible = chains.filter((chain) => filter === "all" || chain.category === filter);
  faucetGrid.innerHTML = visible.map((chain) => {
    const color = `#${chain.color.toString(16).padStart(6, "0")}`;
    return `<article class="card spotlight-card ${chain.category === "privacy" ? "privacy-card" : ""}" style="--card-glow:${color}26">
      <div class="card-top"><span class="chain-mark" style="color:${color}">${chain.mark}</span><span class="tag">${chain.family}</span></div>
      <h3>${chain.name}</h3><div class="card-network">${chain.network} / ${chain.asset}</div><p>${chain.note}</p>
      <div class="card-meta"><span class="tag">CHAINWELL</span><span class="tag">${chain.adapter}</span></div>
      <div class="card-actions"><a class="button primary" href="${chain.faucet}" target="_blank" rel="noreferrer">SOURCE</a><a class="button ghost" href="${chain.docs}" target="_blank" rel="noreferrer">DOCS</a></div>
    </article>`;
  }).join("");

  document.querySelectorAll(".spotlight-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}

function setupFilters() {
  filters.forEach((button) => button.addEventListener("click", () => {
    filters.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderCards(button.dataset.filter || "all");
  }));
}

function showDetail(chain) {
  if (!detailPanel || !chain) return;
  const color = `#${chain.color.toString(16).padStart(6, "0")}`;
  const mark = document.querySelector("#detailMark");
  mark.textContent = chain.mark;
  mark.style.color = color;
  mark.style.borderColor = color;
  document.querySelector("#detailName").textContent = `${chain.name} CHAINWELL`;
  document.querySelector("#detailNetwork").textContent = `${chain.network} utility station`;
  document.querySelector("#detailAsset").textContent = chain.asset;
  document.querySelector("#detailFamily").textContent = chain.family;
  document.querySelector("#detailMode").textContent = chain.mode;
  document.querySelector("#detailAdapter").textContent = chain.adapter;
  document.querySelector("#detailNote").textContent = chain.note;
  const faucet = document.querySelector("#detailFaucet");
  const docs = document.querySelector("#detailDocs");
  faucet.href = chain.faucet; faucet.target = "_blank"; faucet.rel = "noreferrer";
  docs.href = chain.docs; docs.target = "_blank"; docs.rel = "noreferrer";
  detailPanel.classList.toggle("privacy-detail", chain.category === "privacy");
  detailPanel.classList.add("open");
}

function makeLabel(text, className = "") {
  const label = document.createElement("span");
  label.className = `city-label ${className}`.trim();
  label.textContent = text;
  return label;
}

function createBuilding(group, x, z, w, d, h, accent) {
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color:0x0a1017, emissive:accent, emissiveIntensity:.08, metalness:.82, roughness:.27 })
  );
  body.position.set(x, h / 2, z);
  group.add(body);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(w * .78, .06, d * .78), new THREE.MeshBasicMaterial({ color:accent, transparent:true, opacity:.72 }));
  cap.position.set(x, h + .04, z);
  group.add(cap);
}

function createHumanoid(color, role, route, offset) {
  const group = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color:0x101820, metalness:.65, roughness:.34 });
  const accent = new THREE.MeshStandardMaterial({ color:0x17222d, emissive:color, emissiveIntensity:.58, metalness:.7, roughness:.22 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(.16, 14, 12), accent);
  head.position.y = .92;
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.14, .38, 4, 8), dark);
  torso.position.y = .57;
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(.05, .28, 3, 7), accent);
  const armR = armL.clone();
  armL.position.set(-.18,.58,0); armR.position.set(.18,.58,0);
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(.055, .32, 3, 7), dark);
  const legR = legL.clone();
  legL.position.set(-.08,.2,0); legR.position.set(.08,.2,0);
  group.add(head, torso, armL, armR, legL, legR);
  group.scale.setScalar(1.25);
  group.userData = { role, route, offset, armL, armR, legL, legR, state:"walking", speed:1 };
  return group;
}

function createChainwellStation(world, chain, x, z, selectable) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  const color = new THREE.Color(chain.color);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.35,.12,24), new THREE.MeshStandardMaterial({ color:0x0a0f14, emissive:color, emissiveIntensity:.08, metalness:.76, roughness:.3 }));
  base.position.y = .07;
  group.add(base);
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,.12,24), new THREE.MeshStandardMaterial({ color:0x101820, emissive:color, emissiveIntensity:.3, metalness:.82, roughness:.2 }));
  canopy.position.y = 1.65;
  canopy.userData.chain = chain;
  group.add(canopy); selectable.push(canopy);
  [-.55,.55].forEach((px) => {
    const dispenser = new THREE.Mesh(new THREE.BoxGeometry(.32,.8,.38), new THREE.MeshStandardMaterial({ color:0x0d151c, emissive:color, emissiveIntensity:.42, metalness:.72, roughness:.24 }));
    dispenser.position.set(px,.55,.1); dispenser.userData.chain = chain; group.add(dispenser); selectable.push(dispenser);
  });
  const halo = new THREE.Mesh(new THREE.TorusGeometry(1.32,.025,8,48), new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.58 }));
  halo.rotation.x = Math.PI/2; halo.position.y=.15; group.add(halo);
  world.add(group);
  return group;
}

async function createAqueduct() {
  const canvas = document.querySelector("#aqueduct3d");
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030407, .017);
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, .1, 180);
  camera.position.set(24,20,30); camera.lookAt(0,2.2,0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, matchMedia("(max-width: 820px)").matches ? 1.25 : 1.65));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const world = new THREE.Group();
  scene.add(world);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(42,36), new THREE.MeshStandardMaterial({ color:0x05080c, emissive:0x020406, emissiveIntensity:.2, metalness:.5, roughness:.7 }));
  ground.rotation.x = -Math.PI/2; world.add(ground);
  const grid = new THREE.GridHelper(42,42,0x24404a,0x101a22); grid.position.y=.025; grid.material.transparent=true; grid.material.opacity=.26; world.add(grid);

  const labelLayer = document.createElement("div");
  labelLayer.className = "city-label-layer";
  document.body.appendChild(labelLayer);
  const labels = [];
  const selectable = [];

  districts.forEach((district, di) => {
    const group = new THREE.Group();
    const count = 7;
    for (let i=0;i<count;i+=1) {
      const angle = (i/count)*Math.PI*2;
      const radius = i===0 ? 0 : 1.5 + ((di*31+i*17)%10)/10;
      const h = i===0 ? district.height : 2 + ((di*23+i*13)%10)/10 * district.height*.48;
      createBuilding(group, district.x + Math.cos(angle)*radius, district.z + Math.sin(angle)*radius, i===0?1.7:.7+((i*7)%5)*.13, i===0?1.7:.7+((i*5)%4)*.16, h, district.color);
    }
    world.add(group);
    const label = makeLabel(district.name,"district-label");
    labelLayer.appendChild(label); labels.push({ label, position:new THREE.Vector3(district.x,district.height+1,district.z) });
  });

  const utilityLight = new THREE.PointLight(0x28efff, 100, 38); utilityLight.position.set(8,10,-6); scene.add(utilityLight);
  const redLight = new THREE.PointLight(0xff2738, 92, 36); redLight.position.set(0,12,1); scene.add(redLight);
  const violetLight = new THREE.PointLight(0xac5cff, 40, 30); violetLight.position.set(0,8,10); scene.add(violetLight);
  scene.add(new THREE.AmbientLight(0xaac8ff,.42));

  chains.forEach((chain,index) => {
    const [x,z] = stationSlots[index];
    createChainwellStation(world,chain,x,z,selectable);
    const label = makeLabel(`${chain.mark} / ${chain.network}`, chain.category === "privacy" ? "privacy-label" : "utility-label");
    labelLayer.appendChild(label); labels.push({ label, position:new THREE.Vector3(x,2.3,z) });
  });

  const routes = [
    [[-16,-3],[16,-3]], [[-16,4],[16,4]], [[-5,-15],[-5,15]], [[5,-15],[5,15]], [[0,-15],[0,15]], [[-14,10],[13,-9]]
  ];
  const roles = ["city","hermes","wallet-atlas","route-engine","verifier","receipt-scribe","veil-sentinel","city","city","city"];
  const agents = [];
  roles.forEach((role,index) => {
    const color = role === "hermes" ? 0xff2738 : role === "veil-sentinel" ? 0xff7a18 : role === "receipt-scribe" ? 0xac5cff : 0x28efff;
    const agent = createHumanoid(color,role,routes[index % routes.length],index/roles.length);
    agent.position.y=.1; world.add(agent); agents.push(agent);
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const intersectAt = (x,y) => {
    pointer.x = (x/innerWidth)*2-1; pointer.y = -(y/innerHeight)*2+1;
    raycaster.setFromCamera(pointer,camera);
    return raycaster.intersectObjects(selectable,false)[0];
  };
  canvas.addEventListener("pointermove", (event) => { canvas.style.cursor = intersectAt(event.clientX,event.clientY) ? "pointer" : "default"; });
  canvas.addEventListener("click", (event) => { const hit = intersectAt(event.clientX,event.clientY); if (hit?.object?.userData?.chain) showDetail(hit.object.userData.chain); });

  const agentState = new Map();
  const districtState = new Map();
  const scrollScene = await createScrollScene({
    manifestUrl:"./scenes/aqueduct-agent-city/manifest.json",
    camera,
    utilityLight,
    onAgentState:(id,state) => agentState.set(id,state),
    onDistrictState:(id,state) => districtState.set(id,state),
    onBeat:({id}) => {
      document.querySelectorAll("[data-beat]").forEach((el) => el.classList.toggle("active", el.dataset.beat === id));
    }
  });
  scrollScene.mount();

  const clock = new THREE.Clock();
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let visible = true;
  const observer = new IntersectionObserver((entries) => { visible = entries.some((entry) => entry.isIntersecting); }, { threshold:.01 });
  observer.observe(document.querySelector("#top") || document.body);

  function animateAgent(agent, elapsed) {
    const data = agent.userData;
    const state = agentState.get(data.role) || (data.role === "city" ? agentState.get("city") : null) || "walking";
    const stateSpeed = state === "servicing" || state === "verifying" || state === "receipting" ? .42 : state === "orchestrating" ? 1.35 : 1;
    const route = data.route;
    const cycle = (elapsed * .055 * stateSpeed + data.offset) % 1;
    const ping = cycle < .5 ? cycle*2 : (1-cycle)*2;
    agent.position.x = THREE.MathUtils.lerp(route[0][0],route[1][0],ping);
    agent.position.z = THREE.MathUtils.lerp(route[0][1],route[1][1],ping);
    const phase = elapsed*7*stateSpeed + data.offset*10;
    data.armL.rotation.x = Math.sin(phase)*.55; data.armR.rotation.x = -Math.sin(phase)*.55;
    data.legL.rotation.x = -Math.sin(phase)*.45; data.legR.rotation.x = Math.sin(phase)*.45;
    agent.position.y = .12 + Math.abs(Math.sin(phase))*0.025;
  }

  function projectLabels() {
    labels.forEach(({label,position}) => {
      const projected = position.clone().applyMatrix4(world.matrixWorld).project(camera);
      const x = (projected.x*.5+.5)*innerWidth;
      const y = (-projected.y*.5+.5)*innerHeight;
      const show = projected.z < 1 && x > -180 && x < innerWidth+180 && y > -100 && y < innerHeight+100;
      label.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      label.style.opacity = show ? ".84" : "0";
    });
  }

  function render() {
    requestAnimationFrame(render);
    if (!visible || document.hidden) return;
    const elapsed = clock.getElapsedTime();
    if (!reducedMotion) agents.forEach((agent) => animateAgent(agent,elapsed));
    projectLabels();
    renderer.render(scene,camera);
  }
  render();

  addEventListener("resize", () => {
    camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight);
  });
  addEventListener("beforeunload", () => { observer.disconnect(); scrollScene.destroy(); });
}

closeDetail?.addEventListener("click", () => detailPanel?.classList.remove("open"));
addEventListener("keydown", (event) => { if (event.key === "Escape") detailPanel?.classList.remove("open"); });
addEventListener("load", () => {
  renderCards(); setupFilters(); typeBootSequence(); createAqueduct().catch((error) => {
    console.error(error);
    document.documentElement.dataset.sceneError = "true";
  });
});
