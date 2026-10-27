// ─────────────────────────────────────────────────────────────
//  Everything on the site is driven from this file.
//  The site itself is black & white — each app brings its own branding.
//  To add an app: copy an object in `apps`, drop its assets in
//  /public/apps/<id>/, deploy.
// ─────────────────────────────────────────────────────────────

export const site = {
  brand: "Sampal",
  owner: "Shmuel",
  email: "hello@sampal.app", // TODO: confirm the public contact address
  city: "New York",
  timezone: "America/New_York",
  nowBuilding: "No. 02",
  socials: [{ label: "GitHub", href: "https://github.com/shmuel-usa" }],
};

// status: "live" | "beta" | "soon"
export const apps = [
  {
    id: "window-valet",
    name: "Window Valet",
    tagline: "Every window, parked perfectly.", // TODO: real tagline
    description:
      "Window Valet takes care of the busywork so you don't have to.", // TODO: real description
    status: "live",
    year: 2026,
    platforms: ["Web"],
    url: "https://windowvalet.sampal.app", // TODO: confirm live URL
    // The app's own identity. Swap these for Window Valet's real brand.
    brand: {
      bg: "#111111", // card background
      fg: "#FFFFFF", // text on the card
      accent: "#FFFFFF", // button colour
      logo: null, // e.g. "/apps/window-valet/logo.svg" (square app icon)
      wordmark: null, // e.g. "/apps/window-valet/wordmark.svg" (optional)
      font: null, // e.g. "Poppins" — any Google Font, used for the app name
      screenshot: null, // e.g. "/apps/window-valet/screen.png" (16:10 works best)
    },
  },
];

// Teasers for what's cooking. Delete entries as they ship.
export const upcoming = [
  { codename: "No. 02", hint: "For the people who run the place.", progress: 0.6 },
  { codename: "No. 03", hint: "Tiny tool. Unreasonable polish.", progress: 0.25 },
];
