import { site, apps, upcoming } from "./apps.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const pad = (n) => String(n).padStart(2, "0");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

document.body.classList.add("is-loading");

/* ── Site copy from config ── */
$$("[data-brand]").forEach((el) => (el.textContent = site.brand));
$$("[data-owner]").forEach((el) => (el.textContent = site.owner));
$$("[data-city]").forEach((el) => (el.textContent = site.city));
$$("[data-email]").forEach((el) => (el.textContent = site.email));
$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
if (!isMac) $$("[data-mod]").forEach((el) => (el.textContent = "Ctrl"));
$("[data-socials]").innerHTML = site.socials
  .map((s) => `<a href="${esc(s.href)}" target="_blank" rel="noopener" data-magnetic>${esc(s.label)} ↗</a>`)
  .join("");

const live = apps.filter((a) => a.status !== "soon");
$('[data-stat="live"]').textContent = pad(live.length);
$('[data-stat="soon"]').textContent = pad(upcoming.length + apps.length - live.length);

/* ── Apps ── */
const statusLabel = { live: "Live", beta: "Beta", soon: "Soon" };
const accentStyle = (a) => `--a1:${a.accent[0]};--a2:${a.accent[1]}`;

$("[data-apps]").innerHTML =
  apps
    .map(
      (a, i) => `
  <button class="app-card reveal" data-app="${esc(a.id)}" style="${accentStyle(a)}" aria-label="Open ${esc(a.name)}">
    <div class="app-info">
      <div class="app-top">
        <span class="app-index">${pad(i + 1)} / ${pad(apps.length)} · ${esc(a.year)}</span>
        <span class="status" data-s="${esc(a.status)}">${statusLabel[a.status]}</span>
      </div>
      <h3 class="app-name">${esc(a.name)}</h3>
      <p class="app-tag">${esc(a.tagline)}</p>
      <div class="app-row">
        ${a.platforms.map((p) => `<span class="chip">${esc(p)}</span>`).join("")}
        <span class="app-open">View <i class="arrow">→</i></span>
      </div>
    </div>
    <div class="app-stage" aria-hidden="true">
      <div class="stage-grid"></div>
      <span class="orbit"></span><span class="orbit"></span>
      <div class="app-icon">${esc(a.glyph)}</div>
    </div>
  </button>`
    )
    .join("") +
  upcoming
    .map(
      (u, i) => `
  <div class="soon-card reveal" style="--d:${0.08 * (i + 1)}s">
    <span class="scramble" data-scramble>IN THE WORKSHOP</span>
    <div><h3>${esc(u.codename)}</h3><p>${esc(u.hint)}</p></div>
  </div>`
    )
    .join("");

/* ── Marquee ── */
{
  const words = [...apps.map((a) => a.name), "Small apps", "Big care", "Made by hand", "More soon"];
  const row = words.map((w) => `<span>${esc(w)} <i>✦</i></span>`).join("");
  $("[data-marquee]").innerHTML = row + row + row + row;
}

/* ── Hero split text ── */
$$(".split").forEach((el) => {
  let idx = 0;
  const wrap = (node) => {
    if (node.nodeType === 3) {
      const frag = document.createDocumentFragment();
      // Group glyphs per word so lines only break between words.
      node.textContent.split(/(\s+)/).forEach((word) => {
        if (!word.trim()) return word && frag.append(" ");
        const w = document.createElement("span");
        w.className = "word";
        for (const ch of word) {
          const s = document.createElement("span");
          s.className = "char";
          s.style.transitionDelay = `${0.35 + idx++ * 0.025}s`;
          s.textContent = ch;
          w.append(s);
        }
        frag.append(w);
      });
      node.replaceWith(frag);
    } else if (node.classList?.contains("shimmer")) {
      // Gradient text can't be split per glyph; animate the word as one piece.
      node.classList.add("char");
      node.style.transitionDelay = `${0.35 + idx++ * 0.025}s`;
    } else {
      [...node.childNodes].forEach(wrap);
    }
  };
  [...el.childNodes].forEach(wrap);
});

