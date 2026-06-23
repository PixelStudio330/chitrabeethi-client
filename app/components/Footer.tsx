"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 4000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#3D2B1F] text-[#FDFBF7] overflow-hidden border-t border-[#8A9A5B]/20 pt-16 pb-8 selection:bg-[#8A9A5B] selection:text-[#FDFBF7]">
      {/* Background Subtle Art Textures / Overlays */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#8A9A5B_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Section: Brand Statement & Newsletter Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-[#FDFBF7]/10">
          
          {/* Brand Description Column */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 group">
                <div className="p-2 bg-[#8A9A5B] rounded-xl text-[#FDFBF7] shadow-md transition-transform group-hover:rotate-12 duration-300">
                  {/* Paintbrush SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                    <path d="M7.42 10.96a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                    <path d="M11.3 7.3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                    <path d="M16.2 9.2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                    <path d="M6 14c0-2 2-3 4-3 2.5 0 4.5 1.5 4.5 4H6z"/>
                  </svg>
                </div>
                <span className="text-2xl font-serif tracking-wide font-semibold text-[#FDFBF7]">
                  Art<span className="text-[#8A9A5B]">Hub</span>
                </span>
              </Link>
              <p className="mt-4 text-sm font-light text-[#FDFBF7]/70 leading-relaxed max-w-md">
                A curated sanctuary connecting passionate collectors with independent global creators. 
                Where original canvases, digital masterpieces, and fine sculptures discover their forever homes.
              </p>
            </div>

            {/* Social Channels Block */}
            <div className="flex items-center gap-3">
              {[
                { 
                  href: "https://instagram.com", 
                  svg: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  ) 
                },
                { 
                  href: "https://twitter.com", 
                  svg: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                    </svg>
                  ) 
                },
                { 
                  href: "https://facebook.com", 
                  svg: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  ) 
                },
                { 
                  href: "https://linkedin.com", 
                  svg: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect width="4" height="12" x="2" y="9"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  ) 
                },
              ].map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-[#FDFBF7]/5 border border-[#FDFBF7]/10 text-[#FDFBF7]/60 hover:text-[#8A9A5B] hover:border-[#8A9A5B] hover:bg-[#FDFBF7]/10 transition-all duration-300"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {social.svg}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Interactive Newsletter Sign Up Placeholder */}
          <div className="lg:col-span-7 flex flex-col justify-center bg-[#FDFBF7]/5 p-6 sm:p-8 rounded-2xl border border-[#FDFBF7]/10 backdrop-blur-sm">
            <div className="mb-4">
              <h4 className="text-lg font-serif font-medium inline-flex items-center gap-2">
                Join The Collector's Circle 
                <svg className="text-[#8A9A5B] animate-pulse" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
              </h4>
              <p className="text-xs text-[#FDFBF7]/60 font-light mt-1">
                Receive curated collection updates, weekly artist highlights, and exclusive early access drops.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="relative mt-2">
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#3D2B1F]/40 border border-[#FDFBF7]/20 rounded-xl px-4 py-3.5 pr-32 text-sm text-[#FDFBF7] placeholder-[#FDFBF7]/40 focus:outline-none focus:border-[#8A9A5B] focus:ring-1 focus:ring-[#8A9A5B] transition-all duration-300 font-light"
                />
                
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#8A9A5B] text-[#FDFBF7] rounded-lg text-xs font-medium tracking-wide hover:bg-[#8A9A5B]/90 active:scale-95 transition-all duration-200 flex items-center gap-2 shadow-sm"
                >
                  {isSubscribed ? "Joined ✨" : (
                    <span className="flex items-center gap-2">
                      Subscribe 
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" x2="11" y1="2" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </span>
                  )}
                </button>
              </div>

              {/* Status Message */}
              {isSubscribed && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-[#8A9A5B] mt-2 font-medium tracking-wide"
                >
                  Success! Welcome to ArtHub's dynamic mailing desk loop list.
                </motion.p>
              )}
            </form>
          </div>

        </div>

        {/* Middle Section: Quick Nav Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 text-sm">
          
          {/* Column 1: Marketplace Links */}
          <div className="space-y-4">
            <h5 className="font-serif font-medium tracking-wider text-xs uppercase text-[#8A9A5B]">Marketplace</h5>
            <ul className="space-y-2.5 font-light text-[#FDFBF7]/70">
              <li>
                <Link href="/browse" className="hover:text-[#8A9A5B] transition-colors flex items-center gap-0.5 group">
                  Browse Artworks 
                  <svg className="opacity-0 group-hover:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" x2="17" y1="17" y2="7"/>
                    <polyline points="7 7 17 7 17 17"/>
                  </svg>
                </Link>
              </li>
              <li>
                <Link href="/browse?category=Painting" className="hover:text-[#8A9A5B] transition-colors">Original Paintings</Link>
              </li>
              <li>
                <Link href="/browse?category=Digital" className="hover:text-[#8A9A5B] transition-colors">Digital Collections</Link>
              </li>
              <li>
                <Link href="/browse?category=Sculpture" className="hover:text-[#8A9A5B] transition-colors">Fine Sculptures</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Dashboard/Account Links */}
          <div className="space-y-4">
            <h5 className="font-serif font-medium tracking-wider text-xs uppercase text-[#8A9A5B]">Your Account</h5>
            <ul className="space-y-2.5 font-light text-[#FDFBF7]/70">
              <li><Link href="/dashboard/user" className="hover:text-[#8A9A5B] transition-colors">Buyer Dashboard</Link></li>
              <li><Link href="/dashboard/artist" className="hover:text-[#8A9A5B] transition-colors">Artist Dashboard</Link></li>
              <li><Link href="/dashboard/admin" className="hover:text-[#8A9A5B] transition-colors">Admin Deck</Link></li>
              <li><Link href="/login" className="hover:text-[#8A9A5B] transition-colors">Access Profile</Link></li>
            </ul>
          </div>

          {/* Column 3: Corporate Info */}
          <div className="space-y-4">
            <h5 className="font-serif font-medium tracking-wider text-xs uppercase text-[#8A9A5B]">Company</h5>
            <ul className="space-y-2.5 font-light text-[#FDFBF7]/70">
              <li><Link href="/about" className="hover:text-[#8A9A5B] transition-colors">About Our Gallery</Link></li>
              <li><Link href="/contact" className="hover:text-[#8A9A5B] transition-colors">Contact Support</Link></li>
              <li><Link href="/careers" className="hover:text-[#8A9A5B] transition-colors">Artist Careers</Link></li>
              <li><Link href="/press" className="hover:text-[#8A9A5B] transition-colors">Press Kit</Link></li>
            </ul>
          </div>

          {/* Column 4: Trust & Verification */}
          <div className="space-y-4">
            <h5 className="font-serif font-medium tracking-wider text-xs uppercase text-[#8A9A5B]">Trust & Legal</h5>
            <ul className="space-y-2.5 font-light text-[#FDFBF7]/70">
              <li><Link href="/privacy-policy" className="hover:text-[#8A9A5B] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#8A9A5B] transition-colors">Terms of Service</Link></li>
              <li><Link href="/stripe-guarantee" className="hover:text-[#8A9A5B] transition-colors">Stripe Protection</Link></li>
              <li><Link href="/refunds" className="hover:text-[#8A9A5B] transition-colors">Refund Guidelines</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Section: Copyright & Decorative Badge */}
        <div className="pt-8 border-t border-[#FDFBF7]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-[#FDFBF7]/50">
          <div>
            &copy; {currentYear} ArtHub Inc. Deployed via Vercel Secure Node Ecosystem. All Rights Reserved.
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#8A9A5B] bg-[#8A9A5B]/10 border border-[#8A9A5B]/20 px-3 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8A9A5B] animate-ping" />
            Handcrafted for Art Enthusiasts
          </div>
        </div>

      </div>
    </footer>
  );
}