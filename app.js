import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const chains = [
  { id:"ethereum-sepolia", name:"Ethereum", network:"Sepolia", asset:"ETH", family:"EVM", category:"evm", mark:"ETH", mode:"Provider utility", adapter:"EVMAdapter", color:0x8ea1ff, faucet:"https://ethereum.org/en/developers/docs/networks/", docs:"https://ethereum.org/en/developers/docs/networks/", note:"Sepolia is the primary Ethereum application-development testnet. Upstream provider availability remains authoritative." },
  { id:"base-sepolia", name:"Base", network:"Base Sepolia", asset:"ETH", family:"EVM / OP Stack", category:"evm", mark:"BASE", mode:"Provider utility", adapter:"BaseAdapter", color:0x3478ff, faucet:"https://docs.base.org/base-chain/tools/network-faucets", docs:"https://docs.base.org/base-chain/network-information", note:"Base documents multiple Sepolia funding sources. Provider account and rate-limit rules remain authoritative." },
  { id:"op-sepolia", name:"Optimism", network:"OP Sepolia", asset:"ETH", family:"EVM / OP Stack", category:"evm", mark:"OP", mode:"Superchain utility", adapter:"SuperchainAdapter", color:0xff344d, faucet:"https://console.optimism.io/faucet", docs:"https://docs.optimism.io/chain/networks", note:"The Superchain faucet is represented as an upstream utility source for supported OP Stack test networks." },
  { id:"arbitrum-sepolia", name:"Arbitrum", network:"Arbitrum Sepolia", asset:"ETH", family:"EVM / Arbitrum", category:"evm", mark:"ARB", mode:"Provider utility", adapter:"ArbitrumAdapter", color:0x37b5ff, faucet:"https://docs.arbitrum.io/", docs:"https://docs.arbitrum.io/", note:"AQUEDUCT exposes the service point while provider endpoints remain registry-driven." },
  { id:"polygon-amoy", name:"Polygon", network:"Amoy", asset:"POL", family:"EVM / Polygon", category:"evm", mark:"POL", mode:"Provider utility", adapter:"PolygonAdapter", color:0x9b55ff, faucet:"https://docs.polygon.technology/tools/gas/matic-faucet/", docs:"https://docs.polygon.technology/pos/reference/rpc-endpoints/", note:"Amoy is Polygon PoS test infrastructure. RPC and funding providers remain registry-driven." },
  { id:"avalanche-fuji", name:"Avalanche", network:"Fuji C-Chain", asset:"AVAX", family:"EVM / Avalanche", category:"evm", mark:"AVAX", mode:"Web utility", adapter:"AvalancheAdapter", color:0xff4b55, faucet:"https://core.app/tools/testnet-faucet/", docs:"https://build.avax.network/docs/quick-start/networks/fuji-testnet", note:"Fuji is Avalanche's primary public test network. AQUEDUCT represents it as a city utility station." },
  { id:"bsc-testnet", name:"BNB Chain", network:"BSC Testnet", asset:"tBNB", family:"EVM / BNB", category:"evm", mark:"BNB", mode:"Web utility", adapter:"BnbAdapter", color:0xf3ba2f, faucet:"https://www.bnbchain.org/en/testnet-faucet", docs:"https://docs.bnbchain.org/bnb-smart-chain/developers/network-config/", note:"BSC Testnet uses test BNB for gas. Human-verification gates remain human-required." },
  { id:"litvm-liteforge", name:"LitVM", network:"LiteForge", asset:"zkLTC", family:"EVM / LitVM", category:"evm", mark:"LTC", mode:"Testnet utility", adapter:"LitVMAdapter", color:0xbac5d0, faucet:"https://liteforge.explorer.caldera.xyz/", docs:"https://liteforge.explorer.caldera.xyz/", note:"Digital Silver Borough lane. Provider discovery remains registry-controlled until a stable public endpoint is verified." },
  { id:"solana-devnet", name:"Solana", network:"Devnet", asset:"SOL", family:"Solana", category:"non-evm", mark:"SOL", mode:"Programmatic utility", adapter:"SolanaAdapter", color:0x14f195, faucet:"https://faucet.solana.com/", docs:"https://solana.com/docs/references/clusters", note:"Devnet is the normal Solana application-development lane. Approved programmatic requestAirdrop paths belong behind AQUEDUCT controls." },
  { id:"xrpl-testnet", name:"XRPL", network:"Testnet", asset:"XRP", family:"XRPL", category:"non-evm", mark:"XRP", mode:"SDK utility", adapter:"XrplAdapter", color:0xe7f4ff, faucet:"https://xrpl.org/resources/dev-tools/xrp-faucets", docs:"https://xrpl.org/docs/concepts/networks-and-servers/parallel-networks", note:"XRPL test funding is exposed as an agent utility service rather than a browser-owned wallet action." },
  { id:"stellar-testnet", name:"Stellar", network:"Testnet", asset:"XLM", family:"Stellar", category:"non-evm", mark:"XLM", mode:"Friendbot utility", adapter:"StellarAdapter", color:0x28efff, faucet:"https://developers.stellar.org/docs/data/apis/horizon/api-reference/resources/create-account", docs:"https://developers.stellar.org/docs/networks", note:"Friendbot is treated as an upstream utility provider behind the AQUEDUCT service point." },
  { id:"sui-testnet", name:"Sui", network:"Testnet", asset:"SUI", family:"Move / Sui", category:"non-evm", mark:"SUI", mode:"Client utility", adapter:"SuiAdapter", color:0x6fbcf0, faucet:"https://faucet.sui.io/", docs:"https://docs.sui.io/guides/developer/getting-started/connect", note:"Sui testnet resources are exposed through a governed Chainwell station." },
  { id:"aptos-testnet", name:"Aptos", network:"Testnet", asset:"APT", family:"Move / Aptos", category:"non-evm", mark:"APT", mode:"API utility", adapter:"AptosAdapter", color:0x78f0cf, faucet:"https://aptos.dev/network/faucet", docs:"https://aptos.dev/network/nodes/networks", note:"Aptos testnet funding remains bounded by the provider's service limits and authentication requirements." },
  { id:"polkadot-paseo", name:"Polkadot", network:"Paseo", asset:"PAS", family:"Substrate", category:"non-evm", mark:"DOT", mode:"Community utility", adapter:"SubstrateAdapter", color:0xff4da6, faucet:"https://docs.polkadot.com/develop/networks/", docs:"https://docs.polkadot.com/develop/networks/", note:"Paseo is the Substrate ecosystem utility lane. Upstream funding endpoints remain documentation-driven." },
  { id:"monero-stagenet", name:"VEILWELL", network:"Monero Stagenet", asset:"sXMR", family:"Monero / Privacy", category:"privacy", mark:"XMR", mode:"Privacy utility", adapter:"MoneroAdapter", color:0xff7a18, faucet:"https://docs.getmonero.org/infrastructure/networks/", docs:"https://docs.getmonero.org/infrastructure/networks/", note:"VEILWELL is the privacy-sensitive utility station. Self-hosted monerod and isolated wallet RPC are preferred." }
];

