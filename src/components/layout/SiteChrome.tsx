'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import WhatsAppBubble from '@/components/WhatsAppBubble';
import FormModal from '@/components/FormModal';

/* Wraps page content with the site's global chrome (nav, footer, bubbles).
   On standalone routes (e.g. private client previews under /preview/*) the
   chrome is suppressed so the page renders clean, without Clean Sheet
   branding. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone = pathname?.startsWith('/preview/') ?? false;

  if (standalone) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Navigation />
      {/* pb-16 on mobile reserves space for the fixed bottom nav */}
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <WhatsAppBubble />
      <FormModal />
      <MobileBottomNav />
    </>
  );
}
