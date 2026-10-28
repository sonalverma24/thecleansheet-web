import { ANALYSER_APPROVED_BASELINE, ANALYSER_METHOD_VERSION, ANALYSER_RELEASE } from "@/lib/analyser-x/version";
import { ANALYSER_FLAGS, isFlagOn } from "@/lib/analyser-flags";

/** Public, non-sensitive release identity for checking local/production parity. */
export function GET() {
  return Response.json({
    baseline: ANALYSER_APPROVED_BASELINE,
    release: ANALYSER_RELEASE,
    method: ANALYSER_METHOD_VERSION,
    configuration: {
      pillsPage: isFlagOn(ANALYSER_FLAGS.pillsPage),
      newLayout: isFlagOn(ANALYSER_FLAGS.newLayout),
      ingredientAliases: isFlagOn(ANALYSER_FLAGS.ingredientAliases),
      pillarStanding: isFlagOn(ANALYSER_FLAGS.pillarStanding),
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
