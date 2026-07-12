import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CyberBackground } from "@/components/CyberBackground";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ScanProvider } from "@/contexts/ScanContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScanV — Vulnerability Scanner",
  description: "Understandable security reports for every stakeholder",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative">
        <ThemeProvider>
          <CyberBackground />
          <ScanProvider>
            <div className="relative z-10 flex flex-col flex-1">{children}</div>
          </ScanProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
