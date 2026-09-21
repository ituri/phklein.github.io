/* Umschalter für die Entwürfe: Farbpalette (20) und Layout (5) sind unabhängig wählbar.
   Bedienung: ← / → (oder Leertaste) = Palette wechseln, ↑ / ↓ oder 1–5 = Layout wechseln,
   R = zufällige Kombination, G = Übersicht, H = Leiste aus-/einblenden.
   Direktlink: index.html#7/fetch  (Palette 7 im Layout „fetch“) */
(function () {
  "use strict";

  var PALETTES = [
    { file: "01-one-dark",         name: "One Dark" },
    { file: "02-night-owl",        name: "Night Owl" },
    { file: "03-dracula",          name: "Dracula" },
    { file: "04-nord",             name: "Nord" },
    { file: "05-solarized-dark",   name: "Solarized Dark" },
    { file: "06-solarized-light",  name: "Solarized Light" },
    { file: "07-gruvbox-dark",     name: "Gruvbox Dark" },
    { file: "08-gruvbox-light",    name: "Gruvbox Light" },
    { file: "09-monokai",          name: "Monokai" },
    { file: "10-tokyo-night",      name: "Tokyo Night" },
    { file: "11-catppuccin-mocha", name: "Catppuccin Mocha" },
    { file: "12-catppuccin-latte", name: "Catppuccin Latte" },
    { file: "13-ayu-mirage",       name: "Ayu Mirage" },
    { file: "14-rose-pine",        name: "Rosé Pine" },
    { file: "15-github-dark",      name: "GitHub Dark" },
    { file: "16-palenight",        name: "Material Palenight" },
    { file: "17-everforest",       name: "Everforest" },
    { file: "18-matrix",           name: "Matrix (Phosphor)" },
    { file: "19-amber",            name: "Amber-Monitor" },
    { file: "20-synthwave",        name: "Synthwave '84" }
  ];
  var LAYOUTS = [
    { id: "plain",    name: "Schlicht" },
    { id: "terminal", name: "Terminal" },
    { id: "editor",   name: "Editor" },
    { id: "man",      name: "Man-Page" },
    { id: "fetch",    name: "Neofetch" }
  ];
  window.PALETTES = PALETTES;
  window.LAYOUTS = LAYOUTS;
  if (!document.getElementById("theme")) return; // z. B. auf uebersicht.html: nur die Listen bereitstellen

  var bare = /[?&]bare\b/.test(location.search);
  var pal = 0, lay = 1, ui = null;

  function layoutIndex(id) {
    for (var i = 0; i < LAYOUTS.length; i++) if (LAYOUTS[i].id === id) return i;
    return -1;
  }
  function store(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* egal */ } }
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function mod(n, m) { return (n % m + m) % m; }

  function fromLocation() {
    var parts = location.hash.replace("#", "").split("/");
    var n = parseInt(parts[0], 10);
    if (!(n >= 1 && n <= PALETTES.length)) {
      n = parseInt(store("phklein-palette"), 10) + 1;
      if (!(n >= 1 && n <= PALETTES.length)) n = 1;
    }
    var li = layoutIndex(parts[1]);
    if (li < 0) li = layoutIndex(store("phklein-layout"));
    if (li < 0) li = 1;
    return { p: n - 1, l: li };
  }

  function apply(p, l, persist) {
    pal = mod(p, PALETTES.length);
    lay = mod(l, LAYOUTS.length);
    var P = PALETTES[pal], L = LAYOUTS[lay];
    document.getElementById("theme").setAttribute("href", "themes/" + P.file + ".css");
    document.documentElement.setAttribute("data-layout", L.id);
    document.title = pad(pal + 1) + " " + P.name + " · " + L.name + " – phklein.net Entwürfe";
    if (persist) {
      try { history.replaceState(null, "", "#" + (pal + 1) + "/" + L.id); } catch (e) { /* egal */ }
      save("phklein-palette", String(pal));
      save("phklein-layout", L.id);
    }
    if (ui) {
      ui.count.textContent = pad(pal + 1) + "/" + PALETTES.length;
      ui.select.value = String(pal);
      ui.layouts.forEach(function (b) {
        var on = b.getAttribute("data-layout") === L.id;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
  }

  function buildUi() {
    var bar = document.createElement("nav");
    bar.id = "switcher";
    bar.setAttribute("aria-label", "Palette und Layout wechseln");
    var layoutButtons = LAYOUTS.map(function (L, i) {
      return '<button type="button" data-layout="' + L.id + '" title="Layout ' + (i + 1) + ": " + L.name + " (Taste " + (i + 1) + ')">' + L.name + "</button>";
    }).join("");
    bar.innerHTML =
      '<div class="sw-group"><button type="button" data-act="prev" aria-label="Vorige Palette" title="Vorige Palette (←)">&#9664;</button>' +
      '<span class="sw-count"></span><select aria-label="Palette wählen"></select>' +
      '<button type="button" data-act="next" aria-label="Nächste Palette" title="Nächste Palette (→)">&#9654;</button></div>' +
      '<div class="sw-group sw-layouts" role="group" aria-label="Layout">' + layoutButtons + "</div>" +
      '<div class="sw-group"><a href="uebersicht.html" title="Alle Kombinationen im Überblick (G)">Übersicht</a>' +
      '<button type="button" data-act="hide" title="Leiste ausblenden (H)" aria-label="Leiste ausblenden">&#215;</button></div>';

    var css = document.createElement("style");
    css.textContent =
      "#switcher{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:99999;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:.5rem .9rem;" +
      "padding:.45rem .8rem;background:rgba(18,18,18,.93);color:#e6e6e6;border:1px solid rgba(255,255,255,.18);border-radius:18px;" +
      "font:13px/1.2 ui-monospace,Menlo,Consolas,monospace;text-shadow:none;box-shadow:0 6px 24px rgba(0,0,0,.5);max-width:calc(100vw - 16px)}" +
      "#switcher .sw-group{display:flex;align-items:center;gap:.4rem}" +
      "#switcher button,#switcher select,#switcher a{font:inherit;color:inherit;background:transparent;border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:.3rem .65rem;cursor:pointer;text-decoration:none;white-space:nowrap}" +
      "#switcher button:hover,#switcher a:hover{background:rgba(255,255,255,.14)}" +
      "#switcher .sw-layouts button.on{background:#e6e6e6;color:#111;border-color:#e6e6e6}" +
      "#switcher select{max-width:11rem;background:#1c1c1c}#switcher select option{background:#1c1c1c;color:#eee}" +
      "#switcher .sw-count{opacity:.7}" +
      "#switcher.off{display:none}#sw-show{position:fixed;right:10px;bottom:10px;z-index:99999;opacity:.35;background:#111;color:#eee;border:1px solid #444;border-radius:999px;padding:.2rem .6rem;font:12px ui-monospace,monospace;cursor:pointer;display:none;text-shadow:none}" +
      "#sw-show:hover{opacity:1}" +
      "@media(max-width:40rem){#switcher{width:calc(100vw - 16px);border-radius:14px}#switcher .sw-layouts{flex-wrap:wrap;justify-content:center}#switcher select{max-width:8rem}}";
    document.head.appendChild(css);
    document.body.appendChild(bar);

    var show = document.createElement("button");
    show.id = "sw-show"; show.type = "button"; show.textContent = "Entwürfe";
    document.body.appendChild(show);

    ui = {
      bar: bar, show: show,
      count: bar.querySelector(".sw-count"),
      select: bar.querySelector("select"),
      layouts: Array.prototype.slice.call(bar.querySelectorAll(".sw-layouts button"))
    };
    PALETTES.forEach(function (P, i) {
      var o = document.createElement("option");
      o.value = String(i); o.textContent = pad(i + 1) + "  " + P.name;
      ui.select.appendChild(o);
    });

    bar.addEventListener("click", function (e) {
      var t = e.target;
      var act = t.getAttribute && t.getAttribute("data-act");
      var lid = t.getAttribute && t.getAttribute("data-layout");
      if (act === "prev") apply(pal - 1, lay, true);
      else if (act === "next") apply(pal + 1, lay, true);
      else if (act === "hide") toggleBar(false);
      else if (lid) apply(pal, layoutIndex(lid), true);
    });
    ui.select.addEventListener("change", function () { apply(parseInt(ui.select.value, 10), lay, true); });
    show.addEventListener("click", function () { toggleBar(true); });
  }

  function toggleBar(on) {
    if (!ui) return;
    var visible = typeof on === "boolean" ? on : ui.bar.classList.contains("off");
    ui.bar.classList.toggle("off", !visible);
    ui.show.style.display = visible ? "none" : "block";
  }

  window.addEventListener("keydown", function (e) {
    if (bare || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(select|input|textarea|button|a)$/i.test((e.target.tagName || ""))) return;
    var k = e.key;
    if (k === "ArrowRight" || k === " " || k === "PageDown") { apply(pal + 1, lay, true); e.preventDefault(); }
    else if (k === "ArrowLeft" || k === "PageUp") { apply(pal - 1, lay, true); e.preventDefault(); }
    else if (k === "ArrowDown") { apply(pal, lay + 1, true); e.preventDefault(); }
    else if (k === "ArrowUp") { apply(pal, lay - 1, true); e.preventDefault(); }
    else if (k >= "1" && k <= String(LAYOUTS.length)) { apply(pal, parseInt(k, 10) - 1, true); }
    else if (k === "r" || k === "R") { apply(Math.floor(Math.random() * PALETTES.length), Math.floor(Math.random() * LAYOUTS.length), true); }
    else if (k === "h" || k === "H") { toggleBar(); }
    else if (k === "g" || k === "G") { location.href = "uebersicht.html#layout=" + LAYOUTS[lay].id; }
    else if (k === "Home") { apply(0, lay, true); }
    else if (k === "End") { apply(PALETTES.length - 1, lay, true); }
  });

  window.addEventListener("hashchange", function () { var s = fromLocation(); apply(s.p, s.l, false); });

  var s0 = fromLocation();
  apply(s0.p, s0.l, false);
  document.addEventListener("DOMContentLoaded", function () {
    if (!bare) { buildUi(); apply(pal, lay, false); }
  });
})();
