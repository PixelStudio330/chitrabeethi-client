"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, ArrowLeft, Sparkles, ShieldCheck, Paintbrush, Calendar, Tag, MessageSquare, Send, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// --- TYPES MATCHING YOUR SPECIFICATION ---
interface Comment {
  id: string;
  userName: string;
  text: string;
  createdAt: string;
}

interface Artwork {
  id: string;
  title: string;
  bengaliTitle?: string;
  artistId: string;
  artistName: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string; // From imgBB
  status: "available" | "sold";
  createdAt: string;
}

export default function ArtworkDetails() {
  const { id } = useParams();
  const router = useRouter();

  // Framework/Auth Mock States (Swap with your actual AuthContext / JWT decoding later)
  const [currentUser, setCurrentUser] = useState({
    isLoggedIn: true,
    id: "user_123", // Change this to mockArtwork.artistId to test the disabled self-purchase flag!
    name: "Nabila Rahman",
    role: "user" 
  });

  // Structural Core States
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // --- SIMULATED BACKEND FETCHING ---
  useEffect(() => {
    const timer = setTimeout(() => {
      // Set to null to test your "Artwork Not Found" error boundary state
      setArtwork({
        id: id as string,
        title: "Spring Whispers",
        bengaliTitle: "বসন্তের গুনগুন",
        artistId: "artist_99", 
        artistName: "Mst. Gulnahar",
        price: 12500,
        category: "Watercolor Painting",
        description: "A delicate exploration of a Bangladeshi winter morning transitioning into early spring. Captured with soft, layered washes to evoke the fleeting dew and early blossoms of the delta.",
        imageUrl: "", // Handled by standard layout placeholder text below
        status: "available",
        createdAt: "2026-02-14"
      });

      setComments([
        { id: "c1", userName: "Anisa Kabir", text: "The color transitions here look absolutely magical. Reminds me of foggy mornings!", createdAt: "2026-05-10" },
      ]);
      setLoading(false);
    }, 1200); 

    return () => clearTimeout(timer);
  }, [id]);

  // --- ACTIONS ---
  const handlePurchase = () => {
    if (!currentUser.isLoggedIn) {
      router.push("/login");
      return;
    }
    // Stripe Checkout API integration link target goes here
    console.log("Redirecting to Stripe Checkout for artwork:", artwork?.id);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: Math.random().toString(),
      userName: currentUser.name,
      text: newComment,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setComments([newCommentObj, ...comments]);
    setNewComment("");
  };

  // --- VALIDATION FLAGS ---
  const isArtistOwner = artwork && currentUser.isLoggedIn && currentUser.id === artwork.artistId;
  const isPurchaseDisabled = artwork?.status !== "available" || isArtistOwner;

  // ==========================================
  // 1. STATE BOUNDARY: SKELETON LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-36 px-6 max-w-6xl mx-auto animate-pulse">
        <div className="w-32 h-8 bg-[#3D2B1F]/10 rounded-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 bg-[#3D2B1F]/5 rounded-[2.5rem] aspect-[4/5]" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-4 w-1/3 bg-[#3D2B1F]/10 rounded-full" />
            <div className="h-12 w-3/4 bg-[#3D2B1F]/10 rounded-xl" />
            <div className="h-20 w-full bg-[#3D2B1F]/10 rounded-2xl" />
            <div className="h-14 w-1/2 bg-[#3D2B1F]/10 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. STATE BOUNDARY: NOT FOUND EXCEPTION
  // ==========================================
  if (!artwork) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] text-[#3D2B1F] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-8 rounded-[2.5rem] bg-[#3D2B1F]/5 max-w-md shadow-inner border border-[#3D2B1F]/5">
          <span className="text-4xl">🔍</span>
          <h1 className="text-2xl font-black uppercase tracking-tight mt-4">Artwork Not Found</h1>
          <p className="text-sm opacity-70 mt-2 leading-relaxed">
            The masterpiece you are searching for has dissolved into thin air, or the item identifier string is broken.
          </p>
          <Link href="/browse" className="mt-6 inline-block font-black uppercase tracking-wider text-[10px] bg-[#3D2B1F] text-[#FDFBF7] px-6 py-3 rounded-full hover:bg-[#8A9A5B] transition-colors">
            Return to Gallery
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // 3. MAIN INTERFACE RENDER
  // ==========================================
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#3D2B1F] pt-36 pb-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* TOP INTERACTION LINE */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link href="/browse" className="inline-flex items-center gap-2 group font-black uppercase tracking-[0.2em] text-[10px] bg-[#3D2B1F]/5 hover:bg-[#3D2B1F]/10 px-4 py-2 rounded-full transition-all duration-300">
            <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
            Back to Gallery
          </Link>

          {/* DYNAMIC ARTIST MANAGED SYSTEM PANEL */}
          {isArtistOwner && (
            <div className="flex items-center gap-2 bg-[#8A9A5B]/10 p-1.5 rounded-full border border-[#8A9A5B]/20">
              <span className="text-[9px] font-black uppercase tracking-wider text-[#8A9A5B] pl-3 pr-2">Your Studio Item:</span>
              <button className="p-2 rounded-full bg-[#FDFBF7] text-[#3D2B1F] hover:bg-[#E2B4BD] shadow-sm transition-colors" title="Edit Masterpiece">
                <Edit size={14} />
              </button>
              <button 
                onClick={() => { if(confirm("Are you sure you want to burn this artwork from the vault?")) alert("Deleted!"); }}
                className="p-2 rounded-full bg-[#3D2B1F] text-[#FDFBF7] hover:bg-red-700 shadow-sm transition-colors" 
                title="Destroy Masterpiece"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* --- CORE PRODUCT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* IMAGE PREVIEW FRAME BLOCK */}
          <div className="lg:col-span-7 flex justify-center relative sticky top-36">
            <div className="absolute -top-12 -left-12 w-72 h-72 bg-[#E2B4BD]/20 rounded-full blur-3xl pointer-events-none" />
            
            <motion.div 
              className="relative rounded-[2.5rem] p-4 bg-[#3D2B1F]/5 border border-[#3D2B1F]/5 shadow-xl cursor-zoom-in overflow-hidden w-full max-w-lg aspect-[4/5] flex items-center justify-center"
              whileHover={{ scale: 1.01 }}
              onClick={() => setIsZoomed(!isZoomed)}
              layout
            >
              <motion.div 
                className="w-full h-full rounded-[1.8rem] overflow-hidden relative bg-[#F4EFE6]"
                animate={{ scale: isZoomed ? 1.2 : 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 25 }}
              >
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#3d2b1f_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* Fallback Display Frame Mocking imgBB Rendering */}
                {artwork.imageUrl ? (
                  <img src={artwork.imageUrl} alt={artwork.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-sm text-[#3D2B1F]/40 italic">
                    [ imgBB Cloud Image Source: {artwork.title} ]
                  </div>
                )}
              </motion.div>

              <span className={`absolute top-8 left-8 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md ${
                artwork.status === "available" ? "bg-[#8A9A5B] text-[#FDFBF7]" : "bg-red-800 text-[#FDFBF7]"
              }`}>
                {artwork.status}
              </span>
            </motion.div>
          </div>

          {/* META DESCRIPTION INFO COLUMN */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8A9A5B] bg-[#8A9A5B]/10 px-3 py-1 rounded-full flex items-center gap-1">
                  <Paintbrush size={10} /> Certified Original
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black font-sans uppercase tracking-tight text-[#3D2B1F]">
                {artwork.title}
              </h1>
              {artwork.bengaliTitle && (
                <h2 className="text-2xl font-bold font-bengali text-[#E2B4BD] mt-1">{artwork.bengaliTitle}</h2>
              )}
              
              {/* Dynamic Link Route tracking to Artist profile */}
              <p className="text-xs font-bold tracking-wider opacity-60 mt-2 uppercase">
                Artist:{" "}
                <Link href={`/browse?artist=${artwork.artistId}`} className="text-[#8A9A5B] hover:underline underline-offset-4 decoration-2">
                  {artwork.artistName}
                </Link>
              </p>
            </div>

            {/* Price tag Capsule */}
            <div className="inline-flex items-baseline gap-3 bg-[#3D2B1F] text-[#FDFBF7] p-5 rounded-[2rem] shadow-lg w-fit pr-10">
              <span className="text-3xl font-black tracking-tight font-sans">৳{artwork.price.toLocaleString("bn-BD")}</span>
              <span className="text-[10px] font-black tracking-widest text-[#E2B4BD] uppercase">BDT / Fixed Price</span>
            </div>

            {/* Meta tags Pill Group */}
            <div className="grid grid-cols-2 gap-3 bg-[#3D2B1F]/5 p-4 rounded-[2rem] border border-[#3D2B1F]/5">
              <div className="bg-[#FDFBF7] p-3 rounded-[1.2rem] text-center shadow-sm flex flex-col items-center justify-center">
                <Tag size={12} className="text-[#8A9A5B] mb-1" />
                <p className="text-[8px] font-black uppercase tracking-wider text-[#3D2B1F]/50">Classification</p>
                <p className="text-xs font-bold mt-0.5">{artwork.category}</p>
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-[1.2rem] text-center shadow-sm flex flex-col items-center justify-center">
                <Calendar size={12} className="text-[#E2B4BD] mb-1" />
                <p className="text-[8px] font-black uppercase tracking-wider text-[#3D2B1F]/50">Vault Release</p>
                <p className="text-xs font-bold mt-0.5">{artwork.createdAt}</p>
              </div>
            </div>

            {/* Poetic Description Text */}
            <p className="text-sm font-medium leading-relaxed text-[#3D2B1F]/80 pl-4 border-l-2 border-[#E2B4BD]">
              "{artwork.description}"
            </p>

            {/* --- CORE PURCHASE UTILITY ACTION --- */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex gap-4">
                <motion.button 
                  whileHover={!isPurchaseDisabled ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isPurchaseDisabled ? { scale: 0.98 } : {}}
                  onClick={handlePurchase}
                  disabled={isPurchaseDisabled}
                  className={`flex-1 font-black uppercase tracking-[0.2em] text-xs py-4 px-6 rounded-full flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                    isPurchaseDisabled
                      ? "bg-[#3D2B1F]/10 text-[#3D2B1F]/30 cursor-not-allowed shadow-none line-through"
                      : "bg-[#E2B4BD] text-[#3D2B1F] hover:bg-[#8A9A5B] hover:text-[#FDFBF7]"
                  }`}
                >
                  <span>
                    {artwork.status === "sold" 
                      ? "Artwork Sold Out" 
                      : isArtistOwner 
                        ? "You Own This Piece" 
                        : currentUser.isLoggedIn 
                          ? "Acquire via Stripe" 
                          : "Log In to Acquire"}
                  </span>
                  <ShoppingBag size={16} strokeWidth={2.5} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                    isWishlisted 
                      ? "bg-[#E2B4BD]/20 border-[#E2B4BD] text-[#E2B4BD]" 
                      : "border-[#3D2B1F]/20 text-[#3D2B1F] hover:border-[#E2B4BD] hover:text-[#E2B4BD]"
                  }`}
                >
                  <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={2.5} />
                </motion.button>
              </div>

              {/* Sub-context contextual messaging */}
              {isArtistOwner && (
                <p className="text-[10px] text-center font-bold text-red-700/70 tracking-wide mt-1">
                  ⚠️ System Protection: Artists cannot purchase their own registered portfolio listings.
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 mt-2 opacity-50 text-[10px] font-black uppercase tracking-widest text-center">
              <div className="flex items-center gap-1.5"><ShieldCheck size={14} /> Authenticated Contract</div>
              <div className="flex items-center gap-1.5"><Sparkles size={14} /> Courier Protection</div>
            </div>

            {/* --- PUBLIC FEEDBACK & COMMENT HOOK --- */}
            <hr className="border-[#3D2B1F]/10 my-4" />
            
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#3D2B1F] flex items-center gap-2">
                <MessageSquare size={14} /> Gallery Dialogue ({comments.length})
              </h3>

              {/* Secure Input Context Intercept Form */}
              {currentUser.isLoggedIn ? (
                <form onSubmit={handlePostComment} className="flex gap-2 items-center bg-[#3D2B1F]/5 p-2 rounded-full border border-[#3D2B1F]/5">
                  <input 
                    type="text" 
                    placeholder="Leave a thought on this canvas..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-transparent px-4 py-2 text-xs font-medium focus:outline-none placeholder-[#3D2B1F]/40 text-[#3D2B1F]"
                  />
                  <button type="submit" className="p-2 rounded-full bg-[#3D2B1F] text-[#FDFBF7] hover:bg-[#8A9A5B] transition-colors">
                    <Send size={12} />
                  </button>
                </form>
              ) : (
                <div className="text-center p-4 rounded-2xl bg-[#3D2B1F]/5 border border-dashed border-[#3D2B1F]/10">
                  <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider">
                    You must be logged in to participate in the conversation.
                  </p>
                  <Link href="/login" className="inline-block text-[9px] font-black uppercase text-[#8A9A5B] hover:underline mt-1">
                    Sign In to Account →
                  </Link>
                </div>
              )}

              {/* Feed Display Thread */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {comments.map((comment) => (
                    <motion.div 
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-[#3D2B1F]/5 p-3.5 rounded-[1.5rem] border border-[#3D2B1F]/5 relative"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider">{comment.userName}</span>
                        <span className="text-[8px] opacity-40 font-bold">{comment.createdAt}</span>
                      </div>
                      <p className="text-xs font-medium opacity-80 leading-relaxed">
                        {comment.text}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}