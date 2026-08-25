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
  { id:"hermes", name:"HERMES TOWER", x:0, z:0, color:0xff2738, height:10 },
  { id:"identity", name:"IDENTITY PLAZA", x:-8, z:-6, color:0xff5364, height:6 },
  { id:"utility-grid", name:"UTILITY GRID", x:8, z:-6, color:0x28efff, height:7 },
  { id:"docking", name:"DOCKING DISTRICT", x:-9, z:7, color:0x8ea1ff, height:7 },
  { id:"entertainment", name:"ENTERTAINMENT", x:0, z:9, color:0xac5cff, height:7 },
  { id:"gaming", name:"GAMING DISTRICT", x:9, z:7, color:0x14f195, height:6 }
];

const stationSlots = [[-14,-10],[-9,-11],[-4,-11],[2,-11],[7,-11],[13,-9],[-14,-3],[-14,4],[-11,10],[-5,12],[1,12],[7,12],[13,8],[14,1],[13,-5]];
const agentSpawns = [[-2,-1],[2,1],[-7,-3],[6,-2],[-4,6],[4,6],[10,4],[-10,3],[1,7],[-1,-7]];
const bootLines = [
  "boot://hermes3d-agent-city",
  "scene contract: agentropolis.spatial-scene.v1",
  "experience tier: 2 / procedural 3D",
  "scroll: camera operator / GSAP ScrollTrigger",
  `chainwell stations: ${chains.length}`,
  "agent behavior: navigate -> dock -> replenish -> receipt -> depart",
  "governor: FLOWKEEPER",
  "registry: WALLET ATLAS",
  "evaluator: BE",
  "privacy utility: VEILWELL / XMR STAGENET",
  "ready: WebGL diorama online"
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
    else terminal.textContent = output + "\nDIORAMA READY";
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

function createDioramaBase(world) {
  const lower = new THREE.Mesh(new THREE.BoxGeometry(42.8,1.15,36.8),new THREE.MeshStandardMaterial({ color:0x04070a, emissive:0x02070a, emissiveIntensity:.28, metalness:.72, roughness:.34 }));
  lower.position.y=-.72; lower.receiveShadow=true; world.add(lower);
  const top = new THREE.Mesh(new THREE.BoxGeometry(41.4,.28,35.4),new THREE.MeshStandardMaterial({ color:0x080d12, emissive:0x051016, emissiveIntensity:.18, metalness:.58, roughness:.5 }));
  top.position.y=-.08; top.receiveShadow=true; world.add(top);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(42.86,1.18,36.86)),new THREE.LineBasicMaterial({ color:0x28efff, transparent:true, opacity:.2 }));
  edges.position.y=-.72; world.add(edges);
  const underGlow = new THREE.Mesh(new THREE.PlaneGeometry(43.8,37.8),new THREE.MeshBasicMaterial({ color:0x071e25, transparent:true, opacity:.34, side:THREE.DoubleSide }));
  underGlow.rotation.x=-Math.PI/2; underGlow.position.y=-1.32; world.add(underGlow);
}

function createRoad(world,x,z,width,depth,orientation="x") {
  const road = new THREE.Mesh(new THREE.BoxGeometry(width,.075,depth),new THREE.MeshStandardMaterial({ color:0x090d12, metalness:.58, roughness:.62 }));
  road.position.set(x,.095,z); road.receiveShadow=true; world.add(road);
  const length=orientation==="x"?width:depth;
  const dashCount=Math.max(2,Math.floor(length/1.6));
  const dashGeometry=orientation==="x"?new THREE.BoxGeometry(.62,.018,.035):new THREE.BoxGeometry(.035,.018,.62);
  const dashMaterial=new THREE.MeshBasicMaterial({ color:0x7fdfe8, transparent:true, opacity:.28 });
  for(let i=0;i<dashCount;i+=1){
    const dash=new THREE.Mesh(dashGeometry,dashMaterial);
    const t=dashCount===1?.5:i/(dashCount-1);
    if(orientation==="x") dash.position.set(x-width*.46+t*width*.92,.142,z);
    else dash.position.set(x,.142,z-depth*.46+t*depth*.92);
    world.add(dash);
  }
}

