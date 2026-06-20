"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, Sparkles, Plus, Eye, Inbox, ArrowUpDown, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getArtworks, ArtworkData } from "../../utils/api";
import { useAuth } from "../context/AuthContext"; 
import { useSharedWishlist } from "../../utils/WishlistContext"; 

const CATEGORIES = ["All", "Painting", "Acrylic Art", "Sculpture", "Photography"];

const CARD_BG_COLORS = [
  "bg-[#F4EFE6]", 
  "bg-[#F5E6E8]", 
  "bg-[#EFF2E7]", 
  "bg-[#F9F6F0]", 
];

export default function BrowseArtworksPage() {
  const router = useRouter();
  
  // Connect to global system contexts
  const { user } = useAuth();
  const { wishlist, handleWishlistToggle } = useSharedWishlist();

  const [artworks, setArtworks] = useState<ArtworkData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // --- NEW FILTER & SORTING STATES ---
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<string>("newest"); // options: newest, price-low, price-high

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // --- TOAST NOTIFICATION STATES ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info">("success");

  // --- CONNECT TO BACKEND DATA PIPELINE & RANDOMIZE ---
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        setHasError(false);
        
        const artData = await getArtworks();
        
        if (isMounted) {
          // Requirements rule: Randomize array elements on each initial page load
          const randomizedData = [...artData].sort(() => Math.random() - 0.5);
          setArtworks(randomizedData);
        }
      } catch (err) {
        console.error("Data synchronization error:", err);
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // --- TOAST TRIGGER ENGINE ---
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // --- SAFE ON-CLICK ROUTER INTERACT WITH TOAST ---
  const onWishlistToggleClick = async (artworkId: string, artworkName: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    
    const isCurrentlyWishlisted = wishlist?.includes(artworkId) || false;
    await handleWishlistToggle(artworkId);
    
    if (!isCurrentlyWishlisted) {
      showToast(`"${artworkName}" added to your vault wishlist!`, "success");
    } else {
      showToast(`Removed "${artworkName}" from your wishlist.`, "info");
    }
  };

  // --- DYNAMIC MULTI-FILTERING & SORTING PIPELINE ---
  const filteredAndSortedArtworks = artworks
    .filter(art => {
      if (!art) return false;

      // 1. Filter by category match safely
      const targetCategory = art.category || art.tag || "";
      const matchesCategory = 
        selectedCategory === "All" || 
        targetCategory.toLowerCase() === selectedCategory.toLowerCase();

      // 2. Filter by Search Query match (looks up title or artist name safely)
      const targetName = art.name || "";
      const targetArtistName = art.artist?.name || "";
      const matchesSearch = 
        targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        targetArtistName.toLowerCase().includes(searchQuery.toLowerCase());

      // 3. Filter by Price Range boundaries safely handles empty state evaluation inputs
      const currentPrice = art.price ?? 0;
      const matchesMinPrice = minPrice === "" || currentPrice >= Number(minPrice);
      const matchesMaxPrice = maxPrice === "" || currentPrice <= Number(maxPrice);

      return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
    })
    .sort((a, b) => {
      // 4. Multi-criteria Sorting system
      const priceA = a.price ?? 0;
      const priceB = b.price ?? 0;

      if (sortBy === "price-low") {
        return priceA - priceB;
      }
      if (sortBy === "price-high") {
        return priceB - priceA;
      }
      if (sortBy === "newest") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D2B1F] pt-32 pb-24 px-4 md:px-12 relative overflow-hidden font-sans select-none">
      
      {/* --- IN-HOUSE ANIMATED TOAST SYSTEM --- */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: -20, scale: 0.9, x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-28 left-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full shadow-xl border backdrop-blur-md font-sans text-xs font-black uppercase tracking-wider text-[#3D2B1F]"
            style={{
              backgroundColor: toastType === "success" ? "rgba(138, 154, 91, 0.15)" : "rgba(226, 180, 189, 0.25)",
              borderColor: toastType === "success" ? "#8A9A5B" : "#E2B4BD",
            }}
          >
            <Heart size={14} className={toastType === "success" ? "text-[#8A9A5B]" : "text-[#E2B4BD]"} fill={toastType === "success" ? "currentColor" : "none"} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- BACKGROUND GRAPHICS & TEXTURES --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3D2B1F/0.03_1px,transparent_1px),linear-gradient(to_bottom,#3D2B1F/0.03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-[#FAECF0] rounded-full blur-[80px] opacity-70 pointer-events-none" />
      <div className="absolute top-[40%] right-[-100px] w-[500px] h-[500px] bg-[#E2B4BD]/20 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-10 left-[-50px] w-[350px] h-[350px] bg-[#8A9A5B]/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- HEADER TITLE SECTION --- */}
        <div className="mb-16 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8A9A5B]/10 rounded-full border border-[#8A9A5B]/20 text-[#8A9A5B] text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles size={12} /> Curated Masterpieces
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight text-[#2C1D11] leading-none">
            EXPLORE <span className="text-[#E2B4BD] italic drop-shadow-sm">THE</span> <span className="text-[#8A9A5B]">GALLERY</span>
          </h1>
          
          <div className="w-24 h-[3px] bg-[#3D2B1F] mx-auto mt-6 mb-4 rounded-full" />
          
          <p className="text-xs md:text-sm text-[#5C4033] uppercase tracking-[0.2em] font-bold max-w-xl mx-auto leading-relaxed opacity-80">
            Reality is a lie meant for the living. Die a little to the world, and let imagination spill onto the canvas.
          </p>
        </div>

        {/* --- COMPACT ADVANCED FILTER & UTILITY BAR CONTROLS --- */}
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-[35px] border border-[#3D2B1F]/10 mb-16 shadow-[0_8px_30px_rgb(61,43,31,0.03)] space-y-6">
          
          {/* Main Controls Row */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center w-full">
            {/* Search Query Input Container */}
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40 group-focus-within:text-[#8A9A5B] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search by title or artist..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FDFBF7] border border-[#3D2B1F]/10 rounded-[20px] pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:border-[#8A9A5B] focus:ring-4 focus:ring-[#8A9A5B]/5 shadow-inner text-[#3D2B1F] transition-all"
              />
            </div>

            {/* Category Select Filters Row */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-end w-full lg:w-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-full border transition-all duration-300 relative overflow-hidden ${
                    selectedCategory === cat
                      ? "bg-[#3D2B1F] text-[#FAECF0] border-[#3D2B1F] shadow-md scale-105"
                      : "bg-[#FDFBF7] text-[#3D2B1F]/80 border-[#3D2B1F]/10 hover:border-[#3D2B1F] hover:bg-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Numeric Constraints and Custom Sorting Blocks */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#3D2B1F]/5 w-full">
            
            {/* Range Constraints Panel Block */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-[#3D2B1F]/60 text-xs font-black uppercase tracking-wider">
                <SlidersHorizontal size={13} /> Price Range:
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input 
                  type="number" 
                  placeholder="Min ৳"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-24 bg-[#FDFBF7] border border-[#3D2B1F]/10 rounded-xl px-3 py-2 text-xs font-bold text-[#3D2B1F] focus:outline-none focus:border-[#8A9A5B] shadow-inner"
                />
                <span className="text-[#3D2B1F]/40 text-xs font-bold">to</span>
                <input 
                  type="number" 
                  placeholder="Max ৳"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-24 bg-[#FDFBF7] border border-[#3D2B1F]/10 rounded-xl px-3 py-2 text-xs font-bold text-[#3D2B1F] focus:outline-none focus:border-[#8A9A5B] shadow-inner"
                />
              </div>
            </div>

            {/* Sorting Handler Component Wrapper */}
            <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1.5 text-[#3D2B1F]/60 text-xs font-black uppercase tracking-wider">
                <ArrowUpDown size={13} /> Sort By:
              </div>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#FDFBF7] border border-[#3D2B1F]/10 text-[#3D2B1F] rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider focus:outline-none focus:border-[#8A9A5B] cursor-pointer transition-all"
              >
                <option value="newest">Newest Artwork</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

          </div>
        </div>

        {/* --- BACKEND NETWORK FAULT HANDLER --- */}
        {hasError && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center border-3 border-dashed border-[#3D2B1F]/20 rounded-[40px] bg-[#3D2B1F]/5 max-w-xl mx-auto px-6">
            <span className="text-3xl mb-3">🍂</span>
            <h3 className="text-xl font-black text-[#2C1D11] italic">The Vault Room is Quiet...</h3>
            <p className="text-xs text-[#5C4033] mt-2 leading-relaxed font-medium">
              We encountered an issue syncing with the live Chitrabeethi database API. Ensure your server is active on port 5000 and try refreshing.
            </p>
            <button type="button" onClick={() => window.location.reload()} className="mt-6 bg-[#3D2B1F] text-[#FAECF0] py-3 px-8 rounded-full text-[10px] font-black tracking-widest uppercase transition-all hover:bg-[#8A9A5B] shadow-md">
              Retry Connection
            </button>
          </motion.div>
        )}

        {/* --- EMPTY FILTER STATE HANDLER --- */}
        {!isLoading && !hasError && filteredAndSortedArtworks.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto"
          >
            <div className="w-16 h-16 bg-[#3D2B1F]/5 rounded-full flex items-center justify-center text-[#3D2B1F]/40 mb-4">
              <Inbox size={24} />
            </div>
            <h3 className="text-lg font-black text-[#2C1D11] uppercase tracking-wide">No Masterpieces Found</h3>
            <p className="text-xs text-[#5C4033] mt-2 leading-relaxed font-medium opacity-70">
              We couldn't find any artworks matching your current search criteria or category filter parameters. Try checking your spelling or selecting another room.
            </p>
          </motion.div>
        )}

        {/* --- ARTWORKS RECONSTRUCTED GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-20">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <motion.div 
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white/50 backdrop-blur-sm rounded-[32px] p-4 border border-[#3D2B1F]/5 animate-pulse"
                >
                  <div className="w-full aspect-square bg-[#3D2B1F]/5 rounded-[24px] mb-4" />
                  <div className="h-4 bg-[#3D2B1F]/10 rounded w-2/3 mb-2 mx-auto" />
                  <div className="h-3 bg-[#3D2B1F]/5 rounded w-1/2 mb-4 mx-auto" />
                </motion.div>
              ))
            ) : (
              filteredAndSortedArtworks.map((art, index) => {
                if (!art || !art._id) return null;
                
                const productUrl = `/product-details/${art._id}`;
                const cardBg = CARD_BG_COLORS[index % CARD_BG_COLORS.length];
                const isWishlisted = wishlist?.includes(art._id) || false;

                return (
                  <motion.div
                    key={art._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                    className={`group relative ${cardBg} border-[3px] border-[#3D2B1F] rounded-[35px] p-6 shadow-[8px_8px_0px_0px_#3D2B1F] h-full flex flex-col justify-between`}
                  >
                    {/* Status Badge Overlays */}
                    {art.status === "sold" ? (
                      <div className="absolute -top-3 -left-3 bg-[#8A3324] text-[#FAECF0] px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border-2 border-[#3D2B1F] rotate-[-5deg] z-20 shadow-sm animate-pulse">
                        Sold Out 🍂
                      </div>
                    ) : (
                      <div className="absolute -top-3 -left-3 bg-[#8A9A5B] text-[#3D2B1F] px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border-2 border-[#3D2B1F] rotate-[-5deg] z-20">
                        Available ✨
                      </div>
                    )}

                    {/* Interactive Price Floating Badge */}
                    <div className="absolute -top-3 -right-3 bg-[#3D2B1F] text-[#FAECF0] w-14 h-14 rounded-full flex items-center justify-center font-black text-[10px] rotate-12 border-2 border-[#FDFBF7] shadow-md z-10">
                      ৳{art.price}
                    </div>

                    {/* Image Box Inner Container Frame */}
                    <Link href={productUrl} className="w-full aspect-square bg-[#3D2B1F]/5 rounded-[25px] border-2 border-[#3D2B1F]/10 mb-6 overflow-hidden flex items-center justify-center relative p-0 cursor-pointer">
                      <motion.img 
                        whileHover={{ scale: 1.1, rotate: 3 }}
                        transition={{ duration: 0.4 }}
                        src={art.img} 
                        alt={art.name || "Artwork Image"} 
                        className={`w-full h-full object-cover drop-shadow-md ${art.status === "sold" ? "grayscale opacity-60" : ""}`}
                      />
                      
                      {/* Floating Absolute Heart Action Over Media Frame */}
                      <div className="absolute bottom-3 right-3 z-20">
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onWishlistToggleClick(art._id, art.name || "Untitled Artwork");
                          }}
                          className={`p-2 rounded-full border shadow-sm transition-all backdrop-blur-md ${
                            isWishlisted
                              ? "bg-[#3D2B1F] border-[#3D2B1F] text-[#FDFBF7]" 
                              : "bg-[#FAECF0]/90 border-[#3D2B1F]/20 text-[#3D2B1F] hover:border-[#E2B4BD] hover:text-[#E2B4BD]"
                          }`}
                        >
                          <Heart 
                            size={14} 
                            fill={isWishlisted ? "currentColor" : "none"} 
                            strokeWidth={2.5} 
                          />
                        </motion.button>
                      </div>
                    </Link>

                    {/* Content Detail Info Wrapper */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[#8A9A5B] text-[9px] font-black tracking-[0.3em] uppercase block mb-1.5">
                          {art.tag || art.category}
                        </span>
                        <h4 className={`text-2xl italic font-bold lowercase tracking-tighter mb-1 text-[#2C1D11] ${art.status === "sold" ? "line-through opacity-50" : ""}`}>
                          {art.name}
                        </h4>
                        <p className="text-xs font-sans font-medium opacity-70 tracking-wide">
                          by {art.artist?.name || "Independent Artist"}
                        </p>
                      </div>

                      {/* Interactive Dual Action Row Stack */}
                      <div className="mt-6 space-y-3">
                        {art.status !== "sold" ? (
                          <button type="button" className="w-full bg-[#3D2B1F] text-[#FAECF0] py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#3D2B1F]/90 transition-all active:scale-95 shadow-sm">
                            <Plus size={14} strokeWidth={3} />
                            <span className="uppercase text-[10px] font-black tracking-widest">Acquire Artwork</span>
                          </button>
                        ) : (
                          <div className="w-full bg-[#8A3324]/10 text-[#8A3324] border border-[#8A3324]/20 py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest select-none cursor-not-allowed">
                            Unavailable / Sold out
                          </div>
                        )}
                        
                        <Link href={productUrl} className="w-full border-2 border-[#3D2B1F]/20 text-[#3D2B1F] py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#3D2B1F]/5 transition-all uppercase text-[9px] font-black tracking-[0.2em]">
                          <Eye size={14} /> Inspect Details
                        </Link>
                      </div>
                    </div>

                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}