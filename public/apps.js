// ─────────────────────────────────────────────────────────────
//  Everything on the site is driven from this file.
//  Apps appear on the surf timeline in the order listed here,
//  and each postcard wears that app's own branding.
//  To add an app: copy an object in `apps`, drop its assets in
//  /public/apps/<id>/, deploy.
// ─────────────────────────────────────────────────────────────

export const site = {
  brand: "Sampal",
  owner: "Sam",
  email: "hello@sampal.app", // TODO: confirm the public contact address
  city: "Miami",
  region: "FL",
  timezone: "America/New_York",
  coords: { lat: 25.7617, lon: -80.1918 }, // for the live temperature
  photo: null, // e.g. "/me.jpg" — shows on the polaroid in the About section
  socials: [], // e.g. { label: "X", href: "https://x.com/…" }
};

// status: "live" | "beta"
export const apps = [
  {
    id: "window-valet",
    name: "Window Valet",
    launched: "2026", // shown on the buoy + postmark, e.g. "Mar 2026"
    tagline: "Every window, parked perfectly.", // TODO: real tagline
    note: "Built this one so nobody has to babysit the busywork again. Hand it the keys and go enjoy the beach.", // TODO: personal note, written like a postcard
    status: "live",
    url: "https://windowvalet.sampal.app", // TODO: confirm live URL
    // The app's own identity. Swap these for Window Valet's real brand.
    brand: {
      bg: "#111111", // picture-side background
      fg: "#FFFFFF", // text on the picture side
      logo: null, // e.g. "/apps/window-valet/logo.svg" (square app icon — also used as the stamp)
      wordmark: null, // e.g. "/apps/window-valet/wordmark.svg"
      font: null, // e.g. "Poppins" — any Google Font, used for the app name
      screenshot: null, // e.g. "/apps/window-valet/screen.png" (16:10 works best)
    },
  },
];

// Messages in bottles — what's coming next. Delete entries as they ship.
export const upcoming = [
  { codename: "No. 02", hint: "For the people who run the place." },
  { codename: "No. 03", hint: "Tiny tool. Unreasonable polish." },
];
