"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  CheckCircle2, Clock, Calendar, Users, BookOpen, Star,
  Shield, FlaskConical, Zap, Sparkles, AlertTriangle
} from "lucide-react";

/* ─── Razorpay Button ─── */
function RazorpayButton({ className }: { className?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    form.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.setAttribute("data-payment_button_id", "pl_SfO9mMsnPFH82u");
    script.async = true;
    form.appendChild(script);
    return () => { form.innerHTML = ""; };
  }, []);
  return <form ref={formRef} className={className} />;
}

/* ─── Data ─── */
const INSTRUCTORS = [
  {
    name: "Neha Kundarap",
    role: "Beauty Innovation & Compliance Expert",
    bio: "A regulatory expert and educator who guides ethical beauty brands from concept to shelf, ensuring products are safe, sustainable, and globally compliant.",
    photo: "/instructors/neha-kundarap.png",
  },
  {
    name: "Saranya Yamunan",
    role: "Formulation Scientist & Skincare Coach",
    bio: "A trusted skincare coach and formulation expert who helps brands create safer, highly effective, and affordable beauty and home products.",
    photo: "/instructors/saranya-yamunan.jpeg",
  },
  {
    name: "Sonal Verma",
    role: "Co-founder, The Clean Sheet",
    bio: "Building India's first verified beauty and personal care ecosystem to ensure what you put on your skin is proven, safe, and uncompromising.",
    photo: "/instructors/sonal-verma.png",
  },
];

const PAIN_POINTS = [
  "You don't know your actual skin type",
  "You can't decode an ingredient label",
  "You're unsure what works vs what's just hype",
  "You keep switching products without results",
];

const OUTCOMES = [
  { icon: Shield,      text: "Identify your true skin type and condition" },
  { icon: BookOpen,    text: "Decode any skincare ingredient label confidently" },
  { icon: Zap,         text: "Build a routine tailored to your skin" },
  { icon: AlertTriangle, text: "Avoid marketing traps and wasted spend" },
  { icon: FlaskConical, text: "Choose products based on logic, not trends" },
];

const MODULES = [
  { num: "01", title: "Understand your skin beyond 'dry or oily'",        arrow: "Learn how your skin actually functions" },
  { num: "02", title: "How skincare products really work",                 arrow: "What makes a product effective or useless" },
  { num: "03", title: "Ingredient decoding simplified",                    arrow: "Read labels without confusion" },
  { num: "04", title: "Build your routine",                                arrow: "Know what to use, when, and why" },
  { num: "05", title: "Common skin concerns",                              arrow: "Acne, pigmentation, sensitivity explained" },
  { num: "06", title: "Sunscreen simplified",                              arrow: "What actually protects your skin" },
  { num: "07", title: "How to choose the right products",                  arrow: "Stop guessing. Start deciding" },
  { num: "08", title: "Clean beauty and certifications",                   arrow: "What is real vs what is marketing" },
  { num: "09", title: "Live Q&A: Bring Your Beauty Bag",                  arrow: "Get your shelf decoded live" },
];

const VALUE_ITEMS = [
  { icon: "🎥", title: "2-Hour Live Session",      sub: "Interactive, not pre-recorded" },
  { icon: "🔬", title: "Real Product Examples",    sub: "Actual formulations decoded" },
  { icon: "📖", title: "Ingredient Frameworks",    sub: "Decode any label instantly" },
  { icon: "📋", title: "Pocket Guide PDF",         sub: "Free, yours to keep forever" },
];

const CHECKLIST = [
  "2-hour live online session",
  "9 science-backed modules",
  "Live Q&A and beauty bag audit",
  "Pocket Guide to Skincare Red Flags (free)",
  "Recording access for 48 hours post-session",
];

