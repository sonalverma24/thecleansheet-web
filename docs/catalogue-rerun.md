# Rerun the existing catalogue with the approved analyser

The owner authorised refreshing the live product pages newest first on 28 October 2026, keeping the previously agreed pace of 20 products per hour. This is an operational job; it does not change the frozen analyser sources.

`scripts/rerun-approved.mts` takes a private, checksummed full-row snapshot and selects live cosmetic analyses by accepted rubric, excluding retracted/unrated rows. It sorts descending by `reviewed_at`, with missing dates last. The initial snapshot had 307 stored rows and 304 eligible products. Products added afterwards already use the approved website logic and are outside this snapshot.

For each product, the job invokes the unchanged analyser in a fresh process with only the model/scraping keys. Database and email credentials are absent, and database/email fetches are blocked. It validates product identity, the primary ingredient source and quotation, list sanity, grounding and retained decision before updating the existing database row. A title change can retain its URL when identity is confirmed by its saved product URL or source. A shorter previously verified list is held; a newly captured primary list may correct an unanchored model list. Lost decisions are held for review. Up to two further attempts are allowed for missing web-search grounding. Ambiguous and held products keep their existing page.

Writes use the existing slug and an optimistic timestamp condition. A concurrently edited or deleted product is skipped, never recreated. Requester columns are untouched. Every accepted write is read back. There are no deletes. Each pre-run row and each candidate result are saved privately so rollback and follow-up are possible. Progress survives a stopped run. Three consecutive execution failures or a billing/key error stop the job; ambiguity and held pages do not count as execution failures.

## Commands

Run from the approved checkout. An environment file is read locally; its secrets are never written into the command or child process arguments. Use an output directory outside the public repository. Both backup and result files are private.

```sh
# Dry run: snapshot + queue only, no model calls or production writes.
node --import tsx scripts/rerun-approved.mts --env /path/to/.env.local --out /private/backup/directory

# Apply: spends on the configured paid keys and updates validated results only.
caffeinate -i node --import tsx scripts/rerun-approved.mts --env /path/to/.env.local --out /private/backup/directory --apply --confirm-project xivtoayjkpnfkafrxghq
```

Reuse the same output directory to resume. Read `state.json` and `worker.log` for progress. Create `STOP` in that directory for a graceful stop before the next write; remove it only when resuming is authorised. Do not remove `RUNNING` unless its saved PID is no longer alive. Keep the Mac powered and online; caffeinate prevents idle sleep but cannot keep a shut-down computer running.

Database updates appear after the site's existing cache refresh. The job does not call the public analysis API, send emails, recreate deleted products, change the analyser, or silently overwrite concurrent edits.
