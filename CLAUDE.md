# sampal.app

Sam's personal landing page for every app Sam builds. Static site, no build step, hosted on Cloudflare Pages (connected to this repo).

- All content lives in `public/apps.js` (site info, apps, upcoming teasers). Adding an app = adding an entry there; the surf timeline, buoy and postcard are generated from it.
- The maker is **Sam** — never use any other name in site copy.
- Theme: Miami beach day (morning hero → surf timeline → shore/about → sunset contact). Each app's postcard keeps that app's own branding via its `brand` fields; the site itself must not restyle apps.

## Releasing

- Cloudflare Pages deploys `public/` automatically: `main` → production (sampal.app), any other branch → its own preview URL.
- Workflow: push changes to a branch, share the Cloudflare preview link (from the PR checks), and merge to `main` only when Sam says to ship.
- Preview locally with `npx serve public` (or `python3 -m http.server -d public`).
