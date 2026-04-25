"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import DownloadLeadModal from "./DownloadLeadModal";

type Props = {
  guideName: string;
  guideFile: string;
};

export default function DownloadGuideButton({ guideName, guideFile }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
      >
        <Download size={14} />
        Download PDF
      </button>

      {open && (
        <DownloadLeadModal
          guideName={guideName}
          guideFile={guideFile}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
