import { site, apps, upcoming } from "./apps.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n) => String(n).padStart(2, "0");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const initials = (name) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const brandVars = (b) => `--bg:${b.bg};--fg:${b.fg};--accent:${b.accent}${b.font ? `;--app-font:'${b.font}'` : ""}`;

/* ── Copy from config ── */
$$("[data-brand]").forEach((el) => (el.textContent = site.brand));
$$("[data-owner]").forEach((el) => (el.textContent = site.owner));
$$("[data-city]").forEach((el) => (el.textContent = site.city));
$$("[data-email]").forEach((el) => (el.textContent = site.email));
$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
$("[data-now]").textContent = site.nowBuilding;
$("[data-avatar]").innerHTML = site.photo ? `<img src="${esc(site.photo)}" alt="" />` : esc(site.owner[0]);
$("[data-socials]").innerHTML = site.socials
  .map((s) => `<a href="${esc(s.href)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`)
  .join("");

const live = apps.filter((a) => a.status !== "soon");
$("[data-count]").textContent = `${pad(live.length)} live · ${pad(upcoming.length)} cooking`;

/* ── App brand fonts (only the ones an app asks for) ── */
const fonts = [...new Set(apps.map((a) => a.brand.font).filter(Boolean))];
if (fonts.length) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${fonts.map((f) => `family=${encodeURIComponent(f)}:wght@400;600;700;800`).join("&")}&display=swap`;
  document.head.append(link);
}

/* ── Apps ── */
const statusLabel = { live: "Live", beta: "Beta", soon: "Soon" };
const appVisual = (a) => {
  const b = a.brand;
  if (b.screenshot) return `<div class="browser"><div class="browser-bar"><i></i><i></i><i></i></div><img src="${esc(b.screenshot)}" alt="${esc(a.name)} screenshot" loading="lazy" /></div>`;
  if (b.logo) return `<div class="app-hero-mark"><img src="${esc(b.logo)}" alt="" /></div>`;
  return `<div class="app-hero-mark" aria-hidden="true">${esc(initials(a.name))}</div>`;
};

$("[data-apps]").innerHTML =
  apps
    .map((a) => {
      const b = a.brand;
      const title = b.wordmark
        ? `<h3 class="app-name"><img class="app-wordmark" src="${esc(b.wordmark)}" alt="${esc(a.name)}" /></h3>`
        : `<h3 class="app-name">${esc(a.name)}</h3>`;
      return `
  <article class="app" id="${esc(a.id)}" style="${brandVars(b)}">
    <div class="app-copy">
      <div class="app-meta">
        <span class="${a.status === "live" ? "live" : ""}">${statusLabel[a.status]}</span>
        ${a.platforms.map((p) => `<span>${esc(p)}</span>`).join("")}
        <span>${esc(a.year)}</span>
      </div>
      ${b.logo && b.screenshot ? `<div class="app-logo"><img src="${esc(b.logo)}" alt="" /></div>` : ""}
      ${title}
      <p class="app-tag">${esc(a.tagline)}</p>
      <p class="app-desc">${esc(a.description)}</p>
      ${a.url && a.status !== "soon" ? `<a class="app-cta" href="${esc(a.url)}" target="_blank" rel="noopener">Open ${esc(a.name)} ↗</a>` : ""}
    </div>
    <div class="app-visual">${appVisual(a)}</div>
  </article>`;
    })
    .join("") +
  (upcoming.length
    ? `<div class="soon-row">${upcoming
        .map(
          (u, i) => `
    <div class="soon reveal" style="--d:${i * 0.1}s;--p:${u.progress ?? 0.5}">
      <div class="soon-top"><span>Cooking</span><span>${Math.round((u.progress ?? 0.5) * 100)}%</span></div>
      <h3>${esc(u.codename)}</h3>
      <p>${esc(u.hint)}</p>
      <div class="bar"><span></span></div>
    </div>`
        )
        .join("")}</div>`
    : "");

/* ── Band ── */
{
  const words = ["New apps", ...apps.map((a) => a.name), "Ideas in", "Apps out", `Made in ${site.city}`];
  const row = words.map((w) => `<span>${esc(w)} <b>✺</b></span>`).join("");
  $("[data-band]").innerHTML = row.repeat(4);
}

/* ── Clock ── */
{
  const el = $("[data-clock]");
  const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: site.timezone });
  const tick = () => (el.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 15000);
}

/* ── Nav ── */
{
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 20);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ── Reveal ── */
{
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { rootMargin: "0px 0px -8% 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));
}

/* ── Copy email ── */
{
  const toast = $("[data-toast]");
  let t;
  $("[data-copy-email]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      toast.textContent = "Copied. Talk soon!";
      toast.classList.add("show");
      $("[data-email-hint]").textContent = "copied ✓";
      clearTimeout(t);
      t = setTimeout(() => toast.classList.remove("show"), 2000);
    } catch {
      location.href = `mailto:${site.email}`;
    }
  });
}

/* ── Hero stickers: throwable, with a little physics ── */
{
  const hero = $(".hero");
  const layer = $("[data-stickers]");
  // x / y are fractions of the free space above the headline; r is resting tilt.
  const spots = [
    { x: 0.6, y: 0.1, r: -8 },
    { x: 0.04, y: 0.3, r: -6 },
    { x: 0.9, y: 0.55, r: 12 },
    { x: 0.34, y: 0.05, r: 7 },
    { x: 0.2, y: 0.85, r: 4 },
    { x: 0.5, y: 0.75, r: -3 },
    { x: 0.78, y: 0.5, r: -5 },
    { x: 0.14, y: 0.0, r: 9 },
  ];
  const defs = [
    ...apps.map((a) => {
      const b = a.brand;
      return `<a class="st-app" href="#${esc(a.id)}" draggable="false" style="${brandVars(b)}" aria-label="${esc(a.name)}">${b.logo ? `<img src="${esc(b.logo)}" alt="" draggable="false" />` : esc(initials(a.name))}</a>`;
    }),
    `<div class="st-label lime">New apps</div>`,
    `<div class="st-star">Say<br/>hi!</div>`,
    ...upcoming.slice(0, 2).map((u) => `<div class="st-soon">${esc(u.codename)}<br/>cooking</div>`),
    `<div class="st-label paper">Made in ${esc(site.city)}</div>`,
    `<div class="st-label ink">Ideas → Apps</div>`,
  ].slice(0, spots.length);

  layer.innerHTML = defs.map((d) => `<div class="sticker">${d}</div>`).join("");
  const els = $$(".sticker", layer);
  const state = els.map((el, i) => ({ el, x: 0, y: 0, vx: 0, vy: 0, r: spots[i].r, vr: 0, w: 0, h: 0, moved: false, grabbed: false, clickable: !!el.querySelector("a") }));

  // Phones get a calmer layout with fewer stickers.
  const mobileSpots = [
    { x: 0.62, y: 0.12, r: -8 },
    { x: 0.0, y: 0.0, r: -6 },
    { x: 0.04, y: 0.62, r: 12 },
    { x: 0.92, y: 0.66, r: 7 },
    null,
    { x: 0.42, y: 0.94, r: -3 },
    null,
    null,
  ];
  const spotFor = (i) => (innerWidth < 640 ? mobileSpots[i] : spots[i]);

  const bounds = () => ({ w: hero.clientWidth, h: hero.clientHeight });
  const layout = () => {
    const { w } = bounds();
    const top = 84;
    const bottom = Math.max(top + 120, $(".hero-title").getBoundingClientRect().top - hero.getBoundingClientRect().top - 12);
    state.forEach((s, i) => {
      const sp = spotFor(i);
      s.el.hidden = !sp;
      s.w = s.el.offsetWidth; s.h = s.el.offsetHeight;
      if (s.moved || !sp) return;
      s.x = sp.x * Math.max(0, w - s.w);
      s.y = top + sp.y * Math.max(0, bottom - top - s.h);
      draw(s);
    });
  };
  const draw = (s) => (s.el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) rotate(${s.r}deg)`);

  let raf = 0;
  const step = () => {
    const { w, h } = bounds();
    let moving = false;
    for (const s of state) {
      if (s.grabbed) { moving = true; continue; }
      if (Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(s.vr) < 0.05) continue;
      moving = true;
      s.x += s.vx; s.y += s.vy; s.r += s.vr;
      s.vx *= 0.95; s.vy *= 0.95; s.vr *= 0.92;
      if (s.x < 0) { s.x = 0; s.vx = -s.vx * 0.6; }
      if (s.x > w - s.w) { s.x = w - s.w; s.vx = -s.vx * 0.6; }
      if (s.y < 64) { s.y = 64; s.vy = -s.vy * 0.6; }
      if (s.y > h - s.h) { s.y = h - s.h; s.vy = -s.vy * 0.6; }
      draw(s);
    }
    raf = moving ? requestAnimationFrame(step) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(step); };

  let z = 10;
  state.forEach((s) => {
    let ox = 0, oy = 0, lx = 0, ly = 0, lt = 0, dist = 0;
    s.el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      s.el.setPointerCapture(e.pointerId);
      s.grabbed = true; s.moved = true; dist = 0;
      s.el.classList.add("is-grabbed");
      s.el.style.zIndex = ++z;
      const hr = hero.getBoundingClientRect();
      ox = e.clientX - hr.left - s.x; oy = e.clientY - hr.top - s.y;
      lx = e.clientX; ly = e.clientY; lt = performance.now();
      s.vx = s.vy = s.vr = 0;
      kick();
    });
    s.el.addEventListener("pointermove", (e) => {
      if (!s.grabbed) return;
      const hr = hero.getBoundingClientRect();
      const now = performance.now();
      const dt = Math.max(1, now - lt);
      s.vx = ((e.clientX - lx) / dt) * 16; s.vy = ((e.clientY - ly) / dt) * 16;
      dist += Math.abs(e.clientX - lx) + Math.abs(e.clientY - ly);
      lx = e.clientX; ly = e.clientY; lt = now;
      s.x = e.clientX - hr.left - ox; s.y = e.clientY - hr.top - oy;
      s.r += (s.vx * 0.12 - s.r * 0.02);
      draw(s);
    });
    const release = (e) => {
      if (!s.grabbed) return;
      s.grabbed = false;
      s.el.classList.remove("is-grabbed");
      s.vr = s.vx * 0.15;
      if (performance.now() - lt > 80) s.vx = s.vy = 0; // held still before letting go
      kick();
      // A tap (not a throw) on an app sticker jumps to that app.
      if (dist < 6 && s.clickable && e.type === "pointerup") {
        const a = s.el.querySelector("a");
        document.querySelector(a.getAttribute("href"))?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      }
    };
    s.el.addEventListener("pointerup", release);
    s.el.addEventListener("pointercancel", release);
    s.el.querySelector("a")?.addEventListener("click", (e) => e.preventDefault());
  });

  addEventListener("resize", layout);
  document.fonts?.ready.then(layout);
  layout();
}

/* ── Go ── */
requestAnimationFrame(() => document.body.classList.add("is-ready"));
