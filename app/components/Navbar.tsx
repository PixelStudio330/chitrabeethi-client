"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useVelocity, useTransform, useSpring, useMotionValue } from "framer-motion";
import { ShoppingBag, Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Framework Authentication Context
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [userRole, setUserRole] = useState("user"); 

  // Kinetic Physics Base
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  // 1. Use a direct motion value for rotation that we can explicitly override
  const rotationTarget = useTransform(scrollVelocity, [-2000, 2000], [-12, 12]);
  const smoothRotation = useSpring(rotationTarget, { damping: 12, stiffness: 90 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Kill the kinetic momentum instantly when the pathname transforms
  useEffect(() => {
    // Explicitly force the spring state and its velocity hook back to 0
    smoothRotation.set(0);
    scrollVelocity.set(0);
  }, [pathname, smoothRotation, scrollVelocity]);

  const leftLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Artworks", href: "/browse" },
  ];

  const rightLinks = [
    { name: "Our Story", href: "/about" },
  ];

  const allMobileLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Artworks", href: "/browse" },
    { name: "Our Story", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Structural Fixed wrapper */}
      <nav className="fixed w-full top-0 left-0 z-[100] pointer-events-none transition-all duration-300">
        <div className="max-w-7xl mx-auto relative h-32 md:h-40 px-6">
          
          {/* --- LAYER 1: ORIGINAL UNALTERED BRANCH BACKGROUND --- */}
          <motion.div 
            animate={{ 
              y: isScrolled ? -20 : 0, 
              opacity: isScrolled ? 0 : 0.9
            }}
            transition={{ type: "spring", stiffness: 100, damping: 22 }}
            className="absolute inset-x-0 top-0 h-full z-0 overflow-visible"
          >
            <svg 
              viewBox="0 0 1200 160" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-full h-full object-cover md:object-fill drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
            >
              <path 
                d="M-20 20C150 22 280 45 450 35C620 25 780 15 950 25C1080 32 1150 20 1250 15" 
                stroke="#2C1D11" 
                strokeWidth="7" 
                strokeLinecap="round" 
              />
              <path 
                d="M120 23C200 35 320 50 390 62" 
                stroke="#2C1D11" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />
              <path 
                d="M750 20C820 32 890 48 930 65" 
                stroke="#2C1D11" 
                strokeWidth="3" 
                strokeLinecap="round" 
              />
              <circle cx="160" cy="28" r="7" fill="#E2B4BD" opacity="0.95" />
              <circle cx="165" cy="24" r="5" fill="#FAECF0" opacity="0.9" />
              <circle cx="320" cy="48" r="8" fill="#E2B4BD" opacity="0.95" />
              <circle cx="326" cy="45" r="6" fill="#FAECF0" opacity="0.9" />
              <circle cx="480" cy="32" r="7" fill="#E2B4BD" opacity="0.95" />
              <circle cx="780" cy="22" r="8" fill="#E2B4BD" opacity="0.95" />
              <circle cx="880" cy="44" r="7" fill="#E2B4BD" opacity="0.95" />
              <circle cx="886" cy="40" r="5" fill="#FAECF0" opacity="0.9" />
            </svg>
          </motion.div>

          {/* --- LAYER 2: CAPSULE STRIP BACKGROUND --- */}
          <div className="absolute inset-x-6 top-4 flex justify-center z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ 
                opacity: isScrolled ? 1 : 0,
                scale: isScrolled ? 1 : 0.95,
                y: isScrolled ? 0 : -10
              }}
              transition={{ type: "spring", stiffness: 125, damping: 21 }}
              className="w-full max-w-5xl h-14 bg-[#3D2B1F]/90 backdrop-blur-md border border-[#E2B4BD]/15 rounded-full shadow-2xl"
            />
          </div>

          {/* --- LAYER 3: CORE INTERACTIVE NAVIGATION --- */}
          <motion.div 
            animate={{
              maxWidth: isScrolled ? "64rem" : "80rem", 
              paddingLeft: isScrolled ? "2rem" : "1.5rem",
              paddingRight: isScrolled ? "2rem" : "1.5rem",
              y: isScrolled ? -2 : 0
            }}
            transition={{ type: "spring", stiffness: 120, damping: 22 }}
            className="relative w-full h-full mx-auto flex items-start justify-between pt-6 z-20 pointer-events-auto"
          >
            
            {/* LEFT COMPONENT COLUMN */}
            <div className="flex items-center gap-6 mt-1 md:mt-3">
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="md:hidden p-2 rounded-full bg-[#3D2B1F]/90 border border-[#E2B4BD]/20 text-[#E2B4BD] shadow"
              >
                <Menu size={20} />
              </button>

              {/* Left Nav Elements */}
              <div className="hidden md:flex items-center gap-6 lg:gap-10 pl-4 transition-all duration-500">
                {leftLinks.map((link) => (
                  <motion.div
                    key={link.href}
                    animate={{ y: isScrolled ? -2 : 0 }}
                    style={{ 
                      // Removed isNavigating check since the motion hook itself is snapped to 0
                      rotate: isScrolled ? 0 : smoothRotation, 
                      transformOrigin: "top center" 
                    }}
                    whileHover={isScrolled ? { scale: 1.05 } : { scale: 1.05, rotate: 3 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div 
                      animate={{ 
                        height: isScrolled ? 0 : 32, 
                        opacity: isScrolled ? 0 : 0.6 
                      }}
                      className="w-[1.5px] bg-[#3D2B1F]" 
                    />
                    
                    <Link 
                      href={link.href}
                      className={`px-4 py-2 transition-all duration-300 font-black uppercase tracking-[0.25em] text-[10px] ${
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

            {/* CENTRAL BRAND LOGO TRANSFORMATION LAYER */}
            <div className="flex flex-col items-center self-start">
              {/* Rope Anchor Line */}
              <motion.div 
                animate={{ 
                  height: isScrolled ? 0 : 20, 
                  opacity: isScrolled ? 0 : 1 
                }}
                className="w-[2px] bg-[#2C1D11]" 
              />
              
              <Link href="/" className="group flex flex-col items-center">
                {/* Logo Icon Wrapper */}
                <motion.div 
                  animate={{ 
                    scale: isScrolled ? 0.85 : 1, 
                    y: isScrolled ? -9 : 0,
                    borderWidth: isScrolled ? "3px" : "4px"
                  }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  className="relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 shadow-xl bg-[#3D2B1F] border-[#E2B4BD] p-1.5 z-10"
                >
                  <svg className="w-full h-full text-[#E2B4BD] transform group-hover:rotate-12 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l9.37-9.37a2.25 2.25 0 113.182 3.182l-9.37 9.371a6 6 0 01-2.122 1.39l-2.06.515.515-2.061a6 6 0 011.383-2.112zm0 0L19 7m-4.75 2.75l1.5 1.5M3 21v-1.5A3.75 3.75 0 016.75 16h0A3.75 3.75 0 0110 19.75V21H3z" />
                  </svg>
                </motion.div>
              </Link>
            </div>

            {/* RIGHT COMPONENT COLUMN */}
            <div className="flex items-center gap-4 md:gap-6 lg:gap-8 mt-1 md:mt-3 pr-4">
              <div className="hidden md:flex items-center gap-6 lg:gap-8">
                {rightLinks.map((link) => (
                  <motion.div
                    key={link.href}
                    animate={{ y: isScrolled ? -2 : 0 }}
                    style={{ 
                      rotate: isScrolled ? 0 : smoothRotation, 
                      transformOrigin: "top center" 
                    }}
                    whileHover={isScrolled ? { scale: 1.05 } : { scale: 1.05, rotate: -3 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div 
                      animate={{ 
                        height: isScrolled ? 0 : 44, 
                        opacity: isScrolled ? 0 : 0.6 
                      }}
                      className="w-[1.5px] bg-[#3D2B1F]" 
                    />
                    <Link 
                      href={link.href}
                      className={`px-4 py-2 transition-all duration-300 font-black uppercase tracking-[0.25em] text-[10px] ${
                        isScrolled
                          ? isActive(link.href)
                            ? "text-[#8A9A5B] bg-transparent border-transparent"
                            : "text-[#E2B4BD] bg-transparent border-transparent hover:text-[#FAECF0]"
                          : isActive(link.href)
                            ? "bg-[#8A9A5B] text-[#3D2B1F] rounded-md shadow-md border border-transparent"
                            : "bg-[#3D2B1F]/90 text-[#E2B4BD] border-[#E2B4BD]/10 rounded-md shadow-md border"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                {isLoggedIn && (
                  <motion.div 
                    animate={{ y: isScrolled ? -2 : 0 }}
                    style={{ 
                      rotate: isScrolled ? 0 : smoothRotation, 
                      transformOrigin: "top center" 
                    }} 
                    className="flex flex-col items-center"
                  >
                    <motion.div 
                      animate={{ 
                        height: isScrolled ? 0 : 36, 
                        opacity: isScrolled ? 0 : 0.6 
                      }}
                      className="w-[1.5px] bg-[#3D2B1F]" 
                    />
                    <Link 
                      href={`/dashboard/${userRole}`}
                      className={`px-4 py-2 transition-all duration-300 font-black uppercase tracking-[0.25em] text-[10px] ${
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
              </div>
              
              {/* Acquisitions Component Container */}
              <motion.div 
                animate={{ y: isScrolled ? -2 : 0 }}
                style={{ 
                  rotate: isScrolled ? 0 : smoothRotation, 
                  transformOrigin: "top center" 
                }} 
                className="flex flex-col items-center"
              >
                <motion.div 
                  animate={{ 
                    height: isScrolled ? 0 : 28, 
                    opacity: isScrolled ? 0 : 0.6 
                  }}
                  className="w-[1.5px] bg-[#3D2B1F]" 
                />
                <Link href="/order-history">
                  <motion.button 
                    animate={{
                      backgroundColor: isScrolled ? "rgba(0,0,0,0)" : "#E2B4BD",
                      color: isScrolled ? "#E2B4BD" : "#3D2B1F",
                      borderWidth: isScrolled ? "0px" : "1px",
                      boxShadow: isScrolled ? "none" : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      y: isScrolled ? 1 : 0
                    }}
                    className="border border-[#E2B4BD]/30 font-black uppercase tracking-[0.1em] hover:text-[#8A9A5B] transition-all duration-300 flex items-center gap-2 px-4 py-2 text-[10px] active:scale-95"
                  >
                    <span className="hidden sm:inline">Acquisitions</span>
                    <ShoppingBag size={13} strokeWidth={2.5} />
                  </motion.button>
                </Link>
              </motion.div>
            </div>

          </motion.div>
        </div>
      </nav>

      {/* --- MOBILE ACCORDION DRAWER --- */}
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
                {allMobileLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    onClick={() => setMobileMenuOpen(false)} 
                    className={`text-3xl font-black uppercase flex justify-between items-center transition-colors ${
                      isActive(link.href) ? "text-[#8A9A5B]" : "text-[#E2B4BD] hover:text-[#8A9A5B]"
                    }`}
                  >
                    {link.name}
                    <ArrowRight className="text-[#8A9A5B]" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E2B4BD]/10 pt-6">
              <Link
                href={isLoggedIn ? "#" : "/login"}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isLoggedIn) setIsLoggedIn(false);
                }}
                className="block text-center text-sm font-black uppercase tracking-wider py-3.5 rounded-md bg-[#E2B4BD] text-[#3D2B1F]"
              >
                {isLoggedIn ? "Log Out System" : "Sign In / Register"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}