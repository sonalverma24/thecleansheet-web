import type { Metadata } from "next";
import { Navigation } from "@/components/layout/Navigation";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Clean Sheet App",
  description: "Decode. Decide. Do Better.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col antialiased">
        <Navigation />
        <main className="flex-1 w-full mx-auto pb-24 md:pb-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
