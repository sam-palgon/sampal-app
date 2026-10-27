import { site, apps, upcoming } from "./apps.js";

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

/* ── Nav ── */
{
  const nav = $(".nav");
  const on = () => nav.classList.toggle("is-scrolled", scrollY > 20);
  addEventListener("scroll", on, { passive: true });
  on();
}

/* ── Copy email ── */
{
  const toast = $("[data-toast]");
  let t;
  $("[data-copy-email]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      toast.textContent = "Copied! Talk soon 🌴";
      toast.classList.add("show");
      $("[data-email-hint]").textContent = "copied!";
      clearTimeout(t);
      t = setTimeout(() => toast.classList.remove("show"), 2000);
    } catch {
      location.href = `mailto:${site.email}`;
    }
  });
}
