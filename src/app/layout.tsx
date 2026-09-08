import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { MockModeBanner } from "@/components/ui/MockModeBanner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExaPrep",
  description: "Platform ujian minimalis berkinerja tinggi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <MockModeBanner />
        {children}
      </body>
    </html>
  );
}
