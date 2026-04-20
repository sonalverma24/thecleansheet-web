import { GoogleGenerativeAI } from "@google/generative-ai";
import { CLEAN_SHEET_SYSTEM_PROMPT, COMPARISON_SYSTEM_PROMPT, EXPERT_ANSWER_SYSTEM_PROMPT } from "@/lib/scoring-context";

export const maxDuration = 120;

function isComparisonQuery(query: string): boolean {
  const q = query.toLowerCase();
  if (q.includes(" vs ") || q.includes(" versus ") || q.includes("compare")) return true;
  if (q.includes("better than") || q.includes("which is better") || q.includes("which one is")) return true;
  if (/better.{1,80}\bor\b/i.test(query) || /\bor\b.{1,80}better/i.test(query)) return true;
  return false;
}

// Queries that are questions about ingredients, safety, skin concerns — not a specific product to score
function isExpertQuestion(query: string): boolean {
  const q = query.toLowerCase().trim();
  const questionStarters = ["is ", "are ", "does ", "do ", "can ", "should ", "what is ", "what are ", "why is ", "why are ", "how does ", "how do ", "how safe ", "is it safe", "tell me about", "explain"];
  const hasQuestionMark = q.includes("?");
  const startsLikeQuestion = questionStarters.some((s) => q.startsWith(s));
  // Has no brand/product signals (no title-case multi-word, no % signs for serums, no brand-style formatting)
  const looksLikeProduct = /\d+%/.test(q) || q.split(" ").filter((w) => /^[A-Z]/.test(w)).length >= 2;
  return (hasQuestionMark || startsLikeQuestion) && !looksLikeProduct && !isComparisonQuery(query);
}

function parseJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const stripped = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    try {
      return JSON.parse(stripped);
    } catch {
      const match = stripped.match(/\{[\s\S]*\}/);
      if (match) {
        try { return JSON.parse(match[0]); } catch { /* fall through */ }
      }
    }
  }
  return null;
}

const OUT_OF_SCOPE = Response.json({ type: "out_of_scope" });

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query?.trim()) {
      return Response.json({ error: "No query provided" }, { status: 400 });
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return OUT_OF_SCOPE;
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const q = query.trim();
    const isComparison = isComparisonQuery(q);
    const isExpert = !isComparison && isExpertQuestion(q);

    const systemInstruction = isComparison
      ? COMPARISON_SYSTEM_PROMPT
      : isExpert
        ? EXPERT_ANSWER_SYSTEM_PROMPT
        : CLEAN_SHEET_SYSTEM_PROMPT;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: [{ googleSearch: {} } as any],
      systemInstruction,
    });

    const prompt = isComparison
      ? `Compare these two products: ${q}`
      : isExpert
        ? q
        : `Analyze this product: ${q}`;

    const result = await model.generateContent(prompt);
    const finalText = result.response.text().trim();

    if (!finalText) {
      return OUT_OF_SCOPE;
    }

    // Expert answer — plain text response, no JSON parsing needed
    if (isExpert) {
      const parsed = parseJSON(finalText);
      if (parsed?.type === "out_of_scope") return OUT_OF_SCOPE;
      if (parsed?.type === "answer") return Response.json({ type: "answer", answer: parsed });
      // Fallback: return raw text as answer
      return Response.json({ type: "answer", answer: { type: "answer", text: finalText, verdict: "info" } });
    }

    const parsed = parseJSON(finalText);

    if (!parsed) return OUT_OF_SCOPE;
    if (parsed.type === "out_of_scope") return OUT_OF_SCOPE;

    // Comparison response
    if (isComparison && parsed.type === "comparison" && parsed.productA && parsed.productB) {
      return Response.json({ type: "comparison", comparison: parsed });
    }

    // Single product response (existing behaviour unchanged)
    return Response.json({ type: "single", scorecard: parsed });
  } catch (err: unknown) {
    console.error("[analyze]", err instanceof Error ? err.message : err);
    return OUT_OF_SCOPE;
  }
}
