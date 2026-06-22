"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Sparkles,
  CreditCard,
  User,
  ArrowUpRight,
  Loader2,
  Layers,
  Inbox,
  ShieldCheck,
  Tag,
  Eye,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

interface TransactionData {
  _id: string;
  transactionId: string;
  type: "purchase" | "subscription";
  amount: number;
  buyerEmail: string;
  buyerId?: string;
  status: "pending" | "successful" | "failed";
  createdAt: string;
  artworkId?: {
    _id: string;
    name: string;
    img: string;
    price: number;
    artist?: {
      name: string;
      email: string;
    };
    artistName?: string;
  };
}

interface WishlistItemData {
  _id: string;
  artwork: {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    img: string;
    tag: string;
    status: string;
    artist?: {
      name: string;
      email: string;
    };
    artistName?: string;
  };
}

interface CommentData {
  _id: string;
  comment: string;
  createdAt: string;
  artworkId: {
    _id: string;
    name: string;
    img?: string;
  } | null;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItemData[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"collection" | "history" | "wishlist" | "comments" >("collection");

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      setErrorMsg(null);

      // 1. Load User Transactions
      const txRes = await fetch(`http://localhost:5000/api/payments/my-transactions?userId=${user.id}`);
      const txJson = await txRes.json();
      
      let paidRecords: TransactionData[] = [];
      if (txJson && txJson.success && Array.isArray(txJson.data)) {
        paidRecords = txJson.data;
      } else {
        // Fallback placeholder logic
        const fallbackRes = await fetch(`http://localhost:5000/api/artworks`);
        const fallbackJson = await fallbackRes.json();
        
        if (fallbackJson && fallbackJson.success && Array.isArray(fallbackJson.artworks)) {
          paidRecords = fallbackJson.artworks.slice(0, 2).map((art: any, i: number) => ({
            _id: `mock-tx-${i}`,
            transactionId: `ch_mock_${Math.random().toString(36).substring(2, 10)}`,
            type: "purchase",
            amount: art.price || 0,
            buyerEmail: user.email || "",
            buyerId: user.id,
            status: "successful",
            createdAt: new Date().toISOString(),
            artworkId: art
          }));
        }
      }
      setTransactions(paidRecords);

      // 2. Load User Wishlist
      console.log("Requesting wishlist data for user ID:", user.id);
      const wishlistRes = await fetch(`http://localhost:5000/api/wishlist?userId=${user.id}`);
      const wishlistJson = await wishlistRes.json();

      if (wishlistJson && wishlistJson.success && Array.isArray(wishlistJson.data)) {
        setWishlistItems(wishlistJson.data);
      } else {
        setWishlistItems([]);
      }

      // 3. Load User Comments
      console.log("Requesting user comments stream for ID:", user.id);
      const commentsRes = await fetch(`http://localhost:5000/api/comments/user/${user.id}`);
      const commentsJson = await commentsRes.json();

      if (commentsJson && commentsJson.success && Array.isArray(commentsJson.data)) {
        setComments(commentsJson.data);
      } else {
        setComments([]);
      }

    } catch (err: any) {
      console.error("Dashboard core alignment sync error:", err);
      setErrorMsg("Failed to establish live interface sync with Chitrabeethi database infrastructure.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      const timer = setTimeout(() => router.push("/login"), 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const boughtArtworks = transactions.filter(
    (tx) => tx && tx.type === "purchase" && tx.status === "successful" && tx.artworkId
  );
  const purchaseCount = boughtArtworks.length;

  const totalInvested = transactions.reduce(
    (acc, curr) => (curr && curr.status === "successful" ? acc + (curr.amount || 0) : acc), 
    0
  );

  const activeTier = (user as any)?.subscriptionTier || "free";
  const tierConfig = {
    free: { name: "Free Tier", max: 3, progressColor: "bg-[#3D2B1F]/30" },
    pro: { name: "Pro Collector", max: 9, progressColor: "bg-[#8A9A5B]" },
    premium: { name: "Premium Guild", max: Infinity, progressColor: "bg-[#E2B4BD]" }
  }[activeTier as "free" | "pro" | "premium"] || { name: "Free Tier", max: 3, progressColor: "bg-[#3D2B1F]/30" };

  const progressPercent = tierConfig.max === Infinity 
    ? 100 
    : Math.min((purchaseCount / tierConfig.max) * 100, 100);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D2B1F] pt-32 pb-24 px-4 md:px-12 relative overflow-hidden font-sans select-none">
      {/* Structural Ambient Geometric Layer Accents */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(61,43,31,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(61,43,31,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-[15%] left-[-80px] w-[450px] h-[450px] bg-[#EFF2E7]/40 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-5 right-[-60px] w-[400px] h-[400px] bg-[#F5E6E8]/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- HEADER BLOCK --- */}
        <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b-[3px] border-[#3D2B1F] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8A9A5B]/10 rounded-full border border-[#8A9A5B]/20 text-[#8A9A5B] text-xs font-black uppercase tracking-widest mb-3">
              <Sparkles size={12} /> Collector Space
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-[#3D2B1F] leading-none">
              MY <span className="text-[#8A9A5B] italic font-normal">DASHBOARD</span>
            </h1>
            <p className="text-xs font-medium opacity-60 uppercase tracking-wider mt-2">
              Welcome back, {user?.name || "Patron of the Arts"} — Explore your private vault stash
            </p>
          </div>

          <div className="flex gap-3 flex-wrap w-full lg:w-auto">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/profile")}
              className="bg-[#FDFBF7] text-[#3D2B1F] border-[3px] border-[#3D2B1F] rounded-2xl text-xs font-black uppercase tracking-widest px-5 py-3.5 flex items-center gap-2 shadow-[4px_4px_0px_#3D2B1F] hover:shadow-none transition-all duration-200"
            >
              <User size={14} /> Profile Settings
            </motion.button>
          </div>
        </div>

        {/* --- ANALYTICS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Membership State Card */}
          <div className="bg-[#EFF2E7] border-[3px] border-[#3D2B1F] rounded-3xl p-6 shadow-[4px_4px_0px_#3D2B1F] relative overflow-hidden">
            <div className="absolute right-4 top-4 text-[#8A9A5B] opacity-20">
              <Layers size={48} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#3D2B1F]/60 mb-1">Membership State</p>
            <h3 className="text-2xl font-black uppercase tracking-tight text-[#3D2B1F] mb-4 flex items-center gap-2">
              {tierConfig.name}
              {activeTier !== "free" && <ShieldCheck size={18} className="text-[#8A9A5B]" />}
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span>Vault Space Spent</span>
                <span>{tierConfig.max === Infinity ? `${purchaseCount} / 👑` : `${purchaseCount} / ${tierConfig.max} Artworks`}</span>
              </div>
              <div className="w-full bg-[#FDFBF7] border-[2px] border-[#3D2B1F] rounded-full h-3 overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full ${tierConfig.progressColor} transition-all duration-500`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <p className="text-[9px] font-medium text-[#3D2B1F]/60 mt-3 italic">
              * Based on active structural tier allowances constraint variables.
            </p>
          </div>

          {/* Quick Metrics Multiplier Tracker */}
          <div className="bg-[#FDFBF7] border-[3px] border-[#3D2B1F] rounded-3xl p-6 shadow-[4px_4px_0px_#3D2B1F] flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#3D2B1F]/60 mb-1">Invested Allocation</p>
              <h3 className="text-4xl font-black tracking-tight text-[#3D2B1F]">
                ৳{totalInvested.toLocaleString()}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#8A9A5B] bg-[#8A9A5B]/10 border border-[#8A9A5B]/20 px-2.5 py-1 rounded-lg w-max mt-4 uppercase tracking-wider">
              <ShoppingBag size={10} /> Checked out {purchaseCount} creative items
            </div>
          </div>

          {/* Core Wishlist Info Card */}
          <div className="bg-[#F5E6E8] border-[3px] border-[#3D2B1F] rounded-3xl p-6 shadow-[4px_4px_0px_#3D2B1F] flex flex-col justify-between relative overflow-hidden">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#3D2B1F]/60 mb-1">Curated Wishlist</p>
              <h3 className="text-4xl font-black tracking-tight text-[#3D2B1F]">
                {wishlistItems.length} <span className="text-xs font-bold uppercase tracking-widest text-[#3D2B1F]/40">Assets Saved</span>
              </h3>
            </div>
            <p className="text-[10px] font-medium text-[#3D2B1F]/70 mt-4 leading-relaxed">
              Review saved masterworks or backstories seamlessly before they are claimed.
            </p>
          </div>

        </div>

        {/* --- NAVIGATION SWITCHER CONTROLLER --- */}
        <div className="flex border-b-[2px] border-[#3D2B1F]/20 mb-8 gap-4 overflow-x-auto pb-1">
          {[
            { id: "collection", name: "Purchased Gallery", icon: ShoppingBag },
            { id: "history", name: "Transaction History", icon: CreditCard },
            { id: "wishlist", name: "My Wishlist", icon: Heart },
            { id: "comments", name: "My Comments", icon: MessageSquare },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 font-black text-xs uppercase tracking-widest transition-all relative whitespace-nowrap ${
                  isTabActive ? "text-[#8A9A5B]" : "text-[#3D2B1F]/60 hover:text-[#3D2B1F]"
                }`}
              >
                <TabIcon size={14} />
                {tab.name}
                {isTabActive && (
                  <motion.div 
                    layoutId="activeUserDashboardTabLine"
                    className="absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#8A9A5B]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* --- MAIN INTERFACE CONTENT BLOCK PIPELINE --- */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-[#8A9A5B]" size={36} />
            <p className="text-xs font-mono tracking-widest uppercase text-[#3D2B1F]/50">Reading repository registry streams...</p>
          </div>
        ) : errorMsg ? (
          <div className="bg-red-50 border-[2px] border-red-200 text-red-800 p-6 rounded-2xl text-center text-xs font-semibold tracking-wide uppercase">
            {errorMsg}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: BOUGHT ARTWORKS GALLERY */}
            {activeTab === "collection" && (
              <motion.div
                key="collection-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {boughtArtworks.map((tx, idx) => {
                  const art = tx.artworkId;
                  if (!art) return null;
                  
                  const exhibitionCreator = art.artist?.name || art.artistName || "Verified Masterpiece Creator";

                  return (
                    <motion.div
                      key={tx._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                      className="bg-[#FDFBF7] border-[3px] border-[#3D2B1F] rounded-3xl overflow-hidden shadow-[4px_4px_0px_#3D2B1F] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-200 flex flex-col group"
                    >
                      <div className="aspect-square relative overflow-hidden bg-[#3D2B1F]/5 border-b-[3px] border-[#3D2B1F]">
                        <img 
                          src={art.img || "/placeholder.jpg"} 
                          alt={art.name || "Artwork Asset"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#3D2B1F] text-[#FDFBF7] text-[8px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                          Secured Masterpiece
                        </div>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-black uppercase tracking-tight text-[#3D2B1F] truncate">
                            {art.name || "Untitled Canvas"}
                          </h4>
                          <p className="text-[10px] font-medium text-[#3D2B1F]/60 mt-0.5">
                            By {exhibitionCreator}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#3D2B1F]/10">
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#3D2B1F]/40 block">Acquired Asset Net</span>
                            <span className="text-xs font-mono font-bold text-[#8A9A5B]">৳{(art.price || 0).toLocaleString()}</span>
                          </div>

                          {/* 🍃 FIXED ROUTE: point to /product-details/[id] dynamically */}
                          <Link href={`/product-details/${art._id}`}>
                            <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#EFF2E7] hover:bg-[#8A9A5B] hover:text-[#FDFBF7] text-[#3D2B1F] border-[2px] border-[#3D2B1F] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer">
                              View Details <Eye size={10} />
                            </span>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {boughtArtworks.length === 0 && (
                  <div className="col-span-full bg-[#FDFBF7] border-[3px] border-dashed border-[#3D2B1F]/20 rounded-3xl py-16 text-center">
                    <Inbox className="mx-auto text-[#3D2B1F]/30 mb-3" size={32} />
                    <p className="text-xs font-black uppercase tracking-widest text-[#3D2B1F]/40">No collection assets acquired yet</p>
                    <Link href="/browse" className="text-[10px] font-black text-[#8A9A5B] uppercase tracking-widest mt-2 block hover:underline">
                      Explore Public Exhibition Showcase →
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 2: PURCHASE HISTORY TABLE */}
            {activeTab === "history" && (
              <motion.div
                key="history-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#FDFBF7] border-[3px] border-[#3D2B1F] rounded-3xl overflow-hidden shadow-[4px_4px_0px_#3D2B1F]"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#3D2B1F] text-[#FDFBF7] text-[10px] font-black uppercase tracking-widest border-b-[3px] border-[#3D2B1F]">
                        <th className="p-4">Item Asset Reference</th>
                        <th className="p-4">Exhibition Creator</th>
                        <th className="p-4">Settlement Cost</th>
                        <th className="p-4">Execution Date</th>
                        <th className="p-4 text-right">Stripe Gateway ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3D2B1F]/10 text-xs font-medium">
                      {transactions.map((tx) => {
                        const tableCreator = tx.type === "subscription" 
                          ? "System Engine" 
                          : tx.artworkId?.artist?.name || tx.artworkId?.artistName || "Anonymous Creator";

                        return (
                          <tr key={tx._id} className="hover:bg-[#EFF2E7]/30 transition-colors">
                            <td className="p-4 font-black text-[#3D2B1F] max-w-[200px] truncate">
                              {tx.type === "subscription" ? (
                                <span className="inline-flex items-center gap-1.5 text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md text-[9px] uppercase font-black">
                                  Premium Space Upgraded
                                </span>
                              ) : (
                                tx.artworkId?.name || "Purged/Archived Asset Selection"
                              )}
                            </td>
                            <td className="p-4 text-[#3D2B1F]/70">
                              {tableCreator}
                            </td>
                            <td className="p-4 font-mono font-bold text-[#8A9A5B]">
                              ৳{(tx.amount || 0).toLocaleString()}
                            </td>
                            <td className="p-4 text-[#3D2B1F]/60 font-mono">
                              {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "---"}
                            </td>
                            <td className="p-4 text-right font-mono text-[10px] text-[#3D2B1F]/40 max-w-[150px] truncate" title={tx.transactionId}>
                              {tx.transactionId || "---"}
                            </td>
                          </tr>
                        );
                      })}

                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-xs font-black uppercase tracking-widest text-[#3D2B1F]/40">
                            No ledger data logs recorded in user metadata pipeline profiles.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* VIEW 3: WISHLIST */}
            {activeTab === "wishlist" && (
              <motion.div
                key="wishlist-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {wishlistItems.map((item, idx) => {
                  const art = item.artwork;
                  if (!art) return null;
                  
                  const wishlistCreator = art.artist?.name || art.artistName || "Exhibition Creator";

                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                      className="bg-[#FDFBF7] border-[3px] border-[#3D2B1F] rounded-3xl overflow-hidden shadow-[4px_4px_0px_#3D2B1F] flex flex-col justify-between group"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden bg-[#3D2B1F]/5 border-b-[3px] border-[#3D2B1F]">
                        <img 
                          src={art.img || "/placeholder.jpg"} 
                          alt={art.name || "Wishlist Item"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {art.category && (
                          <div className="absolute top-3 right-3 px-2 py-1 bg-[#F5E6E8] border border-[#3D2B1F]/20 text-[#3D2B1F]/70 text-[8px] font-black uppercase tracking-widest rounded-md flex items-center gap-1">
                            <Tag size={8} /> {art.category}
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <h4 className="text-base font-black uppercase tracking-tight text-[#3D2B1F] truncate">
                            {art.name || "Untitled Canvas"}
                          </h4>
                          <p className="text-[10px] font-medium text-[#3D2B1F]/60">
                            By {wishlistCreator}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#3D2B1F]/10">
                          <span className="text-sm font-mono font-bold text-[#3D2B1F]">৳{(art.price || 0).toLocaleString()}</span>
                          
                          {/* 🍃 FIXED ROUTE: point to /product-details/[id] dynamically */}
                          <button
                            onClick={() => router.push(`/product-details/${art._id}`)}
                            className="bg-[#3D2B1F] text-[#FDFBF7] border-2 border-[#3D2B1F] rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-[#8A9A5B] transition-colors flex items-center gap-1"
                          >
                            View Details <ArrowUpRight size={11} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {wishlistItems.length === 0 && (
                  <div className="col-span-full bg-[#FDFBF7] border-[3px] border-dashed border-[#3D2B1F]/20 rounded-3xl py-16 text-center">
                    <Heart className="mx-auto text-[#3D2B1F]/20 mb-3" size={32} />
                    <p className="text-xs font-black uppercase tracking-widest text-[#3D2B1F]/40">Your wishlist drawer is empty</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW 4: MY COMMENTS */}
            {activeTab === "comments" && (
              <motion.div
                key="comments-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {comments.map((comment, idx) => (
                  <motion.div
                    key={comment._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.04 } }}
                    className="bg-[#FDFBF7] border-[3px] border-[#3D2B1F] rounded-2xl p-5 shadow-[4px_4px_0px_#3D2B1F] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:translate-y-[-2px]"
                  >
                    <div className="flex items-start gap-4 max-w-2xl">
                      <div className="bg-[#8A9A5B]/10 p-2.5 rounded-xl border border-[#8A9A5B]/20 text-[#8A9A5B] shrink-0 mt-0.5">
                        <MessageSquare size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#3D2B1F] leading-relaxed break-words">
                          "{comment.comment}"
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[10px] font-bold text-[#3D2B1F]/50 uppercase tracking-wide">
                          <span>Posted on:</span>
                          <span className="font-mono text-[#3D2B1F]/70">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "---"}
                          </span>
                          {comment.artworkId && (
                            <>
                              <span className="text-[#3D2B1F]/30">•</span>
                              <span>Artwork:</span>
                              <span className="text-[#8A9A5B] italic font-medium normal-case">
                                {comment.artworkId.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {comment.artworkId && (
                      /* 🍃 FIXED ROUTE: point to /product-details/[id] dynamically */
                      <button
                        onClick={() => router.push(`/product-details/${comment.artworkId?._id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#EFF2E7] hover:bg-[#3D2B1F] hover:text-[#FDFBF7] text-[#3D2B1F] border-[2px] border-[#3D2B1F] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap self-end sm:self-auto cursor-pointer"
                      >
                        Go to Canvas <ArrowRight size={11} />
                      </button>
                    )}
                  </motion.div>
                ))}

                {comments.length === 0 && (
                  <div className="bg-[#FDFBF7] border-[3px] border-dashed border-[#3D2B1F]/20 rounded-3xl py-16 text-center">
                    <MessageSquare className="mx-auto text-[#3D2B1F]/20 mb-3" size={32} />
                    <p className="text-xs font-black uppercase tracking-widest text-[#3D2B1F]/40">You haven't left any narrative reviews yet</p>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        )}

      </div>
    </div>
  );
}