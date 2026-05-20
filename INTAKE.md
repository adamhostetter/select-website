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
| Email | service@selectenv.com |
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

## Anti-spam — Cloudflare Turnstile

Contact form is wired to Resend (`_worker.js` → `select-contact`) but has only a single-layer honeypot. Mirror the Starnes implementation (Starnes repo, commit `b70d9f8` — "Add anti-spam layers to contact form: Turnstile + time + origin") when spam volume warrants. Four layers, all silent-ok on rejection so bots can't learn:

1. **Origin allowlist** — reject POSTs whose `Origin` isn't `selectenv.com` / `www.selectenv.com` / preview `*.pages.dev`
2. **Honeypot** — already in place
3. **Min-submit-time** (3 s) — JS writes `Date.now()` into a hidden `_ts` field; worker rejects fast submissions
4. **Cloudflare Turnstile** — verify the widget token via `challenges.cloudflare.com/turnstile/v0/siteverify`

Setup (~15 min):
1. Cloudflare dash → Turnstile → Add widget named `Select Contact Form`; hostnames `selectenv.com`, `www.selectenv.com`, `select-website.pages.dev` (or whatever the Pages preview hostname is); mode Managed
2. Copy the site key (public) and secret key (private)
3. Pages project → Settings → Variables and Secrets → add `TURNSTILE_SECRET_KEY` as a Secret (Production)
4. Copy the 4-layer pattern from Starnes `_worker.js` into Select `_worker.js`; copy the widget div + `_ts` hidden input + Turnstile script tag into `index.html` and `shared/templates/branch.html`; copy the `_ts` setter in `assets/js/form-handler.js`. Swap the Starnes site key for Select's.
5. Push — Cloudflare redeploys with the secret available.
