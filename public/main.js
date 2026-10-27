import { site, apps, upcoming, tiki, tips } from "./apps.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const initials = (name) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const brandVars = (b) => `--bg:${b.bg};--fg:${b.fg}${b.font ? `;--app-font:'${b.font}'` : ""}`;
const host = (url) => { try { return new URL(url).host; } catch { return url; } };

/* ── Copy from config ── */
$$("[data-brand]").forEach((el) => (el.textContent = site.brand));
$$("[data-owner]").forEach((el) => (el.textContent = site.owner));
$$("[data-city]").forEach((el) => (el.textContent = site.city));
$$("[data-region]").forEach((el) => (el.textContent = site.region));
$$("[data-email]").forEach((el) => (el.textContent = site.email));
$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
$("[data-photo]").innerHTML = site.photo ? `<img src="${esc(site.photo)}" alt="" />` : esc(site.owner[0]);
$("[data-socials]").innerHTML = site.socials.map((s) => `<a href="${esc(s.href)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`).join("");

/* ── App brand fonts (only the ones an app asks for) ── */
const fonts = [...new Set(apps.map((a) => a.brand.font).filter(Boolean))];
if (fonts.length) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${fonts.map((f) => `family=${encodeURIComponent(f)}:wght@400;700`).join("&")}&display=swap`;
  document.head.append(link);
}

/* ── Floating title letters ── */
{
  const t = $("[data-title]");
  t.innerHTML = [...site.brand].map((ch, i) => `<span class="l" style="--i:${i}" data-ch="${esc(ch)}" aria-hidden="true"><span class="f">${esc(ch)}</span></span>`).join("");
}

/* ── Palm fronds, drawn procedurally ── */
{
  const frond = (len, angle, color) => {
    const a = (angle * Math.PI) / 180;
    const T = [Math.cos(a) * len, Math.sin(a) * len];
    const C = [T[0] * 0.5, T[1] * 0.5 - len * 0.32]; // arch up, then droop
    const at = (t) => [2 * (1 - t) * t * C[0] + t * t * T[0], 2 * (1 - t) * t * C[1] + t * t * T[1]];
    const tan = (t) => { const dx = 2 * (1 - t) * C[0] + 2 * t * (T[0] - C[0]); const dy = 2 * (1 - t) * C[1] + 2 * t * (T[1] - C[1]); const m = Math.hypot(dx, dy) || 1; return [dx / m, dy / m]; };
    let leaves = "";
    for (let t = 0.1; t <= 0.98; t += 0.035) {
      const [bx, by] = at(t);
      const [ux, uy] = tan(t);
      for (const side of [-1, 1]) {
        const nx = -uy * side, ny = ux * side;
        let dx = nx * 0.75 + ux * 0.55, dy = ny * 0.75 + uy * 0.55 + 0.55; // leaflets sweep forward and droop
        const m = Math.hypot(dx, dy); dx /= m; dy /= m;
        const l = len * (0.08 + 0.26 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.8));
        const tx = bx + dx * l, ty = by + dy * l;
        const mx = (bx + tx) / 2, my = (by + ty) / 2, w = l * 0.09;
        leaves += `M${bx.toFixed(1)} ${by.toFixed(1)}Q${(mx - dy * w).toFixed(1)} ${(my + dx * w).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}Q${(mx + dy * w).toFixed(1)} ${(my - dx * w).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}Z`;
      }
    }
    return `<g class="frond" style="--dur:${(5 + Math.random() * 3).toFixed(1)}s;--delay:${(-Math.random() * 5).toFixed(1)}s"><path d="M0 0Q${C[0]} ${C[1]} ${T[0]} ${T[1]}" stroke="${color}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="${leaves}" fill="${color}"/></g>`;
  };
  const greens = ["#1d6b4a", "#24855a", "#2f9e6e", "#1a5e44", "#2a9163"];
  const spec = [[420, 95], [470, 62], [520, 32], [430, 8], [360, 128], [300, -14]];
  const svg = `<svg viewBox="-40 -60 600 600"><g>${spec.map(([l, a], i) => frond(l, a, greens[i % greens.length])).join("")}</g><circle cx="6" cy="4" r="16" fill="#7a4a24"/><circle cx="24" cy="12" r="13" fill="#8a5a2e"/></svg>`;
  $$("[data-palm]").forEach((el) => (el.innerHTML = svg));
}

