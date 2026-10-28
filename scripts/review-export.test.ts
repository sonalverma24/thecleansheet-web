import { describe, expect, it } from "vitest";
import { PRIVATE_COLUMNS } from "./preview-seed";
import {
  EXPORT_COLUMNS, EXPORT_FORMAT, PAGE_SIZE, buildExportFile, checkOutDir, exportFileName, fetchAllRows,
  privateKeyWarnings, rowsDigest, sanitizeRows, verifyExportFile, type ExportFile, type PageResult, type Row,
} from "./review-export";

const EMAIL = "requester@example.com";
const USER_ID = "11111111-2222-3333-4444-555555555555";

const row = (slug: string, extra: Row = {}): Row => ({
  product_slug: slug,
  product_name: `Name of ${slug}`,
  brand: "Brand",
  tier: "mostly-clean",
  image_url: null,
  result: { type: "product-review", review: { title: slug } },
  rubric_rev: "r7",
  reviewed_at: "2026-10-22T07:00:00Z",
  ...extra,
});
const withRequester = (slug: string): Row => row(slug, { requested_by_email: EMAIL, requested_by_user_id: USER_ID });

const NOW = new Date("2026-10-23T02:49:04.123Z");
const URL_OK = "https://abcdefghij.supabase.co";
const build = (rawRows: Row[], extra: Partial<Parameters<typeof buildExportFile>[0]> = {}) =>
  buildExportFile({ rawRows, exportedAt: NOW, supabaseUrl: URL_OK, ...extra });

describe("the column allow-list", () => {
  it("never overlaps the private columns", () => {
    for (const c of PRIVATE_COLUMNS) expect(EXPORT_COLUMNS).not.toContain(c);
  });

  it("holds the columns a restore needs", () => {
    for (const c of ["product_slug", "result", "tier", "rubric_rev", "reviewed_at"]) expect(EXPORT_COLUMNS).toContain(c);
  });
});

describe("exportFileName", () => {
  it("is dated in UTC, without milliseconds or colons", () => {
    expect(exportFileName(NOW)).toBe("product-reviews-2026-10-23T02-49-04Z.json");
  });

  it("uses UTC whatever the local time zone", () => {
    expect(exportFileName(new Date("2026-12-31T23:59:59.999+05:30"))).toBe("product-reviews-2026-12-31T18-29-59Z.json");
  });

  it("sorts in time order", () => {
    const a = exportFileName(new Date("2026-10-23T02:49:04Z"));
    const b = exportFileName(new Date("2026-10-23T14:00:00Z"));
    expect(a < b).toBe(true);
  });
});

describe("sanitizeRows", () => {
  it("drops the requester columns and keeps only allow-listed ones", () => {
    const { rows, privateColumnRows } = sanitizeRows([withRequester("a"), row("b", { surprise_column: "x" })]);
    for (const r of rows) {
      for (const c of PRIVATE_COLUMNS) expect(r).not.toHaveProperty(c);
      expect(r).not.toHaveProperty("surprise_column");
      expect(Object.keys(r).every((k) => EXPORT_COLUMNS.includes(k))).toBe(true);
    }
    expect(privateColumnRows).toBe(1);
  });

  it("orders by slug so two exports of the same data match", () => {
    const { rows } = sanitizeRows([row("c"), row("a"), row("b")]);
    expect(rows.map((r) => r.product_slug)).toEqual(["a", "b", "c"]);
  });

  it("drops a repeated slug (a page shift while reading) and counts it", () => {
    const { rows, duplicates } = sanitizeRows([row("a"), row("b"), row("a")]);
    expect(rows).toHaveLength(2);
    expect(duplicates).toBe(1);
  });

  it("does not change its input", () => {
    const input = [withRequester("a")];
    const copy = JSON.parse(JSON.stringify(input));
    sanitizeRows(input);
    expect(input).toEqual(copy);
  });

  it("keeps the review JSON exactly as stored", () => {
    const r = row("a", { result: { nested: { list: [1, 2, { x: "y" }] } } });
    expect(sanitizeRows([r]).rows[0].result).toEqual({ nested: { list: [1, 2, { x: "y" }] } });
  });
});

describe("privateKeyWarnings", () => {
  it("reports the path of a requester-looking key inside a review, never its value", () => {
    const w = privateKeyWarnings([row("a", { result: { review: { requestedBy: { email: EMAIL } } } })]);
    expect(w.length).toBeGreaterThan(0);
    expect(w.join(" ")).toContain("a: result.review.requestedBy");
    expect(w.join(" ")).not.toContain(EMAIL);
  });

  it("is empty for an ordinary review", () => {
    expect(privateKeyWarnings([row("a"), row("b")])).toEqual([]);
  });

  it("caps a long list", () => {
    const many = Array.from({ length: 80 }, (_, i) => row(`s${i}`, { result: { user_id: "x" } }));
    const w = privateKeyWarnings(many);
    expect(w).toHaveLength(51);
    expect(w[50]).toMatch(/and 30 more/);
  });
});

