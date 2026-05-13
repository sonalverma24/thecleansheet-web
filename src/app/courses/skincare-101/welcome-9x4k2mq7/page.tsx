import { CheckCircle2, Download, Calendar, Clock, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

export const metadata = {
  title: "You're In! | Skincare 101 · The Clean Sheet™",
  description: "Your spot for Skincare 101 is confirmed. Download your free Pocket Guide to Skincare Red Flags.",
  robots: { index: false, follow: false },
};

const GUIDE_URL = "/guides/skincare-red-flags-guide.pdf";

const CALENDAR_LINKS = {
  google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Skincare+101+%E2%80%94+The+Clean+Sheet%E2%81%A0%E2%80%8B%E2%84%A2&dates=20260426T063000Z/20260426T083000Z&details=Your+live+Skincare+101+session+with+The+Clean+Sheet%E2%84%A2.+Link+will+be+shared+before+the+session.&location=Live+Online`,
};

export default function PaymentSuccessPage() {
  return (
    <>
    <Script id="meta-pixel-purchase" strategy="afterInteractive">{`
      fbq('track', 'Purchase', {
        value: 299,
        currency: 'INR',
        content_name: 'Skincare 101 | The Clean Sheet',
        content_type: 'product',
        content_ids: ['skincare-101'],
      });
    `}</Script>
    <div className="min-h-screen bg-gradient-to-b from-teal-50/60 to-white px-4 py-16">
      <div className="max-w-lg mx-auto">

        {/* ── Success badge ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 border-4 border-teal-200 mb-5">
            <CheckCircle2 size={32} className="text-teal-600" />
          </div>
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-600 text-xs font-normal px-4 py-1.5 rounded-full mb-4">
            <Sparkles size={12} /> The Clean Sheet™ · Skincare 101
          </div>
          <h1 className="text-3xl sm:text-4xl font-medium text-ink-950 mb-3">
            You&apos;re in! 🎉
          </h1>
          <p className="text-ink-500 text-base leading-relaxed">
            Your spot is confirmed. We&apos;ll send the session link to your registered email before 26 April.
          </p>
        </div>

        {/* ── Session details ── */}
        <div className="bg-white rounded-3xl border border-teal-100 p-5 mb-4 shadow-sm">
          <p className="text-xs font-medium text-teal-500 uppercase tracking-widest mb-3">Your session details</p>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 text-sm text-ink-700">
              <Calendar size={15} className="text-teal-500 flex-shrink-0" />
              <span><span className="font-normal">26 April 2026</span> · Saturday</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-ink-700">
              <Clock size={15} className="text-teal-500 flex-shrink-0" />
              <span><span className="font-normal">12:00 to 2:00 PM IST</span> · Live Online</span>
            </div>
          </div>
          <a
            href={CALENDAR_LINKS.google}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full border border-teal-200 text-teal-700 hover:bg-teal-50 text-sm font-normal py-2.5 rounded-xl transition-colors"
          >
            <ExternalLink size={14} /> Add to Google Calendar
          </a>
        </div>

        {/* ── PDF Download ── */}
        <div className="bg-teal-900 rounded-3xl p-6 mb-4 text-white">
          <div className="flex items-start gap-4 mb-5">
            <div className="text-3xl flex-shrink-0">📋</div>
            <div>
              <p className="text-xs font-medium text-teal-300 uppercase tracking-widest mb-1">Free gift · Yours to keep</p>
              <h2 className="font-medium text-lg leading-tight mb-1">Pocket Guide to Skincare Red Flags</h2>
              <p className="text-teal-200 text-xs leading-relaxed">
                The cheat sheet to take with you every time you shop. Covers ingredient red flags, misleading claims, and formulation loopholes.
              </p>
            </div>
          </div>
          <a
            href={GUIDE_URL}
            download="The Clean Sheet - Pocket Guide to Skincare Red Flags.pdf"
            className="flex items-center justify-center gap-2 w-full bg-white text-teal-800 hover:bg-teal-50 font-medium text-sm py-3.5 rounded-2xl transition-colors"
          >
            <Download size={16} /> Download Now
          </a>
        </div>

        {/* ── What's next ── */}
        <div className="bg-white rounded-3xl border border-teal-100 p-5 mb-8 shadow-sm">
          <p className="text-xs font-medium text-teal-500 uppercase tracking-widest mb-3">What happens next</p>
          <ol className="space-y-3">
            {[
              "Check your email for a payment confirmation from Razorpay.",
              "We'll send you the session link 24 hours before the class on 26 April.",
              "On the day, join at 12:00 PM IST with your beauty bag ready.",
              "After the session, you'll get recording access for 48 hours.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-ink-600">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* ── Back link ── */}
        <p className="text-center text-xs text-ink-400">
          Questions? Reach us at{" "}
          <a href="mailto:hello@thecleansheet.in" className="text-teal-600 font-medium hover:underline">
            hello@thecleansheet.in
          </a>
          {" "}·{" "}
          <Link href="/" className="text-teal-600 font-medium hover:underline">
            Back to The Clean Sheet™
          </Link>
        </p>

      </div>
    </div>
    </>
  );
}
