import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | The Clean Sheet™",
  description: "Privacy Policy for The Clean Sheet™: how we collect, use, and protect your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">

        <div className="mb-12">
          <p className="text-teal-600 text-xs font-normal uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-medium text-ink-950 tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-ink-400 text-sm">Last updated: April 2026 &nbsp;·&nbsp; Effective: April 2026</p>
        </div>

        <div className="prose prose-sm max-w-none text-ink-700 leading-relaxed space-y-8">

          <section>
            <p>
              The Clean Sheet™ (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the website{" "}
              <a href="https://thecleansheet.in" className="text-teal-600 hover:underline">thecleansheet.in</a>{" "}
              and related services. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you visit our website or use our services, including the Ask Clean AI
              analyser. Please read this carefully.
            </p>
            <p className="mt-3">
              This policy is compliant with India&apos;s <strong>Digital Personal Data Protection Act, 2023 (DPDPA)</strong>,
              the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal
              Data or Information) Rules, 2011</strong>, and is aligned with the EU <strong>General Data Protection
              Regulation (GDPR)</strong> where applicable.
            </p>
          </section>

          <Section title="1. Information We Collect">
            <p>We may collect the following categories of personal data:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5">
              <li><strong>Usage Data:</strong> IP address, browser type, pages visited, time spent, referring URLs, and device identifiers, collected automatically via server logs and analytics.</li>
              <li><strong>Query Data:</strong> Product names, ingredient lists, or questions you submit to the Ask Clean analyser. These are processed to generate responses and are not stored long-term.</li>
              <li><strong>Communication Data:</strong> Name, email address, and message content when you contact us via email or forms.</li>
              <li><strong>Brand/Business Data:</strong> Company name, contact details, and product information submitted by brands applying for certification.</li>
            </ul>
            <p className="mt-3">We do not knowingly collect data from children under the age of 18.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To operate, maintain, and improve the website and Ask Clean analyser</li>
              <li>To respond to enquiries, support requests, and certification applications</li>
              <li>To analyse usage patterns and improve user experience</li>
              <li>To send transactional communications (e.g. application confirmations)</li>
              <li>To comply with legal obligations under Indian law</li>
              <li>To detect and prevent fraud, abuse, or security incidents</li>
            </ul>
            <p className="mt-3">
              We process your data on the legal bases of <strong>legitimate interests</strong>, <strong>contract performance</strong>,
              and <strong>legal compliance</strong>. Where required by law, we will seek your <strong>consent</strong>.
            </p>
          </Section>

          <Section title="3. Data Sharing and Disclosure">
            <p>We do not sell, rent, or trade your personal data. We may share data with:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5">
              <li><strong>Service Providers:</strong> Hosting, analytics, email, and AI infrastructure providers who process data on our behalf under data processing agreements.</li>
              <li><strong>Legal Authorities:</strong> When required by Indian law, court order, or to protect our legal rights.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, with appropriate notice.</li>
            </ul>
            <p className="mt-3">Any third-party processors are contractually bound to process data only on our instructions.</p>
          </Section>

          <Section title="4. Cookies and Tracking">
            <p>
              We use essential cookies necessary for the website to function. We may use analytics cookies
              (e.g. Google Analytics) to understand traffic patterns. You may disable cookies through your
              browser settings, though this may affect functionality.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain personal data only for as long as necessary for the purpose it was collected, or as
              required by applicable law. Query data submitted to the Ask Clean analyser is not retained beyond
              the session. Contact and application data is retained for up to 3 years or as required for
              certification records.
            </p>
          </Section>

          <Section title="6. Data Security">
            <p>
              We implement reasonable technical and organisational measures to protect your data against
              unauthorised access, loss, or disclosure, in accordance with the IT (SPDI) Rules 2011. However,
              no transmission over the internet is 100% secure.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>Depending on applicable law, you have the right to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1.5">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request erasure of your data (right to be forgotten)</li>
              <li>Withdraw consent at any time (where processing is consent-based)</li>
              <li>Lodge a complaint with the Data Protection Board of India (under DPDPA 2023)</li>
            </ul>
            <p className="mt-3">
              To exercise your rights, contact us at{" "}
              <a href="mailto:hello@thecleansheet.in" className="text-teal-600 hover:underline">hello@thecleansheet.in</a>.
            </p>
          </Section>

          <Section title="8. International Data Transfers">
            <p>
              Our AI infrastructure may involve processing on servers outside India. Where data is transferred
              internationally, we ensure appropriate safeguards are in place consistent with DPDPA 2023 and
              applicable cross-border data transfer requirements.
            </p>
          </Section>

          <Section title="9. Third-Party Links">
            <p>
              Our website may link to external sites (e.g. Nykaa, Amazon). We are not responsible for the
              privacy practices of those sites. Please review their privacy policies independently.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Material changes will be notified via
              a notice on our website. Continued use of the website after changes constitutes acceptance.
            </p>
          </Section>

          <Section title="11. Contact: Data Grievance Officer">
            <p>For any privacy-related queries or grievances (as required under DPDPA 2023 and IT Rules 2011):</p>
            <div className="mt-3 bg-teal-50 border border-teal-100 rounded-2xl p-5 text-sm space-y-1">
              <p className="font-normal text-ink-950">The Clean Sheet™</p>
              <p>Email: <a href="mailto:hello@thecleansheet.in" className="text-teal-600 hover:underline">hello@thecleansheet.in</a></p>
              <p>Phone: <a href="tel:+919704443566" className="text-teal-600 hover:underline">+91-9704443566</a></p>
              <p>Website: <a href="https://thecleansheet.in" className="text-teal-600 hover:underline">thecleansheet.in</a></p>
            </div>
          </Section>

        </div>

        <div className="mt-16 pt-8 border-t border-ink-100 flex flex-col sm:flex-row gap-4 text-sm text-ink-400">
          <Link href="/terms-of-use" className="hover:text-teal-600 transition-colors">Terms of Use</Link>
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
      <h2 className="text-lg font-medium text-ink-950 mb-3">{title}</h2>
      {children}
    </section>
  );
}
