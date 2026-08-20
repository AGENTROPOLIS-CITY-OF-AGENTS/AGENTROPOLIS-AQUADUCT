import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const chains = [
  { id:"ethereum-sepolia", name:"Ethereum", network:"Sepolia", asset:"ETH", family:"EVM", category:"evm", mark:"ETH", mode:"Provider faucet", adapter:"EVMAdapter", color:0x8ea1ff, faucet:"https://ethereum.org/en/developers/docs/networks/", docs:"https://ethereum.org/en/developers/docs/networks/", note:"Sepolia is the primary Ethereum application-development testnet. Faucet availability is provider-dependent." },
  { id:"base-sepolia", name:"Base", network:"Base Sepolia", asset:"ETH", family:"EVM / OP Stack", category:"evm", mark:"BASE", mode:"Provider faucet", adapter:"BaseAdapter", color:0x3478ff, faucet:"https://docs.base.org/base-chain/tools/network-faucets", docs:"https://docs.base.org/base-chain/network-information", note:"Base documents multiple Sepolia faucet options. Provider account and rate-limit rules remain authoritative." },
  { id:"op-sepolia", name:"Optimism", network:"OP Sepolia", asset:"ETH", family:"EVM / OP Stack", category:"evm", mark:"OP", mode:"Superchain faucet", adapter:"SuperchainAdapter", color:0xff344d, faucet:"https://console.optimism.io/faucet", docs:"https://docs.optimism.io/chain/networks", note:"The Superchain faucet is the preferred public entry point for supported OP Stack test networks." },
  { id:"arbitrum-sepolia", name:"Arbitrum", network:"Arbitrum Sepolia", asset:"ETH", family:"EVM / Arbitrum", category:"evm", mark:"ARB", mode:"Provider faucet", adapter:"ArbitrumAdapter", color:0x37b5ff, faucet:"https://docs.arbitrum.io/", docs:"https://docs.arbitrum.io/", note:"AQUEDUCT links to Arbitrum documentation; public faucet providers may change independently of this registry." },
  { id:"polygon-amoy", name:"Polygon", network:"Amoy", asset:"POL", family:"EVM / Polygon", category:"evm", mark:"POL", mode:"Provider faucet", adapter:"PolygonAdapter", color:0x9b55ff, faucet:"https://docs.polygon.technology/tools/gas/matic-faucet/", docs:"https://docs.polygon.technology/pos/reference/rpc-endpoints/", note:"Amoy is Polygon PoS test infrastructure. Keep RPC and faucet providers registry-driven because endpoints can change." },
  { id:"avalanche-fuji", name:"Avalanche", network:"Fuji C-Chain", asset:"AVAX", family:"EVM / Avalanche", category:"evm", mark:"AVAX", mode:"Web faucet", adapter:"AvalancheAdapter", color:0xff4b55, faucet:"https://core.app/tools/testnet-faucet/", docs:"https://build.avax.network/docs/quick-start/networks/fuji-testnet", note:"Fuji is Avalanche's primary public test network. Faucet access may impose provider-specific limits." },
  { id:"bsc-testnet", name:"BNB Chain", network:"BSC Testnet", asset:"tBNB", family:"EVM / BNB", category:"evm", mark:"BNB", mode:"Web faucet", adapter:"BnbAdapter", color:0xf3ba2f, faucet:"https://www.bnbchain.org/en/testnet-faucet", docs:"https://docs.bnbchain.org/bnb-smart-chain/developers/network-config/", note:"BSC Testnet uses test BNB for gas. AQUEDUCT does not automate human-verification gates." },
  { id:"litvm-liteforge", name:"LitVM", network:"LiteForge", asset:"zkLTC", family:"EVM / LitVM", category:"evm", mark:"LTC", mode:"Testnet resource", adapter:"LitVMAdapter", color:0xbac5d0, faucet:"https://liteforge.explorer.caldera.xyz/", docs:"https://liteforge.explorer.caldera.xyz/", note:"AGENTROPOLIS Digital Silver Borough lane. Faucet discovery remains registry-controlled until a stable public endpoint is verified." },
  { id:"solana-devnet", name:"Solana", network:"Devnet", asset:"SOL", family:"Solana", category:"non-evm", mark:"SOL", mode:"Programmatic / web", adapter:"SolanaAdapter", color:0x14f195, faucet:"https://faucet.solana.com/", docs:"https://solana.com/docs/references/clusters", note:"Devnet is the normal Solana application-development lane. Agent execution should prefer approved programmatic requestAirdrop paths, not browser automation." },
  { id:"xrpl-testnet", name:"XRPL", network:"Testnet", asset:"XRP", family:"XRPL", category:"non-evm", mark:"XRP", mode:"SDK / web faucet", adapter:"XrplAdapter", color:0xe7f4ff, faucet:"https://xrpl.org/resources/dev-tools/xrp-faucets", docs:"https://xrpl.org/docs/concepts/networks-and-servers/parallel-networks", note:"XRPL exposes test funding through faucet tooling and SDK workflows such as funded test-wallet creation." },
  { id:"stellar-testnet", name:"Stellar", network:"Testnet", asset:"XLM", family:"Stellar", category:"non-evm", mark:"XLM", mode:"Friendbot", adapter:"StellarAdapter", color:0x28efff, faucet:"https://developers.stellar.org/docs/data/apis/horizon/api-reference/resources/create-account", docs:"https://developers.stellar.org/docs/networks", note:"Stellar test accounts can be funded through Friendbot. Governed execution belongs behind AQUEDUCT MCP." },
  { id:"sui-testnet", name:"Sui", network:"Testnet", asset:"SUI", family:"Move / Sui", category:"non-evm", mark:"SUI", mode:"Web / client faucet", adapter:"SuiAdapter", color:0x6fbcf0, faucet:"https://faucet.sui.io/", docs:"https://docs.sui.io/guides/developer/getting-started/connect", note:"Sui testnet funding can be requested through supported faucet tooling. Adapter authority remains separately governed." },
  { id:"aptos-testnet", name:"Aptos", network:"Testnet", asset:"APT", family:"Move / Aptos", category:"non-evm", mark:"APT", mode:"Web / API faucet", adapter:"AptosAdapter", color:0x78f0cf, faucet:"https://aptos.dev/network/faucet", docs:"https://aptos.dev/network/nodes/networks", note:"Aptos maintains test-network funding guidance. Automated requests must honor published service limits and authentication requirements." },
  { id:"polkadot-paseo", name:"Polkadot", network:"Paseo", asset:"PAS", family:"Substrate", category:"non-evm", mark:"DOT", mode:"Community faucet", adapter:"SubstrateAdapter", color:0xff4da6, faucet:"https://docs.polkadot.com/develop/networks/", docs:"https://docs.polkadot.com/develop/networks/", note:"Paseo is represented as the Substrate ecosystem test lane. Faucet endpoints stay documentation-driven until verified as stable." },
  { id:"monero-stagenet", name:"VEILWELL", network:"Monero Stagenet", asset:"sXMR", family:"Monero / Privacy", category:"privacy", mark:"XMR", mode:"Stagenet faucet / sovereign node", adapter:"MoneroAdapter", color:0xff7a18, faucet:"https://docs.getmonero.org/infrastructure/networks/", docs:"https://docs.getmonero.org/infrastructure/networks/", note:"Primary XMR development privacy lane. Self-hosted monerod and isolated wallet RPC are preferred; remote metadata remains part of the threat model." }
];