/* ─── Page ─── */
export default function Skincare101Page() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Urgency Strip ── */}
      <div className="bg-teal-900 text-white text-center py-2.5 px-4 text-xs sm:text-sm font-medium sticky top-0 z-50">
        <span className="opacity-80 mr-2">26 April 2026 · 12–2 PM IST · Live Online</span>
        <span className="font-bold text-teal-300">Limited slots available →</span>
      </div>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-teal-800 to-teal-950 text-white pt-8 pb-7 px-4 relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-300/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-teal-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-white/10">
            <Sparkles size={12} /> The Clean Sheet™ presents · Skincare 101
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3 tracking-tight text-white">
            Stop wasting money on skincare <span className="text-teal-300">that doesn&apos;t work.</span>
          </h1>
          <p className="text-teal-100 text-base sm:text-lg font-medium mb-2">
            Learn exactly what YOUR skin needs in just 2 hours.
          </p>
          <p className="text-teal-200 text-sm mb-4 leading-relaxed">
            Decode ingredients. Build a routine that works. Avoid 80% of common skincare mistakes.
          </p>

          {/* meta pills */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-xs font-medium mb-4 border border-white/10">
            <span className="w-1.5 h-1.5 bg-teal-300 rounded-full" />
            Live online · 26 April 2026 · 12–2 PM IST
          </div>

          <p className="text-teal-200 text-xs italic mb-3">
            Skip the overpriced serum. Spend ₹299 on knowing exactly why it doesn&apos;t work. ☕
          </p>
          <RazorpayButton className="flex justify-center" />
          <p className="text-teal-300/70 text-xs mt-2">No prior knowledge needed · One-time payment · All inclusive</p>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="border-b border-teal-100 bg-white py-3 px-4">
        <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            { icon: Clock,    label: "2 Hours",   sub: "Live session" },
            { icon: BookOpen, label: "9 Modules",  sub: "No fluff" },
            { icon: Users,    label: "Live Q&A",   sub: "Beauty bag audit" },
            { icon: Star,     label: "₹299",       sub: "All inclusive" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <Icon size={16} className="text-teal-500 mb-0.5" />
              <span className="text-xs font-bold text-ink-900">{label}</span>
              <span className="text-[10px] text-ink-400">{sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Instructors ── */}
      <section className="px-4 py-8 bg-teal-50/40">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-1 text-center">Your instructors</p>
          <h2 className="text-xl sm:text-2xl font-bold text-teal-900 text-center mb-1">
            Learn from people who build skincare for a living.
          </h2>
          <p className="text-ink-400 text-xs text-center mb-6">Not influencers. Scientists, formulators, and compliance experts.</p>
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {INSTRUCTORS.map((inst) => (
              <div key={inst.name} className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg shadow-teal-900/10 mb-3 flex-shrink-0">
                  <Image
                    src={inst.photo}
                    alt={inst.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 80px, 112px"
                  />
                </div>
                <p className="font-bold text-ink-900 text-xs sm:text-sm mb-0.5 leading-tight">{inst.name}</p>
                <p className="text-[10px] sm:text-xs text-teal-600 font-semibold mb-1 leading-tight">{inst.role}</p>
                <p className="hidden sm:block text-xs text-ink-500 leading-relaxed">{inst.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="px-4 py-10 bg-teal-950 text-white">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-4">Sound familiar?</p>
          <p className="text-xl sm:text-2xl font-bold leading-relaxed mb-8">
            You&apos;ve tried products. Followed routines. Watched endless videos.<br />
            <span className="text-teal-300">But still…</span>
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {PAIN_POINTS.map((p) => (
              <div key={p} className="flex items-start gap-3 bg-white/5 border-l-4 border-teal-400 rounded-r-2xl px-4 py-4">
                <span className="text-teal-400 font-black text-lg leading-none mt-0.5">✕</span>
                <p className="text-sm text-white/90">{p}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-2xl font-black text-teal-300">This class fixes that.</p>
        </div>
      </section>

      {/* ── Did You Know ── */}
      <section className="px-4 py-8 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="bg-teal-900 rounded-3xl p-5 sm:p-8 text-white">
            <p className="text-xs font-bold text-teal-300 uppercase tracking-widest mb-4">Did You Know?</p>
            <p className="text-lg sm:text-xl font-semibold leading-relaxed mb-4">
              &ldquo;Toxin-free&rdquo;, &ldquo;natural&rdquo;, and &ldquo;clean&rdquo; claims in India are{" "}
              <span className="text-teal-300">not regulated by any government body.</span>
            </p>
            <p className="text-teal-200 text-sm leading-relaxed">
              A brand can print them on packaging with zero proof. In this session, we teach you exactly how to look past the label and see the truth. This is why The Clean Sheet™ exists.
            </p>
          </div>
        </div>
      </section>

      {/* ── Outcomes ── */}
      <section className="px-4 py-10 bg-teal-50/40">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-2 text-center">What you walk away with</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-teal-900 text-center mb-2">Clear outcomes. Not just information.</h2>
          <p className="text-ink-400 text-sm text-center mb-8">After this session, you will be able to:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {OUTCOMES.map(({ icon: Icon, text }, i) => (
              <div
                key={text}
                className={`flex items-start gap-4 bg-white rounded-2xl border border-teal-100 p-4 shadow-sm hover:border-teal-300 hover:shadow-md transition-all${i === OUTCOMES.length - 1 && OUTCOMES.length % 2 !== 0 ? " sm:col-span-2 sm:max-w-sm sm:mx-auto" : ""}`}
              >
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-teal-600" />
                </div>
                <p className="text-sm font-semibold text-ink-800 leading-snug mt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modules ── */}
      <section className="px-4 py-10 bg-white">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-2 text-center">What you will learn</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink-950 text-center mb-2">9 modules. 2 hours. A lifetime of clarity.</h2>
          <p className="text-ink-400 text-sm text-center mb-8">Every module is designed for real-world application.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {MODULES.map((mod) => (
              <div
                key={mod.num}
                className="bg-white border border-teal-100 rounded-2xl p-5 hover:border-teal-300 hover:shadow-md transition-all group"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-500 mb-2">Module {mod.num}</p>
                <h3 className="text-sm font-bold text-ink-900 mb-2 leading-snug">{mod.title}</h3>
                <p className="text-xs text-ink-400 flex items-center gap-1.5">
                  <span className="text-teal-500 font-bold">→</span>
                  {mod.arrow}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Beauty Bag ── */}
      <section className="px-4 py-10 bg-teal-50/40">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-teal-700 to-teal-950 rounded-3xl p-6 sm:p-10 text-white text-center">
            <p className="text-4xl mb-4">👜</p>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-3">Module 09 · Live Session</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Bring Your Beauty Bag to Class.</h3>
            <p className="text-white text-sm leading-relaxed max-w-md mx-auto">
              This isn&apos;t a lecture. Show us what&apos;s on your shelf and we decode it live: ingredients, claims, and all. Get your routine audited by people who actually build skincare for a living.
            </p>
          </div>
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="px-4 py-10 bg-white">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-2 text-center">Everything you get</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink-950 text-center mb-8">This is not just a class.</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {VALUE_ITEMS.map((v) => (
              <div key={v.title} className="bg-teal-50 border border-teal-100 rounded-2xl p-5 text-center">
                <p className="text-3xl mb-2">{v.icon}</p>
                <p className="text-xs font-bold text-ink-900 mb-1">{v.title}</p>
                <p className="text-[11px] text-ink-400">{v.sub}</p>
              </div>
            ))}
          </div>
          {/* Bonus */}
          <div className="bg-teal-50 rounded-2xl border border-teal-200 p-5">
            <div className="flex items-start gap-4">
              <div className="text-2xl flex-shrink-0">📋</div>
              <div>
                <p className="text-[10px] font-bold text-teal-500 uppercase tracking-widest mb-1">Bonus: Free with Registration</p>
                <p className="font-bold text-ink-900 text-sm mb-1">The Pocket Guide to Skincare Red Flags</p>
                <p className="text-xs text-ink-500 leading-relaxed">Your cheat sheet for every Nykaa visit: ingredient red flags, misleading claims, formulation loopholes. Yours to keep forever.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing + Final CTA ── */}
      <section className="px-4 py-16 bg-gradient-to-br from-teal-800 to-teal-950 text-white">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs font-bold text-teal-300 uppercase tracking-widest mb-3">One decision. A lifetime of clarity.</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            Your skin. Finally understood.
          </h2>
          <p className="text-teal-200 text-base mb-10 leading-relaxed">
            2 hours with people who actually build skincare for a living.
          </p>

          <div className="bg-white rounded-3xl p-6 sm:p-8 text-left shadow-2xl shadow-teal-950/40">
            <div className="text-center mb-6">
              <p className="text-5xl font-black text-teal-700 mb-1">₹299</p>
              <p className="text-ink-400 text-sm">One-time · No hidden fees · All inclusive</p>
            </div>
            <div className="space-y-2.5 mb-7">
              {CHECKLIST.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-ink-700 py-2 border-b border-teal-50 last:border-0">
                  <CheckCircle2 size={16} className="text-teal-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <p className="text-sm text-ink-500 italic text-center mb-5">Less than your last impulse buy at Nykaa. Just saying. ☕</p>
            <RazorpayButton className="flex justify-center" />
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-4 text-xs text-ink-400">
              <span className="flex items-center gap-1"><Calendar size={11} /> 26 April 2026</span>
              <span className="flex items-center gap-1"><Clock size={11} /> 12–2 PM IST</span>
              <span className="flex items-center gap-1"><Users size={11} /> Limited slots</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t border-teal-100 px-4 py-3 shadow-xl z-40 flex justify-center">
        <RazorpayButton />
      </div>
      <div className="h-20 sm:h-0" />
    </div>
  );
}