const districts = [
  { name:"HERMES TOWER", x:0, z:0, color:0xff2738, height:9.5, blocks:7 },
  { name:"IDENTITY PLAZA", x:-8.2, z:-6.5, color:0xff2738, height:5.8, blocks:6 },
  { name:"UTILITY GRID", x:7.8, z:-6.4, color:0x28efff, height:6.4, blocks:7 },
  { name:"DOCKING DISTRICT", x:-9.2, z:6.7, color:0x8ea1ff, height:6.8, blocks:7 },
  { name:"ENTERTAINMENT", x:0.2, z:9.2, color:0xac5cff, height:7.2, blocks:8 },
  { name:"GAMING DISTRICT", x:9.4, z:6.7, color:0x14f195, height:6.2, blocks:7 }
];

const stationSlots = [
  [-13,-9],[-8,-10],[-3,-10],[3,-10],[8,-10],[13,-9],
  [-13,-2],[-13,4],[-10,10],[-4,12],[2,12],[8,11],
  [13,7],[13,1],[13,-5]
];

const bootLines = [
  "boot://hermes3d-agent-city",
  "city: AGENTROPOLIS ONLINE",
  "utility: AQUEDUCT TESTNET SERVICES",
  `chainwell stations: ${chains.length}`,
  "agent behavior: route -> service -> verify -> receipt",
  "governor: FLOWKEEPER",
  "registry: WALLET ATLAS",
  "policy: 54-T / BE gate",
  "privacy utility: VEILWELL XMR STAGENET",
  "boundary: testnet only / no secrets",
  "ready: city utility grid online"
];