/* ── Timeline stops: postcards for apps, bottles for what's next ── */
{
  const statusLabel = { live: "Live", beta: "Beta" };
  const postcard = (a) => {
    const b = a.brand;
    let front;
    if (b.screenshot) front = `<img class="shot" src="${esc(b.screenshot)}" alt="${esc(a.name)} screenshot" loading="lazy" />`;
    else if (b.wordmark) front = `<span class="pc-greet">Greetings from</span><img class="pc-word" src="${esc(b.wordmark)}" alt="${esc(a.name)}" />`;
    else if (b.logo) front = `<span class="pc-greet">Greetings from</span><img class="pc-logo" src="${esc(b.logo)}" alt="" />`;
    else front = `<span class="pc-greet">Greetings from</span><span class="pc-name">${esc(a.name)}</span>`;
    const stamp = b.logo ? `<img src="${esc(b.logo)}" alt="" />` : `<span>${esc(initials(a.name))}</span>`;
    return `
      <article class="postcard" style="${brandVars(b)}" aria-label="${esc(a.name)}">
        <div class="pc-front">${front}</div>
        <div class="pc-back">
          <div class="stamp" aria-hidden="true">${stamp}</div>
          <div class="postmark" aria-hidden="true">${esc(site.city.toUpperCase())} ${esc(site.region)}<br/>${esc(String(a.launched).toUpperCase())}<br/>${esc(statusLabel[a.status] ?? "")}</div>
          <p class="pc-note"><b>${esc(a.name)}</b> — ${esc(a.tagline)}<br/>${esc(a.note)}<span class="sig">— ${esc(site.owner)}</span></p>
          <div class="pc-to"><span>To: ${esc(host(a.url))}</span><a class="pc-cta" href="${esc(a.url)}" target="_blank" rel="noopener">Visit ↗</a></div>
        </div>
      </article>`;
  };
  const bottleSvg = `<svg viewBox="0 0 200 90" aria-hidden="true">
    <path d="M24 20 H128 Q146 20 156 32 H176 V58 H156 Q146 70 128 70 H24 Q10 70 10 56 V34 Q10 20 24 20 Z" fill="rgba(170,240,215,.45)" stroke="#0e3b4a" stroke-width="3"/>
    <rect x="40" y="34" width="84" height="22" rx="11" fill="#fdf1d8" stroke="#0e3b4a" stroke-width="1.5"/>
    <path d="M82 34 V56" stroke="#ff6f59" stroke-width="3"/>
    <rect x="176" y="34" width="14" height="22" rx="3" fill="#c98b4b" stroke="#0e3b4a" stroke-width="2"/>
    <path d="M26 28 H110" stroke="#fff" stroke-opacity=".8" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
  const bottle = (u) => `
      <div class="bottle">${bottleSvg}
        <div class="note"><b>${esc(u.codename)}</b><p>${esc(u.hint)}</p><small>Washing ashore soon</small></div>
      </div>`;

  const stops = [
    ...apps.map((a) => ({ label: a.launched, html: postcard(a) })),
    ...upcoming.map((u) => ({ label: "Soon", html: bottle(u) })),
  ];
  $("[data-stops]").innerHTML = stops
    .map((s, i) => `
    <li class="stop" data-side="${i % 2 ? "left" : "right"}">
      <div class="buoy"><i></i><b>${esc(s.label)}</b></div>
      <div class="card-wrap">${s.html}</div>
    </li>`)
    .join("");
}

/* ── The ride: surfboard follows the route as you scroll ── */
{
  const route = $("[data-route]");
  const svg = $("[data-route-svg]");
  const line = $("[data-route-line]");
  const wake = $("[data-route-wake]");
  const surfer = $("[data-surfer]");
  const stops = $$(".stop", route);
  let L = 0, samples = [], buoyY = [], cur = 0, target = 0, raf = 0;

  const build = () => {
    const r = route.getBoundingClientRect();
    const w = r.width, h = r.height;
    const pts = stops.map((s) => {
      const b = $(".buoy i", s).getBoundingClientRect();
      return [b.left + b.width / 2 - r.left, b.top + b.height / 2 - r.top];
    });
    buoyY = pts.map((p) => p[1]);
    const x0 = pts[0] ? (innerWidth < 860 ? pts[0][0] : w / 2) : w / 2;
    const all = [[x0, 0], ...pts, [innerWidth < 860 ? x0 : w / 2, h]];
    let d = `M${all[0][0]} ${all[0][1]}`;
    for (let i = 1; i < all.length; i++) {
      const [px, py] = all[i - 1], [x, y] = all[i], dy = y - py;
      d += ` C${px} ${py + dy * 0.55} ${x} ${y - dy * 0.55} ${x} ${y}`;
    }
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    line.setAttribute("d", d);
    wake.setAttribute("d", d);
    L = wake.getTotalLength();
    wake.style.strokeDasharray = `${L} ${L}`;
    samples = [];
    for (let l = 0; l <= L; l += 6) { const p = wake.getPointAtLength(l); samples.push([l, p.x, p.y]); }
    update(true);
  };

  // Length along the path where the path reaches a given y (path only ever moves down).
  const lengthAtY = (y) => {
    let lo = 0, hi = samples.length - 1;
    if (!samples.length || y <= samples[0][2]) return 0;
    if (y >= samples[hi][2]) return L;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; samples[mid][2] < y ? (lo = mid) : (hi = mid); }
    return samples[lo][0];
  };

  const place = (len) => {
    const p = wake.getPointAtLength(len);
    const q = wake.getPointAtLength(Math.min(L, len + 3));
    const o = wake.getPointAtLength(Math.max(0, len - 3));
    const ang = (Math.atan2(q.y - o.y, q.x - o.x) * 180) / Math.PI;
    surfer.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${ang}deg)`;
    wake.style.strokeDashoffset = L - len;
    stops.forEach((s, i) => s.classList.toggle("reached", p.y >= buoyY[i] - 40));
  };

  const tick = () => {
    cur += (target - cur) * 0.14;
    if (Math.abs(target - cur) < 0.5) cur = target;
    place(cur);
    raf = cur !== target ? requestAnimationFrame(tick) : 0;
  };
  const update = (instant) => {
    const r = route.getBoundingClientRect();
    target = lengthAtY(innerHeight * 0.55 - r.top);
    if (instant || reduced) { cur = target; place(cur); return; }
    if (!raf) raf = requestAnimationFrame(tick);
  };

  addEventListener("scroll", () => update(), { passive: true });
  addEventListener("resize", build);
  document.fonts?.ready.then(build);
  addEventListener("load", build);
  build();
}

