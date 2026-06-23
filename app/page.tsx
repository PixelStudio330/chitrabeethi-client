"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Plus, Loader2, Inbox } from "lucide-react";

interface ArtworkData {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  img: string;
  tag: string;
  status: "available" | "sold" | "unpublished";
}

const CARD_BG_COLORS = [
  "bg-[#F4EFE6]", 
  "bg-[#F5E6E8]", 
  "bg-[#EFF2E7]", 
  "bg-[#F9F6F0]", 
];

export default function Home() {
  const router = useRouter();
  const [artworks, setArtworks] = useState<ArtworkData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Fetch exactly 6 artworks from the backend API
  useEffect(() => {
    const fetchHomeArtworks = async () => {
      try {
        setIsLoading(true);
        // Request limit=6 to load precisely six high-end showcase pieces
        const response = await fetch("http://localhost:5000/api/artworks?limit=6");
        const json = await response.json();
        if (json.success) {
          setArtworks(json.artworks || json.data || []);
        }
      } catch (error) {
        console.error("Error connecting to Chitrabeethi Vault Base:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeArtworks();
  }, []);

  // Compute filtered listings dynamically based on active selection bar
  const filteredArtworks = React.useMemo(() => {
    if (selectedCategory === "All") return artworks;
    return artworks.filter(art => art.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [artworks, selectedCategory]);

  return (
    <>
      <main className="bg-[#FDFBF7] min-h-screen pt-20 md:pt-32 pb-20 overflow-x-hidden font-sans text-[#3D2B1F]">
        
        {/* --- HERO SECTION --- */}
        <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 md:px-10 overflow-hidden">
          
          {/* Decorative Background Orbs */}
          <div className="absolute top-10 -left-10 md:-left-24 w-40 md:w-64 h-64 select-none pointer-events-none z-0">
            <div className="relative w-full h-full">
              <div className="absolute top-0 left-0 w-32 h-32 md:w-80 md:h-80 bg-[#e2b4bd] opacity-20 rounded-full" />
              <div className="absolute top-6 left-6 w-24 h-24 md:w-60 md:h-60 bg-[#5C4033] opacity-20 rounded-full shadow-lg" />
              <div className="absolute top-48 left-16 md:top-60 md:left-24 w-16 h-16 md:w-44 md:h-44 bg-[#8A9A5B] opacity-10 rounded-full" />
            </div>
          </div>

          <div className="absolute top-[15%] -right-16 md:top-[20%] md:right-0 w-64 md:w-120 h-auto md:h-150 select-none pointer-events-none z-0">
            <div className="relative h-full w-full flex items-center justify-end">
              <div className="absolute w-80 h-64 md:w-120 md:h-96 lg:w-160 lg:h-160 bg-[#5C4033] opacity-10 rounded-full translate-x-1/2" />
              <div className="absolute w-64 h-64 md:w-[320px] md:h-[320px] lg:w-[500px] lg:h-[500px] bg-[#8A9A5B] opacity-20 rounded-full translate-x-[52%]" />
              <div className="absolute w-48 h-48 md:w-[240px] md:h-[240px] lg:w-[320px] lg:h-[320px] bg-[#5C4033] opacity-100 rounded-full shadow-2xl translate-x-[58%] border-2 md:border-4 border-[#E2B4BD]" />

              <motion.img 
                initial={{ opacity: 0, x: 20, rotate: -90 }}
                animate={{ opacity: 1, x: 0, rotate: -90 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src="/cherry-blossom.png" 
                alt="Lotus Bloom Accent"
                className="absolute right-[-40px] md:right-[-140px] lg:right-[-180px] w-[250px] md:w-[450px] lg:w-[600px] scale-75 md:scale-100 object-contain z-20 drop-shadow-[-20px_0px_30px_rgba(0,0,0,0.15)] opacity-40"
              />
            </div>
          </div>

          <div className="text-center z-10 flex flex-col items-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 bg-[#3D2B1F] rounded-full -z-10 shadow-[0_0_80px_rgba(61,43,31,0.4)] border border-white/5" />
              
              <h1 className="text-[50px] sm:text-[100px] md:text-[220px] font-bold text-[#e2b4bd] leading-none select-none tracking-tighter drop-shadow-2xl font-sans pt-18 pb-8">
                চিত্রবীথি
              </h1>
              
              <div className="flex flex-col items-center mt-[-5px] md:mt-[-20px]">
                <p className="text-lg md:text-3xl tracking-[0.8em] md:tracking-[1.2em] font-black text-[#3D2B1F] uppercase border-t-[2px] md:border-t-[4px] border-[#3D2B1F] pt-2 md:pt-4 leading-none">
                  চিত্রবীথি
                </p>
                <p className="text-[8px] md:text-[11px] tracking-[0.3em] md:tracking-[0.6em] text-[#5C4033] uppercase mt-4 md:mt-6 font-bold opacity-70">
                    CHITRABEETHI • THE FINE ART GALLERY — ESTD 2026
                </p>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 mt-12 z-20 relative w-full max-w-7xl lg:-ml-32">
            <motion.div 
              animate={{ y: [0, -25, 0], rotate: [0, 1, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="flex-shrink-0"
            >
              <div className="relative group">
                <div className="w-[280px] h-[280px] md:w-[480px] md:h-[480px] lg:w-[580px] lg:h-[580px] bg-white/10 backdrop-blur-xl rounded-full border-[6px] md:border-[10px] border-[#3D2B1F]/10 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/hero.png" 
                    alt="Main Gallery Exhibition" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                  />
                </div>
              </div>
            </motion.div>

            <div className="max-w-md lg:text-left text-center px-4">
              <h2 className="text-[#3D2B1F] text-3xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] italic">
                THE SOUL OF THE <br /> 
                <span className="text-[#E2B4BD]">BENGAL</span> <span className="text-[#8A9A5B]">CANVAS</span>
              </h2>
              <p className="text-[10px] md:text-sm text-[#5C4033] mt-4 md:mt-6 uppercase tracking-[0.15em] md:tracking-[0.2em] font-bold leading-relaxed">
                Reality is a lie meant for the living. Die a little to the world, and let your wildest imagination spill onto the canvas.
              </p>
              <div className="mt-6 md:mt-8 flex flex-wrap gap-3 md:gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => router.push('/browse')}
                  className="bg-[#3D2B1F] text-[#E2B4BD] text-[9px] md:text-[10px] py-3 md:py-4 px-8 md:px-10 rounded-full uppercase tracking-widest font-black hover:bg-[#8A9A5B] hover:text-[#3D2B1F] transition-all duration-300 shadow-xl cursor-pointer"
                >
                  Browse Artworks
                </button>
                <button className="border-2 border-[#3D2B1F] text-[#3D2B1F] text-[9px] md:text-[10px] py-3 md:py-4 px-8 md:px-10 rounded-full uppercase tracking-widest font-black hover:bg-[#3D2B1F] hover:text-[#E2B4BD] transition-all duration-300">
                  Our Story
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- STICKY FILTER NAVIGATION BAR --- */}
        <div className="sticky top-0 z-50 w-full py-6 md:py-10 flex justify-center bg-[#FDFBF7]/95 backdrop-blur-lg border-b border-[#3D2B1F]/10">
          <div className="bg-[#3D2B1F] p-1.5 md:p-2 rounded-full flex gap-1 shadow-lg">
            {["All", "Canvas", "Paper", "Painting", "Acrylic Art"].map((cat) => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 md:px-10 py-3 md:py-3.5 rounded-full text-[10px] md:text-[11px] uppercase tracking-[0.15em] md:tracking-[0.25em] font-black transition-all duration-500 cursor-pointer
                ${selectedCategory === cat 
                  ? 'bg-[#E2B4BD] text-[#3D2B1F] scale-105 shadow-xl' 
                  : 'bg-transparent text-[#E2B4BD]/60 hover:text-white hover:bg-white/5'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- ARTWORK SHOWCASE DYNAMIC GRID --- */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 mt-16">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-[#3D2B1F]/60">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-xs uppercase font-black tracking-widest">Unlocking the Art Vault...</p>
            </div>
          ) : filteredArtworks.length === 0 ? (
            <div className="bg-[#3D2B1F]/5 border-3 border-dashed border-[#3D2B1F]/20 rounded-[40px] py-24 text-center">
              <Inbox className="mx-auto text-[#3D2B1F]/20 mb-4" size={40} />
              <p className="text-xs font-black uppercase tracking-widest text-[#3D2B1F]/50">No fine artworks found in this collection category</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mt-8">
                <AnimatePresence mode="popLayout">
                  {filteredArtworks.map((art, index) => {
                    const bgColor = CARD_BG_COLORS[index % CARD_BG_COLORS.length];
                    const productUrl = `/product-details/${art._id}`;

                    return (
                      <motion.div
                        key={art._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className={`rounded-[32px] p-5 flex flex-col justify-between border-2 border-[#3D2B1F]/10 shadow-sm hover:shadow-xl hover:border-[#3D2B1F] transition-all group ${bgColor}`}
                      >
                        <div>
                          {/* Artwork Frame Canvas Container */}
                          <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-[#3D2B1F] bg-white shadow-inner">
                            <img 
                              src={art.img} 
                              alt={art.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                            />
                            <span className="absolute top-3 left-3 bg-[#3D2B1F] text-[#FAECF0] text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md border border-white/10">
                              {art.tag || art.category}
                            </span>
                          </div>

                          {/* Title and Backstory Lore Context */}
                          <div className="mt-5 space-y-1.5">
                            <h3 className="text-[#3D2B1F] font-black text-lg uppercase tracking-tight line-clamp-1 group-hover:text-[#8A9A5B] transition-colors">
                              {art.name}
                            </h3>
                            <p className="text-[11px] font-medium text-[#5C4033]/80 tracking-wide line-clamp-2 leading-relaxed">
                              {art.description || "Finished with premium museum archive glazing. Includes custom Certificate of Authenticity."}
                            </p>
                          </div>
                        </div>

                        {/* Controls Base Section */}
                        <div className="mt-6 space-y-3">
                          <div className="flex items-center justify-between border-b-2 border-[#3D2B1F]/10 pb-2.5 mb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/50">Investment Value</span>
                            <span className="text-[#3D2B1F] font-black text-xl italic font-sans">৳{art.price.toLocaleString()}</span>
                          </div>

                          {art.status !== "sold" ? (
                            <button 
                              type="button" 
                              className="w-full bg-[#3D2B1F] text-[#FAECF0] py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#8A9A5B] hover:text-[#3D2B1F] transition-all active:scale-95 shadow-sm font-black uppercase text-[10px] tracking-widest cursor-pointer"
                            >
                              <Plus size={14} strokeWidth={3} />
                              <span>Acquire Artwork</span>
                            </button>
                          ) : (
                            <div className="w-full bg-[#8A3324]/10 text-[#8A3324] border border-[#8A3324]/20 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest select-none cursor-not-allowed">
                              Unavailable / Sold out
                            </div>
                          )}
                          
                          <Link 
                            href={productUrl} 
                            className="w-full border-2 border-[#3D2B1F]/20 text-[#3D2B1F] py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#3D2B1F] hover:text-white transition-all uppercase text-[9px] font-black tracking-[0.2em]"
                          >
                            <Eye size={14} /> Inspect Details
                          </Link>
                        </div>

                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* --- VIEW MORE ARTWORKS LINK BUTTON --- */}
              <div className="flex justify-center mt-16">
                <Link
                  href="/browse"
                  className="inline-flex items-center justify-center border-2 border-[#3D2B1F] bg-transparent text-[#3D2B1F] text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] py-4 px-12 rounded-full hover:bg-[#3D2B1F] hover:text-[#E2B4BD] transition-all duration-300 shadow-sm hover:shadow-lg active:scale-95"
                >
                  View More Artworks
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}