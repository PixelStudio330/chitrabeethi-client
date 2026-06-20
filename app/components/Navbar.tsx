"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useVelocity, useTransform, useSpring } from "framer-motion";
import { Menu, X, ArrowRight, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // 🌟 Tracks initial page settlement
  const pathname = usePathname();
  const router = useRouter();

  // 🛡️ Access synchronized global auth state
  const { user, token, logout, isLoading } = useAuth();

  // Kinetic Physics Base (Hanging effect for links)
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const rotationTarget = useTransform(scrollVelocity, [-2000, 2000], [-12, 12]);
  const smoothRotation = useSpring(rotationTarget, { damping: 12, stiffness: 90 });

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Stabilize physics layout on mount and path switch
  useEffect(() => {
    setIsMounted(true);
    smoothRotation.set(0);
    scrollVelocity.set(0);
  }, [pathname, smoothRotation, scrollVelocity]);

  // Structural Navigation Tree Arrays
  const leftLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Artworks", href: "/browse" }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className="fixed w-full top-0 left-0 z-[100] pointer-events-none transition-all duration-300">
        <div className="max-w-7xl mx-auto relative h-32 md:h-40 px-6">
          
          {/* --- LAYER 1: DECORATIVE BRANCHES (ANIMATION FIX) --- */}
          <motion.div 
            initial={{ opacity: 0, y: 0 }} // 🌟 FIXED: Explicit baseline y coordinate prevents layout calculation jumps
            animate={{ 
              y: isScrolled ? -20 : 0, 
              opacity: isScrolled ? 0 : 0.9
            }}
            transition={{ 
              duration: 0.4, 
              ease: "easeOut",
              layout: { type: "tween" } // 🌟 FIXED: Prevents Next.js route switching from running auto layout scaling
            }}
            className="absolute inset-x-0 top-0 h-full z-0 overflow-visible"
          >
            <svg viewBox="0 0 1200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover md:object-fill drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
              <path d="M-20 20C150 22 280 45 450 35C620 25 780 15 950 25C1080 32 1150 20 1250 15" stroke="#2C1D11" strokeWidth="7" strokeLinecap="round" />
              <path d="M120 23C200 35 320 50 390 62" stroke="#2C1D11" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M750 20C820 32 890 48 930 65" stroke="#2C1D11" strokeWidth="3" strokeLinecap="round" />
              <circle cx="160" cy="28" r="7" fill="#E2B4BD" opacity="0.95" />
              <circle cx="320" cy="48" r="8" fill="#E2B4BD" opacity="0.95" />
              <circle cx="780" cy="22" r="8" fill="#E2B4BD" opacity="0.95" />
            </svg>
          </motion.div>

          {/* --- LAYER 2: CAPSULE STRIP SCROLL BACKDROP --- */}
          <div className="absolute inset-x-6 top-4 flex justify-center z-10">
            <motion.div 
              animate={{ 
                opacity: isScrolled ? 1 : 0,
                scale: isScrolled ? 1 : 0.95,
                y: isScrolled ? 0 : -10
              }}
              className="w-full max-w-5xl h-14 bg-[#3D2B1F]/90 backdrop-blur-md border border-[#E2B4BD]/15 rounded-full shadow-2xl"
            />
          </div>

          {/* --- LAYER 3: CORE INTERACTIVE NAVIGATION --- */}
          <motion.div 
            animate={{
              maxWidth: isScrolled ? "64rem" : "80rem", 
              y: isScrolled ? -2 : 0
            }}
            transition={{ type: "spring", stiffness: 120, damping: 22 }}
            className="relative w-full h-full mx-auto flex items-start justify-between pt-6 z-20 pointer-events-auto"
          >
            
            {/* LEFT COMPONENT NAVIGATION BLOCK */}
            <div className="flex items-center gap-6 mt-1 md:mt-3">
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="md:hidden p-2 rounded-full bg-[#3D2B1F]/90 border border-[#E2B4BD]/20 text-[#E2B4BD] shadow"
              >
                <Menu size={20} />
              </button>

              <div className="hidden md:flex items-center gap-2 lg:gap-4 pl-4 transition-all duration-500">
                {leftLinks.map((link) => (
                  <motion.div
                    key={link.href}
                    animate={{ y: isScrolled ? -2 : 0 }}
                    style={{ 
                      rotate: !isMounted || isScrolled ? 0 : smoothRotation, 
                      transformOrigin: "top center" 
                    }}
                    whileHover={isScrolled ? { scale: 1.05 } : { scale: 1.05, rotate: 3 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div animate={{ height: isScrolled ? 0 : 32, opacity: isScrolled ? 0 : 0.6 }} className="w-[1.5px] bg-[#3D2B1F]" />
                    <Link href={link.href} className={`px-3 py-2 transition-all duration-300 font-black uppercase tracking-[0.2em] text-[10px] whitespace-nowrap ${
                        isScrolled
                          ? isActive(link.href)
                            ? "text-[#8A9A5B] bg-transparent border-transparent"
                            : "text-[#E2B4BD] bg-transparent border-transparent hover:text-[#FAECF0]"
                          : isActive(link.href)
                            ? "bg-[#8A9A5B] text-[#3D2B1F] border-[#8A9A5B]/40 rounded-md shadow-md border"
                            : "bg-[#3D2B1F]/90 text-[#E2B4BD] border-[#E2B4BD]/10 hover:border-[#8A9A5B] rounded-md shadow-md border"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CENTRAL BRAND LOGO EMBLEM HUB */}
            <div className="flex flex-col items-center self-start mx-2">
              <motion.div animate={{ height: isScrolled ? 0 : 20, opacity: isScrolled ? 0 : 1 }} className="w-[2px] bg-[#2C1D11]" />
              <Link href="/" className="group flex flex-col items-center">
                <motion.div 
                  animate={{ scale: isScrolled ? 0.85 : 1, y: isScrolled ? -9 : 0, borderWidth: isScrolled ? "3px" : "4px" }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  className="relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 shadow-xl bg-[#3D2B1F] border-[#E2B4BD] p-1.5 z-10"
                >
                  <svg className="w-full h-full text-[#E2B4BD] transform group-hover:rotate-12 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l9.37-9.37a2.25 2.25 0 113.182 3.182l-9.37 9.371a6 6 0 01-2.122 1.39l-2.06.515.515-2.061a6 6 0 011.383-2.112zm0 0L19 7m-4.75 2.75l1.5 1.5M3 21v-1.5A3.75 3.75 0 016.75 16h0A3.75 3.75 0 0110 19.75V21H3z" />
                  </svg>
                </motion.div>
              </Link>
            </div>

            {/* RIGHT COMPONENT AUTH BLOCK WITH LINKAGE */}
            <div className="flex items-center gap-3 md:gap-4 lg:gap-5 mt-1 md:mt-3 pr-4">
              {!isLoading && (
                <div className="hidden md:flex items-center gap-3 lg:gap-4">
                  {/* Dashboard link */}
                  {user && (
                    <motion.div
                      animate={{ y: isScrolled ? -2 : 0 }}
                      style={{ 
                        rotate: !isMounted || isScrolled ? 0 : smoothRotation, 
                        transformOrigin: "top center" 
                      }}
                      whileHover={isScrolled ? { scale: 1.05 } : { scale: 1.05, rotate: -3 }}
                      className="flex flex-col items-center"
                    >
                      <motion.div animate={{ height: isScrolled ? 0 : 44, opacity: isScrolled ? 0 : 0.6 }} className="w-[1.5px] bg-[#3D2B1F]" />
                      <Link 
                        href={`/dashboard/${user.role}`}
                        className={`px-3 py-2 transition-all duration-300 font-black uppercase tracking-[0.2em] text-[9px] ${
                          isScrolled
                            ? pathname.startsWith("/dashboard")
                              ? "text-[#8A9A5B] bg-transparent border-transparent"
                              : "text-[#E2B4BD] bg-transparent border-transparent hover:text-[#FAECF0]"
                            : pathname.startsWith("/dashboard")
                              ? "bg-[#8A9A5B] text-[#3D2B1F] rounded-md shadow-md border border-transparent"
                              : "bg-[#3D2B1F]/90 text-[#E2B4BD] border-[#E2B4BD]/10 rounded-md shadow-md border"
                        }`}
                      >
                        Dashboard
                      </Link>
                    </motion.div>
                  )}

                  {/* Log In Link */}
                  {!user && (
                    <motion.div
                      animate={{ y: isScrolled ? -2 : 0 }}
                      style={{ 
                        rotate: !isMounted || isScrolled ? 0 : smoothRotation, 
                        transformOrigin: "top center" 
                      }}
                      whileHover={isScrolled ? { scale: 1.05 } : { scale: 1.05, rotate: -3 }}
                      className="flex flex-col items-center"
                    >
                      <motion.div animate={{ height: isScrolled ? 0 : 44, opacity: isScrolled ? 0 : 0.6 }} className="w-[1.5px] bg-[#3D2B1F]" />
                      <Link 
                        href="/login"
                        className={`px-3 py-2 transition-all duration-300 font-black uppercase tracking-[0.2em] text-[9px] ${
                          isScrolled
                            ? isActive("/login")
                              ? "text-[#8A9A5B] bg-transparent border-transparent"
                              : "text-[#E2B4BD] bg-transparent border-transparent hover:text-[#FAECF0]"
                            : isActive("/login")
                              ? "bg-[#8A9A5B] text-[#3D2B1F] rounded-md shadow-md border border-transparent"
                              : "bg-[#3D2B1F]/90 text-[#E2B4BD] border-[#E2B4BD]/10 rounded-md shadow-md border"
                        }`}
                      >
                        Log In
                      </Link>
                    </motion.div>
                  )}

                  {/* Register Link */}
                  {!user && (
                    <motion.div
                      animate={{ y: isScrolled ? -2 : 0 }}
                      style={{ 
                        rotate: !isMounted || isScrolled ? 0 : smoothRotation, 
                        transformOrigin: "top center" 
                      }}
                      whileHover={isScrolled ? { scale: 1.05 } : { scale: 1.05, rotate: -3 }}
                      className="flex flex-col items-center"
                    >
                      <motion.div animate={{ height: isScrolled ? 0 : 44, opacity: isScrolled ? 0 : 0.6 }} className="w-[1.5px] bg-[#3D2B1F]" />
                      <Link 
                        href="/register"
                        className={`px-3 py-2 transition-all duration-300 font-black uppercase tracking-[0.2em] text-[9px] ${
                          isScrolled
                            ? isActive("/register")
                              ? "text-[#8A9A5B] bg-transparent border-transparent"
                              : "text-[#E2B4BD] bg-transparent border-transparent hover:text-[#FAECF0]"
                            : isActive("/register")
                              ? "bg-[#8A9A5B] text-[#3D2B1F] rounded-md shadow-md border border-transparent"
                              : "bg-[#E2B4BD] text-[#3D2B1F] rounded-md shadow-md border border-transparent font-black"
                        }`}
                      >
                        Register
                      </Link>
                    </motion.div>
                  )}
                </div>
              )}

              {/* DYNAMIC PROFILE AVATAR WRAPPER */}
              {user && (
                <motion.div
                  animate={{ y: isScrolled ? -2 : 0 }}
                  style={{ 
                    rotate: !isMounted || isScrolled ? 0 : smoothRotation, 
                    transformOrigin: "top center" 
                  }}
                  className="flex items-center gap-3 pl-1 relative"
                >
                  <div className="absolute top-0 left-6 flex flex-col items-center pointer-events-none">
                    <motion.div animate={{ height: isScrolled ? 0 : 24, opacity: isScrolled ? 0 : 0.6 }} className="w-[1.5px] bg-[#3D2B1F]" />
                  </div>
                  
                  <div className="relative w-11 h-11 md:w-12 md:h-12 mt-6 md:mt-0 flex items-center justify-center">
                    <Link href="/profile" className="block w-full h-full rounded-full border-2 border-[#8A9A5B] bg-[#3D2B1F] flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105 shadow-md">
                      {(user.profilePicture || user.photoUrl) ? (
                        <img 
                          src={`/api/proxy-avatar?url=${encodeURIComponent(user.profilePicture || user.photoUrl)}`} 
                          alt={user.name || "User Avatar"} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-sm font-black uppercase text-[#E2B4BD]">
                          {user.name ? user.name.charAt(0) : <User size={16} />}
                        </span>
                      )}
                    </Link>
                  </div>

                  {token && (
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault();
                        logout();
                      }}
                      title="Exit Account"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center bg-[#8A3324] hover:bg-[#a13d2b] text-[#FAECF0] w-7 h-7 md:w-8 md:h-8 rounded-full shadow border border-[#3D2B1F] transition-colors pointer-events-auto mt-6 md:mt-0"
                    >
                      <LogOut size={12} strokeWidth={2.5} />
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>

          </motion.div>
        </div>
      </nav>

      {/* --- MOBILE ACCORDION COMPONENT DRAWER --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="fixed inset-0 z-[200] bg-[#3D2B1F] flex flex-col p-8 justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-12">
                <div className="flex flex-col">
                  <span className="text-[#E2B4BD] font-black text-2xl font-sans tracking-tight uppercase">
                    CHITRA<span className="text-[#8A9A5B]">BEETHI</span>
                  </span>
                  <span className="text-[#E2B4BD]/60 font-medium text-sm tracking-wide mt-0.5 font-bengali">
                    চিত্রবীথি
                  </span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-[#E2B4BD] hover:text-[#8A9A5B] transition-colors">
                  <X size={28} />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <Link 
                  href="/" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`text-3xl font-black uppercase flex justify-between items-center transition-colors ${isActive("/") ? "text-[#8A9A5B]" : "text-[#E2B4BD]"}`}
                >
                  Home <ArrowRight className="text-[#8A9A5B]" />
                </Link>
                <Link 
                  href="/browse" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className={`text-3xl font-black uppercase flex justify-between items-center transition-colors ${isActive("/browse") ? "text-[#8A9A5B]" : "text-[#E2B4BD]"}`}
                >
                  Browse Artworks <ArrowRight className="text-[#8A9A5B]" />
                </Link>
                
                {user && (
                  <>
                    <Link 
                      href={`/dashboard/${user.role}`}
                      onClick={() => setMobileMenuOpen(false)} 
                      className={`text-3xl font-black uppercase flex justify-between items-center transition-colors ${pathname.startsWith("/dashboard") ? "text-[#8A9A5B]" : "text-[#E2B4BD]"}`}
                    >
                      Dashboard <ArrowRight className="text-[#8A9A5B]" />
                    </Link>
                    <Link 
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)} 
                      className={`text-3xl font-black uppercase flex justify-between items-center transition-colors ${isActive("/profile") ? "text-[#8A9A5B]" : "text-[#E2B4BD]"}`}
                    >
                      My Profile <ArrowRight className="text-[#8A9A5B]" />
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-[#E2B4BD]/10 pt-6">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (user && token) {
                    logout();
                  } else {
                    router.push("/login");
                  }
                }}
                className={`w-full block text-center text-sm font-black uppercase tracking-wider py-3.5 rounded-md transition-all ${
                  user && token 
                    ? "bg-[#8A3324] text-[#FAECF0]" 
                    : "bg-[#E2B4BD] text-[#3D2B1F]"
                }`}
              >
                {user && token ? "Log Out of Gallery" : "Sign In / Register"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}