/* ── Intro curtain ── */
{
  const curtain = $(".curtain");
  const count = $("[data-count]");
  const start = performance.now();
  const dur = reduced ? 0 : 1100;
  const tick = (now) => {
    const p = Math.min(1, (now - start) / dur || 1);
    count.textContent = Math.round((1 - Math.pow(1 - p, 3)) * 100);
    if (p < 1) return requestAnimationFrame(tick);
    curtain.classList.add("is-done");
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    setTimeout(() => $$(".hero .reveal").forEach((el, i) => { el.style.setProperty("--d", `${0.6 + i * 0.12}s`); el.classList.add("in"); }), 100);
    setTimeout(() => curtain.remove(), 1400);
  };
  requestAnimationFrame(tick);
}

/* ── Reveal on scroll ── */
{
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { rootMargin: "0px 0px -10% 0px" }
  );
  $$(".reveal").forEach((el) => { if (!el.closest(".hero")) io.observe(el); });
}

/* ── Manifesto: words light up as you scroll ── */
{
  const m = $("[data-manifesto]");
  const wrap = (node) => {
    if (node.nodeType === 3) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((t) => {
        if (!t.trim()) return frag.append(t);
        const s = document.createElement("span");
        s.className = "w";
        s.textContent = t;
        frag.append(s);
      });
      node.replaceWith(frag);
    } else [...node.childNodes].forEach(wrap);
  };
  [...m.childNodes].forEach(wrap);
  const words = $$(".w", m);
  const update = () => {
    const r = m.getBoundingClientRect();
    const vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
    const lit = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle("on", reduced || i < lit));
  };
  addEventListener("scroll", update, { passive: true });
  update();
}

/* ── Nav: scrolled state, hide on scroll down, active link ── */
{
  const nav = $(".nav");
  let last = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    nav.classList.toggle("is-scrolled", y > 20);
    nav.classList.toggle("is-hidden", y > last && y > 400 && !document.querySelector("dialog[open]"));
    last = y;
  }, { passive: true });
  const links = $$(".nav-links a");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${e.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("section[id]").forEach((s) => io.observe(s));
}

/* ── Live clock ── */
{
  const el = $("[data-clock]");
  const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: site.timezone });
  const tick = () => (el.textContent = `${fmt.format(new Date())} · ${site.city}`);
  tick();
  setInterval(tick, 15000);
}

/* ── Scramble text on the workshop cards ── */
if (!reduced) {
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=/<>";
  $$("[data-scramble]").forEach((el) => {
    const final = el.textContent;
    setInterval(() => {
      let f = 0;
      const id = setInterval(() => {
        el.textContent = final.split("").map((c, i) => (c === " " || i < f ? c : glyphs[(Math.random() * glyphs.length) | 0])).join("");
        f += 0.6;
        if (f > final.length) { clearInterval(id); el.textContent = final; }
      }, 30);
    }, 4200 + Math.random() * 2000);
  });
}

/* ── Pointer effects: cursor, magnetic, tilt, spotlight ── */
if (finePointer && !reduced) {
  document.documentElement.classList.add("has-cursor");
  const cursor = $(".cursor");
  const dot = $(".cursor-dot");
  const ring = $(".cursor-ring");
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; cursor.classList.add("is-on"); }, { passive: true });
  document.addEventListener("pointerleave", () => cursor.classList.remove("is-on"));
  addEventListener("pointerdown", () => cursor.classList.add("is-down"));
  addEventListener("pointerup", () => cursor.classList.remove("is-down"));
  const loop = () => {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.addEventListener("pointerover", (e) => {
    cursor.classList.toggle("is-hover", !!e.target.closest("a, button, [data-hover], .palette-item"));
  });

  document.addEventListener("pointermove", (e) => {
    $$("[data-magnetic]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const near = Math.abs(dx) < r.width / 2 + 30 && Math.abs(dy) < r.height / 2 + 30;
      el.style.transform = near ? `translate(${dx * 0.18}px, ${dy * 0.25}px)` : "";
    });
  }, { passive: true });

  const track = (sel, tilt) => {
    $$(sel).forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
        if (tilt) {
          card.style.setProperty("--rx", `${(0.5 - y) * 5}deg`);
          card.style.setProperty("--ry", `${(x - 0.5) * 7}deg`);
        }
      });
      card.addEventListener("pointerleave", () => { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); });
    });
  };
  track(".app-card", true);
  track("[data-spotlight]", false);
}

