# Evidence harness: implementation and remaining rebuild

Status: first implementation on a separate branch, based on main at e08cb07. Not a complete replacement, not deployed, and not a zero error system. Laptop changes listed in the supplied file map were not available as source code.

## What runs

`src/lib/neurosymbolic/harness.ts` supplies a deterministic evidence evaluator and an asynchronous audit hook boundary. The existing model continues to propose reviews. The harness separately validates its input shape, compares ingredient captures against exact product identity and ordered ingredient lists, checks capture dates under an explicitly supplied freshness policy, retains exact claim spans, and reports unknowns or conflicts. Model scores, confidence, evidence levels and preexisting anchors cannot grant endorsement in this layer.

Claims currently have three states: source_stated, unsubstantiated and disputed. Source_stated means only that literal wording exists in an identity matched capture. It does not establish that a brand authored the wording, that a study substantiates it, or that an assertion is true. Disputed means a review lead, not a confirmed defect. The current policy deliberately returns human_review_required for every endorsement. No fake reviewer approval or placeholder clinical adjudication is included.

Each decision carries a policy version, exact input hash, source text digests, citation offsets and reason codes. Hashes detect changes when compared with a retained record; they do not authenticate sources or protect an audit from a database administrator.

`runEvidenceHarness` snapshots inputs before evaluation, requires an audit callback to succeed before the observation callback, and isolates callback mutation. The caller must implement durable storage. The production shadow adapter currently retains its decision and captures in the existing review JSON, whose legacy store is best effort. It is not an append only audit ledger.

## Live adapter and default behavior

ANALYSER_EVIDENCE_HARNESS_SHADOW=true adds observations to newly generated reviews. It is off by default. ANALYSER_CAPTURE_MAX_AGE_MS must be a positive millisecond value to consider captured evidence current; no scientific validity period is invented in code. Without it the audit abstains.

The adapter passes INCIDecoder titles, brand fields, source quote, truncation status and ingredients through the exact identity checker. Product page claims remain unresolved because the existing fetch path does not yet provide a sufficiently validated identity envelope. Cached reviews do not receive a new audit automatically.

The harness does not currently block publication, rewrite ratings, suppress badges, reprocess caches, or make certification decisions. Public read paths and registry writes still follow the existing engine. Never enable or describe this as enforced publication protection. The separate image evidence bug fix does change model input: graphics transcription is now collected once before constructing prompts and reaches name and URL prompts, including retries. Transcription is still model output, not independently validated evidence.

## Necessary work before enforcement

1. Reconcile the unpushed laptop branch and working tree with this branch. The uploaded documentation lists source changes but does not contain them.
2. Define product identity including SKU, region, batch/formula version, category and population. Add direct brand and packaging capture adapters; verify quoted spans against immutable raw captures.
3. Build a reviewed rule registry with version, effective dates, jurisdiction, category, exposure assumptions, concentration requirements, references and actual reviewer provenance. Existing alias metadata is insufficient to infer blanket safety.
4. Add structured study adjudication: exact finished product, endpoint, population, method, comparator, sample size, duration, results and limitations. A linked paper or ingredient study is not finished product substantiation. Keep efficacy, safety, regulatory scope and marketing fidelity as separate decisions.
5. Replace model assigned scores with rule based coverage and evidence outcomes. Preserve unknown as unknown. Do not numerically average a hard conflict away or convert missing documentation into a product defect.
6. Add authenticated expert decisions, conflict resolution history and an append only audit store. Only explicit, scoped decisions may resolve holds. Capture hashes and model output alone cannot do so.
7. Enforce a single publication policy across API responses, stored review reads, memory caches, listings, registry, badges, JSON-LD, extension and pitch pages. Audit, decision and publication must commit consistently. A shadow field is not this policy.
8. Build an expert adjudicated benchmark with positives, negatives, ambiguous cases, adversarial pages, reformulations, region variants and retrieval failures. Measure precision, recall, unsupported endorsement rate, abstention rate and evidence coverage independently. Synthetic passing tests are not accuracy evidence.
9. Run read only previews over existing rows, inspect rating changes, stage enforcement, and retain explicit rollback behavior. No production rows or existing policy flags were changed here.

## Verification

Run `npm test` and `npx tsc --noEmit`. The new tests cover forged model evidence, exact source spans, variant mismatch, formula conflicts, truncation, stale/future/invalid dates, absent freshness policy, malformed scores, duplicate capture IDs, missing INCI, injected source instructions, deterministic replay and hook failures. Engine integration tests cover shadow audit persistence and image evidence reaching prompts once across retries.

A passing test suite demonstrates the checked properties on those fixtures. It cannot establish zero error in unseen products, scientific interpretation or upstream source content.