const terminal = document.querySelector("#typewriter");
const chainCount = document.querySelector("#chainCount");
const faucetGrid = document.querySelector("#faucetGrid");
const detailPanel = document.querySelector("#detailPanel");
const closeDetail = document.querySelector("#closeDetail");
const revealItems = document.querySelectorAll(".reveal");
const filters = document.querySelectorAll(".filter");
if (chainCount) chainCount.textContent = String(chains.length);

function revealOnScroll() {
  const trigger = window.innerHeight * 0.9;
  revealItems.forEach((item) => {
    if (item.getBoundingClientRect().top < trigger) item.classList.add("visible");
  });
}

function typeBootSequence() {
  if (!terminal) return;
  let lineIndex = 0;
  let charIndex = 0;
  let output = "";
  function tick() {
    const line = bootLines[lineIndex];
    output += line[charIndex] || "";
    terminal.textContent = output + "_";
    charIndex += 1;
    if (charIndex > line.length) {
      output += "\n";
      lineIndex += 1;
      charIndex = 0;
    }
    if (lineIndex < bootLines.length) setTimeout(tick, charIndex === 0 ? 145 : 15);
    else terminal.textContent = output + "\nCITY FLOW STABLE";
  }
  tick();
}

function renderCards(filter = "all") {
  if (!faucetGrid) return;
  const visible = chains.filter((chain) => filter === "all" || chain.category === filter);
  faucetGrid.innerHTML = visible.map((chain) => {
    const color = `#${chain.color.toString(16).padStart(6, "0")}`;
    const privacy = chain.category === "privacy";
    return `
      <article class="card ${privacy ? "privacy-card" : ""}" style="--card-glow:${color}33">
        <div class="card-top">
          <span class="chain-mark" style="color:${color}">${chain.mark}</span>
          <span class="tag">${chain.family}</span>
        </div>
        <h3>${chain.name}</h3>
        <div class="card-network">${chain.network} / ${chain.asset}</div>
        <p>${chain.note}</p>
        <div class="card-meta"><span class="tag">CHAINWELL STATION</span><span class="tag">${chain.mode}</span><span class="tag">${chain.adapter}</span></div>
        <div class="card-actions">
          <a class="button primary" href="${chain.faucet}" target="_blank" rel="noreferrer">UPSTREAM SOURCE</a>
          <a class="button ghost" href="${chain.docs}" target="_blank" rel="noreferrer">NETWORK DOCS</a>
        </div>
      </article>`;
  }).join("");
}

function setupFilters() {
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      filters.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderCards(button.dataset.filter || "all");
    });
  });
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
  faucet.textContent = "UPSTREAM SOURCE";
  faucet.href = chain.faucet;
  faucet.target = "_blank";
  faucet.rel = "noreferrer";
  docs.textContent = "NETWORK DOCS";
  docs.href = chain.docs;
  docs.target = "_blank";
  docs.rel = "noreferrer";
  detailPanel.classList.toggle("privacy-detail", chain.category === "privacy");
  detailPanel.classList.add("open");
}

function seeded(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = value * 16807 % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function createBuilding(group, x, z, w, d, h, color, accent, selectable = false) {
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({
      color,
      emissive: accent,
      emissiveIntensity: 0.08,
      metalness: 0.78,
      roughness: 0.28
    })
  );
  body.position.set(x, h / 2, z);
  group.add(body);

  const crown = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.72, 0.08, d * 0.72),
    new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.72 })
  );
  crown.position.set(x, h + 0.06, z);
  group.add(crown);

  if (selectable) body.userData.selectable = true;
  return body;
}