/* ── Aurora (WebGL) ── */
{
  const canvas = $(".aurora");
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
  if (gl) {
    const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
    const fs = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.3,.7);a*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/r;
 vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
 p+=(m-.5)*vec2(.25,-.25);
 float T=t*.045;
 vec2 q=vec2(fbm(p*1.3+vec2(0.,T)),fbm(p*1.3+vec2(5.2,-T)));
 vec2 w=vec2(fbm(p*1.5+2.2*q+vec2(1.7,9.2)+T*1.4),fbm(p*1.5+2.2*q+vec2(8.3,2.8)-T));
 float f=fbm(p*1.1+2.6*w);
 vec3 col=vec3(.027,.027,.04);
 col=mix(col,vec3(.36,.24,.95),smoothstep(.35,.95,f)*.85);
 col=mix(col,vec3(.05,.70,.95),smoothstep(.5,1.,w.x)*.55);
 col=mix(col,vec3(1.,.42,.32),smoothstep(.62,1.,q.y)*.28);
 col+=.06*vec3(.6,.5,1.)*pow(f,3.);
 float v=smoothstep(1.25,.15,length(p*vec2(.8,1.1)));
 col*=v;
 col*=mix(.25,1.,smoothstep(0.,.75,uv.y));
 gl_FragColor=vec4(col,1.);
}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const uR = gl.getUniformLocation(prog, "r"), uT = gl.getUniformLocation(prog, "t"), uM = gl.getUniformLocation(prog, "m");
      const scale = 0.5; // render at half res; the blur is part of the look
      const resize = () => {
        canvas.width = Math.max(1, (canvas.clientWidth * scale) | 0);
        canvas.height = Math.max(1, (canvas.clientHeight * scale) | 0);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uR, canvas.width, canvas.height);
      };
      resize();
      addEventListener("resize", resize);
      let tx = 0.5, ty = 0.5, cx = 0.5, cy = 0.5, visible = true;
      addEventListener("pointermove", (e) => { tx = e.clientX / innerWidth; ty = e.clientY / innerHeight; }, { passive: true });
      new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
      const t0 = performance.now();
      const frame = (now) => {
        if (visible) {
          cx += (tx - cx) * 0.03; cy += (ty - cy) * 0.03;
          gl.uniform1f(uT, reduced ? 20 : (now - t0) / 1000 + 20);
          gl.uniform2f(uM, cx, cy);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
        if (!reduced) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }
  }
}

/* ── App detail sheet ── */
const sheet = $("[data-sheet]");
const openApp = (id) => {
  const a = apps.find((x) => x.id === id);
  if (!a) return;
  const body = $("[data-sheet-body]");
  body.setAttribute("style", accentStyle(a));
  const cta = a.url && a.status !== "soon"
    ? `<a class="btn btn-primary" href="${esc(a.url)}" target="_blank" rel="noopener"><span>Open ${esc(a.name)}</span><i class="arrow">↗</i></a>`
    : `<span class="status" data-s="soon">Coming soon</span>`;
  body.innerHTML = `
    <div class="sheet-hero"><div class="stage-grid"></div><div class="app-icon">${esc(a.glyph)}</div>
      <button class="sheet-close" data-sheet-close aria-label="Close">✕</button></div>
    <div class="sheet-body">
      <div class="app-top"><span class="app-index">${a.platforms.map(esc).join(" · ")} · ${esc(a.year)}</span><span class="status" data-s="${esc(a.status)}">${statusLabel[a.status]}</span></div>
      <h2 id="sheet-title">${esc(a.name)}</h2>
      <p class="app-tag">${esc(a.tagline)}</p>
      <p>${esc(a.description)}</p>
      <ul class="features">${a.features.map((f, i) => `<li><span>${pad(i + 1)}</span>${esc(f)}</li>`).join("")}</ul>
      <div class="sheet-actions">${cta}</div>
    </div>`;
  sheet.showModal();
  history.replaceState(null, "", `#${a.id}`);
};
const closeSheet = () => { sheet.close(); };
sheet.addEventListener("close", () => { if (apps.some((a) => `#${a.id}` === location.hash)) history.replaceState(null, "", location.pathname); });
sheet.addEventListener("click", (e) => { if (e.target === sheet || e.target.closest("[data-sheet-close]")) closeSheet(); });
$$("[data-app]").forEach((c) => c.addEventListener("click", () => openApp(c.dataset.app)));
if (location.hash && apps.some((a) => `#${a.id}` === location.hash)) setTimeout(() => openApp(location.hash.slice(1)), 1400);

