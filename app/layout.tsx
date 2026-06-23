import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import FullscreenLoader from "./components/Loading"; // 1. Import the loader
import { Toaster } from "react-hot-toast";
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from "../utils/WishlistContext";
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
        {/* 2. Add the Loader here at the root level */}
        <FullscreenLoader /> 
        
        <Toaster position="top-left" reverseOrder={false} />
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            <WishlistProvider>
              <Navbar />
              {children}
            </WishlistProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}