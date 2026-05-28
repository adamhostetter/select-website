# Select — Intake Status

Status: **first build complete.** Site is reviewable in the browser.

Run `cd "Select" && node scripts/dev-server.js` to preview locally, or open `Select/index.html` directly.

---

## What's done

- Full Starnes scaffold copied; tokens swapped to FCM corporate palette (forest green + bright blue)
- Logo placed at `shared/img/logos/select-logo.svg` (full color) and `select-hero-white.svg` (white version for dark hero)
- Hero photo wired in at `shared/img/photos/select/west-babylon-hero.webp`
- `index.html` built (135 KB) — home page with hero, capabilities, technical-experience list, industries hex grid, "A FirstCall Company" block, careers, contact form
- 6 service pages built (~120 KB each): commercial-hvac, building-controls, commercial-refrigeration, planned-maintenance, emergency, project-support
- All hardcoded Starnes content replaced with Select / West Babylon / Long Island / 1980

## Confirmed values

| Field | Value |
|---|---|
| Display name | Select |
| Tagline | A FirstCall Company |
| Domain | selectenv.com |
| Phone | (631) 694-5287 |
| Email | dispatch@selectenv.com (contact form forwards to dispatch + Adam.Hostetter@firstcallgroup.com) |
| Address | 210 Dale Street, West Babylon, NY 11704 |
| Founding year | 1980 |
| Brand palette | FCM standard: #1A4120 forest green, #5BA3D6 accent blue |
| Services | Commercial HVAC · Building Controls · Commercial Refrigeration · Planned Maintenance · Emergency Services · Project Support |

---

## Still open (per your last message)

8. **NY environmental/HVAC licenses** — held as Todo. Need NYS Refrigeration Trade certs, EPA Section 608, Suffolk County / Town of Babylon registrations, plus any NYC contractor licensure if Select operates in the five boroughs. Display in footer when provided.

## Lower-priority Todos (in config files)

- Optional 24/7 emergency line — currently main number does double duty; add a separate emergency line here if one exists
- Map coordinates — approximated to West Babylon centroid; refine to 210 Dale St pin
- Photo strip — `photoStrip` array empty; add 2+ job-site shots to `shared/img/photos/select/`
- Careers URL — currently links to FirstCall Mechanical careers hub; flip to Select-specific page if one exists
- Equipment list — adapted for HVAC + controls + refrigeration scope; have the West Babylon team review for accuracy

## Anti-spam — five layers wired

Contact form posts to Resend via `_worker.js` → `select-contact` (routes to `dispatch@selectenv.com` + `Adam.Hostetter@firstcallgroup.com`). All five layers in place, silent-ok on rejection so bots can't learn:

1. **Origin allowlist** — `selectenv.com` / `www.selectenv.com` / `select-website.pages.dev`
2. **Honeypot** — hidden `_honeypot` input
3. **Min-submit-time** (3 s) — `_ts` stamped by `assets/js/form-handler.js`
4. **Cloudflare Turnstile** — widget site key `0x4AAAAAADX46kdtNk6jSZnX`; secret loaded from `TURNSTILE_SECRET_KEY` env var (worker conditionally skips this layer if the secret isn't set, so production must have it configured)
5. **Non-Latin script reject** — English + Spanish only

Cloudflare Pages env vars (Production):
- `RESEND_API_KEY` — re-use the FCG/FCM key
- `TURNSTILE_SECRET_KEY` — secret matching widget site key `0x4AAAAAADX46kdtNk6jSZnX`