describe("buildExportFile", () => {
  it("counts the rows and records a checksum of exactly those rows", () => {
    const f = build([row("b"), row("a")]);
    expect(f.format).toBe(EXPORT_FORMAT);
    expect(f.table).toBe("product_reviews");
    expect(f.count).toBe(2);
    expect(f.sha256).toBe(rowsDigest(f.rows));
    expect(f.columns).toEqual([...EXPORT_COLUMNS]);
    expect(f.exportedAt).toBe("2026-10-23T02:49:04.123Z");
  });

  it("names the project by reference and never holds a key or URL", () => {
    const f = build([row("a")], { supabaseUrl: "https://abcdefghij.supabase.co/rest/v1" });
    expect(f.project).toBe("abcdefghij");
    expect(JSON.stringify(f)).not.toContain("supabase.co");
  });

  it("records no project for a URL that is not a hosted supabase.co one", () => {
    expect(build([row("a")], { supabaseUrl: "https://db.example.com" }).project).toBeNull();
  });

  it("leaves no trace of a requester email or user id anywhere in the file", () => {
    const text = JSON.stringify(build([withRequester("a"), withRequester("b")]));
    expect(text).not.toContain(EMAIL);
    expect(text).not.toContain(USER_ID);
    expect(text).not.toContain("requested_by");
  });

  it("warns when a private column reached it, when rows repeat, and carries any extra warning", () => {
    const f = build([withRequester("a"), row("a")], { extraWarnings: ["count changed"] });
    expect(f.warnings).toContain("count changed");
    expect(f.warnings.join(" ")).toMatch(/1 row\(s\) carried a private column/);
    expect(f.warnings.join(" ")).toMatch(/1 duplicate row\(s\) were dropped/);
  });

  it("has no warnings for clean rows", () => {
    expect(build([row("a"), row("b")]).warnings).toEqual([]);
  });

  it("builds an empty but valid file from an empty table", () => {
    const f = build([]);
    expect(f.count).toBe(0);
    expect(verifyExportFile(f)).toEqual([]);
  });
});

describe("verifyExportFile", () => {
  const good = (): ExportFile => build([row("a"), row("b"), row("c")]);

  it("accepts a freshly built file, also after a JSON round trip", () => {
    expect(verifyExportFile(good())).toEqual([]);
    expect(verifyExportFile(JSON.parse(JSON.stringify(good())))).toEqual([]);
  });

  it("catches an edited row through the checksum", () => {
    const f = good();
    (f.rows[1] as Row).tier = "not-recommended";
    expect(verifyExportFile(f).join(" ")).toMatch(/checksum does not match/);
  });

  it("catches a truncated file through the count and the checksum", () => {
    const f = good();
    f.rows.pop();
    const p = verifyExportFile(f).join(" ");
    expect(p).toMatch(/says 3 rows but holds 2/);
    expect(p).toMatch(/checksum does not match/);
  });

  it("catches a private column even when the checksum was recomputed to hide it", () => {
    const f = good();
    (f.rows[0] as Row).requested_by_email = EMAIL;
    f.sha256 = rowsDigest(f.rows);
    expect(verifyExportFile(f).join(" ")).toMatch(/private column\(s\) present: requested_by_email/);
  });

  it("catches an unexpected column", () => {
    const f = good();
    (f.rows[0] as Row).notes = "x";
    f.sha256 = rowsDigest(f.rows);
    expect(verifyExportFile(f).join(" ")).toMatch(/unexpected column\(s\): notes/);
  });

  it("catches duplicates and rows without a review", () => {
    const f = build([row("a"), row("b")]);
    f.rows.push({ ...(f.rows[0] as Row) });
    f.rows.push({ product_slug: "z", result: null });
    f.count = f.rows.length;
    f.sha256 = rowsDigest(f.rows);
    const p = verifyExportFile(f).join(" ");
    expect(p).toMatch(/1 duplicate slug/);
    expect(p).toMatch(/1 row\(s\) have no slug or no review/);
  });

  it("refuses a wrong format, a wrong table and things that are not export files", () => {
    expect(verifyExportFile({ ...good(), format: 99 }).join(" ")).toMatch(/unknown format 99/);
    expect(verifyExportFile({ ...good(), table: "ingredients" }).join(" ")).toMatch(/not a product_reviews export/);
    expect(verifyExportFile(null)).toEqual(["the file is not a JSON object"]);
    expect(verifyExportFile([])).toEqual(["the file is not a JSON object"]);
    expect(verifyExportFile({ format: EXPORT_FORMAT, table: "product_reviews" }).join(" ")).toMatch(/rows are missing/);
  });

  it("never echoes a stored value in its messages", () => {
    const f = good();
    (f.rows[0] as Row).requested_by_email = EMAIL;
    expect(verifyExportFile(f).join(" ")).not.toContain(EMAIL);
  });
});

