export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email?.trim()) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "The Clean Sheet™ <onboarding@resend.dev>",
          to: "sonal@thecleansheet.in",
          subject: `New Newsletter Subscriber: ${email}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
              <p style="font-size:12px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.1em;margin:0 0 8px">The Clean Sheet™ · New Subscriber</p>
              <h2 style="font-size:20px;font-weight:800;color:#0a1f16;margin:0 0 20px">Newsletter Sign-up</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr>
                  <td style="padding:10px 12px;background:#f0fdfa;border-radius:8px 8px 0 0;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Email</td>
                  <td style="padding:10px 12px;background:#f0fdfa;border-radius:8px 8px 0 0;font-size:14px;color:#0a1f16;font-weight:600">${email}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 0 8px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Source</td>
                  <td style="padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-left:none;border-radius:0 0 8px 0;font-size:14px;color:#0a1f16">Blog page</td>
                </tr>
              </table>
              <p style="font-size:11px;color:#9ca3af;margin:20px 0 0">Submitted at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
            </div>
          `,
        }),
      });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[subscribe]", err);
    return Response.json({ success: true });
  }
}
