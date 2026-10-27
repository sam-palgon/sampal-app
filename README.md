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

## Deploy (Cloudflare Workers, from your computer)

One-time: `npx wrangler login` (opens the browser to authorize your Cloudflare account).

Then every release:

```sh
npm run deploy   # = npx wrangler deploy → uploads public/ to the sampal-app Worker (sampal.app)
```