function createDistrictPad(world,district){
  const pad=new THREE.Mesh(new THREE.BoxGeometry(5.7,.12,4.7),new THREE.MeshStandardMaterial({ color:0x0a1016, emissive:district.color, emissiveIntensity:.055, metalness:.54, roughness:.46 }));
  pad.position.set(district.x,.12,district.z); pad.receiveShadow=true; world.add(pad);
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(5.72,.13,4.72)),new THREE.LineBasicMaterial({ color:district.color, transparent:true, opacity:.3 }));
  edge.position.copy(pad.position); world.add(edge); return {pad,edge};
}

function createBuilding(group,x,z,w,d,h,accent,seed=0){
  const material=new THREE.MeshStandardMaterial({ color:0x0a1017, emissive:accent, emissiveIntensity:.07, metalness:.82, roughness:.27 });
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material); body.position.set(x,h/2+.17,z); body.castShadow=true; body.receiveShadow=true; group.add(body);
  const cap=new THREE.Mesh(new THREE.BoxGeometry(w*.78,.07,d*.78),new THREE.MeshBasicMaterial({ color:accent, transparent:true, opacity:.68 })); cap.position.set(x,h+.21,z); group.add(cap);
  if(h>2.2){const rows=Math.max(2,Math.min(8,Math.floor(h/.75)));const windowMaterial=new THREE.MeshBasicMaterial({ color:accent, transparent:true, opacity:.26 });for(let row=0;row<rows;row+=1){if((row+seed)%3===0)continue;const y=.65+row*((h-.75)/rows);const front=new THREE.Mesh(new THREE.PlaneGeometry(w*.48,.045),windowMaterial);front.position.set(x,y,z+d/2+.006);group.add(front);}}
  return body;
}

function createUtilityHub(world){
  const hub=new THREE.Group(); hub.position.set(8,0,-6);
  const base=new THREE.Mesh(new THREE.BoxGeometry(3.8,.2,3.2),new THREE.MeshStandardMaterial({ color:0x071017, emissive:0x28efff, emissiveIntensity:.12, metalness:.75, roughness:.28 })); base.position.y=.25; base.receiveShadow=true; hub.add(base);
  [-1.05,0,1.05].forEach((x,index)=>{const core=new THREE.Mesh(new THREE.CylinderGeometry(.36,.48,2.5,12),new THREE.MeshStandardMaterial({ color:0x0b161d, emissive:index===1?0xff2738:0x28efff, emissiveIntensity:.34, metalness:.82, roughness:.2 }));core.position.set(x,1.55,0);core.castShadow=true;hub.add(core);const ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.035,8,36),new THREE.MeshBasicMaterial({ color:index===1?0xff2738:0x28efff, transparent:true, opacity:.72 }));ring.rotation.x=Math.PI/2;ring.position.set(x,2.78,0);hub.add(ring);});
  const beam=new THREE.Mesh(new THREE.BoxGeometry(3.3,.08,.08),new THREE.MeshBasicMaterial({ color:0x28efff, transparent:true, opacity:.42 })); beam.position.set(0,2.5,0); hub.add(beam); world.add(hub); return hub;
}