const bootLines = [
  "boot://agentropolis-aqueduct",
  "visual law: red authority / cyan flow / orange privacy",
  `chainwells: ${chains.length} represented`,
  "privacy: VEILWELL XMR STAGENET",
  "governor: FLOWKEEPER",
  "registry: WALLET ATLAS",
  "interface: AQUEDUCT MCP [planned]",
  "execution: AQUEDUCT AGENT KIT [planned]",
  "policy: 54-T / ASBE gate",
  "boundary: testnet only / no secrets",
  "ready: waterworks online"
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
    else terminal.textContent = output + "\nFLOW STABLE";
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
        <div class="card-meta"><span class="tag">${chain.mode}</span><span class="tag">${chain.adapter}</span></div>
        <div class="card-actions">
          <a class="button primary" href="${chain.faucet}" target="_blank" rel="noreferrer">SOURCE</a>
          <a class="button ghost" href="${chain.docs}" target="_blank" rel="noreferrer">DOCS</a>
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
  document.querySelector("#detailName").textContent = chain.name;
  document.querySelector("#detailNetwork").textContent = chain.network;
  document.querySelector("#detailAsset").textContent = chain.asset;
  document.querySelector("#detailFamily").textContent = chain.family;
  document.querySelector("#detailMode").textContent = chain.mode;
  document.querySelector("#detailAdapter").textContent = chain.adapter;
  document.querySelector("#detailNote").textContent = chain.note;
  const faucet = document.querySelector("#detailFaucet");
  const docs = document.querySelector("#detailDocs");
  faucet.href = chain.faucet;
  faucet.target = "_blank";
  faucet.rel = "noreferrer";
  docs.href = chain.docs;
  docs.target = "_blank";
  docs.rel = "noreferrer";
  detailPanel.classList.toggle("privacy-detail", chain.category === "privacy");
  detailPanel.classList.add("open");
}

