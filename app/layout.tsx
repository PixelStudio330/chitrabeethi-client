import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "চিত্রবীথি | Discover & Buy Original Art",
  description:
    "An online art marketplace connecting buyers with independent painters, illustrators, and sculptors.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* ADDED bg-cream AND text-ink HERE TO POWER THE WHOLE SITE BACKGROUND */}
      <body className={`${fraunces.variable} ${inter.variable} font-body bg-cream text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}