function createRoad(world, x, z, w, d) {
  const road = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.05, d),
    new THREE.MeshStandardMaterial({ color:0x070a0e, metalness:0.45, roughness:0.6 })
  );
  road.position.set(x, 0.045, z);
  world.add(road);

  const lane = new THREE.Mesh(
    new THREE.BoxGeometry(w > d ? w * 0.92 : 0.045, 0.012, w > d ? 0.035 : d * 0.92),
    new THREE.MeshBasicMaterial({ color:0x28efff, transparent:true, opacity:0.28 })
  );
  lane.position.set(x, 0.078, z);
  world.add(lane);
}

function createChainwellStation(world, chain, x, z, selectable) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  const color = new THREE.Color(chain.color);
  const privacy = chain.category === "privacy";

  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.15, 1.55),
    new THREE.MeshStandardMaterial({ color:privacy ? 0x160c08 : 0x0a0f14, emissive:privacy ? 0x5a2400 : 0x061921, emissiveIntensity:0.18, metalness:0.65, roughness:0.34 })
  );
  pad.position.y = 0.1;
  group.add(pad);

  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.15, 1.65),
    new THREE.MeshStandardMaterial({ color:0x10151c, emissive:color, emissiveIntensity:privacy ? 0.32 : 0.2, metalness:0.82, roughness:0.2 })
  );
  canopy.position.y = 1.95;
  canopy.userData.chain = chain;
  group.add(canopy);
  selectable.push(canopy);

  [-0.72, 0.72].forEach((px) => {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 1.75, 0.11),
      new THREE.MeshStandardMaterial({ color:0x17212a, emissive:color, emissiveIntensity:0.18, metalness:0.75, roughness:0.22 })
    );
    post.position.set(px, 1.02, 0);
    post.userData.chain = chain;
    group.add(post);
    selectable.push(post);
  });

  [-0.48, 0.48].forEach((px) => {
    const service = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.82, 0.4),
      new THREE.MeshStandardMaterial({ color:0x0d151c, emissive:color, emissiveIntensity:0.35, metalness:0.72, roughness:0.24 })
    );
    service.position.set(px, 0.62, 0.18);
    service.userData.chain = chain;
    group.add(service);
    selectable.push(service);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 0.22),
      new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.86, side:THREE.DoubleSide })
    );
    screen.position.set(px, 0.78, 0.386);
    group.add(screen);
  });

  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(1.32, 0.36, 0.08),
    new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.88 })
  );
  sign.position.set(0, 2.28, 0);
  sign.userData.chain = chain;
  group.add(sign);
  selectable.push(sign);

  if (privacy) {
    const perimeter = new THREE.Mesh(
      new THREE.RingGeometry(1.35, 1.42, 48),
      new THREE.MeshBasicMaterial({ color:0xff7a18, transparent:true, opacity:0.46, side:THREE.DoubleSide })
    );
    perimeter.rotation.x = -Math.PI / 2;
    perimeter.position.y = 0.18;
    group.add(perimeter);
  }

  world.add(group);
  return group;
}

