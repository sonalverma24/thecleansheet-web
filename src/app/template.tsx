"use client";
import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // A link to a #section (the header menus' Community items) is scrolled to by
    // the router or the browser before this runs; resetting here would undo it.
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, []);

  return <>{children}</>;
}
