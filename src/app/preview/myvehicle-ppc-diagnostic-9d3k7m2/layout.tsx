import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MyVehicle.ie · PPC Diagnostic Preview',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function DiagnosticPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
