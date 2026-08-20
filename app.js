import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const chains = [
  {
    id: "ethereum-sepolia", name: "Ethereum", network: "Sepolia", asset: "ETH", family: "EVM", mark: "Ξ",
    mode: "Provider faucet", adapter: "EVMAdapter", color: 0x8ea1ff,
    faucet: "https://ethereum.org/en/developers/docs/networks/", docs: "https://ethereum.org/en/developers/docs/networks/",
    note: "Sepolia is the primary Ethereum application-development testnet. Faucet availability is provider-dependent."
  },
  {
    id: "base-sepolia", name: "Base", network: "Base Sepolia", asset: "ETH", family: "EVM / OP Stack", mark: "B",
    mode: "Provider faucet", adapter: "BaseAdapter", color: 0x3478ff,
    faucet: "https://docs.base.org/base-chain/tools/network-faucets", docs: "https://docs.base.org/base-chain/network-information",
    note: "Base documents multiple Sepolia faucet options. Provider account and rate-limit rules remain authoritative."
  },
  {
    id: "op-sepolia", name: "Optimism", network: "OP Sepolia", asset: "ETH", family: "EVM / OP Stack", mark: "OP",
    mode: "Superchain faucet", adapter: "SuperchainAdapter", color: 0xff344d,
    faucet: "https://console.optimism.io/faucet", docs: "https://docs.optimism.io/chain/networks",
    note: "The Superchain faucet is the preferred public entry point for supported OP Stack test networks."
  },
  {
    id: "arbitrum-sepolia", name: "Arbitrum", network: "Arbitrum Sepolia", asset: "ETH", family: "EVM / Arbitrum", mark: "A",
    mode: "Provider faucet", adapter: "ArbitrumAdapter", color: 0x37b5ff,
    faucet: "https://docs.arbitrum.io/", docs: "https://docs.arbitrum.io/",
    note: "AQUEDUCT links to Arbitrum documentation; public faucet providers may change independently of this registry."
  },
  {
    id: "polygon-amoy", name: "Polygon", network: "Amoy", asset: "POL", family: "EVM / Polygon", mark: "P",
    mode: "Provider faucet", adapter: "PolygonAdapter", color: 0x9b55ff,
    faucet: "https://docs.polygon.technology/tools/gas/matic-faucet/", docs: "https://docs.polygon.technology/pos/reference/rpc-endpoints/",
    note: "Amoy is Polygon PoS test infrastructure. Keep RPC and faucet providers registry-driven because endpoints can change."
  },
  {
    id: "avalanche-fuji", name: "Avalanche", network: "Fuji C-Chain", asset: "AVAX", family: "EVM / Avalanche", mark: "AV",
    mode: "Web faucet", adapter: "AvalancheAdapter", color: 0xff4b55,
    faucet: "https://core.app/tools/testnet-faucet/", docs: "https://build.avax.network/docs/quick-start/networks/fuji-testnet",
    note: "Fuji is Avalanche's primary public test network. Faucet access may impose provider-specific limits."
  },
  {
    id: "bsc-testnet", name: "BNB Chain", network: "BSC Testnet", asset: "tBNB", family: "EVM / BNB", mark: "BNB",
    mode: "Web faucet", adapter: "BnbAdapter", color: 0xf3ba2f,
    faucet: "https://www.bnbchain.org/en/testnet-faucet", docs: "https://docs.bnbchain.org/bnb-smart-chain/developers/network-config/",
    note: "BSC Testnet uses test BNB for gas. AQUEDUCT will not automate human-verification gates."
  },
  {
    id: "litvm-liteforge", name: "LitVM", network: "LiteForge", asset: "zkLTC", family: "EVM / LitVM", mark: "Ł",
    mode: "Testnet resource", adapter: "LitVMAdapter", color: 0xbac5d0,
    faucet: "https://liteforge.explorer.caldera.xyz/", docs: "https://liteforge.explorer.caldera.xyz/",
    note: "AGENTROPOLIS Digital Silver Borough lane. Faucet discovery remains registry-controlled until a stable public endpoint is verified."
  },
  {
    id: "solana-devnet", name: "Solana", network: "Devnet", asset: "SOL", family: "Solana", mark: "S",
    mode: "Programmatic / web", adapter: "SolanaAdapter", color: 0x14f195,
    faucet: "https://faucet.solana.com/", docs: "https://solana.com/docs/references/clusters",
    note: "Devnet is the normal Solana application-development lane. Agent execution should prefer approved programmatic requestAirdrop paths, not browser automation."
  },
  {
    id: "xrpl-testnet", name: "XRPL", network: "Testnet", asset: "XRP", family: "XRPL", mark: "X",
    mode: "SDK / web faucet", adapter: "XrplAdapter", color: 0xe7f4ff,
    faucet: "https://xrpl.org/resources/dev-tools/xrp-faucets", docs: "https://xrpl.org/docs/concepts/networks-and-servers/parallel-networks",
    note: "XRPL exposes test funding through its faucet tooling and SDK workflows such as funded test-wallet creation."
  },
  {
    id: "stellar-testnet", name: "Stellar", network: "Testnet", asset: "XLM", family: "Stellar", mark: "★",
    mode: "Friendbot", adapter: "StellarAdapter", color: 0xffd166,
    faucet: "https://developers.stellar.org/docs/data/apis/horizon/api-reference/resources/create-account", docs: "https://developers.stellar.org/docs/networks",
    note: "Stellar test accounts can be funded through Friendbot. This public UI only documents the path; governed execution belongs behind AQUEDUCT MCP."
  },
  {
    id: "sui-testnet", name: "Sui", network: "Testnet", asset: "SUI", family: "Move / Sui", mark: "SUI",
    mode: "Web / client faucet", adapter: "SuiAdapter", color: 0x6fbcf0,
    faucet: "https://faucet.sui.io/", docs: "https://docs.sui.io/guides/developer/getting-started/connect",
    note: "Sui testnet funding can be requested through supported faucet tooling. Adapter authority remains separately governed."
  },
  {
    id: "aptos-testnet", name: "Aptos", network: "Testnet", asset: "APT", family: "Move / Aptos", mark: "APT",
    mode: "Web / API faucet", adapter: "AptosAdapter", color: 0x78f0cf,
    faucet: "https://aptos.dev/network/faucet", docs: "https://aptos.dev/network/nodes/networks",
    note: "Aptos maintains test-network funding guidance. Any automated requests should honor published service limits and authentication requirements."
  },
  {
    id: "polkadot-paseo", name: "Polkadot", network: "Paseo", asset: "PAS", family: "Substrate", mark: "DOT",
    mode: "Community faucet", adapter: "SubstrateAdapter", color: 0xff4da6,
    faucet: "https://docs.polkadot.com/develop/networks/", docs: "https://docs.polkadot.com/develop/networks/",
    note: "Paseo is represented as the Substrate ecosystem test lane. Faucet endpoints are kept documentation-driven until verified as stable."
  }
];

