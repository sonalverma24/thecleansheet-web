# SEO architecture

How indexing is controlled on thecleansheet.in, and the rules for keeping it that way.

## The rules

1. **No global canonical.** `src/app/layout.tsx` must not set `alternates.canonical` (or `openGraph.url`). Next.js inherits it into every page that does not define its own, which tells Google the whole site duplicates the homepage. Every indexable page sets its own self-referencing canonical.
2. **Keep pages out of the index with `noindex`, not `robots.txt` alone.** Google cannot see a `noindex` on a URL it is not allowed to crawl and may still list it URL-only. Use `robots: NOINDEX` from `src/lib/seo.ts` (a layout file is the easiest place for client-component pages). `robots.txt` only blocks paths crawlers should not spend requests on (`/admin/`, `/api/admin/`, gated URLs).
3. **The sitemap lists only URLs that return 200, are indexable, and are their own canonical.** No redirects, no `noindex`, no duplicates. `lastmod` is emitted only from a real date.
4. **Every indexable page needs a unique title and description.** Do not add ` | The Clean Sheet™` to a top-level `title`: the root template appends it. Keep descriptions under about 155 characters; for generated ones use `clipDescription()` from `src/lib/seo.ts`.
5. **Never hard-code a count of products, brands or ingredients** (and never a marketing figure like "25,000+"). Use `getSiteStats()` from `src/lib/site-stats.ts`; in static metadata just leave the number out.
6. **Every detail page must be reachable through plain `<a>` links** from a hub page, not only through the sitemap or client-side rendering. See `CrawlableIndex`.

## Where things live

| Concern | File |
| --- | --- |
| Origin, robots presets, canonical helpers | `src/lib/seo.ts` |
| Sitemap sections + admission rule | `src/lib/sitemap-data.ts` |
| Sitemap index (`/sitemap.xml`) | `src/app/sitemap.xml/route.ts` |
| Section sitemaps (`/sitemaps/{pages,editorial,brands,reviews,ingredients}.xml`) | `src/app/sitemaps/[section]/route.ts` |
| `robots.txt` | `src/app/robots.ts` |
| Crawlable link directories on hub pages | `src/components/seo/CrawlableIndex.tsx` |
| Reviews that duplicate a catalogue page | `src/lib/catalogue-dedupe.ts` |
| Live product / brand / ingredient counts | `src/lib/site-stats.ts` |
| Permanent redirects for retired URLs | `next.config.ts` |
| Health check | `scripts/seo-audit.ts` |

## Sitemap sections

`/sitemap.xml` is an index. Submit only that URL in Search Console; the sections show up as separate rows so indexing coverage is visible per page type:

| Section | Contents |
| --- | --- |
| `pages` | Home, tools, hubs, standard, verify, about, legal |
| `editorial` | Blog posts, skin-type guides |
| `brands` | Brand pages and catalogue product pages |
| `reviews` | Live-reviewed products (`/reviews/[slug]`) that have no catalogue page |
| `ingredients` | Every indexable ingredient profile: curated core plus discovered profiles that have been enriched (de-duplicated; stubs excluded) |

Sections revalidate hourly, so new reviews appear without a redeploy.

## Adding pages

- **New static public page:** give it `metadata` with a title, description and `alternates: { canonical }`; add its path to `PAGES` in `src/lib/sitemap-data.ts`.
- **New dynamic page type:** add a section to `SITEMAP_SECTIONS` and a case in `getSitemapEntries`, and make sure a hub page links to it with real anchors.
- **New non-public page** (admin, account, previews, prototypes): add a `layout.tsx` exporting `robots: NOINDEX`.
- **Retiring a URL:** add a permanent redirect in `next.config.ts`, update internal links to the new URL, and remove it from the sitemap.

## Deliberately noindex

`/admin/*`, `/account`, `/auth/*`, `/app`, `/routine` (unlinked, unfinished), `/courses/skincare-101` (registrations closed), `/analysis-preview`, `/product/[id]` (placeholder), `/analyzed/[slug]` (legacy cached scans), `/learn/guides/[slug]/print`, `/spf/sample`, `/pitch`, `/preview/*`, `/verify/[certificate]` (example proof pages), and ingredient stubs with no profile yet ("Profile being compiled"). A stub becomes indexable and enters the sitemap automatically once it is enriched (`node scripts/enrich-ingredients.mts`, see the script header).

## Health check

```bash
node scripts/seo-audit.ts                       # audit production, every sitemap URL
node scripts/seo-audit.ts --base http://localhost:3000 --sample 5
node scripts/seo-audit.ts --discover            # also check internal links that are not in the sitemap
node scripts/seo-audit.ts --csv seo.csv --fail-on high   # CI gate
```

Needs Node 22.6+ (native TypeScript). No dependencies. See the header of the script for all flags. It requests pages as Googlebot on purpose: Next.js places metadata differently per user agent.
