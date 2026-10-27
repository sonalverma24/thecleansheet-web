import { rateLimit, rateLimited } from "@/lib/rate-limit";
import { parseSubscriber, recordSubscriber } from "@/lib/subscribers";

export async function POST(req: Request) {
  // Open to anyone and writes a row, so it is rate-limited like the other public endpoints.
  if (!rateLimit(req, "subscribe", 5)) return rateLimited();

  try {
    const { email, source } = await req.json();

    if (typeof email !== "string" || !email.trim()) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }
    const subscriber = parseSubscriber(email, source);
    if (!subscriber) {
      return Response.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    await recordSubscriber(subscriber);
    return Response.json({ success: true });
  } catch (err) {
    console.error("[subscribe]", err);
    return Response.json({ success: true });
  }
}