function createHumanoid(color,role,route,offset,stationIndex){
  const group=new THREE.Group(); const dark=new THREE.MeshStandardMaterial({ color:0x101820, metalness:.65, roughness:.34 }); const accent=new THREE.MeshStandardMaterial({ color:0x17222d, emissive:color, emissiveIntensity:.62, metalness:.7, roughness:.22 });
  const head=new THREE.Mesh(new THREE.SphereGeometry(.16,14,12),accent); head.position.y=.92; const visor=new THREE.Mesh(new THREE.BoxGeometry(.18,.055,.035),new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.95 })); visor.position.set(0,.95,.145);
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.38,4,8),dark); torso.position.y=.57; const armL=new THREE.Mesh(new THREE.CapsuleGeometry(.05,.28,3,7),accent); const armR=armL.clone(); armL.position.set(-.18,.58,0); armR.position.set(.18,.58,0); const legL=new THREE.Mesh(new THREE.CapsuleGeometry(.055,.32,3,7),dark); const legR=legL.clone(); legL.position.set(-.08,.2,0); legR.position.set(.08,.2,0);
  group.add(head,visor,torso,armL,armR,legL,legR); group.scale.setScalar(1.25); group.traverse((child)=>{if(child.isMesh)child.castShadow=true;}); group.userData={role,route,offset,stationIndex,armL,armR,legL,legR,state:"walking"}; return group;
}

function createChainwellStation(world,chain,x,z,selectable,index){
  const group=new THREE.Group(); group.position.set(x,0,z); const color=new THREE.Color(chain.color); const stationMaterial=new THREE.MeshStandardMaterial({ color:0x0c141b, emissive:color, emissiveIntensity:.14, metalness:.76, roughness:.27 });
  const pad=new THREE.Mesh(new THREE.BoxGeometry(2.8,.13,2.15),new THREE.MeshStandardMaterial({ color:0x091016, emissive:color, emissiveIntensity:.045, metalness:.62, roughness:.45 })); pad.position.y=.14; pad.receiveShadow=true; group.add(pad);
  const canopy=new THREE.Mesh(new THREE.BoxGeometry(2.55,.16,1.9),stationMaterial); canopy.position.y=2; canopy.userData.chain=chain; canopy.castShadow=true; group.add(canopy); selectable.push(canopy);
  [-.92,.92].forEach((px)=>{const post=new THREE.Mesh(new THREE.BoxGeometry(.1,1.72,.1),stationMaterial);post.position.set(px,1.08,-.45);post.castShadow=true;post.userData.chain=chain;group.add(post);selectable.push(post);});
  [-.55,.55].forEach((px)=>{const dispenser=new THREE.Mesh(new THREE.BoxGeometry(.34,.86,.42),stationMaterial);dispenser.position.set(px,.64,.12);dispenser.userData.chain=chain;dispenser.castShadow=true;group.add(dispenser);selectable.push(dispenser);const screen=new THREE.Mesh(new THREE.PlaneGeometry(.2,.22),new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.92, side:THREE.DoubleSide }));screen.position.set(px,.78,.337);group.add(screen);});
  const serviceLane=new THREE.Mesh(new THREE.BoxGeometry(2.45,.025,.65),new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.12 })); serviceLane.position.set(0,.225,.64); group.add(serviceLane);
  const haloMaterial=new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.38 }); const halo=new THREE.Mesh(new THREE.TorusGeometry(1.42,.026,8,48),haloMaterial); halo.rotation.x=Math.PI/2; halo.position.y=.22; group.add(halo);
  const beacon=new THREE.Mesh(new THREE.SphereGeometry(.08,12,10),new THREE.MeshBasicMaterial({ color })); beacon.position.set(0,2.28,-.45); group.add(beacon);
  if(chain.category==="privacy"){const shield=new THREE.Mesh(new THREE.TorusGeometry(1.62,.04,8,54),new THREE.MeshBasicMaterial({ color:0xff7a18, transparent:true, opacity:.66 }));shield.rotation.x=Math.PI/2;shield.position.y=.23;group.add(shield);}
  world.add(group); return {index,chain,group,halo,haloMaterial,beacon,activity:0,bay:new THREE.Vector3(x,.12,z+.72),approach:new THREE.Vector3(x,.12,z+2.2)};
}

