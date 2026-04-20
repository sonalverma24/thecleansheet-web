import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return Response.json({ error: "No URL provided" }, { status: 400 });
  }

  try {
    // Jina AI reader: converts any URL (including JS-rendered) to clean markdown
    const jinaUrl = `https://r.jina.ai/${url}`;
    const res = await fetch(jinaUrl, {
      headers: {
        Accept: "text/plain",
        "X-Return-Format": "markdown",
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch page: ${res.status}`);
    }

    const content = await res.text();
    return Response.json({ content, url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
