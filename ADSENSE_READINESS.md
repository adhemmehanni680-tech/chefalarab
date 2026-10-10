# Chef Al Arab — AdSense readiness checklist

This project now treats monetization as a route policy rather than scattering exceptions across individual pages.

## Pages that must remain ad-free

The application blocks manual AdSense units, the global AdSense script on a direct visit, and local floating promotions on:

- `https://chefalarab.com/privacy_policy`
- `https://chefalarab.com/terms_conditions`
- `https://chefalarab.com/cookie_policy`
- `https://chefalarab.com/contact_us`
- `https://chefalarab.com/about_us`

The source of truth is `src/lib/routePolicy.ts`.

### Required AdSense dashboard step

Auto ads are controlled by AdSense account settings, not only by React code. In AdSense, add the five exact URLs above as **Page exclusions**. This also protects client-side navigation cases where the AdSense library was already loaded on a previous page.

If you want exact control over every ad position, disable Auto ads and use the manual units already placed in the site. If you keep Auto ads, review **Excluded areas** so Google does not insert in-page ads inside navigation or other interactive areas.

## Current manual ad layout

- Home: one manual unit after the second recipe category, not directly under the hero/LCP area.
- Recipe detail: one manual unit after the ingredients section, before the preparation steps.
- Recipes listing: mobile units are spaced every 8 recipe cards; desktop has a dedicated advertising aside.
- Legal/about/contact pages: no manual units.
- Local floating promotions: disabled by default and controlled independently with `NEXT_PUBLIC_LOCAL_ADS_ENABLED=true`.

Every manual AdSense unit reserves height before loading and initializes only near the viewport to reduce CLS and unnecessary work.

## Consent / CMP

- Consent Mode v2 defaults are initialized from `src/instrumentation-client.ts` before hydration.
- The site banner does not cover, hide, inert, or scroll-lock the main page.
- When an IAB TCF CMP is detected for GDPR traffic, the custom banner yields to it to avoid two consent interfaces.
- Keep the Google-certified CMP published in **AdSense > Privacy & messaging** for EEA, UK and Switzerland traffic.
- The footer contains a persistent privacy-settings control.

## AdSense crawl/readiness

- Privacy Policy is linked from the main navigation and footer.
- Privacy, Cookie, Terms, Contact and About pages are server-rendered and readable without JavaScript.
- The consent UI no longer blocks the crawler from the main content path.
- `robots.ts` allows the public site and only disallows API/private paths.
- Sitemap includes all public policy pages and published recipes.
- `public/ads.txt` contains the expected Google publisher record.

## Before production submission

1. Restore the real images under `public/uploads`, `public/card`, and the required top-level/PWA assets.
2. Run `npm ci` on a machine with registry access.
3. Run `npm run check`.
4. Deploy the production build.
5. Configure the five AdSense Page exclusions listed above.
6. Verify Google Privacy & messaging / CMP is published.
7. Open each excluded page in a clean browser session and confirm there is no ad unit.
8. Re-run PageSpeed Insights on `/`, `/recipes`, and representative recipe pages.
9. Re-scan in AdSense Auditor / AdSense after the deployed pages are crawlable.

## Environment switches

- `NEXT_PUBLIC_ADS_ENABLED=true` — enables Google AdSense integration.
- `NEXT_PUBLIC_LOCAL_ADS_ENABLED=true` — opt-in for the site's own floating promotions; default is off.
- `NEXT_IMAGE_UNOPTIMIZED=true` — emergency hosting fallback only. Leave unset for normal production so Next.js image optimization remains enabled.
