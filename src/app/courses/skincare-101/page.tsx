"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ChevronDown, ChevronUp, CheckCircle2, Clock, Calendar,
  Users, Zap, BookOpen, Star, Shield, FlaskConical, Sparkles
} from "lucide-react";

function RazorpayButton({ className }: { className?: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    // Clear any previous instance before injecting
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

const MODULES = [
  { tag: "Foundation", title: "Understanding Your Skin", desc: "Skin types vs conditions, barrier function, sebum regulation, hydration, and inflammation — including what's specific to Indian skin." },
  { tag: "Foundation", title: "How Skincare Products Actually Work", desc: "Delivery systems, actives vs base ingredients, penetration vs surface action, wash-off vs leave-on logic." },
  { tag: "Application", title: "Ingredient Decoding", desc: "INCI list basics, ingredient order and the 1% line, hero vs marketing ingredients, and how to spot red flags." },
  { tag: "Application", title: "Building an Effective Routine", desc: "The 4-step system: Cleanser, Treatment, Moisturiser, Sunscreen. Layering rules, AM vs PM, and the case for minimalism." },
  { tag: "Foundation", title: "Common Skin Concerns", desc: "Root causes of acne, pigmentation, dryness, and sensitivity — and how to address each with the right ingredients." },
  { tag: "Application", title: "Sunscreen Simplified", desc: "SPF vs PA ratings, chemical vs physical filters, correct application amounts, reapplication, and real-world usage tips." },
  { tag: "Application", title: "Choosing the Right Products", desc: "A practical checklist: matching products to skin needs, ingredient relevance, formulation quality, and brand transparency." },
  { tag: "Foundation", title: "Clean Beauty and Certifications Explained", desc: 'What "clean", "natural", and "toxin-free" actually mean. India\'s regulatory gap and how certifications create real accountability.' },
  { tag: "Live Session", title: "Live Q&A and Case Discussions", desc: "Decode real products from your shelf. Get your routine audited. Ask anything — answered by people who actually build skincare." },
];

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

const OUTCOMES = [
  { icon: Shield, text: "Know your skin type and what it actually needs" },
  { icon: BookOpen, text: "Read and decode any product label confidently" },
  { icon: Zap, text: "Build a routine that actually works for your skin" },
  { icon: FlaskConical, text: "Spot marketing claims that mean absolutely nothing" },
];

const AUDIENCE = [
  { label: "New to skincare", desc: "Don't know where to start" },
  { label: "Ingredient-curious", desc: "Want to understand what you're applying" },
  { label: "Overwhelmed by choices", desc: "Tired of trial and error" },
  { label: "Early-intermediate", desc: "Have a routine but want to optimise it" },
];

function ModuleRow({ mod, index }: { mod: typeof MODULES[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const tagStyles: Record<string, string> = {
    "Foundation": "bg-teal-50 text-teal-700 border-teal-200",
    "Application": "bg-sky-50 text-sky-700 border-sky-200",
    "Live Session": "bg-coral-50 text-coral-600 border-coral-200",
  };
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left border-b border-teal-50 last:border-0 py-4 px-1 hover:bg-teal-50/40 transition-colors rounded-lg"
    >
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagStyles[mod.tag] ?? "bg-teal-50 text-teal-700 border-teal-200"}`}>
              {mod.tag}
            </span>
          </div>
          <p className="text-sm font-semibold text-ink-900">{mod.title}</p>
          {open && <p className="text-xs text-ink-500 leading-relaxed mt-1.5">{mod.desc}</p>}
        </div>
        <span className="flex-shrink-0 text-ink-400 mt-0.5">
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </div>
    </button>
  );
}

export default function Skincare101Page() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Urgency Strip ── */}
      <div className="bg-teal-900 text-white text-center py-2.5 px-4 text-xs sm:text-sm font-medium sticky top-0 z-50">
        <span className="opacity-80 mr-2">26 April 2026 · 12–2 PM IST · Live Online</span>
        <span className="font-bold text-teal-300">Limited slots available →</span>
      </div>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-teal-50/60 to-white pt-12 pb-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
            <Sparkles size={12} /> The Clean Sheet™ presents
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-ink-950 leading-tight mb-4">
            Stop Guessing.<br />Start Understanding<br className="hidden sm:block" /> Your Skin.
          </h1>
          <p className="text-ink-500 text-base sm:text-lg max-w-lg mx-auto leading-relaxed mb-8">
            One 2-hour live session. 9 science-backed modules. Everything you need to read labels, decode ingredients, and build a routine that actually works.
          </p>
          <p className="text-sm text-ink-600 italic mb-3">
            Skip the overpriced serum. Spend ₹299 on knowing exactly why it doesn&apos;t work. ☕
          </p>
          <RazorpayButton className="flex justify-center" />
          <p className="text-xs text-ink-400 mt-3">No prior knowledge needed · One-time payment · All inclusive</p>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="border-y border-teal-100 bg-white py-5 px-4">
        <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { icon: Clock, label: "2 Hours", sub: "Live session" },
            { icon: BookOpen, label: "9 Modules", sub: "No fluff" },
            { icon: Users, label: "Live Q&A", sub: "Beauty bag audit" },
            { icon: Star, label: "₹299", sub: "All inclusive" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon size={18} className="text-teal-500 mb-0.5" />
              <span className="text-sm font-bold text-ink-900">{label}</span>
              <span className="text-xs text-ink-400">{sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Instructors ── */}
      <section className="px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-2 text-center">Your instructors</p>
          <h2 className="text-2xl font-bold text-ink-950 text-center mb-2">Learn from people who build skincare for a living.</h2>
          <p className="text-ink-400 text-sm text-center mb-8">Not influencers. Scientists, formulators, and compliance experts.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {INSTRUCTORS.map((inst) => (
              <div key={inst.name} className="bg-white rounded-3xl border border-teal-100 overflow-hidden shadow-sm flex flex-col">
                <div className="relative w-full aspect-square bg-teal-50">
                  <Image
                    src={inst.photo}
                    alt={inst.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
                <div className="p-4 flex-1">
                  <p className="font-bold text-ink-900 text-sm mb-0.5">{inst.name}</p>
                  <p className="text-xs text-teal-600 font-semibold mb-2">{inst.role}</p>
                  <p className="text-xs text-ink-500 leading-relaxed">{inst.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hook ── */}
      <section className="px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-teal-900 rounded-3xl p-7 sm:p-10 text-white">
            <p className="text-xs font-bold text-teal-300 uppercase tracking-widest mb-4">Did You Know?</p>
            <p className="text-lg sm:text-xl font-semibold leading-relaxed mb-4">
              "Toxin-free", "natural", and "clean" claims in India are <span className="text-teal-300">not regulated by any government body.</span>
            </p>
            <p className="text-teal-200 text-sm leading-relaxed">
              A brand can print them on packaging with zero proof. In this session, we teach you exactly how to look past the label and see the truth. This is why The Clean Sheet™ exists.
            </p>
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-2 text-center">Who this is for</p>
          <h2 className="text-2xl font-bold text-ink-950 text-center mb-8">Built for the curious beginner.</h2>
          <div className="grid grid-cols-2 gap-3">
            {AUDIENCE.map((a) => (
              <div key={a.label} className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
                <CheckCircle2 size={15} className="text-teal-500 mb-2" />
                <p className="text-sm font-bold text-ink-900 mb-0.5">{a.label}</p>
                <p className="text-xs text-ink-500">{a.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-ink-400 mt-4">No prior knowledge needed. Just a desire to understand your skin.</p>
        </div>
      </section>

      {/* ── Outcomes ── */}
      <section className="px-4 pb-12 bg-teal-50/40 py-12">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-2 text-center">What you'll walk away with</p>
          <h2 className="text-2xl font-bold text-ink-950 text-center mb-8">Clarity, not more confusion.</h2>
          <div className="space-y-3">
            {OUTCOMES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4 bg-white rounded-2xl border border-teal-100 p-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-teal-600" />
                </div>
                <p className="text-sm font-semibold text-ink-800">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Curriculum ── */}
      <section className="px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-2 text-center">Course structure</p>
          <h2 className="text-2xl font-bold text-ink-950 text-center mb-2">9 modules. 2 hours. No fluff.</h2>
          <p className="text-ink-400 text-sm text-center mb-8">Tap any module to see what's covered.</p>
          <div className="bg-white rounded-3xl border border-teal-100 shadow-sm px-4 py-2">
            {MODULES.map((mod, i) => (
              <ModuleRow key={i} mod={mod} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Beauty Bag ── */}
      <section className="px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-teal-700 to-teal-900 rounded-3xl p-7 sm:p-10 text-white text-center">
            <p className="text-4xl mb-4">👜</p>
            <p className="text-xs font-bold text-teal-300 uppercase tracking-widest mb-3">Module 09 · Live Session</p>
            <h3 className="text-xl sm:text-2xl font-bold mb-3">Bring Your Beauty Bag to Class.</h3>
            <p className="text-teal-100 text-sm leading-relaxed max-w-md mx-auto">
              This isn't a lecture. Show us what's on your shelf and we decode it live — ingredients, claims, and all. Get your routine audited by people who actually build skincare for a living.
            </p>
          </div>
        </div>
      </section>

      {/* ── Bonus ── */}
      <section className="px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-2 text-center">Bonus — Free with Registration</p>
          <h2 className="text-2xl font-bold text-ink-950 text-center mb-8">Register today and get instant access.</h2>
          <div className="bg-white rounded-3xl border-2 border-teal-200 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">📋</div>
              <div>
                <p className="font-bold text-ink-900 mb-1">The Pocket Guide to Skincare Red Flags</p>
                <p className="text-sm text-ink-500 leading-relaxed">
                  The cheat sheet to take with you every time you shop at Nykaa or the pharmacy. Covers ingredient red flags, misleading claims, and formulation loopholes.
                </p>
                <p className="text-xs text-teal-600 font-semibold mt-2">Free with every registration. Yours to keep forever.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="px-4 pb-12 bg-teal-50/40 py-12">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-2 text-center">Pricing</p>
          <h2 className="text-2xl font-bold text-ink-950 text-center mb-8">One price. Everything included.</h2>
          <div className="bg-white rounded-3xl border-2 border-teal-300 p-7 shadow-lg shadow-teal-900/5 text-center">
            <div className="h-1.5 bg-gradient-to-r from-teal-400 via-teal-600 to-teal-800 rounded-full mb-6 -mx-7 -mt-7" />
            <p className="text-5xl font-black text-teal-700 mb-1">₹299</p>
            <p className="text-ink-400 text-sm mb-6">One-time · No hidden fees · All inclusive</p>
            <div className="space-y-2 mb-7 text-left">
              {[
                "2-hour live online session",
                "9 science-backed modules",
                "Live Q&A and beauty bag audit",
                "Pocket Guide to Skincare Red Flags (free)",
                "Recording access (48 hours post-session)",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-ink-700">
                  <CheckCircle2 size={15} className="text-teal-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <p className="text-sm text-ink-700 italic mb-3">Less than your last impulse buy at Nykaa. Just saying. ☕</p>
            <RazorpayButton className="flex justify-center" />
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-ink-400">
              <span className="flex items-center gap-1"><Calendar size={11} /> 26 April 2026</span>
              <span className="flex items-center gap-1"><Clock size={11} /> 12–2 PM IST</span>
              <span className="flex items-center gap-1"><Users size={11} /> Limited slots</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-4 py-14 text-center">
        <div className="max-w-lg mx-auto">
          <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-3">Ready to stop guessing?</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink-950 mb-4">
            Your skin deserves more than marketing claims.
          </h2>
          <p className="text-ink-500 text-sm mb-8 leading-relaxed">
            Join us on 26 April and walk away with the science to make confident, informed choices about every product you buy.
          </p>
          <RazorpayButton className="flex justify-center" />
          <p className="text-xs text-ink-400 mt-3">₹299 · 26 April · 12–2 PM IST · Live Online</p>
        </div>
      </section>

      {/* ── Mobile sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t border-teal-100 px-4 py-3 shadow-xl z-40 flex justify-center">
        <RazorpayButton />
      </div>

      {/* Bottom padding for mobile sticky CTA */}
      <div className="h-20 sm:h-0" />
    </div>
  );
}