function createServiceCurve(start,station,index){
  const bend=index%2===0?1:-1; const midpoint=new THREE.Vector3(THREE.MathUtils.lerp(start.x,station.approach.x,.5)+bend*1.2,.12,THREE.MathUtils.lerp(start.z,station.approach.z,.5)); return new THREE.CatmullRomCurve3([new THREE.Vector3(start.x,.12,start.z),midpoint,station.approach.clone(),station.bay.clone()],false,"catmullrom",.35);
}

function createFlowConduit(world,from,station,index){
  const color=station.chain.category==="privacy"?0xff7a18:0x28efff; const side=index%2===0?.8:-.8; const points=[from.clone(),new THREE.Vector3((from.x+station.bay.x)*.5+side,.2,(from.z+station.bay.z)*.5),new THREE.Vector3(station.bay.x,.2,station.bay.z)]; const curve=new THREE.CatmullRomCurve3(points,false,"catmullrom",.4); const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.018,5,false),new THREE.MeshBasicMaterial({ color, transparent:true, opacity:station.chain.category==="privacy"?.5:.18 })); world.add(tube); const pulse=new THREE.Mesh(new THREE.SphereGeometry(.065,8,6),new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.88 })); world.add(pulse); return {curve,pulse,offset:(index*.117)%1,speed:.055+(index%4)*.008};
}

