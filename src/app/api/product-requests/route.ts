import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, brandName, productUrl, reason } = body;

    if (!productName || !brandName) {
      return NextResponse.json(
        { error: "Product name and brand name are required" },
        { status: 400 }
      );
    }

    // Log for now; in production send to email/CRM/Notion
    console.log("[Product Request]", { productName, brandName, productUrl, reason });

    // MVP: fire a notification email via the existing email mechanism if available
    // For now, just acknowledge the request
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