/* ── Sun rises out of the way as you scroll ── */
{
  const sun = $("[data-sun]");
  addEventListener("scroll", () => {
    if (scrollY < innerHeight * 1.2) sun.style.transform = `translateY(${scrollY * 0.45}px)`;
  }, { passive: true });
}

/* ── Local time + weather ── */
{
  const el = $("[data-clock]");
  const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: site.timezone });
  const tick = () => (el.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 15000);

  const words = (c) => (c === 0 ? "clear skies" : c <= 2 ? "mostly sunny" : c === 3 ? "cloudy" : c <= 48 ? "hazy" : c <= 67 ? "rainy" : c <= 82 ? "showers" : "stormy");
  const { lat, lon } = site.coords;
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`)
    .then((r) => r.json())
    .then((d) => { $("[data-weather]").textContent = `${Math.round(d.current.temperature_2m)}°F, ${words(d.current.weather_code)}`; })
    .catch(() => {});
}

/* ── Toast (shared) ── */
const say = (() => {
  const el = $("[data-toast]");
  let t;
  return (msg, ms = 2200) => {
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(t);
    t = setTimeout(() => el.classList.remove("show"), ms);
  };
})();

const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
};

/* ── Low tide: draw in the wet sand, a wave washes it away ── */
{
  const wet = $("[data-wet]");
  const canvas = $("[data-sand]");
  const wash = $("[data-wash]");
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, last = null, washing = false, idle;

  const size = () => {
    const r = wet.getBoundingClientRect();
    if (Math.round(r.width) === w && Math.round(r.height) === h) return;
    const copy = w && h ? (() => { const c = document.createElement("canvas"); c.width = canvas.width; c.height = canvas.height; c.getContext("2d").drawImage(canvas, 0, 0); return c; })() : null;
    w = Math.round(r.width); h = Math.round(r.height);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (copy) ctx.drawImage(copy, 0, 0, w, h);
  };

  // A groove: dark trench, with the lower lip catching the light.
  const groove = (draw) => {
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.save(); ctx.translate(2, 3); ctx.strokeStyle = ctx.fillStyle = "rgba(255, 238, 205, .55)"; ctx.lineWidth = 4; draw(); ctx.restore();
    ctx.strokeStyle = ctx.fillStyle = "rgba(105, 68, 30, .5)"; ctx.lineWidth = 9; draw();
    ctx.strokeStyle = ctx.fillStyle = "rgba(80, 50, 20, .35)"; ctx.lineWidth = 4; draw();
  };
  const seg = (a, b) => groove(() => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); });
  const scribble = () => {
    const px = Math.min(h * 0.36, w / 6.5);
    ctx.font = `700 ${px}px Caveat, cursive`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    groove(() => ctx.fillText(`${site.owner} was here`, w / 2, h / 2));
  };
  const leaveShell = () => {
    const shells = ["🐚", "⭐", "🦀"];
    ctx.font = `${Math.round(h * 0.12)}px serif`;
    ctx.fillText(shells[Math.floor(Math.random() * shells.length)], w * (0.15 + Math.random() * 0.7), h * (0.3 + Math.random() * 0.45));
  };

  const wave = () => {
    if (washing) return;
    washing = true;
    const dur = reduced ? 400 : 2600, t0 = performance.now();
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    const frame = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const f = t < 0.45 ? ease(t / 0.45) : 1 - ease((t - 0.45) / 0.55);
      wash.style.transform = `translateY(${(f - 1.02) * 100}%)`;
      if (t < 0.55) { // erase whatever the water covers
        ctx.save(); ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = "rgba(0,0,0,.22)";
        ctx.fillRect(0, 0, w, f * h + 20); ctx.restore();
      }
      if (t < 1) return requestAnimationFrame(frame);
      ctx.clearRect(0, 0, w, h);
      leaveShell();
      washing = false;
    };
    requestAnimationFrame(frame);
  };
  const scheduleIdle = () => { clearTimeout(idle); idle = setTimeout(wave, 9000); };

  const pos = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  canvas.addEventListener("pointerdown", (e) => { canvas.setPointerCapture(e.pointerId); last = pos(e); seg(last, last); clearTimeout(idle); });
  canvas.addEventListener("pointermove", (e) => { if (!last) return; const p = pos(e); seg(last, p); last = p; });
  const up = () => { if (last) scheduleIdle(); last = null; };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  $("[data-wave]").addEventListener("click", wave);

  size();
  addEventListener("resize", size);
  (document.fonts?.load(`700 40px Caveat`) ?? Promise.resolve()).then(scribble, scribble);
}

/* ── Tiki bar chalkboard ── */
{
  const fill = (v) => String(v).replace("{apps}", apps.length).replace("{bottles}", upcoming.length);
  $("[data-specials]").innerHTML = tiki.specials.map((s) => `<div><dt>${esc(s.label)}</dt><span class="dots" aria-hidden="true"></span><dd>${esc(fill(s.value))}</dd></div>`).join("");
  $("[data-toolkit]").innerHTML = tiki.toolkit.map((t) => `<li><b>${esc(t.drink)}</b><span class="dots" aria-hidden="true"></span><small>${esc(t.note)}</small></li>`).join("");
}

/* ── Tip jar ── */
{
  const icons = {
    parking: `<rect x="29" y="34" width="6" height="26" fill="#8a5a2e" stroke="#0e3b4a" stroke-width="2"/><rect x="16" y="4" width="32" height="32" rx="10" fill="#9fdaf5" stroke="#0e3b4a" stroke-width="3"/><text x="32" y="28" text-anchor="middle" font-family="Bowlby One, sans-serif" font-size="20" fill="#0e3b4a">P</text>`,
    sunscreen: `<rect x="22" y="4" width="20" height="10" rx="3" fill="#0e3b4a"/><path d="M18 14 H46 L50 56 Q50 60 46 60 H18 Q14 60 14 56 Z" fill="#ff8a4d" stroke="#0e3b4a" stroke-width="3"/><circle cx="32" cy="34" r="8" fill="#ffc93c" stroke="#0e3b4a" stroke-width="2"/><text x="32" y="54" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="700" font-size="8" fill="#0e3b4a">SPF 50</text>`,
    coconut: `<path d="M38 2 L30 24" stroke="#ff6f91" stroke-width="3" stroke-linecap="round"/><path d="M40 6 Q50 2 58 10 L40 14 Z" fill="#ffc93c" stroke="#0e3b4a" stroke-width="2"/><circle cx="30" cy="40" r="20" fill="#8a5a2e" stroke="#0e3b4a" stroke-width="3"/><ellipse cx="30" cy="25" rx="13" ry="5" fill="#fff8ec" stroke="#0e3b4a" stroke-width="2"/>`,
    umbrella: `<path d="M32 30 V60" stroke="#0e3b4a" stroke-width="3" stroke-linecap="round"/><path d="M4 30 Q32 -6 60 30 Z" fill="#ff6f59" stroke="#0e3b4a" stroke-width="3" stroke-linejoin="round"/><path d="M22 30 Q32 -6 42 30 Z" fill="#fff8ec" stroke="#0e3b4a" stroke-width="2" stroke-linejoin="round"/>`,
  };
  $("[data-tips]").innerHTML = tips.map((t) => `
    <li class="tag">
      <svg viewBox="0 0 64 64" aria-hidden="true">${icons[t.icon] ?? ""}</svg>
      <b>${esc(t.name)}</b>
      <small>${esc(t.blurb)}</small>
      <span class="price">${esc(t.price)}</span>
      ${t.url ? `<a href="${esc(t.url)}" target="_blank" rel="noopener">Tip ${esc(t.price)}</a>` : `<span class="soon">Soon</span>`}
    </li>`).join("");
}

/* ── Boardwalk arcade: keep the beach ball up ── */
{
  const canvas = $("[data-game]");
  const ctx = canvas.getContext("2d");
  const scoreEl = $("[data-score]"), bestEl = $("[data-best]"), msg = $("[data-game-msg]");
  const KEY = "sampal.best";
  let best = Number(store.get(KEY)) || 0;
  let w = 0, h = 0, ground = 0, state = "ready", score = 0, raf = 0, prev = 0;
  const ball = { x: 0, y: 0, vx: 0, vy: 0, r: 24, spin: 0, squish: 0 };
  let pops = [];
  bestEl.textContent = best;

  const size = () => {
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height; ground = h * 0.7; // where the screen's sand starts
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ball.r = Math.max(20, w * 0.065);
    if (state !== "playing") reset();
    draw();
  };
  const reset = () => { Object.assign(ball, { x: w / 2, y: ground - ball.r, vx: 0, vy: 0, spin: 0, squish: 0 }); };

  const drawBall = () => {
    const { x, y, r, spin, squish } = ball;
    ctx.save();
    ctx.fillStyle = "rgba(14, 59, 74, .18)"; // shadow on the sand
    const s = Math.max(0.3, 1 - (ground - y) / h);
    ctx.beginPath(); ctx.ellipse(x, ground + 4, r * s, r * 0.25 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.translate(x, y + squish * r * 0.3); ctx.scale(1 + squish * 0.3, 1 - squish * 0.3); ctx.rotate(spin);
    const cols = ["#ff6f59", "#fff8ec", "#22b5c2", "#fff8ec", "#ffc93c", "#fff8ec"];
    cols.forEach((c, i) => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, (i * Math.PI) / 3, ((i + 1) * Math.PI) / 3); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); });
    ctx.beginPath(); ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2); ctx.fillStyle = "#fff8ec"; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = "#0e3b4a"; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  };
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    drawBall();
    ctx.textAlign = "center"; ctx.font = `700 ${Math.round(h * 0.07)}px Caveat, cursive`;
    pops.forEach((p) => { ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = "#0e3b4a"; ctx.fillText(p.text, p.x, p.y); });
    ctx.globalAlpha = 1;
  };

  const shout = { 10: "Gnarly!", 25: "Tubular!", 50: "Beach legend!" };
  const step = (now) => {
    const dt = Math.min(0.033, (now - prev) / 1000); prev = now;
    const g = h * (2.4 + Math.min(score, 40) * 0.035);
    if (state === "playing") {
      ball.vy += g * dt;
      ball.x += ball.vx * dt; ball.y += ball.vy * dt;
      ball.spin += ball.vx * dt * 0.02;
      if (ball.x < ball.r) { ball.x = ball.r; ball.vx = Math.abs(ball.vx) * 0.8; }
      if (ball.x > w - ball.r) { ball.x = w - ball.r; ball.vx = -Math.abs(ball.vx) * 0.8; }
      if (ball.y < ball.r) { ball.y = ball.r; ball.vy = Math.abs(ball.vy) * 0.5; }
      if (ball.y > ground - ball.r) { ball.y = ground - ball.r; over(); }
    }
    ball.squish *= 0.85;
    pops = pops.filter((p) => (p.life -= dt * 1.4) > 0).map((p) => ({ ...p, y: p.y - dt * 50 }));
    draw();
    raf = state === "playing" || pops.length || ball.squish > 0.01 ? requestAnimationFrame(step) : 0;
  };
  const run = () => { if (!raf) { prev = performance.now(); raf = requestAnimationFrame(step); } };

  const over = () => {
    state = "over";
    ball.squish = 1;
    if (score > best) { best = score; store.set(KEY, best); bestEl.textContent = best; }
    msg.textContent = score > 0 && score === best ? `New best: ${score}! Tap to go again` : `Splat! ${score}. Tap to go again`;
    msg.hidden = false;
  };

  canvas.addEventListener("pointerdown", (e) => {
    const r = canvas.getBoundingClientRect();
    const px = e.clientX - r.left, py = e.clientY - r.top;
    if (state === "over") { state = "ready"; score = 0; scoreEl.textContent = 0; reset(); msg.textContent = "Tap the ball to start"; draw(); return; }
    if (Math.hypot(px - ball.x, py - ball.y) > ball.r * 1.7) return;
    if (state === "ready") { state = "playing"; msg.hidden = true; }
    ball.vy = -h * 1.55;
    ball.vx = ((ball.x - px) / ball.r) * w * 0.9 + (Math.random() - 0.5) * w * 0.3;
    score++;
    scoreEl.textContent = score;
    pops.push({ x: ball.x, y: ball.y - ball.r, text: shout[score] ?? "+1", life: 1 });
    run();
  });

  addEventListener("resize", size);
  document.fonts?.ready.then(size);
  size();
}

/* ── Hidden stuff ── */
{
  // The sun: click it for a quick sunset.
  const hero = $(".hero");
  $("[data-sun]").addEventListener("click", () => {
    if (hero.classList.contains("dusk")) return;
    hero.classList.add("dusk");
    say("Sunset speedrun 🌅");
    setTimeout(() => hero.classList.remove("dusk"), 3800);
  });

  // Title letters jump when poked.
  $("[data-title]").addEventListener("click", (e) => {
    const l = e.target.closest(".l");
    if (!l) return;
    l.classList.remove("boing"); void l.offsetWidth; l.classList.add("boing");
    l.addEventListener("animationend", () => l.classList.remove("boing"), { once: true });
  });

  // Tap the surfboard three times for a kickflip.
  {
    const surfer = $("[data-surfer]");
    let taps = 0, t;
    surfer.addEventListener("click", () => {
      clearTimeout(t); t = setTimeout(() => (taps = 0), 900);
      if (++taps < 3) return;
      taps = 0;
      surfer.classList.remove("flip"); void surfer.offsetWidth; surfer.classList.add("flip");
      say("Kickflip! 🛹");
    });
  }

  // Konami code: something is swimming under the page.
  {
    const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let i = 0;
    addEventListener("keydown", (e) => {
      i = e.key === code[i] ? i + 1 : e.key === code[0] ? 1 : 0;
      if (i < code.length) return;
      i = 0;
      if ($(".shark")) return;
      const s = document.createElement("div");
      s.className = "shark";
      s.innerHTML = `<svg viewBox="0 0 90 50" aria-hidden="true"><path d="M10 46 Q40 40 50 4 Q58 30 84 46 Z" fill="#5b7b8c" stroke="#0e3b4a" stroke-width="3" stroke-linejoin="round"/><path d="M0 46 Q20 40 45 46 T90 46" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`;
      document.body.append(s);
      s.addEventListener("animationend", () => s.remove());
      say("Duh-nuh… duh-nuh… 🦈", 3000);
    });
  }

  // Once per visit, a seagull borrows your cursor (mouse users only).
  if (!reduced && matchMedia("(pointer: fine)").matches && !sessionStorageSafe("sampal.gull")) {
    let mx = -1, my = -1;
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    setTimeout(() => {
      if (mx < 0 || document.hidden) return;
      sessionStorageSafe("sampal.gull", "1");
      const g = document.createElement("div");
      g.className = "gull";
      g.innerHTML = `<svg viewBox="0 0 70 60" aria-hidden="true"><g class="grab"><path d="M33 34 L33 54 L38 49 L42 58 L45 57 L41 48 L48 48 Z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/></g><path d="M4 18 Q18 4 30 18 Q42 4 56 14" fill="none" stroke="#0e3b4a" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="24" rx="11" ry="7" fill="#fff8ec" stroke="#0e3b4a" stroke-width="2.5"/><path d="M42 22 L50 24 L42 27 Z" fill="#ffc93c" stroke="#0e3b4a" stroke-width="1.5"/></svg>`;
      document.body.append(g);
      const x = mx - 35, y = my - 34;
      g.animate([{ transform: `translate(-90px, ${y - 140}px)` }, { transform: `translate(${x}px, ${y}px)` }], { duration: 1100, easing: "ease-out", fill: "forwards" }).finished.then(() => {
        g.classList.add("has-it");
        document.documentElement.classList.add("no-cursor");
        return g.animate([{ transform: `translate(${x}px, ${y}px)` }, { transform: `translate(${innerWidth + 90}px, ${y - 220}px)` }], { duration: 1400, easing: "ease-in", fill: "forwards" }).finished;
      }).then(() => {
        g.remove();
        document.documentElement.classList.remove("no-cursor");
        say("A seagull borrowed your cursor. It's back now 🐦", 2800);
      });
    }, 40000);
  }
  function sessionStorageSafe(k, v) {
    try { return v === undefined ? sessionStorage.getItem(k) : sessionStorage.setItem(k, v); } catch { return v === undefined ? "1" : undefined; }
  }
}

/* ── Nav ── */
{
  const nav = $(".nav");
  const on = () => nav.classList.toggle("is-scrolled", scrollY > 20);
  addEventListener("scroll", on, { passive: true });
  on();
}

/* ── Copy email ── */
{
  $("[data-copy-email]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      say("Copied! Talk soon 🌴", 2000);
      $("[data-email-hint]").textContent = "copied!";
    } catch {
      location.href = `mailto:${site.email}`;
    }
  });
}
