# sampal.app

The home page for every app Sam makes. Static site — no build step — hosted on Cloudflare Pages.

## Add a new app

Edit `public/apps.js` and add an object to `apps`:

```js
{
  id: "my-app",            // used for the #my-app deep link
  name: "My App",
  tagline: "One line that sells it.",
  description: "A short paragraph.",
  features: ["…", "…", "…"],
  status: "live",          // "live" | "beta" | "soon"
  year: 2026,
  platforms: ["Web"],
  url: "https://myapp.sampal.app",
  accent: ["#FF6A3D", "#FFC24B"],  // two gradient colours for its card
  glyph: "MA",             // 1–2 letters for its icon
}
```

Commit and push — Cloudflare redeploys automatically. Delete its teaser from `upcoming` if it was there.

## Run locally

```sh
npm run dev   # http://localhost:4321
```

## Deploy (Cloudflare Pages)

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick this repo.
2. Framework preset: **None**. Build command: *(empty)*. Output directory: **`public`**.
3. After the first deploy: project → **Custom domains** → add `sampal.app` (and `www.sampal.app`).
   If `sampal.app` is currently attached to the Window Valet project, remove it there first
   and give Window Valet a subdomain such as `windowvalet.sampal.app`.

Manual deploy without Git: `npm run deploy`.