/* ── Copy email ── */
const toast = (msg) => {
  const t = $("[data-toast]");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.id);
  toast.id = setTimeout(() => t.classList.remove("show"), 2200);
};
const copyEmail = async () => {
  try { await navigator.clipboard.writeText(site.email); toast("Email copied — talk soon ✦"); $("[data-email-hint]").textContent = "Copied!"; }
  catch { location.href = `mailto:${site.email}`; }
};
$("[data-copy-email]").addEventListener("click", copyEmail);

/* ── Command palette ── */
{
  const pal = $("[data-palette]");
  const input = $("[data-palette-input]");
  const list = $("[data-palette-list]");
  const go = (hash) => () => document.querySelector(hash)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  const items = [
    ...apps.map((a) => ({ group: "Apps", label: a.name, sub: a.tagline, app: a, run: () => openApp(a.id) })),
    { group: "Navigate", label: "The collection", sub: "Apps", icon: "01", run: go("#apps") },
    { group: "Navigate", label: "About the maker", sub: "About", icon: "02", run: go("#about") },
    { group: "Navigate", label: "Get in touch", sub: "Contact", icon: "03", run: go("#contact") },
    { group: "Actions", label: "Copy email address", sub: site.email, icon: "@", run: copyEmail },
    { group: "Actions", label: "Send an email", sub: "mailto", icon: "✉", run: () => (location.href = `mailto:${site.email}`) },
    ...site.socials.map((s) => ({ group: "Actions", label: `Open ${s.label}`, sub: "↗", icon: "↗", run: () => open(s.href, "_blank", "noopener") })),
    { group: "Actions", label: "Back to top", sub: "", icon: "↑", run: go("#top") },
  ];
  let shown = [], sel = 0;
  const render = () => {
    const q = input.value.trim().toLowerCase();
    shown = items.filter((i) => !q || `${i.label} ${i.sub} ${i.group}`.toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    if (!shown.length) { list.innerHTML = `<li class="palette-empty">Nothing yet — but maybe I should build that.</li>`; return; }
    let g = "";
    list.innerHTML = shown.map((i, n) => {
      const head = i.group !== g ? `<li class="palette-group" role="presentation">${(g = i.group)}</li>` : "";
      const ico = i.app ? `<span class="pi-ico app" style="${accentStyle(i.app)}">${esc(i.app.glyph)}</span>` : `<span class="pi-ico">${esc(i.icon)}</span>`;
      return `${head}<li class="palette-item" role="option" data-i="${n}" aria-selected="${n === sel}">${ico}<span>${esc(i.label)}</span><span class="pi-sub">${esc(i.sub)}</span></li>`;
    }).join("");
  };
  const run = (i) => { const it = shown[i]; if (!it) return; pal.close(); setTimeout(it.run, 60); };
  const openPal = () => { if (sheet.open) sheet.close(); input.value = ""; sel = 0; render(); pal.showModal(); input.focus(); };
  input.addEventListener("input", () => { sel = 0; render(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % shown.length; render(); }
    if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % shown.length; render(); }
    if (e.key === "Enter") { e.preventDefault(); run(sel); }
  });
  list.addEventListener("click", (e) => { const li = e.target.closest(".palette-item"); if (li) run(+li.dataset.i); });
  list.addEventListener("pointermove", (e) => {
    const li = e.target.closest(".palette-item");
    if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; $$(".palette-item", list).forEach((x) => x.setAttribute("aria-selected", x === li)); }
  });
  pal.addEventListener("click", (e) => { if (e.target === pal) pal.close(); });
  $$("[data-palette-open]").forEach((b) => b.addEventListener("click", openPal));
  addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName);
    if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
      e.preventDefault();
      pal.open ? pal.close() : openPal();
    }
  });
}

/* ── Console hello ── */
console.log(`%c${site.brand}%c  Made by ${site.owner}. Curious? Say hi → ${site.email}`, "font:italic 28px Georgia;color:#8b6cff", "color:#8d8c95");
