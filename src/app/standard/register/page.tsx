import Link from "next/link";
import { Reveal } from "@/components/motion/Motion";
import StatusBanner from "@/components/standard/StatusBanner";
import RegisterTable from "./RegisterTable";
import { STANDARDS_REGISTER } from "@/data/standard";

export const metadata = {
  title: "Live Standards Register",
  description:
    "Every standard, method and rule The Clean Sheet relies on, with its current edition, what it covers, how we use it, where it stops being enough, and a link to the official source.",
};

export default function RegisterPage() {
  return (
    <div className="bg-white">
      <section className="max-w-[1200px] mx-auto px-4 md:px-16 pt-8 md:pt-12 pb-8">
        <Reveal>
          <p className="text-[12px] uppercase text-[var(--color-primary)]" style={{ letterSpacing: "0.14em" }}>
            <Link href="/standard" className="hover:underline">The Standard</Link> · Live register
          </p>
          <h1 className="font-display mt-5 text-[40px] md:text-[56px] leading-[1.06] tracking-[-0.02em] text-[var(--color-charcoal)] max-w-3xl">
            The Live Standards Register.
          </h1>
          <p className="mt-6 text-[17px] leading-[1.7] text-[var(--color-warm-gray)] max-w-2xl">
            Here are the {STANDARDS_REGISTER.length} standards, methods and rules we rely on. For
            each one you can see its current edition, what it covers, how we use it, and where it
            stops being enough. It&apos;s a lot more honest than just saying “13 standards referenced.”
          </p>
        </Reveal>
        <div className="mt-8 max-w-3xl">
          <Reveal delay={0.1}><StatusBanner compact /></Reveal>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-16 pb-24">
        <RegisterTable />
        <p className="mt-10 text-[13px] leading-[1.7] text-[var(--color-warm-gray)] max-w-2xl">
          We checked the status of each one on 21 July 2026. Editions change: several of these were
          updated in 2026 and others are being revised. We confirm the official source before every
          certification decision.
        </p>
      </section>
    </div>
  );
}
