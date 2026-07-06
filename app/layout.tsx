import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Doto } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const doto = Doto({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-doto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quickflows ROI Calculator",
  description:
    "See what Quickflows is worth to your operation. A grounded ROI estimate, built from published industry data and kept deliberately conservative.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${doto.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
