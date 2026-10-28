# Approved analyser

The owner-approved baseline is `X1-approved-2026-10-28`.
Read `docs/ANALYSER-APPROVED.md`, `ANALYSER-REFERENCE.md` and `CLAUDE.md` before changing the analyser. Preserve the approved behaviour unless the owner requests a change. Record the reason in `docs/analyser-decisions.md` and regenerate the reference with `npm run docs:analyser` in the same pull request. CI checks the source fingerprints.

Use the current main branch for production changes. Do not overwrite unrelated work in older local checkouts. Never commit `.env` files, private local results or database exports.
