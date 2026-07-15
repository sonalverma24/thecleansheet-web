import { ArrowRight } from "lucide-react";

export function ClaimsVerifyButton() {
  return (
    <a
      href="https://forms.gle/h43vNq13BSS4baa77"
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center justify-center gap-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3.5 sm:px-7 sm:py-4 rounded-2xl text-sm sm:text-base transition-all hover:shadow-2xl hover:shadow-teal-600/30 active:scale-[0.97]"
    >
      Get your claims verified today
      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
    </a>
  );
}
