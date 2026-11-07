/* ============================================================================
   TOWER BOARD KIT JS — extracted functionality for the HERMES CITY tower upgrade
   Source: Freight Command (OVERVATECH) + F1 Racing Hub (MotionSites)
   Built from: workspace/builds/motionsites-prompts/f1-racing-hub/index.html
               workspace/builds/motionsites-prompts/freight-command/index.html
   These two pages are SOURCE MATERIAL ONLY — they are not shipped.
   Vanilla JS, no frameworks. Wire up by class/attribute; no tower content inside.
   ============================================================================ */
(function () {
  "use strict";

  /* ---- Count-up: cubic ease-out (1-(1-t)^3), 2200ms, rAF (from F1) ----
     Usage: <div class="countup" data-target="227" data-delay="800">0</div> */
  function initCountUps() {
    var els = document.querySelectorAll(".countup");
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        var target = parseInt(el.getAttribute("data-target"), 10);
        var delay = parseInt(el.getAttribute("data-delay"), 10) || 0;
        var duration = 2200;
        var t0 = performance.now() + delay;
        function tick(now) {
          var t = Math.min(Math.max((now - t0) / duration, 0), 1);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased);
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      })(els[i]);
    }
  }

  /* ---- Scale-to-fit stage (from Freight Command) ----
     Stage is a fixed 1586x992 design canvas; scales down, and grows extra
     width/height into the queue + inspector panels when the viewport is larger. */
  var stage = document.getElementById("stage");
  var currentK = 1, currentMode = "desktop";
  function detectMode() {
    var w = window.innerWidth, h = window.innerHeight;
    if (w <= 480 || (h <= 480 && w <= 950)) return "mobile";
    if (w <= 768) return "tablet";
    return "desktop";
  }
  function fit() {
    if (!stage) return;
    var w = window.innerWidth, h = window.innerHeight;
    var mode = detectMode();
    if (mode !== currentMode) {
      document.body.classList.toggle("mobile-mode", mode === "mobile");
      document.body.classList.toggle("tablet-mode", mode === "tablet");
      currentMode = mode;
    }
    var k = 1, growW = 0, growH = 0;
    if (mode === "desktop") {
      k = Math.min(w / 1586, h / 992);
      if (k > 1) { k = 1; growW = w - 1586; growH = h - 992; }
      stage.style.width = "1586px"; stage.style.height = "992px";
    } else if (mode === "tablet") {
      k = Math.min(w / 768, h / 1024);
      stage.style.width = "768px"; stage.style.height = "2336px";
    }
    if (mode !== "mobile") {
      stage.style.transform = "scale(" + k + ")";
      stage.style.setProperty("--growW", growW + "px");
      stage.style.setProperty("--growH", growH + "px");
      currentK = k;
    }
  }

  /* ---- Scale-corrected wheel scrolling (from Freight Command) ---- */
  function bindWheel(el) {
    if (!el) return;
    el.addEventListener("wheel", function (e) {
      var k = currentK || 1;
      var top = el.scrollTop, max = el.scrollHeight - el.clientHeight;
      var nt = Math.max(0, Math.min(max, top + e.deltaY / k));
      if (nt !== top) { e.preventDefault(); el.scrollTop = nt; }
    }, { passive: false });
  }

  /* ---- Exclusive row selection (from Freight Command) ---- */
  function selectRow(tbody, id) {
    var rows = tbody.querySelectorAll(".trow");
    for (var i = 0; i < rows.length; i++) {
      rows[i].classList.toggle("sel", +rows[i].getAttribute("data-id") === id);
    }
  }
  function bindRowSelection(tbodyId) {
    var tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.addEventListener("click", function (e) {
      var row = e.target.closest ? e.target.closest(".trow") : null;
      if (row) selectRow(tbody, +row.getAttribute("data-id"));
    });
  }

  /* ---- Filter buttons + active-filters strip + CLEAR ALL (from Freight Command) ---- */
  function updateFilters() {
    var active = [];
    var btns = document.querySelectorAll(".btn[data-group]");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.classList.contains("on")) {
        var v = b.getAttribute("data-val");
        if (v !== "ALL" && v !== "ALL CARRIERS" && v !== "ALL LOAD TYPES") active.push(v);
      }
    }
    var label = active.length ? active.join(" + ") : "NONE";
    var af = document.getElementById("activeFilters"); if (af) af.textContent = label;
    var mf = document.getElementById("mActiveFilters"); if (mf) mf.textContent = label;
    var fb = document.getElementById("mFiltersBtn");
    if (fb) fb.textContent = "FILTERS · " + (active.length ? active.length : "NONE");
  }
  function bindFilters() {
    document.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".btn[data-group]") : null;
      if (!b) return;
      var g = b.getAttribute("data-group");
      var sibs = document.querySelectorAll('.btn[data-group="' + g + '"]');
      for (var i = 0; i < sibs.length; i++) sibs[i].classList.remove("on");
      b.classList.add("on");
      updateFilters();
    });
    var clear = document.getElementById("clearAll");
    if (clear) clear.addEventListener("click", function () {
      var sibs = document.querySelectorAll(".btn[data-group]");
      for (var i = 0; i < sibs.length; i++) {
        var v = sibs[i].getAttribute("data-val");
        sibs[i].classList.toggle("on", v === "ALL" || v === "ALL CARRIERS" || v === "ALL LOAD TYPES");
      }
      updateFilters();
    });
  }

  /* ---- Menu overlay open/close (from F1 Racing Hub, event delegation) ---- */
  function bindMenu() {
    document.addEventListener("click", function (e) {
      var opener = e.target.closest ? e.target.closest("[data-menu-open]") : null;
      if (opener) {
        var scope = opener.closest(".menu-scope") || document;
        var overlay = scope.querySelector(".menu-overlay");
        if (overlay) overlay.classList.add("open");
        return;
      }
      var closer = e.target.closest ? e.target.closest("[data-menu-close]") : null;
      if (closer) {
        e.preventDefault();
        var scope2 = closer.closest(".menu-scope") || document;
        var overlay2 = scope2.querySelector(".menu-overlay");
        if (overlay2) overlay2.classList.remove("open");
      }
    });
  }

  /* ---- Fixed-width content scaling (from F1 phone frames) ----
     Scales any 390px-wide design block to its container width, keeping
     proportions. Use for embedded board previews inside tower cards. */
  function fitScaledBlocks() {
    var blocks = document.querySelectorAll("[data-fit-width]");
    for (var i = 0; i < blocks.length; i++) {
      var screen = blocks[i];
      var content = screen.querySelector("[data-fit-content]");
      if (!content) continue;
      var designW = parseInt(screen.getAttribute("data-fit-width"), 10) || 390;
      var w = screen.clientWidth;
      if (!w) continue;
      var scale = w / designW;
      content.style.height = (screen.clientHeight / scale) + "px";
      content.style.transform = "scale(" + scale + ")";
      content.style.transformOrigin = "top left";
    }
  }
  var fitObserver = ("ResizeObserver" in window) ? new ResizeObserver(fitScaledBlocks) : null;

  /* ---- Mobile views: queue / filters / context / inspector + Escape (from Freight Command) ---- */
  var mScroll = {};
  function mShow(view) {
    var cur = document.querySelector(".m-view.on");
    if (cur) mScroll[cur.getAttribute("data-view")] = cur.scrollTop;
    document.querySelectorAll(".m-view").forEach(function (v) {
      v.classList.toggle("on", v.getAttribute("data-view") === view);
    });
    document.querySelectorAll(".m-tab").forEach(function (t) {
      t.classList.toggle("on", t.getAttribute("data-view") === view);
    });
    var next = document.querySelector('.m-view[data-view="' + view + '"]');
    if (next && mScroll[view] != null) next.scrollTop = mScroll[view];
  }
  function bindMobileViews() {
    document.querySelectorAll(".m-tab").forEach(function (t) {
      t.addEventListener("click", function () { mShow(t.getAttribute("data-view")); });
    });
    var f = document.getElementById("mFiltersBtn"); if (f) f.addEventListener("click", function () { mShow("filters"); });
    var b = document.getElementById("mBackBtn"); if (b) b.addEventListener("click", function () { mShow("queue"); });
    var q = document.getElementById("mQueueBtn"); if (q) q.addEventListener("click", function () { mShow("queue"); });
    var d = document.getElementById("mDoneBtn"); if (d) d.addEventListener("click", function () { mShow("queue"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && currentMode === "mobile") mShow("queue");
    });
  }

  /* ---- Init ---- */
  initCountUps();
  bindWheel(document.getElementById("tscroll"));
  bindWheel(document.getElementById("iscroll"));
  bindRowSelection("tbody");
  bindFilters();
  bindMenu();
  bindMobileViews();
  fitScaledBlocks();
  if (fitObserver) {
    document.querySelectorAll("[data-fit-width]").forEach(function (s) { fitObserver.observe(s); });
  }
  var rT = null;
  function scheduleFit() { if (rT) clearTimeout(rT); rT = setTimeout(fit, 120); }
  window.addEventListener("resize", fit);
  window.addEventListener("orientationchange", scheduleFit);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fit);
  window.addEventListener("load", function () { fit(); fitScaledBlocks(); });
  fit();
  updateFilters();
})();
