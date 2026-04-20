import Link from "next/link";

export const metadata = {
  title: "Terms of Use — The Clean Sheet™",
  description: "Terms of Use for The Clean Sheet™ website and services.",
};

export default function TermsOfUsePage() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">

        <div className="mb-12">
          <p className="text-teal-600 text-xs font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-bold text-ink-950 tracking-tight mb-4">Terms of Use</h1>
          <p className="text-ink-400 text-sm">Last updated: April 2026 &nbsp;·&nbsp; Effective: April 2026</p>
        </div>

        <div className="prose prose-sm max-w-none text-ink-700 leading-relaxed space-y-8">

          <section>
            <p>
              These Terms of Use (&quot;Terms&quot;) govern your access to and use of the website{" "}
              <a href="https://thecleansheet.in" className="text-teal-600 hover:underline">thecleansheet.in</a>{" "}
              and all related services, tools, and content (collectively, the &quot;Platform&quot;) operated by
              The Clean Sheet™ (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;). By accessing or using the Platform,
              you agree to be bound by these Terms. If you do not agree, do not use the Platform.
            </p>
            <p className="mt-3">
              These Terms are governed by the laws of India, including the <strong>Information Technology Act, 2000</strong>,
              the <strong>Consumer Protection Act, 2019</strong>, and applicable regulations thereunder.
            </p>
          </section>

          <Section title="1. Use of the Platform">
            <p>You may use the Platform for lawful, personal, or professional purposes only. You agree not to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5">
              <li>Use the Platform for any unlawful purpose or in violation of applicable law</li>
              <li>Scrape, copy, reproduce, or republish our content, scores, or analysis without written permission</li>
              <li>Attempt to reverse-engineer, hack, or interfere with the Platform&apos;s infrastructure</li>
              <li>Submit false, misleading, or malicious queries or data</li>
              <li>Impersonate The Clean Sheet™ or any of its representatives</li>
              <li>Use the Platform to disparage or defame any brand without factual basis</li>
            </ul>
          </Section>

          <Section title="2. Ask Clean — AI Analyser">
            <p>
              The Ask Clean analyser is an AI-powered tool that evaluates cosmetic products and ingredients
              based on publicly available data and The Clean Sheet™ proprietary scoring framework.
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5">
              <li>Outputs are <strong>informational only</strong> and do not constitute medical, dermatological, or regulatory advice.</li>
              <li>Results are based on available INCI data at the time of analysis and may not reflect real-time formulation changes.</li>
              <li>We do not guarantee the accuracy, completeness, or fitness for purpose of any analysis output.</li>
              <li>You should not rely solely on Ask Clean outputs when making purchasing or health decisions.</li>
            </ul>
          </Section>

          <Section title="3. Certification Services">
            <p>
              The Clean Sheet™ Certification is awarded at our sole discretion following independent evaluation.
              Certification does not constitute an endorsement of a brand&apos;s overall business practices or all
              products in its portfolio — only the specific product(s) evaluated. Certification is subject to
              periodic review and may be revoked if a product formulation changes or standards are not maintained.
            </p>
          </Section>

          <Section title="4. Intellectual Property">
            <p>
              All content on the Platform — including but not limited to the scoring methodology, badge designs,
              the Clean Sheet™ name and logo, written content, and AI outputs — is the intellectual property of
              The Clean Sheet™ and is protected under the <strong>Copyright Act, 1957</strong> and applicable IP law.
            </p>
            <p className="mt-3">
              You may not reproduce, distribute, or commercialise any part of our content without prior written consent.
              Fair use for journalistic, educational, or research purposes is permitted with appropriate attribution.
            </p>
          </Section>

          <Section title="5. Third-Party Content and Links">
            <p>
              The Platform may reference, link to, or display information from third-party sources (brands,
              retailers, databases). We do not endorse or take responsibility for third-party content. Product
              information sourced from retailer listings may be subject to change without notice.
            </p>
          </Section>

          <Section title="6. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, The Clean Sheet™ shall not be liable for any indirect,
              incidental, consequential, or punitive damages arising from your use of the Platform, including
              reliance on any analysis, score, or certification decision.
            </p>
            <p className="mt-3">
              Our total liability for any claim arising out of these Terms shall not exceed INR 1,000 (one
              thousand rupees) or the amount paid by you for the relevant service, whichever is lower.
            </p>
          </Section>

          <Section title="7. Disclaimer of Warranties">
            <p>
              The Platform is provided &quot;as is&quot; and &quot;as available&quot; without any warranties, express or implied,
              including warranties of merchantability, fitness for a particular purpose, or non-infringement.
              We do not warrant that the Platform will be uninterrupted, error-free, or free of viruses.
            </p>
          </Section>

          <Section title="8. User-Generated Content">
            <p>
              If you submit queries, feedback, or other content to the Platform, you grant The Clean Sheet™ a
              non-exclusive, royalty-free licence to use such content to improve our services. You represent
              that you own or have the right to submit such content.
            </p>
          </Section>

          <Section title="9. Termination">
            <p>
              We reserve the right to suspend or terminate your access to the Platform at any time, without
              notice, for conduct that we believe violates these Terms or is harmful to other users, us, or
              third parties.
            </p>
          </Section>

          <Section title="10. Governing Law and Dispute Resolution">
            <p>
              These Terms are governed by the laws of India. Any disputes arising out of or in connection with
              these Terms shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana,
              India. We encourage resolution through good-faith negotiation before initiating legal proceedings.
            </p>
          </Section>

          <Section title="11. Changes to Terms">
            <p>
              We may modify these Terms at any time. Continued use of the Platform after changes constitutes
              acceptance of the revised Terms. We recommend reviewing this page periodically.
            </p>
          </Section>

          <Section title="12. Contact">
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 text-sm space-y-1">
              <p className="font-semibold text-ink-950">The Clean Sheet™</p>
              <p>Email: <a href="mailto:hello@thecleansheet.in" className="text-teal-600 hover:underline">hello@thecleansheet.in</a></p>
              <p>Phone: <a href="tel:+919704443566" className="text-teal-600 hover:underline">+91-9704443566</a></p>
            </div>
          </Section>

        </div>

        <div className="mt-16 pt-8 border-t border-ink-100 flex flex-col sm:flex-row gap-4 text-sm text-ink-400">
          <Link href="/privacy-policy" className="hover:text-teal-600 transition-colors">Privacy Policy</Link>
          <Link href="/disclaimer" className="hover:text-teal-600 transition-colors">Disclaimer</Link>
          <Link href="/contact" className="hover:text-teal-600 transition-colors">Contact</Link>
        </div>

      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-ink-950 mb-3">{title}</h2>
      {children}
    </section>
  );
}