const bootLines = [
  "boot://agentropolis-aqueduct",
  "surface: hermes-derived static three.js",
  `chainwells: ${chains.length} represented`,
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
    if (lineIndex < bootLines.length) setTimeout(tick, charIndex === 0 ? 150 : 16);
    else terminal.textContent = output + "\nFLOW STABLE";
  }
  tick();
}

function renderCards() {
  if (!faucetGrid) return;
  faucetGrid.innerHTML = chains.map((chain) => {
    const color = `#${chain.color.toString(16).padStart(6, "0")}`;
    return `
      <article class="card reveal visible" style="--card-glow:${color}33">
        <div class="card-top">
          <span class="chain-mark" style="color:${color}">${chain.mark}</span>
          <span class="tag">${chain.family}</span>
        </div>
        <h3>${chain.name}</h3>
        <div class="card-network">${chain.network} · ${chain.asset}</div>
        <p>${chain.note}</p>
        <div class="card-meta"><span class="tag">${chain.mode}</span><span class="tag">${chain.adapter}</span></div>
        <div class="card-actions">
          <a class="button primary" href="${chain.faucet}" target="_blank" rel="noreferrer">Faucet / source ↗</a>
          <a class="button ghost" href="${chain.docs}" target="_blank" rel="noreferrer">Docs ↗</a>
        </div>
      </article>`;
  }).join("");
}

function showDetail(chain) {
  if (!detailPanel || !chain) return;
  const color = `#${chain.color.toString(16).padStart(6, "0")}`;
  document.querySelector("#detailMark").textContent = chain.mark;
  document.querySelector("#detailMark").style.color = color;
  document.querySelector("#detailMark").style.borderColor = color;
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
  detailPanel.classList.add("open");
}

