import Link from "next/link";

export interface IndexGroup {
  label: string;
  /** Optional link for the group heading itself (e.g. a brand page). */
  href?: string;
  links: { href: string; text: string }[];
}

/* Server-rendered, plain-anchor index of pages. The interactive directories
   (/brands, /ingredients) render their lists client-side or paginate them in
   JS, so their server HTML links to almost nothing. This gives crawlers (and
   no-JS visitors) a complete link path to every detail page. It is a real,
   visible section, not hidden text. */
export function CrawlableIndex({
  id, heading, intro, groups,
}: {
  id: string;
  heading: string;
  intro?: string;
  groups: IndexGroup[];
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-[#efe9e0]">
      <h2 id={`${id}-h`} className="text-xl sm:text-2xl font-medium text-[#282828] mb-2">{heading}</h2>
      {intro && <p className="text-sm text-[#6b6764] mb-8 max-w-2xl">{intro}</p>}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-10">
        {groups.map((g) => (
          <div key={g.label} className="break-inside-avoid mb-6">
            <h3 className="text-sm font-medium text-[#248179] mb-1.5">
              {g.href ? <Link href={g.href} className="hover:underline">{g.label}</Link> : g.label}
            </h3>
            <ul className="space-y-1">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] leading-snug text-[#4a4746] hover:text-[#248179] hover:underline">
                    {l.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
