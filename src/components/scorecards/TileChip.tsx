"use client";

export type TileChipVariant = "skin" | "routine" | "flag";

interface TileChipProps {
  label: string;
  variant: TileChipVariant;
}

const CHIP_CLASSES: Record<TileChipVariant, string> = {
  skin:    "bg-[#faf7f2] text-[#5a5550] border-[#e8e2d8]",
  routine: "bg-[#e3f1ef] text-[#248179] border-[#c0ddd9]",
  flag:    "bg-[#ffe6e4] text-[#fd6158] border-[#ffd0cc]",
};

export function TileChip({ label, variant }: TileChipProps) {
  return (
    <span
      className={`inline-flex items-center h-6 px-2.5 rounded-full border text-[10px] font-medium leading-none whitespace-nowrap shrink-0 ${CHIP_CLASSES[variant]}`}
    >
      {label}
    </span>
  );
}
