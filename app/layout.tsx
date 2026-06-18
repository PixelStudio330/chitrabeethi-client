import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

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

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable} font-body bg-cream text-ink antialiased`}>
        {/* The global toaster */}
        <Toaster position="top-center" reverseOrder={false} />
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}