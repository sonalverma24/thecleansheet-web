"use client";

import { useEffect } from "react";
import { captureAcquisition } from "@/lib/acquisition";

/** Runs on the first browser page of a visit, not on every internal link. */
export default function AcquisitionTracker() {
  useEffect(() => { captureAcquisition(); }, []);
  return null;
}
