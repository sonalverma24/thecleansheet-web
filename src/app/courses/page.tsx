import Link from "next/link";
import { ArrowRight, Calendar, Clock, Users } from "lucide-react";

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
          {/* Skincare 101 Card */}
          <Link
            href="/courses/skincare-101"
            className="group relative rounded-3xl border border-ink-100 bg-white hover:border-teal-200 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 overflow-hidden"
          >
            <div className="p-7">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-coral-50 text-coral-600 text-xs font-semibold px-3 py-1 rounded-full">
                  Live Online
                </span>
                <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full">
                  ₹299
                </span>
              </div>

              <h2 className="text-2xl font-bold text-ink-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Skincare 101
                <span className="block text-base font-normal text-ink-500 mt-0.5">The Science Session</span>
              </h2>

              <p className="text-ink-500 text-sm mb-6">
                Stop guessing. Learn the science behind your skin: ingredients, routines, and what actually works.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-ink-500">
                  <Calendar size={14} className="text-teal-500 shrink-0" />
                  <span>26 April 2026</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-500">
                  <Clock size={14} className="text-teal-500 shrink-0" />
                  <span>12–2 PM IST (2 hours)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-500">
                  <Users size={14} className="text-teal-500 shrink-0" />
                  <span>Limited slots available</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-teal-600 font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                View Course <ArrowRight size={15} />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-coral-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </div>
      </div>
    </main>
  );
}
