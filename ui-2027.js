const cssHref = new URL("./ui-2027.css", import.meta.url).href;
if (![...document.styleSheets].some((sheet) => sheet.href === cssHref)) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = cssHref;
  document.head.appendChild(link);
}

const sections = [
  { id: "top", label: "City", tone: "#8cf8ff" },
  { id: "map", label: "Explore", tone: "#9fc6ff" },
  { id: "botmode", label: "Bot Mode", tone: "#ff6f7e" },
  { id: "faucets", label: "Chainwells", tone: "#8cf8ff" },
  { id: "veilwell", label: "Veilwell", tone: "#ffb06d" },
  { id: "protocol", label: "Flowkeeper", tone: "#b58cff" }
];

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildDock() {
  if (document.querySelector(".city-dock")) return;
  const dock = document.createElement("nav");
  dock.className = "city-dock";
  dock.setAttribute("aria-label", "Agent City quick navigation");

  dock.innerHTML = sections.map(({ id, label, tone }) => `
    <a href="#${id}" data-section="${id}" title="${label}" style="color:${tone}">
      <span class="dock-dot" aria-hidden="true"></span>
      <span>${label}</span>
    </a>
  `).join("") + `
    <button class="dock-command" type="button" aria-label="Open command palette" title="Command palette">
      <span class="dock-dot" style="color:#f4f7fa" aria-hidden="true"></span>
      <span>Command</span>
    </button>`;

  document.body.appendChild(dock);
  dock.querySelectorAll("a[data-section]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToSection(link.dataset.section);
    });
  });
  dock.querySelector(".dock-command")?.addEventListener("click", () => togglePalette(true));
}

function buildPalette() {
  if (document.querySelector(".command-palette")) return;
  const palette = document.createElement("div");
  palette.className = "command-palette";
  palette.setAttribute("aria-hidden", "true");
  palette.innerHTML = `
    <div class="command-shell" role="dialog" aria-modal="true" aria-label="Agent City command palette">
      <input class="command-input" type="search" autocomplete="off" placeholder="Go to Agent City, Bot Mode, Chainwells…" aria-label="Search city destinations">
      <div class="command-list">
        ${sections.map(({ id, label }) => `<a class="command-item" href="#${id}" data-section="${id}"><span>${label}</span><small>Open</small></a>`).join("")}
        <a class="command-item" href="https://github.com/AGENTROPOLIS-CITY-OF-AGENTS/AGENTROPOLIS-AQUADUCT" target="_blank" rel="noreferrer"><span>GitHub repository</span><small>External</small></a>
      </div>
    </div>`;
  document.body.appendChild(palette);

  palette.addEventListener("mousedown", (event) => {
    if (event.target === palette) togglePalette(false);
  });
  palette.querySelectorAll("a[data-section]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      togglePalette(false);
      scrollToSection(link.dataset.section);
    });
  });

  const input = palette.querySelector(".command-input");
  input?.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    palette.querySelectorAll(".command-item").forEach((item) => {
      item.hidden = query.length > 0 && !item.textContent.toLowerCase().includes(query);
    });
  });
}

function togglePalette(open) {
  const palette = document.querySelector(".command-palette");
  if (!palette) return;
  palette.classList.toggle("open", open);
  palette.setAttribute("aria-hidden", open ? "false" : "true");
  if (open) {
    const input = palette.querySelector(".command-input");
    if (input) {
      input.value = "";
      palette.querySelectorAll(".command-item").forEach((item) => { item.hidden = false; });
      requestAnimationFrame(() => input.focus());
    }
  }
}

function setupKeyboard() {
  addEventListener("keydown", (event) => {
    const commandKey = event.metaKey || event.ctrlKey;
    if (commandKey && event.key.toLowerCase() === "k") {
      event.preventDefault();
      togglePalette(!document.querySelector(".command-palette")?.classList.contains("open"));
    }
    if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
      event.preventDefault();
      togglePalette(true);
    }
    if (event.key === "Escape") togglePalette(false);
  });
}

function setupActiveSection() {
  const links = [...document.querySelectorAll("[data-section]")];
  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = visible.target.id || "top";
    links.forEach((link) => link.dataset.active = link.dataset.section === id ? "true" : "false");
    navLinks.forEach((link) => {
      const target = link.getAttribute("href")?.slice(1) || "top";
      link.dataset.active = target === id ? "true" : "false";
    });
  }, { rootMargin: "-28% 0px -58% 0px", threshold: [0.01, 0.15, 0.35] });

  sections.forEach(({ id }) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

function setupSpotlights() {
  const apply = () => {
    document.querySelectorAll(".card, .protocol-card, .botmode-card, .hud-row").forEach((card) => {
      if (card.dataset.spotlightBound === "true") return;
      card.dataset.spotlightBound = "true";
      card.classList.add("spotlight-card");
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    });
  };
  apply();
  new MutationObserver(apply).observe(document.body, { childList: true, subtree: true });
}

function setupHeroParallax() {
  const hero = document.querySelector(".hero");
  if (!hero || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  hero.addEventListener("pointermove", (event) => {
    const x = event.clientX / innerWidth - 0.5;
    const y = event.clientY / innerHeight - 0.5;
    document.documentElement.style.setProperty("--hero-x", `${x * 10}px`);
    document.documentElement.style.setProperty("--hero-y", `${y * 8}px`);
  });
}

function markExperience() {
  document.documentElement.dataset.uiGeneration = "2027";
  document.documentElement.dataset.componentSystem = "21st-inspired-spatial";
}

function init() {
  markExperience();
  buildDock();
  buildPalette();
  setupKeyboard();
  setupActiveSection();
  setupSpotlights();
  setupHeroParallax();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
