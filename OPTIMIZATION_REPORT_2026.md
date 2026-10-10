# Chef Al Arab — performance, crawlability and AdSense hardening

Date: 2026-09-17

## What was changed

### LCP / initial rendering

- Re-enabled Next.js image optimization by default, with AVIF/WebP output and responsive device sizes.
- Home hero is the explicit preload candidate and uses a lightweight blur placeholder.
- Removed the ad directly below the home hero so ad work does not compete with the first viewport.
- Delayed large global utility chunks until after the critical render using a real wall-clock delay plus idle scheduling.
- Deferred PWA/install/local-promotion UI even further.
- The decorative brand font is no longer preloaded; the primary Cairo UI font remains preloaded.

### Consent / crawler access

- Moved Consent Mode initialization to the correct `src/instrumentation-client.ts` location.
- Replaced the previous full-screen blocking consent experience with a non-modal bottom card.
- Removed body scroll locking, `inert`, blanket `aria-hidden`, focus trapping and the long 10-second decision wait.
- Legal/about/contact pages are not hidden behind the custom cookie banner.

### Ads

- Added one central ad-free route policy.
- Manual AdSense component, global AdSense script, and local promotions all respect that policy.
- Removed old interstitial ad code.
- Reduced mobile recipe-list ad density from every 4 cards to every 8 cards.
- Recipe pages now have one content-separated manual unit instead of multiple early units.
- Local floating promotions are independent from AdSense and default to disabled.
- AdSense units use intersection/resize observers without repeated 10-second polling loops.

### Crawlable informational pages

- Privacy, Terms, Cookie and Contact content are server-rendered.
- About content no longer relies on accordion state to expose its substantive text.
- Privacy Policy remains linked from the primary navigation and all policy/contact/about links are present in the server-rendered footer.

### Security / quality

- Kept HSTS, MIME sniffing protection, frame protection, referrer and permissions policies.
- Added cross-domain-policy protection.
- Preserved canonical metadata, sitemap, robots directives and recipe JSON-LD.
- Removed duplicate/obsolete browser type declarations and old interstitial code.
- Added a monetization audit script for ad-free routes and ads.txt checks.
- Removed nested `<main>` landmark structure by making the root layout wrapper neutral and keeping route-level main landmarks.

## Validation status

The source/data audit can run without third-party packages. The uploaded archive does **not** contain the production image library, so the asset audit reports missing recipe images. The final image/LCP pass must be done after the real images are supplied.

This environment also could not complete `npm ci` because registry DNS/network requests failed (`EAI_AGAIN`). Therefore a production `next build`, ESLint and TypeScript check must be run again in an environment with npm registry access before deployment. The project includes `npm run check` for that final gate.

## Performance target

The changes are designed to remove the known PageSpeed blockers: late blocking consent UI, unoptimized images, early non-critical client chunks, early ad work, extra font preload, ad polling and excessive ad density. A fixed Lighthouse score cannot be guaranteed because the score varies with hardware, network, third-party Google scripts, ad responses and the final image bytes.
