import Link from "next/link";
import { Calendar, Clock, Users, Star } from "lucide-react";

export const metadata = {
  title: "Courses | The Clean Sheet™",
  description: "Learn the science of skincare with expert-led courses from The Clean Sheet.",
};

export default function CoursesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <p className="text-teal-600 font-medium text-sm uppercase tracking-widest mb-3">The Clean Sheet</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Courses
          </h1>
          <p className="text-lg text-ink-500 max-w-xl">
            Expert-led, science-backed sessions to help you understand your skin and make smarter choices.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">

          {/* Skincare 101 Card — ended, greyed out */}
          <div className="relative rounded-3xl border border-ink-100 bg-ink-50 overflow-hidden opacity-70">

            {/* Rating badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-yellow-400 text-ink-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
              <Star size={11} className="fill-ink-900" />
              4.75 / 5
            </div>

            {/* Ended ribbon */}
            <div className="absolute top-4 left-4 bg-ink-400 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full z-10">
              Ended
            </div>

            <div className="p-7 pt-14">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-ink-100 text-ink-400 text-xs font-semibold px-3 py-1 rounded-full">
                  Live Online
                </span>
                <span className="inline-flex items-center gap-1.5 bg-ink-100 text-ink-400 text-xs font-semibold px-3 py-1 rounded-full">
                  ₹299
                </span>
              </div>

              <h2 className="text-2xl font-bold text-ink-400 mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Skincare 101
                <span className="block text-base font-normal text-ink-400 mt-0.5">The Science Session</span>
              </h2>

              <p className="text-ink-400 text-sm mb-6">
                Stop guessing. Learn the science behind your skin: ingredients, routines, and what actually works.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-ink-400">
                  <Calendar size={14} className="text-ink-300 shrink-0" />
                  <span>26 April 2026</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-400">
                  <Clock size={14} className="text-ink-300 shrink-0" />
                  <span>12–2 PM IST (2 hours)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-400">
                  <Users size={14} className="text-ink-300 shrink-0" />
                  <span>Session completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Card */}
          <div className="relative rounded-3xl border-2 border-dashed border-teal-200 bg-teal-50/40 overflow-hidden flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mb-4">
              <span className="text-teal-600 text-xl font-bold">+</span>
            </div>
            <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-2">Next Course</p>
            <h2 className="text-xl font-bold text-ink-700 mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Coming Soon
            </h2>
            <p className="text-sm text-ink-400 max-w-xs leading-relaxed">
              Something new is in the works. Stay tuned for the next session from The Clean Sheet™.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
