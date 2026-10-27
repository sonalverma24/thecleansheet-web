# Registration attribution

## Where to view
Visit /admin/acquisition using an account whose verified email is in the server-side ADMIN_EMAILS allowlist.

## What is recorded
First identifiable visitor source, last identifiable visitor source, original landing path,
campaign labels, referral hostname, intended signup path and first-seen timestamp.
These values are connected to an auth.users UUID only for newly created users.
There is no retrospective recovery of previous signups.

## How it works
1. AcquisitionTracker is mounted in src/app/layout.tsx and captures the initial visit in the browser.
2. OAuth and email login entry points save the signup-intent path to browser storage.
3. AuthProvider checks auth.users.created_at after authentication. Only accounts created within the last hour are eligible.
4. The user's own authenticated Supabase client inserts into public.user_attribution.
5. The user_id primary key and INSERT-only RLS policies prevent overwriting first touch.
6. After successful insert, the existing GA4 analytics dispatcher sends the recommended sign_up event.
7. The admin report aggregates records on the server, using the verified ADMIN_EMAILS allowlist.

## Limits and compliance
* Raw referrer URLs, emails and names are not saved in the attribution table.
* Private WhatsApp or app shares can be indistinguishable from direct traffic. Use UTMs.
* OAuth provider pages are excluded from attribution.
* Email magic links opened on a different device/browser may lose source attribution.
* Users disabling browser storage cannot be reliably matched.
* Client-side source values can be manipulated and are marketing indicators, not security evidence.
* The 90-day browser storage retention and the privacy notice should be checked with your consent policy.
* GA4 and Meta Pixel were already configured and are unchanged by this feature.
* New signup events require the database insert to succeed. A newly created account after the one-hour window will not be backfilled.

## Example campaign link
https://thecleansheet.in/review?utm_source=instagram&utm_medium=social&utm_campaign=october_spf

## Tests
npm test
npm run build

## Deployment
The current active Supabase project already has public.user_attribution with the
required columns and RLS policies. The idempotent migration included in this
branch brings other environments into line. Merge and deploy the web code
after preview verification; no production database writes were necessary.
