import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // ✨ 1. Imported the Footer
import FullscreenLoader from "./components/Loading"; 
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
      <body className={`${fraunces.variable} ${inter.variable} font-body bg-cream text-ink antialiased flex flex-col min-h-screen justify-between`}>
        {/* Added flex utilities to body so the footer stays pinned to the bottom on short pages */}
        <div className="flex-grow flex flex-col">
          <FullscreenLoader /> 
          
          <Toaster position="top-left" reverseOrder={false} />
          <GoogleOAuthProvider clientId={googleClientId}>
            <AuthProvider>
              <WishlistProvider>
                <Navbar />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer /> {/* ✨ 2. Added Footer here at the bottom of the content stack */}
              </WishlistProvider>
            </AuthProvider>
          </GoogleOAuthProvider>
        </div>
      </body>
    </html>
  );
}