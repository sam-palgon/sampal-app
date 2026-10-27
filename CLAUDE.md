# sampal.app

Sam's personal landing page for every app Sam builds. Static site, no build step, hosted as a Cloudflare Worker with static assets (connected to this repo; config in `wrangler.toml`).

- All content lives in `public/apps.js` (site info, apps, upcoming teasers). Adding an app = adding an entry there; the surf timeline, buoy and postcard are generated from it.
- The maker is **Sam** — never use any other name in site copy.
- Theme: Miami beach day (morning hero → surf timeline → shore/about → low tide sand writing → tiki bar menu + tip jar → boardwalk arcade → sunset contact), plus beach secrets (easter eggs) in `main.js`, all listed with "Try it" buttons in the floating Beach secrets panel. Tip jar items in `apps.js` take Stripe Payment Link URLs; null shows "Soon". Each app's postcard keeps that app's own branding via its `brand` fields; the site itself must not restyle apps.

## Releasing

Deploys run locally from Sam's machine with Wrangler (already logged in via `npx wrangler login`).

1. Preview locally: `npm run dev` (http://localhost:4321) and check the change.
2. Commit and push to `main` so GitHub stays the source of truth.
3. Deploy: `npm run deploy` (runs `npx wrangler deploy`, uploading `public/` to the `sampal-app` Worker, which serves sampal.app).
4. Confirm the Wrangler output says it deployed, then open https://sampal.app.

Only deploy when Sam asks to ship.
