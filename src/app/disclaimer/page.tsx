import Link from "next/link";
import BackButton from "@/components/BackButton";

export const metadata = {
  title: "Disclaimer | The Clean Sheet™",
  description: "Disclaimer for The Clean Sheet™: scope and limitations of our analysis, scores, and certifications.",
};

export default function DisclaimerPage() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="mb-12">
          <p className="text-teal-600 text-xs font-normal uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-medium text-ink-950 tracking-tight mb-4">Disclaimer</h1>
          <p className="text-ink-400 text-sm">Last updated: April 2026 &nbsp;·&nbsp; Effective: April 2026</p>
        </div>

        <div className="prose prose-sm max-w-none text-ink-700 leading-relaxed space-y-8">

          <section>
            <p>
              The Clean Sheet™ provides ingredient analysis, product scoring, and certification services for
              informational and consumer transparency purposes. By using this website or any of our services,
              you acknowledge and agree to the following disclaimers.
            </p>
          </section>

          <Section title="1. Not Medical or Dermatological Advice">
            <p>
              Nothing on this Platform constitutes medical advice, dermatological advice, or a substitute for
              professional consultation. Product scores, ingredient flags, and safety assessments are based on
              publicly available regulatory data, peer-reviewed literature, and our proprietary framework.
              They are <strong>not clinical recommendations</strong>.
            </p>
            <p className="mt-3">
              If you have a skin condition, allergy, pregnancy concern, or medical question, please consult a
              qualified dermatologist or healthcare professional. The Clean Sheet™ expressly disclaims any
              liability for health outcomes resulting from reliance on our content.
            </p>
          </Section>

          <Section title="2. Accuracy of Information">
            <p>
              We strive for accuracy, but cannot guarantee that all product information, INCI lists, prices,
              or regulatory citations are complete, current, or error-free. Product formulations change without
              public notice. INCI lists sourced from retailer listings may lag behind actual product composition.
            </p>
            <p className="mt-3">
              Scores and analyses represent our independent assessment at a point in time and may not reflect
              subsequent reformulations, regulatory updates, or new scientific evidence.
            </p>
          </Section>

          <Section title="3. Ask Clean: AI Analyser">
            <p>
              The Ask Clean AI analyser uses large language model technology and is subject to the inherent
              limitations of AI, including occasional inaccuracies, hallucinations, or outdated information.
              Outputs should be treated as a starting point for research, not as definitive conclusions.
            </p>
            <p className="mt-3">
              The Clean Sheet™ is not liable for decisions made based on Ask Clean outputs.
            </p>
          </Section>

          <Section title="4. Certification Scope">
            <p>
              The Clean Sheet™ Certified badge applies only to the specific product(s) submitted for evaluation
              under the version of the scoring framework in effect at the time of certification. It does not
              imply endorsement of the brand, its other products, its marketing claims, or its business practices.
            </p>
            <p className="mt-3">
              Certification is based on publicly available or brand-submitted ingredient data and does not
              involve independent laboratory testing of the physical product unless explicitly stated.
            </p>
          </Section>

          <Section title="5. No Brand Affiliation">
            <p>
              The Clean Sheet™ is editorially independent. We do not accept paid placements, sponsored scores,
              or brand advertising that influences analysis outcomes. Brands pay only for certification evaluation
              services, not for favourable scores. References to brands and products are for consumer information
              only and do not constitute endorsement.
            </p>
          </Section>

          <Section title="6. Regulatory References">
            <p>
              References to regulations (EU Cosmetics Regulation 1223/2009, India Cosmetics Rules 2020, CDSCO
              guidelines, IFRA standards, CIR database, etc.) are for informational context only. We are not
              a regulatory authority. Our assessments are independent and do not represent the position of any
              government body or regulatory agency.
            </p>
          </Section>

          <Section title="7. External Links">
            <p>
              The Platform may contain links to external websites including retailers, brand pages, and research
              databases. These links are provided for convenience. The Clean Sheet™ has no control over external
              content and accepts no responsibility for it.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              To the maximum extent permitted under applicable Indian law, The Clean Sheet™, its founders,
              employees, and agents shall not be liable for any direct, indirect, incidental, or consequential
              loss or damage arising from use of or reliance on the Platform, its content, or its tools.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>If you have questions about this disclaimer:</p>
            <div className="mt-3 bg-teal-50 border border-teal-100 rounded-2xl p-5 text-sm space-y-1">
              <p className="font-normal text-ink-950">The Clean Sheet™</p>
              <p>Email: <a href="mailto:hello@thecleansheet.in" className="text-teal-600 hover:underline">hello@thecleansheet.in</a></p>
              <p>Phone: <a href="tel:+919704443566" className="text-teal-600 hover:underline">+91-9704443566</a></p>
            </div>
          </Section>

        </div>

        <div className="mt-16 pt-8 border-t border-ink-100 flex flex-col sm:flex-row gap-4 text-sm text-ink-400">
          <Link href="/privacy-policy" className="hover:text-teal-600 transition-colors">Privacy Policy</Link>
          <Link href="/terms-of-use" className="hover:text-teal-600 transition-colors">Terms of Use</Link>
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