async function createAqueduct(){
  const canvas=document.querySelector("#aqueduct3d"); if(!canvas)return;
  const mobile=matchMedia("(max-width: 820px)").matches; const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x020407); scene.fog=new THREE.FogExp2(0x030407,.018);
  const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,220); camera.position.set(24,20,30); camera.lookAt(0,2.2,0);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:!mobile,alpha:false,powerPreference:"high-performance"}); renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.15:1.6)); renderer.setSize(innerWidth,innerHeight); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1; renderer.shadowMap.enabled=!mobile; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const world=new THREE.Group(); scene.add(world); createDioramaBase(world);
  createRoad(world,0,-10.2,38,1.45,"x"); createRoad(world,0,-3.1,38,1.6,"x"); createRoad(world,0,4,38,1.6,"x"); createRoad(world,0,10.6,38,1.45,"x"); createRoad(world,-13.4,0,1.45,31,"z"); createRoad(world,-5.1,0,1.6,31,"z"); createRoad(world,0,0,1.5,31,"z"); createRoad(world,5.1,0,1.6,31,"z"); createRoad(world,13.4,0,1.45,31,"z");
  const labelLayer=document.createElement("div"); labelLayer.className="city-label-layer"; document.body.appendChild(labelLayer); const labels=[]; const selectable=[]; const districtVisuals=new Map();
  districts.forEach((district,di)=>{const visual=createDistrictPad(world,district);districtVisuals.set(district.id,visual);const group=new THREE.Group();const count=7;for(let i=0;i<count;i+=1){const angle=(i/count)*Math.PI*2;const radius=i===0?0:1.3+((di*31+i*17)%10)/12;const h=i===0?district.height:1.8+((di*23+i*13)%10)/10*district.height*.47;createBuilding(group,district.x+Math.cos(angle)*radius,district.z+Math.sin(angle)*radius,i===0?1.7:.65+((i*7)%5)*.12,i===0?1.7:.65+((i*5)%4)*.15,h,district.color,di+i);}world.add(group);const label=makeLabel(district.name,"district-label");labelLayer.appendChild(label);labels.push({label,position:new THREE.Vector3(district.x,district.height+1.25,district.z),priority:"district"});});
  const utilityHub=createUtilityHub(world); const utilityLight=new THREE.PointLight(0x28efff,100,38); utilityLight.position.set(8,10,-6); scene.add(utilityLight); const redLight=new THREE.PointLight(0xff2738,88,34); redLight.position.set(0,11,1); scene.add(redLight); const violetLight=new THREE.PointLight(0xac5cff,38,29); violetLight.position.set(0,8,10); scene.add(violetLight); scene.add(new THREE.HemisphereLight(0x7ccfff,0x08090d,.7)); const keyLight=new THREE.DirectionalLight(0xd7f8ff,2.2); keyLight.position.set(18,30,16); keyLight.castShadow=!mobile; keyLight.shadow.mapSize.set(1024,1024); keyLight.shadow.camera.left=-24; keyLight.shadow.camera.right=24; keyLight.shadow.camera.top=22; keyLight.shadow.camera.bottom=-22; scene.add(keyLight);
  const stations=chains.map((chain,index)=>{const [x,z]=stationSlots[index];const station=createChainwellStation(world,chain,x,z,selectable,index);const label=makeLabel(`${chain.mark} CHAINWELL`,chain.category==="privacy"?"privacy-label":"utility-label");labelLayer.appendChild(label);labels.push({label,position:new THREE.Vector3(x,2.55,z),priority:"station"});return station;});
  const flowOrigin=new THREE.Vector3(8,.28,-6); const flowConduits=stations.map((station,index)=>createFlowConduit(world,flowOrigin,station,index));
  const roles=["city","hermes","wallet-atlas","route-engine","verifier","receipt-scribe","veil-sentinel","city","city","city"]; const agents=roles.map((role,index)=>{const stationIndex=role==="veil-sentinel"?stations.length-1:(index*2+1)%Math.max(1,stations.length-1);const station=stations[stationIndex];const spawn=agentSpawns[index%agentSpawns.length];const route=createServiceCurve(new THREE.Vector3(spawn[0],.12,spawn[1]),station,index);const color=role==="hermes"?0xff2738:role==="veil-sentinel"?0xff7a18:role==="receipt-scribe"?0xac5cff:role==="wallet-atlas"?0xff4da6:0x28efff;const agent=createHumanoid(color,role,route,index/roles.length,stationIndex);world.add(agent);return agent;});
  const starGeometry=new THREE.BufferGeometry(); const starCount=mobile?180:420; const starPositions=new Float32Array(starCount*3); for(let i=0;i<starCount;i+=1){starPositions[i*3]=(Math.random()-.5)*100;starPositions[i*3+1]=6+Math.random()*46;starPositions[i*3+2]=(Math.random()-.5)*100;} starGeometry.setAttribute("position",new THREE.BufferAttribute(starPositions,3)); scene.add(new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0xcffcff,size:.035,transparent:true,opacity:.38})));
  const raycaster=new THREE.Raycaster(); const pointer=new THREE.Vector2(); const intersectAt=(x,y)=>{pointer.x=(x/innerWidth)*2-1;pointer.y=-(y/innerHeight)*2+1;raycaster.setFromCamera(pointer,camera);return raycaster.intersectObjects(selectable,false)[0];}; canvas.addEventListener("pointermove",(event)=>{canvas.style.cursor=intersectAt(event.clientX,event.clientY)?"pointer":"default";}); canvas.addEventListener("click",(event)=>{const hit=intersectAt(event.clientX,event.clientY);if(hit?.object?.userData?.chain)showDetail(hit.object.userData.chain);});
  const agentState=new Map(); const districtState=new Map(); const scrollScene=await createScrollScene({manifestUrl:"./scenes/aqueduct-agent-city/manifest.json",camera,utilityLight,onAgentState:(id,state)=>agentState.set(id,state),onDistrictState:(id,state)=>districtState.set(id,state),onBeat:({id})=>{document.documentElement.dataset.dioramaBeat=id;document.querySelectorAll("[data-beat]").forEach((el)=>el.classList.toggle("active",el.dataset.beat===id));}}); scrollScene.mount();
  const clock=new THREE.Clock(); let sceneVisible=true; const mapSection=document.querySelector("#map"); const observer=new IntersectionObserver((entries)=>{sceneVisible=entries.some((entry)=>entry.isIntersecting);},{rootMargin:"25% 0px 25% 0px",threshold:.01}); if(mapSection)observer.observe(mapSection);
  function animateAgent(agent,elapsed){const data=agent.userData;const runtimeState=agentState.get(data.role)||(data.role==="city"?agentState.get("city"):null)||"walking";const baseSpeed=runtimeState==="orchestrating"?1.25:runtimeState==="verifying"||runtimeState==="receipting"?.82:1;const cycle=(elapsed*.052*baseSpeed+data.offset)%1;let routeT=0;let docked=false;if(cycle<.4)routeT=cycle/.4;else if(cycle<.62){routeT=1;docked=true;}else routeT=1-(cycle-.62)/.38;const position=data.route.getPointAt(THREE.MathUtils.clamp(routeT,0,1));const tangent=data.route.getTangentAt(THREE.MathUtils.clamp(routeT,0,1));agent.position.copy(position);agent.rotation.y=Math.atan2(tangent.x,tangent.z);const phase=elapsed*7*baseSpeed+data.offset*10;if(docked){data.armL.rotation.x=-.15;data.armR.rotation.x=.15;data.legL.rotation.x=0;data.legR.rotation.x=0;agent.position.y=.12+Math.sin(phase*.5)*.008;stations[data.stationIndex].activity=Math.max(stations[data.stationIndex].activity,1);}else{data.armL.rotation.x=Math.sin(phase)*.55;data.armR.rotation.x=-Math.sin(phase)*.55;data.legL.rotation.x=-Math.sin(phase)*.45;data.legR.rotation.x=Math.sin(phase)*.45;agent.position.y=.12+Math.abs(Math.sin(phase))*.025;}}
  function animateStations(elapsed){stations.forEach((station,index)=>{const activity=station.activity;const pulse=.5+.5*Math.sin(elapsed*4+index*.5);station.haloMaterial.opacity=.26+activity*.45+pulse*.06;station.halo.scale.setScalar(1+activity*.08+pulse*.015);station.beacon.scale.setScalar(1+activity*.9+pulse*.18);station.activity=Math.max(0,activity-.045);});}
  function animateConduits(elapsed){flowConduits.forEach((flow)=>{const t=(elapsed*flow.speed+flow.offset)%1;flow.pulse.position.copy(flow.curve.getPointAt(t));});}
  function applyDistrictState(elapsed){const state=districtState.get("utility-grid");const visual=districtVisuals.get("utility-grid");if(!visual)return;const focused=state==="focused"||state==="complete";visual.edge.material.opacity=focused?.62:.3;visual.pad.material.emissiveIntensity=focused?.16:.055;utilityHub.rotation.y=focused?Math.sin(elapsed*.4)*.05:0;}
  function projectLabels(){labels.forEach(({label,position,priority})=>{const projected=position.clone().applyMatrix4(world.matrixWorld).project(camera);const x=(projected.x*.5+.5)*innerWidth;const y=(-projected.y*.5+.5)*innerHeight;const show=projected.z<1&&x>-180&&x<innerWidth+180&&y>-100&&y<innerHeight+100;label.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;label.style.opacity=show?(priority==="district"?".9":".72"):"0";});}
  function render(){requestAnimationFrame(render);if(!sceneVisible||document.hidden)return;const elapsed=clock.getElapsedTime();if(!reducedMotion){stations.forEach((station)=>{station.activity*=.96;});agents.forEach((agent)=>animateAgent(agent,elapsed));animateStations(elapsed);animateConduits(elapsed);applyDistrictState(elapsed);}projectLabels();renderer.render(scene,camera);} render();
  addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia("(max-width: 820px)").matches?1.15:1.6));renderer.setSize(innerWidth,innerHeight);}); addEventListener("beforeunload",()=>{observer.disconnect();scrollScene.destroy();labelLayer.remove();renderer.dispose();});
}

closeDetail?.addEventListener("click",()=>detailPanel?.classList.remove("open"));
addEventListener("keydown",(event)=>{if(event.key==="Escape")detailPanel?.classList.remove("open");});
addEventListener("load",()=>{renderCards();setupFilters();typeBootSequence();createAqueduct().catch((error)=>{console.error(error);document.documentElement.dataset.sceneError="true";});});