function createAqueduct() {
  const canvas = document.querySelector("#aqueduct3d");
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x02070b, 0.025);
  const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 140);
  camera.position.set(0, 13, 23);
  camera.lookAt(0, 1.8, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const world = new THREE.Group();
  scene.add(world);

  const basin = new THREE.Mesh(
    new THREE.CylinderGeometry(10.7, 11.4, 0.42, 96),
    new THREE.MeshStandardMaterial({ color: 0x06141f, metalness: .68, roughness: .28 })
  );
  basin.position.y = -0.28;
  world.add(basin);

  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(9.9, 9.9, 0.08, 96),
    new THREE.MeshPhysicalMaterial({ color: 0x0a6f85, emissive: 0x0bc8dd, emissiveIntensity: .2, transparent: true, opacity: .48, metalness: .12, roughness: .18 })
  );
  water.position.y = -0.02;
  world.add(water);

  [3.4, 6.5, 9.6].forEach((radius, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, index === 2 ? .035 : .018, 8, 180),
      new THREE.MeshBasicMaterial({ color: index === 2 ? 0x9f67ff : 0x28f0ff, transparent: true, opacity: index === 2 ? .3 : .22 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.05 + index * .02;
    world.add(ring);
  });

  const core = new THREE.Group();
  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.45, 6.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x071c29, emissive: 0x28f0ff, emissiveIntensity: .25, metalness: .8, roughness: .22 })
  );
  tower.position.y = 3.4;
  core.add(tower);
  const crown = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, .12, 12, 64),
    new THREE.MeshBasicMaterial({ color: 0x28f0ff, transparent: true, opacity: .8 })
  );
  crown.rotation.x = Math.PI / 2;
  crown.position.y = 6.75;
  core.add(crown);
  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(.035, .035, 11, 12),
    new THREE.MeshBasicMaterial({ color: 0x28f0ff, transparent: true, opacity: .18 })
  );
  beacon.position.y = 10.5;
  core.add(beacon);
  world.add(core);

  const labelLayer = document.createElement("div");
  labelLayer.className = "city-label-layer";
  document.body.appendChild(labelLayer);
  const labels = [];
  const selectable = [];

  chains.forEach((chain, index) => {
    const angle = (index / chains.length) * Math.PI * 2;
    const radius = index % 2 === 0 ? 7.35 : 9.1;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const color = new THREE.Color(chain.color);

    const pipePoints = [
      new THREE.Vector3(0, .12, 0),
      new THREE.Vector3(x * .55, .12, z * .55),
      new THREE.Vector3(x, .12, z)
    ];
    const pipe = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pipePoints),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: .35 })
    );
    world.add(pipe);

    const station = new THREE.Group();
    station.position.set(x, 0, z);

    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(.72, .9, .35, 8),
      new THREE.MeshStandardMaterial({ color: 0x071721, metalness: .72, roughness: .25 })
    );
    plinth.position.y = .18;
    station.add(plinth);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(.18, .3, 2.2, 10),
      new THREE.MeshStandardMaterial({ color: 0x0b2431, emissive: color, emissiveIntensity: .22, metalness: .74, roughness: .2 })
    );
    stem.position.y = 1.45;
    stem.userData.chain = chain;
    station.add(stem);
    selectable.push(stem);

    const valve = new THREE.Mesh(
      new THREE.TorusGeometry(.48, .08, 10, 28),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .86 })
    );
    valve.rotation.y = Math.PI / 2;
    valve.position.set(.08, 2.15, 0);
    valve.userData.chain = chain;
    station.add(valve);
    selectable.push(valve);

    const spout = new THREE.Mesh(
      new THREE.CylinderGeometry(.08, .11, .9, 8),
      new THREE.MeshStandardMaterial({ color: 0x9adfea, emissive: color, emissiveIntensity: .18, metalness: .8, roughness: .2 })
    );
    spout.rotation.z = Math.PI / 2;
    spout.position.set(.45, 1.52, 0);
    spout.userData.chain = chain;
    station.add(spout);
    selectable.push(spout);

    const drop = new THREE.Mesh(
      new THREE.SphereGeometry(.09, 12, 12),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .82 })
    );
    drop.position.set(.91, 1.28, 0);
    drop.scale.y = 1.7;
    station.add(drop);

    world.add(station);

    const label = document.createElement("span");
    label.className = "city-label";
    label.textContent = `${chain.name} · ${chain.network}`;
    labelLayer.appendChild(label);
    labels.push({ label, position: new THREE.Vector3(x, 3.05, z) });
  });

  const starsGeometry = new THREE.BufferGeometry();
  const starCount = 600;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    positions[i * 3] = (Math.random() - .5) * 90;
    positions[i * 3 + 1] = Math.random() * 38 + 3;
    positions[i * 3 + 2] = (Math.random() - .5) * 90;
  }
  starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0x72eaff, size: .035, transparent: true, opacity: .58 })));

  scene.add(new THREE.AmbientLight(0x94cfff, .5));
  const key = new THREE.PointLight(0x28f0ff, 115, 42);
  key.position.set(0, 10, 2);
  scene.add(key);
  const violet = new THREE.PointLight(0x9f67ff, 85, 36);
  violet.position.set(-9, 5, -2);
  scene.add(violet);

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
      const visible = projected.z < 1 && x > -150 && x < innerWidth + 150 && y > -80 && y < innerHeight + 80;
      label.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      label.style.opacity = visible ? ".92" : "0";
    });
  }

  function animate() {
    const elapsed = clock.getElapsedTime();
    if (!reducedMotion) {
      world.rotation.y = elapsed * .042;
      water.position.y = -.02 + Math.sin(elapsed * .8) * .025;
      crown.rotation.z = elapsed * .18;
      core.position.y = Math.sin(elapsed * .65) * .06;
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
  revealOnScroll();
  typeBootSequence();
  createAqueduct();
});