describe("checkOutDir", () => {
  const ROOT = "/Users/me/projects/site";

  it("accepts a folder outside the repository", () => {
    expect(checkOutDir("/Users/me/Backups/cleansheet", ROOT)).toEqual([]);
  });

  it.each([
    ["the repository root", ROOT],
    ["a folder inside it", `${ROOT}/reports`],
    ["a public folder inside it", `${ROOT}/public/backups`],
    ["a path that climbs back into it", `${ROOT}/a/../reports`],
  ])("refuses %s", (_name, dir) => {
    expect(checkOutDir(dir, ROOT).join(" ")).toMatch(/inside the repository/);
  });

  it("accepts a sibling whose name starts with the repository's name", () => {
    expect(checkOutDir(`${ROOT}-backup`, ROOT)).toEqual([]);
  });

  it("accepts a path that climbs out of the repository", () => {
    expect(checkOutDir(`${ROOT}/../elsewhere`, ROOT)).toEqual([]);
  });

  it("allows a folder inside the repository only when asked to", () => {
    expect(checkOutDir(`${ROOT}/exports`, ROOT, true)).toEqual([]);
  });

  it("refuses a missing folder name", () => {
    expect(checkOutDir("", ROOT).join(" ")).toMatch(/--out-dir is required/);
    expect(checkOutDir("   ", ROOT).join(" ")).toMatch(/--out-dir is required/);
  });
});

describe("fetchAllRows", () => {
  const table = (n: number): Row[] => Array.from({ length: n }, (_, i) => row(`s${String(i).padStart(4, "0")}`));
  const pager = (all: Row[], calls: [number, number][] = []) => async (from: number, to: number): Promise<PageResult> => {
    calls.push([from, to]);
    return { data: all.slice(from, to + 1), error: null };
  };

  it("reads an empty table with one call", async () => {
    const calls: [number, number][] = [];
    expect(await fetchAllRows(pager([], calls))).toEqual([]);
    expect(calls).toEqual([[0, PAGE_SIZE - 1]]);
  });

  it("reads several pages and stops at the short one", async () => {
    const calls: [number, number][] = [];
    const rows = await fetchAllRows(pager(table(250), calls));
    expect(rows).toHaveLength(250);
    expect(calls).toEqual([[0, 99], [100, 199], [200, 299]]);
  });

  it("reads a table that is an exact multiple of the page size, ending on an empty page", async () => {
    const calls: [number, number][] = [];
    const rows = await fetchAllRows(pager(table(200), calls));
    expect(rows).toHaveLength(200);
    expect(calls).toHaveLength(3);
  });

  it("keeps the order the pages arrived in", async () => {
    const rows = await fetchAllRows(pager(table(120)));
    expect(rows.map((r) => r.product_slug)).toEqual(table(120).map((r) => r.product_slug));
  });

  it("surfaces an error with the rows it was reading, and returns nothing partial", async () => {
    const all = table(300);
    const failing = async (from: number, to: number): Promise<PageResult> =>
      from >= 100 ? { data: null, error: { message: "permission denied" } } : { data: all.slice(from, to + 1), error: null };
    await expect(fetchAllRows(failing)).rejects.toThrow(/reading rows 100 to 199 failed: permission denied/);
  });

  it("treats a null page as the end", async () => {
    expect(await fetchAllRows(async () => ({ data: null, error: null }))).toEqual([]);
  });

  it("stops rather than loop forever when the table never ends", async () => {
    const endless = async (): Promise<PageResult> => ({ data: table(PAGE_SIZE), error: null });
    await expect(fetchAllRows(endless, PAGE_SIZE, 5)).rejects.toThrow(/stopped after 5 pages/);
  });
});

describe("end to end, without a network", () => {
  it("turns paged rows with requester data into a verified file with none of it", async () => {
    const source = Array.from({ length: 230 }, (_, i) => withRequester(`slug-${String(i).padStart(3, "0")}`));
    const raw = await fetchAllRows(async (from, to) => ({ data: source.slice(from, to + 1), error: null }));
    const file = buildExportFile({ rawRows: raw, exportedAt: NOW, supabaseUrl: URL_OK });
    const text = JSON.stringify(file);
    expect(file.count).toBe(230);
    expect(verifyExportFile(JSON.parse(text))).toEqual([]);
    expect(text).not.toContain(EMAIL);
    expect(text).not.toContain(USER_ID);
  });
});
