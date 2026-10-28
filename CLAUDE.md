# Working in this repository

The owner-approved analyser baseline is `X1-approved-2026-10-28`. Read `docs/ANALYSER-APPROVED.md` and `ANALYSER-REFERENCE.md` before changing it. Source fingerprints in the reference make executable changes visible in CI. Preserve unrelated local work; use the current main branch as the production reference.

## The analyser reference (keep it current)
- `ANALYSER-REFERENCE.md` is **generated** from the code. Never edit it by hand.
- After changing anything that affects what the analyser does or says (`src/lib/analyser-x/`, `src/lib/product-review-engine.ts`, `src/lib/product-review-context.ts` (the model prompt), `src/lib/pillar-standing.ts`, `src/lib/analyser-flags.ts`), run `npm run docs:analyser` and commit the result in the same pull request. `npm test` and CI fail when it is stale.
- If the generator cannot find something it expects, it throws and says what changed: update `src/lib/analyser-reference.ts` to match.

## The decision log
- When the owner decides something about what the analyser says or what the site shows, or when content is removed, add a dated entry at the top of `docs/analyser-decisions.md`: what was decided, the reason in the owner's words (if none was given, say so), what it touched, and how to undo it. Then run `npm run docs:analyser`.

## Production safety
- Anything that spends money or writes to production (re-running analyses, deleting rows) needs the owner's explicit go-ahead in the conversation, a dry run first, and a backup first. State exactly what will be deleted or overwritten before doing it.
- The repository is public. Never commit keys, the `.env*` files, database exports, or the private `analyser/` folder.

## Wording
- Site copy says "analyse" and "analysis" for our own work. Keep "review" only in URLs, citations and regulator names.

## Giving the analyser to another reader
- Use `ANALYSER-REFERENCE.md` from `origin/main`, not a local branch (local branches can be far behind).
