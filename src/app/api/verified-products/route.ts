import { listVerifiedProducts } from "@/lib/verified-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ products: await listVerifiedProducts() });
}
