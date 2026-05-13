import Link from "next/link";
import { Mail, Phone, Globe, MessageSquare, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Contact | The Clean Sheet™",
  description: "Get in touch with The Clean Sheet™ for brand certification enquiries, consumer questions, or press.",
};

export default function ContactPage() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">

        <div className="mb-12">
          <p className="text-teal-600 text-xs font-normal uppercase tracking-widest mb-3">Get in touch</p>
          <h1 className="text-4xl font-medium text-ink-950 tracking-tight mb-4">Contact Us</h1>
          <p className="text-ink-500 text-lg max-w-xl">
            Whether you&apos;re a brand exploring certification, a consumer with a question, or press, we&apos;ll get back to you within 2 business days.
          </p>
        </div>

        {/* Reason cards with separate emails */}
        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          {[
            {
              icon: Globe,
              title: "For Brands",
              desc: "Interested in certifying a product or want to understand the process before committing?",
              email: "hello@thecleansheet.in",
              cta: "#get-certified",
              ctaLabel: "Apply for Certification →",
            },
            {
              icon: MessageSquare,
              title: "For Consumers",
              desc: "Questions about a certified product, or want to report something about a brand?",
              email: "hello@thecleansheet.in",
            },
            {
              icon: Mail,
              title: "Press & Media",
              desc: "Interviews, data requests, editorial collaborations, and partnerships.",
              email: "hello@thecleansheet.in",
            },
          ].map(({ icon: Icon, title, desc, email, cta, ctaLabel }) => (
            <div key={title} className="bg-white border border-ink-100 rounded-3xl p-6 hover:border-teal-200 hover:shadow-md transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                <Icon size={16} className="text-teal-600" />
              </div>
              <h3 className="font-medium text-ink-950 text-sm mb-2">{title}</h3>
              <p className="text-ink-500 text-xs leading-relaxed mb-3">{desc}</p>
              <a href={`mailto:${email}`} className="text-teal-600 text-xs font-normal hover:underline block mb-2">
                {email}
              </a>
              {cta && (
                <Link href={cta} className="text-coral-500 text-xs font-normal hover:underline">
                  {ctaLabel}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div className="mb-14">
          <h2 className="text-xl font-medium text-ink-950 mb-6">Send us a message</h2>
          <form className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-normal text-ink-600 uppercase tracking-wide mb-1.5">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full border border-ink-200 rounded-2xl px-4 py-3 text-sm text-ink-900 placeholder-ink-300 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-normal text-ink-600 uppercase tracking-wide mb-1.5">Company</label>
                <input
                  type="text"
                  placeholder="Brand or company name (optional)"
                  className="w-full border border-ink-200 rounded-2xl px-4 py-3 text-sm text-ink-900 placeholder-ink-300 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-normal text-ink-600 uppercase tracking-wide mb-1.5">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full border border-ink-200 rounded-2xl px-4 py-3 text-sm text-ink-900 placeholder-ink-300 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-normal text-ink-600 uppercase tracking-wide mb-1.5">What are you enquiring about?</label>
              <select className="w-full border border-ink-200 rounded-2xl px-4 py-3 text-sm text-ink-900 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors bg-white">
                <option value="">Select an option</option>
                <option value="brand-certification">Brand certification</option>
                <option value="consumer-question">Consumer question</option>
                <option value="press">Press &amp; media</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-normal text-ink-600 uppercase tracking-wide mb-1.5">Message</label>
              <textarea
                rows={5}
                placeholder="Tell us what you're looking for..."
                className="w-full border border-ink-200 rounded-2xl px-4 py-3 text-sm text-ink-900 placeholder-ink-300 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-normal px-6 py-3.5 rounded-2xl transition-all hover:shadow-lg active:scale-[0.98]"
            >
              Send message <ArrowRight size={15} />
            </button>
          </form>
        </div>

        {/* Direct contact */}
        <div className="grid sm:grid-cols-2 gap-6 mb-14">
          <a
            href="mailto:hello@thecleansheet.in"
            className="group flex items-start gap-4 bg-teal-50 hover:bg-teal-100 border border-teal-100 hover:border-teal-200 rounded-3xl p-6 transition-all duration-200"
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-600 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-700 transition-colors">
              <Mail size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-normal uppercase tracking-widest text-teal-600 mb-1">General</p>
              <p className="font-normal text-ink-950 text-sm">hello@thecleansheet.in</p>
              <p className="text-ink-400 text-xs mt-1">We respond within 2 business days</p>
            </div>
          </a>

          <a
            href="tel:+919704443566"
            className="group flex items-start gap-4 bg-ink-50 hover:bg-ink-100 border border-ink-100 hover:border-ink-200 rounded-3xl p-6 transition-all duration-200"
          >
            <div className="w-11 h-11 rounded-2xl bg-ink-800 flex items-center justify-center flex-shrink-0 group-hover:bg-ink-900 transition-colors">
              <Phone size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-normal uppercase tracking-widest text-ink-500 mb-1">Phone / WhatsApp</p>
              <p className="font-normal text-ink-950 text-sm">+91-9704443566</p>
              <p className="text-ink-400 text-xs mt-1">Mon-Fri, 10 AM to 6 PM IST</p>
            </div>
          </a>
        </div>

        {/* Social */}
        <div className="mb-14">
          <h2 className="text-xl font-medium text-ink-950 mb-6">Follow us</h2>
          <div className="flex flex-wrap gap-4">
            <a href="https://thecleansheet.in" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 border border-ink-200 hover:border-teal-400 hover:bg-teal-50 text-ink-600 hover:text-teal-700 text-sm font-medium px-4 py-2.5 rounded-2xl transition-all duration-200">
              <Globe size={15} /> thecleansheet.in
            </a>
            <a href="https://www.instagram.com/thecleansheet.in" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 border border-ink-200 hover:border-teal-400 hover:bg-teal-50 text-ink-600 hover:text-teal-700 text-sm font-medium px-4 py-2.5 rounded-2xl transition-all duration-200">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              @thecleansheet.in
            </a>
            <a href="https://www.youtube.com/@thecleansheetindia" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 border border-ink-200 hover:border-teal-400 hover:bg-teal-50 text-ink-600 hover:text-teal-700 text-sm font-medium px-4 py-2.5 rounded-2xl transition-all duration-200">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
              @thecleansheetindia
            </a>
          </div>
        </div>

        {/* Legal notice */}
        <div className="bg-ink-50 border border-ink-100 rounded-3xl p-6 text-xs text-ink-400 leading-relaxed">
          <p className="font-normal text-ink-600 mb-1">The Clean Sheet™</p>
          <p>Est. 2025 · India&apos;s first independent beauty and personal care certification body.</p>
          <p className="mt-2">
            For legal notices, please write to{" "}
            <a href="mailto:hello@thecleansheet.in" className="text-teal-600 hover:underline">hello@thecleansheet.in</a>{" "}
            with subject line: <em>Legal Notice | The Clean Sheet™</em>.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-ink-100 flex flex-wrap gap-4 text-sm text-ink-400">
          <Link href="/privacy-policy" className="hover:text-teal-600 transition-colors">Privacy Policy</Link>
          <Link href="/terms-of-use" className="hover:text-teal-600 transition-colors">Terms of Use</Link>
          <Link href="/disclaimer" className="hover:text-teal-600 transition-colors">Disclaimer</Link>
        </div>

      </div>
    </main>
  );
}
