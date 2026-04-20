import Groq from "groq-sdk";
import { CHAT_SYSTEM_PROMPT } from "@/lib/scoring-context";

export async function POST(req: Request) {
  try {
    const { message, history, scorecardContext } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Build system prompt with scorecard context if available
    const systemPrompt = scorecardContext
      ? `${CHAT_SYSTEM_PROMPT}\n\nPRODUCT CONTEXT (from scorecard already analyzed):\n${JSON.stringify(scorecardContext, null, 2)}`
      : CHAT_SYSTEM_PROMPT;

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const groqStream = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
            max_tokens: 1024,
            stream: true,
          });

          for await (const chunk of groqStream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Chat failed";
          controller.enqueue(encoder.encode(`Error: ${msg}`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Chat failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
