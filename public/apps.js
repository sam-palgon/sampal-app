// ─────────────────────────────────────────────────────────────
//  Everything on the site is driven from this file.
//  To add an app: copy an object in `apps`, change the fields, deploy.
// ─────────────────────────────────────────────────────────────

export const site = {
  brand: "Sampal",
  owner: "Shmuel",
  role: "Independent maker",
  email: "hello@sampal.app", // TODO: confirm the public contact address
  city: "New York", // shown next to the live clock
  timezone: "America/New_York",
  socials: [
    { label: "GitHub", href: "https://github.com/shmuel-usa" },
  ],
};

// status: "live" | "beta" | "soon"
export const apps = [
  {
    id: "window-valet",
    name: "Window Valet",
    tagline: "Every window, parked perfectly.",
    description:
      "Window Valet takes care of the busywork so you don't have to. Hand it the keys and it keeps everything exactly where it belongs — quietly, instantly, every time.",
    features: [
      "Zero setup — useful the moment it opens",
      "Fast, quiet, and out of your way",
      "Designed with the same care as the work you do in it",
    ],
    status: "live",
    year: 2026,
    platforms: ["Web"],
    url: "https://windowvalet.sampal.app", // TODO: confirm the live URL
    accent: ["#8B6CFF", "#2BD4FF"],
    glyph: "WV",
  },
];

// Teasers for what's in the workshop. Delete entries as they ship.
export const upcoming = [
  { codename: "No. 02", hint: "Something for the people who run the place." },
  { codename: "No. 03", hint: "A tiny tool with an unreasonable amount of polish." },
];