function createAqueduct() {
  const canvas = document.querySelector("#aqueduct3d");
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030406, 0.025);
  const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 150);
  camera.position.set(0, 13.5, 23.5);
  camera.lookAt(0, 1.8, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const world = new THREE.Group();
  scene.add(world);

  const basin = new THREE.Mesh(
    new THREE.CylinderGeometry(10.7, 11.4, 0.42, 96),
    new THREE.MeshStandardMaterial({ color: 0x080b10, metalness: .76, roughness: .25, emissive: 0x220208, emissiveIntensity: .12 })
  );
  basin.position.y = -0.28;
  world.add(basin);

  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(9.9, 9.9, 0.08, 96),
    new THREE.MeshPhysicalMaterial({ color: 0x075e72, emissive: 0x11c7df, emissiveIntensity: .26, transparent: true, opacity: .53, metalness: .08, roughness: .15 })
  );
  water.position.y = -0.02;
  world.add(water);

  [3.4, 6.5, 9.6].forEach((radius, index) => {
    const color = index === 1 ? 0x28efff : 0xff2738;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, index === 2 ? .04 : .022, 8, 180),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: index === 2 ? .55 : .35 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.05 + index * .02;
    world.add(ring);
  });

  const core = new THREE.Group();
  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.45, 6.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x0a1017, emissive: 0xff2738, emissiveIntensity: .28, metalness: .84, roughness: .18 })
  );
  tower.position.y = 3.4;
  core.add(tower);

  const coreWater = new THREE.Mesh(
    new THREE.CylinderGeometry(.42, .42, 6.2, 22),
    new THREE.MeshBasicMaterial({ color: 0x28efff, transparent: true, opacity: .24 })
  );
  coreWater.position.y = 3.2;
  core.add(coreWater);

  const crown = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, .12, 12, 64),
    new THREE.MeshBasicMaterial({ color: 0xff2738, transparent: true, opacity: .92 })
  );
  crown.rotation.x = Math.PI / 2;
  crown.position.y = 6.75;
  core.add(crown);

  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(.05, .05, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xff2738, transparent: true, opacity: .3 })
  );
  beacon.position.y = 10.7;
  core.add(beacon);
  world.add(core);

  const labelLayer = document.createElement("div");
  labelLayer.className = "city-label-layer";
  document.body.appendChild(labelLayer);
  const labels = [];
  const selectable = [];

  chains.forEach((chain, index) => {
    const angle = (index / chains.length) * Math.PI * 2;
    const radius = index % 2 === 0 ? 7.3 : 9.05;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const color = new THREE.Color(chain.color);
    const privacy = chain.category === "privacy";

    const pipePoints = [
      new THREE.Vector3(0, .12, 0),
      new THREE.Vector3(x * .55, .12, z * .55),
      new THREE.Vector3(x, .12, z)
    ];
    const pipe = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pipePoints),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: privacy ? .78 : .42 })
    );
    world.add(pipe);

    const station = new THREE.Group();
    station.position.set(x, 0, z);

    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(.72, .9, .35, 8),
      new THREE.MeshStandardMaterial({ color: privacy ? 0x160b06 : 0x0b1016, emissive: privacy ? 0x8a2e00 : 0x230308, emissiveIntensity: privacy ? .2 : .1, metalness: .78, roughness: .21 })
    );
    plinth.position.y = .18;
    station.add(plinth);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(.18, .3, 2.2, 10),
      new THREE.MeshStandardMaterial({ color: privacy ? 0x130c08 : 0x0b1820, emissive: color, emissiveIntensity: privacy ? .42 : .23, metalness: .78, roughness: .18 })
    );
    stem.position.y = 1.45;
    stem.userData.chain = chain;
    station.add(stem);
    selectable.push(stem);

    const valve = new THREE.Mesh(
      new THREE.TorusGeometry(.48, .08, 10, 28),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .92 })
    );
    valve.rotation.y = Math.PI / 2;
    valve.position.set(.08, 2.15, 0);
    valve.userData.chain = chain;
    station.add(valve);
    selectable.push(valve);

    const spout = new THREE.Mesh(
      new THREE.CylinderGeometry(.08, .11, .9, 8),
      new THREE.MeshStandardMaterial({ color: privacy ? 0x2b1a11 : 0xa5e7ef, emissive: color, emissiveIntensity: privacy ? .4 : .2, metalness: .84, roughness: .18 })
    );
    spout.rotation.z = Math.PI / 2;
    spout.position.set(.45, 1.52, 0);
    spout.userData.chain = chain;
    station.add(spout);
    selectable.push(spout);

    const drop = new THREE.Mesh(
      new THREE.SphereGeometry(.09, 12, 12),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9 })
    );
    drop.position.set(.91, 1.28, 0);
    drop.scale.y = 1.7;
    station.add(drop);

    if (privacy) {
      const privacyRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.05, .045, 8, 48),
        new THREE.MeshBasicMaterial({ color: 0xff7a18, transparent: true, opacity: .58 })
      );
      privacyRing.rotation.x = Math.PI / 2;
      privacyRing.position.y = .08;
      station.add(privacyRing);
    }

    world.add(station);

    const label = document.createElement("span");
    label.className = `city-label ${privacy ? "privacy-label" : ""}`;
    label.textContent = privacy ? `VEILWELL / ${chain.network}` : `${chain.name} / ${chain.network}`;
    labelLayer.appendChild(label);
    labels.push({ label, position: new THREE.Vector3(x, 3.05, z) });
  });

  const starsGeometry = new THREE.BufferGeometry();
  const starCount = 650;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    positions[i * 3] = (Math.random() - .5) * 92;
    positions[i * 3 + 1] = Math.random() * 38 + 3;
    positions[i * 3 + 2] = (Math.random() - .5) * 92;
  }
  starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xb9f7ff, size: .035, transparent: true, opacity: .5 })));

  scene.add(new THREE.AmbientLight(0x9ccfff, .45));
  const cyanLight = new THREE.PointLight(0x28efff, 105, 42);
  cyanLight.position.set(0, 8, 3);
  scene.add(cyanLight);
  const redLight = new THREE.PointLight(0xff2738, 115, 40);
  redLight.position.set(-7, 7, 2);
  scene.add(redLight);
  const privacyLight = new THREE.PointLight(0xff7a18, 55, 24);
  privacyLight.position.set(8, 2, -8);
  scene.add(privacyLight);

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
    labels.forEach(({ label, position }) => {
      const projected = position.clone().applyMatrix4(world.matrixWorld).project(camera);
      const x = (projected.x * .5 + .5) * innerWidth;
      const y = (-projected.y * .5 + .5) * innerHeight;
      const visible = projected.z < 1 && x > -160 && x < innerWidth + 160 && y > -90 && y < innerHeight + 90;
      label.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      label.style.opacity = visible ? ".94" : "0";
    });
  }

  function animate() {
    const elapsed = clock.getElapsedTime();
    if (!reducedMotion) {
      world.rotation.y = elapsed * .038;
      water.position.y = -.02 + Math.sin(elapsed * .8) * .025;
      crown.rotation.z = elapsed * .2;
      core.position.y = Math.sin(elapsed * .65) * .055;
      redLight.intensity = 105 + Math.sin(elapsed * 1.2) * 12;
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
addEventListener("scroll", revealOnScroll, { passive: true });
addEventListener("load", () => {
  renderCards();
  setupFilters();
  revealOnScroll();
  typeBootSequence();
  createAqueduct();
});