function createAqueduct() {
  const canvas = document.querySelector("#aqueduct3d");
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030407, 0.018);

  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 180);
  camera.position.set(25, 24, 31);
  camera.lookAt(0, 2.4, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const world = new THREE.Group();
  scene.add(world);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 34),
    new THREE.MeshStandardMaterial({ color:0x05080c, emissive:0x020406, emissiveIntensity:0.2, metalness:0.42, roughness:0.7 })
  );
  ground.rotation.x = -Math.PI / 2;
  world.add(ground);

  const grid = new THREE.GridHelper(40, 40, 0x283847, 0x111a22);
  grid.position.y = 0.03;
  grid.material.transparent = true;
  grid.material.opacity = 0.3;
  world.add(grid);

  createRoad(world, 0, -3.2, 38, 2.0);
  createRoad(world, 0, 4.0, 38, 2.0);
  createRoad(world, -5.4, 0, 2.0, 32);
  createRoad(world, 5.4, 0, 2.0, 32);
  createRoad(world, 0, 0, 2.3, 32);

  const labelLayer = document.createElement("div");
  labelLayer.className = "city-label-layer";
  document.body.appendChild(labelLayer);
  const labels = [];
  const selectable = [];

  districts.forEach((district, districtIndex) => {
    const group = new THREE.Group();
    const accent = new THREE.Color(district.color);
    const rng = seeded(173 + districtIndex * 97);

    const districtPad = new THREE.Mesh(
      new THREE.BoxGeometry(6.1, 0.12, 5.2),
      new THREE.MeshStandardMaterial({ color:0x080d12, emissive:accent, emissiveIntensity:0.04, metalness:0.55, roughness:0.45 })
    );
    districtPad.position.set(district.x, 0.09, district.z);
    group.add(districtPad);

    for (let i = 0; i < district.blocks; i += 1) {
      const angle = (i / district.blocks) * Math.PI * 2;
      const radius = i === 0 ? 0 : 1.45 + rng() * 0.9;
      const bx = district.x + Math.cos(angle) * radius;
      const bz = district.z + Math.sin(angle) * radius;
      const h = i === 0 ? district.height : 1.7 + rng() * district.height * 0.58;
      const w = i === 0 ? 1.7 : 0.65 + rng() * 0.85;
      const d = i === 0 ? 1.7 : 0.65 + rng() * 0.85;
      createBuilding(group, bx, bz, w, d, h, i === 0 ? 0x10161f : 0x0b1118, district.color);
    }

    world.add(group);

    const label = document.createElement("span");
    label.className = "city-label district-label";
    label.textContent = district.name;
    labelLayer.appendChild(label);
    labels.push({ label, position:new THREE.Vector3(district.x, district.height + 1.2, district.z), kind:"district" });
  });

  const utilityHub = new THREE.Group();
  utilityHub.position.set(7.8, 0, -6.4);
  const hubCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.95, 3.8, 10),
    new THREE.MeshStandardMaterial({ color:0x0a1218, emissive:0x28efff, emissiveIntensity:0.3, metalness:0.82, roughness:0.2 })
  );
  hubCore.position.y = 2.05;
  utilityHub.add(hubCore);
  [1.0, 1.55].forEach((r) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.035, 8, 54),
      new THREE.MeshBasicMaterial({ color:0x28efff, transparent:true, opacity:0.55 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 3.65;
    utilityHub.add(ring);
  });
  world.add(utilityHub);

  const stationGroups = [];
  chains.forEach((chain, index) => {
    const [x, z] = stationSlots[index];
    const station = createChainwellStation(world, chain, x, z, selectable);
    stationGroups.push(station);

    const trunkPoints = [
      new THREE.Vector3(7.8, 0.16, -6.4),
      new THREE.Vector3((7.8 + x) * 0.5, 0.16, (-6.4 + z) * 0.5),
      new THREE.Vector3(x, 0.16, z)
    ];
    const lineColor = chain.category === "privacy" ? 0xff7a18 : 0x28efff;
    const trunk = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(trunkPoints),
      new THREE.LineBasicMaterial({ color:lineColor, transparent:true, opacity:chain.category === "privacy" ? 0.7 : 0.27 })
    );
    world.add(trunk);

    const label = document.createElement("span");
    label.className = `city-label utility-label ${chain.category === "privacy" ? "privacy-label" : ""}`;
    label.textContent = `${chain.mark} CHAINWELL / ${chain.network}`;
    labelLayer.appendChild(label);
    labels.push({ label, position:new THREE.Vector3(x, 2.85, z), kind:"station" });
  });

  const agentRoutes = [
    [[-15,-3.2],[15,-3.2]],
    [[-15,4],[15,4]],
    [[-5.4,-14],[-5.4,14]],
    [[5.4,-14],[5.4,14]],
    [[0,-14],[0,14]]
  ];
  const agentPods = [];
  for (let i = 0; i < 12; i += 1) {
    const route = agentRoutes[i % agentRoutes.length];
    const pod = new THREE.Group();
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 14, 10),
      new THREE.MeshStandardMaterial({ color:0x111923, emissive:i % 3 === 0 ? 0xff2738 : 0x28efff, emissiveIntensity:0.75, metalness:0.7, roughness:0.2 })
    );
    shell.scale.set(1.6, 0.75, 1);
    pod.add(shell);
    const glow = new THREE.PointLight(i % 3 === 0 ? 0xff2738 : 0x28efff, 2.4, 2.8);
    glow.position.y = 0.18;
    pod.add(glow);
    pod.userData.route = route;
    pod.userData.offset = i / 12;
    pod.position.y = 0.34;
    world.add(pod);
    agentPods.push(pod);
  }

  const starsGeometry = new THREE.BufferGeometry();
  const starCount = 520;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 110;
    positions[i * 3 + 1] = Math.random() * 48 + 7;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 110;
  }
  starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color:0xb9f7ff, size:0.035, transparent:true, opacity:0.45 })));

  scene.add(new THREE.AmbientLight(0x9ccfff, 0.38));
  const cyanLight = new THREE.PointLight(0x28efff, 92, 34);
  cyanLight.position.set(8, 10, -5);
  scene.add(cyanLight);
  const redLight = new THREE.PointLight(0xff2738, 110, 34);
  redLight.position.set(0, 12, 1);
  scene.add(redLight);
  const purpleLight = new THREE.PointLight(0xac5cff, 45, 28);
  purpleLight.position.set(0, 8, 11);
  scene.add(purpleLight);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function intersectAt(clientX, clientY) {
    pointer.x = (clientX / innerWidth) * 2 - 1;
    pointer.y = -(clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(selectable, false)[0];
  }

  canvas.addEventListener("pointermove", (event) => {
    const hit = intersectAt(event.clientX, event.clientY);
    canvas.style.cursor = hit ? "pointer" : "default";
  });

  canvas.addEventListener("click", (event) => {
    const hit = intersectAt(event.clientX, event.clientY);
    if (hit?.object?.userData?.chain) showDetail(hit.object.userData.chain);
  });

  const clock = new THREE.Clock();
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function projectLabels() {
    labels.forEach(({ label, position, kind }) => {
      const projected = position.clone().applyMatrix4(world.matrixWorld).project(camera);
      const x = (projected.x * 0.5 + 0.5) * innerWidth;
      const y = (-projected.y * 0.5 + 0.5) * innerHeight;
      const visible = projected.z < 1 && x > -180 && x < innerWidth + 180 && y > -100 && y < innerHeight + 100;
      label.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      label.style.opacity = visible ? (kind === "district" ? ".9" : ".78") : "0";
    });
  }

  function animateAgent(pod, elapsed) {
    const [start, end] = pod.userData.route;
    const cycle = (elapsed * 0.055 + pod.userData.offset) % 1;
    const ping = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2;
    pod.position.x = THREE.MathUtils.lerp(start[0], end[0], ping);
    pod.position.z = THREE.MathUtils.lerp(start[1], end[1], ping);
    const heading = Math.atan2(end[1] - start[1], end[0] - start[0]);
    pod.rotation.y = -heading;
  }

  function animate() {
    const elapsed = clock.getElapsedTime();
    if (!reducedMotion) {
      world.rotation.y = Math.sin(elapsed * 0.055) * 0.08;
      agentPods.forEach((pod) => animateAgent(pod, elapsed));
      utilityHub.rotation.y = elapsed * 0.12;
      cyanLight.intensity = 86 + Math.sin(elapsed * 1.1) * 8;
      redLight.intensity = 104 + Math.sin(elapsed * 0.9) * 10;
    }
    projectLabels();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  animate();
}

closeDetail?.addEventListener("click", () => detailPanel?.classList.remove("open"));
addEventListener("keydown", (event) => { if (event.key === "Escape") detailPanel?.classList.remove("open"); });
addEventListener("scroll", revealOnScroll, { passive:true });
addEventListener("load", () => {
  renderCards();
  setupFilters();
  revealOnScroll();
  typeBootSequence();
  createAqueduct();
});
