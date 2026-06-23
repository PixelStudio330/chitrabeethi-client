"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  ShoppingBag, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Paintbrush, 
  Calendar, 
  Tag, 
  MessageSquare, 
  Send, 
  Trash2, 
  Edit, 
  X, 
  Check,
  Loader2,
  Layers,
  Activity,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getArtworkById, getCommentsByArtwork, postComment, ArtworkData, CommentData } from "../../../utils/api";
import { useAuth } from "../../context/AuthContext"; 
import { useSharedWishlist } from "../../../utils/WishlistContext"; 

export default function ArtworkDetails() {
  const { id } = useParams();
  const router = useRouter();
  
  const { user } = useAuth();
  const { wishlist, handleWishlistToggle } = useSharedWishlist();

  const [artwork, setArtwork] = useState<ArtworkData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [hasPurchased, setHasPurchased] = useState<boolean>(false); 
  const [purchaseCount, setPurchaseCount] = useState<number>(0); // Track total user acquisitions for constraints
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Modal Control States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // For Comments
  const [isArtEditModalOpen, setIsArtEditModalOpen] = useState(false); // For Artwork Listing
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isSavingArtwork, setIsSavingArtwork] = useState(false);
  const [isDeletingArtwork, setIsDeletingArtwork] = useState(false);

  // Artwork Editing Form State
  const [artFormData, setArtFormData] = useState({
    name: "",
    price: 0,
    category: "Painting",
    tag: "",
    description: "",
    img: "",
    status: "available"
  });

  // Toast Notification States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "info" | "error">("success");

  const isWishlisted = wishlist.includes(id as string);

  useEffect(() => {
    if (!id) return;

    // Capture the Stripe checkout session parameter from the URL if returning from a purchase
    const urlParams = new URLSearchParams(window.location.search);
    const stripeSessionId = urlParams.get("session_id");

    async function loadArtworkDetails() {
      try {
        setLoading(true);

        // If arriving with a session_id, verify the payment with the backend immediately
        if (stripeSessionId) {
          try {
            const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/payments/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId: stripeSessionId })
            });
            
            if (verifyResponse.ok) {
              showToast("Transaction captured and vaulted successfully!", "success");
              // Clear URL query parameters cleanly so refreshing doesn't send duplicate requests
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch (vErr) {
            console.error("Manual verification handoff loop crashed:", vErr);
          }
        }
        
        const artData = await getArtworkById(id as string);
        setArtwork(artData);

        // Map initial structural form values from backend schema properties
        if (artData) {
          setArtFormData({
            name: artData.name || "",
            price: artData.price || 0,
            category: artData.category || "Painting",
            tag: artData.tag || "",
            description: artData.description || "",
            img: artData.img || "",
            status: artData.status || "available"
          });
        }

        // Gather Comments & Purchase History Details
        const responseData = await getCommentsByArtwork(id as string, user?.id);
        setComments(responseData.comments || []);
        setHasPurchased(responseData.hasPurchased || false);

        // Fetch user transaction history pipeline to enforce limits accurately on frontend
        if (user?.id) {
          const txRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/payments/my-transactions?userId=${user.id}`);
          const txJson = await txRes.json();
          if (txJson && txJson.success && Array.isArray(txJson.data)) {
            const successfulPurchases = txJson.data.filter(
              (tx: any) => tx.type === "purchase" && tx.status === "successful"
            );
            setPurchaseCount(successfulPurchases.length);
          }
        }
      } catch (err) {
        console.error("Database connection failure on resource lookup:", err);
        setArtwork(null);
      } finally {
        setLoading(false);
      }
    }

    loadArtworkDetails();
  }, [id, user?.id]);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handlePurchase = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setPaymentLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/payments/create-artwork-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artworkId: artwork?._id,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to initialize secure checkout session.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Critical failure initializing Stripe Checkout engine:", err);
      alert("Could not connect to the transaction gate.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSaveArtworkEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !id || !artwork) return;

    try {
      setIsSavingArtwork(true);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artworks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          authUser: {
            id: user.id,
            role: user.role || "artist"
          },
          name: artFormData.name,
          price: Number(artFormData.price),
          category: artFormData.category,
          tag: artFormData.tag,
          description: artFormData.description,
          img: artFormData.img,
          status: artFormData.status
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        showToast(resData.message || "Could not save structural changes.", "error");
        return;
      }

      setArtwork((prev) => prev ? { 
        ...prev, 
        name: artFormData.name,
        price: artFormData.price,
        category: artFormData.category as any,
        tag: artFormData.tag,
        description: artFormData.description,
        img: artFormData.img,
        status: artFormData.status as any
      } : null);

      setIsArtEditModalOpen(false);
      showToast("Studio artwork properties saved successfully!", "success");
    } catch (err) {
      console.error("Critical server write update exception error:", err);
      showToast("Connection to server timed out.", "error");
    } finally {
      setIsSavingArtwork(false);
    }
  };

  const handleDeleteArtwork = async () => {
    if (!user?.id || !id) return;
    if (!confirm("Are you completely certain you want to purge this artwork from the vault repository? This cannot be undone.")) return;

    try {
      setIsDeletingArtwork(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artworks/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authUser: {
            id: user.id,
            role: user.role || "artist"
          }
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        showToast(resData.message || "Failed to complete registry drop request.", "error");
        return;
      }

      showToast("Masterpiece registry index dropped.", "info");
      setTimeout(() => {
        router.push("/browse");
      }, 1500);

    } catch (err) {
      console.error("Failed to remove target artwork entry:", err);
      showToast("Could not contact server registry layer.", "error");
    } finally {
      setIsDeletingArtwork(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !artwork || !user?.id) return;

    try {
      const savedComment = await postComment(artwork._id, {
        userId: user.id,
        userName: user.name || "Anonymous Collector",
        comment: newComment.trim()
      });

      setComments((prev) => [savedComment, ...prev]);
      setNewComment("");
      showToast("Review committed to the gallery thread!", "success");
    } catch (err: any) {
      console.error("Failed to save thread review log entry:", err);
      alert(err.message || "Access Denied: Only authenticated collectors who purchased this artwork can leave reviews.");
    }
  };

  const handleStartEdit = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditText(currentText);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim() || !user?.id || !editingCommentId) return;

    try {
      setIsSavingEdit(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artworks/${id}/comments/${editingCommentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, comment: editText.trim() })
      });

      if (!response.ok) {
        const errData = await response.json();
        alert(errData.message || "Could not update your statement review changes.");
        return;
      }
      
      setComments((prev) =>
        prev.map((c) => (c._id === editingCommentId ? { ...c, comment: editText.trim() } : c))
      );
      
      setIsEditModalOpen(false);
      setEditingCommentId(null);
      showToast("Your canvas thread note has been updated.", "success");
    } catch (err) {
      console.error("Failed to save comment edits:", err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user?.id || !confirm("Are you certain you want to remove your comment?")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artworks/${id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (!response.ok) {
        const errData = await response.json();
        alert(errData.message || "Failed to drop comment resource.");
        return;
      }

      setComments((prev) => prev.filter((c) => c._id !== commentId));
      showToast("Comment successfully dropped.", "info");
    } catch (err) {
      console.error("Failed to remove comment entry:", err);
    }
  };

  const onWishlistClick = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    await handleWishlistToggle(id as string);
    if (!isWishlisted) {
      showToast(`"${artwork?.name || 'Masterpiece'}" added to your vault wishlist!`, "success");
    } else {
      showToast(`Removed "${artwork?.name || 'Masterpiece'}" from your wishlist.`, "info");
    }
  };

  // Check ownership matches based on backend controller configurations
  const isArtistOwner = artwork && user && (user.id === artwork.artist?._id || user.id === artwork.artist as any);
  
  // 💡 DYNAMIC SUBSCRIPTION RESTRICTIONS PIPELINE FIXED
  // Normalizes tier string handling from user auth context object data models cleanly
  const activeTier = ((user as any)?.subscriptionTier || "free").toLowerCase();
  
  // Evaluates strict tier maximum bounds correctly so Pro accounts can pass intermediate ranges
  const isTierRestricted = 
    (activeTier === "free" && purchaseCount >= 3) || 
    (activeTier === "pro" && purchaseCount >= 9);

  const isPurchaseDisabled = artwork?.status === "sold" || isArtistOwner || paymentLoading || isTierRestricted;

  const getArtistId = () => {
    if (!artwork || !artwork.artist) return "";
    return typeof artwork.artist === "object" ? artwork.artist._id : artwork.artist;
  };

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

  if (!artwork) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] text-[#3D2B1F] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-8 rounded-[2.5rem] bg-[#3D2B1F]/5 max-w-md shadow-inner border border-[#3D2B1F]/5">
          <span className="text-4xl">🔍</span>
          <h1 className="text-2xl font-black uppercase tracking-tight mt-4">Artwork Not Found</h1>
          <p className="text-sm opacity-70 mt-2 leading-relaxed">
            The masterpiece has dissolved into thin air, or the collection identifier query link string is broken.
          </p>
          <Link href="/browse" className="mt-6 inline-block font-black uppercase tracking-wider text-[10px] bg-[#3D2B1F] text-[#FDFBF7] px-6 py-3 rounded-full hover:bg-[#8A9A5B] transition-colors">
            Return to Gallery
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#3D2B1F] pt-36 pb-20 px-6 overflow-hidden">
      {/* Toast Notification Element */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: -20, scale: 0.9, x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-28 left-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full shadow-xl border backdrop-blur-md font-sans text-xs font-black uppercase tracking-wider text-[#3D2B1F]"
            style={{
              backgroundColor: toastType === "success" ? "rgba(138, 154, 91, 0.15)" : toastType === "info" ? "rgba(226, 180, 189, 0.25)" : "rgba(185, 28, 28, 0.15)",
              borderColor: toastType === "success" ? "#8A9A5B" : toastType === "info" ? "#E2B4BD" : "#B91C1C",
            }}
          >
            <Heart size={14} className={toastType === "success" ? "text-[#8A9A5B]" : toastType === "info" ? "text-[#E2B4BD]" : "text-red-700"} fill={toastType === "success" ? "currentColor" : "none"} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DYNAMIC COMMENT EDITING MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-[#3D2B1F]/30 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md bg-[#FDFBF7] border-2 border-[#3D2B1F]/10 rounded-[2.5rem] p-6 shadow-2xl z-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#8A9A5B]/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center mb-4 relative">
                <div className="flex items-center gap-2">
                  <Edit size={14} className="text-[#8A9A5B]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Revise Canvas Thought</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[#3D2B1F]/5 transition-colors text-[#3D2B1F]/70"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 relative">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/60 pl-1">
                    Your Statement Note
                  </label>
                  <textarea
                    rows={4}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Refine your collector review details..."
                    required
                    className="w-full bg-[#3D2B1F]/5 border-2 border-transparent focus:border-[#8A9A5B] rounded-2xl p-4 text-xs font-medium text-[#3D2B1F] outline-none resize-none transition-colors"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-[#3D2B1F]/5 text-[#3D2B1F] font-black text-[10px] uppercase tracking-widest py-3 rounded-full hover:bg-[#3D2B1F]/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit || !editText.trim()}
                    className="flex-1 bg-[#3D2B1F] text-[#FDFBF7] font-black text-[10px] uppercase tracking-widest py-3 rounded-full hover:bg-[#8A9A5B] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isSavingEdit ? "Saving..." : (
                      <>
                        Save Changes <Check size={12} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DYNAMIC CORE ARTWORK DATA EDITING MODAL */}
      <AnimatePresence>
        {isArtEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsArtEditModalOpen(false)}
              className="absolute inset-0 bg-[#3D2B1F]/30 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md bg-[#FDFBF7] border-2 border-[#3D2B1F]/10 rounded-[2.5rem] p-6 shadow-2xl z-10 overflow-hidden text-[#3D2B1F]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E2B4BD]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-center mb-4 relative">
                <div className="flex items-center gap-2">
                  <Paintbrush size={14} className="text-[#8A9A5B]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Update Masterpiece Configuration</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsArtEditModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[#3D2B1F]/5 transition-colors text-[#3D2B1F]/70"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveArtworkEdit} className="space-y-4 relative">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/60 pl-1">Artwork Title (Name)</label>
                  <input
                    type="text"
                    value={artFormData.name}
                    onChange={(e) => setArtFormData({...artFormData, name: e.target.value})}
                    required
                    className="w-full bg-[#3D2B1F]/5 border-2 border-transparent focus:border-[#8A9A5B] rounded-2xl p-3.5 text-xs font-medium text-[#3D2B1F] outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/60 pl-1">Price (৳ BDT)</label>
                    <input
                      type="number"
                      value={artFormData.price}
                      onChange={(e) => setArtFormData({...artFormData, price: Number(e.target.value)})}
                      required
                      min="0"
                      className="w-full bg-[#3D2B1F]/5 border-2 border-transparent focus:border-[#8A9A5B] rounded-2xl p-3.5 text-xs font-mono text-[#3D2B1F] outline-none transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/60 pl-1">Category Select</label>
                    <select
                      value={artFormData.category}
                      onChange={(e) => setArtFormData({...artFormData, category: e.target.value})}
                      className="w-full bg-[#3D2B1F]/5 border-2 border-transparent focus:border-[#8A9A5B] rounded-2xl p-3.5 text-xs font-medium text-[#3D2B1F] outline-none transition-colors appearance-none"
                    >
                      {["Canvas", "Paper", "Painting", "Acrylic Art", "Sculpture", "Photography"].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/60 pl-1">Classification Sub-Tag</label>
                    <input
                      type="text"
                      value={artFormData.tag}
                      placeholder="e.g. Original Acrylic"
                      onChange={(e) => setArtFormData({...artFormData, tag: e.target.value})}
                      required
                      className="w-full bg-[#3D2B1F]/5 border-2 border-transparent focus:border-[#8A9A5B] rounded-2xl p-3.5 text-xs font-medium text-[#3D2B1F] outline-none transition-colors"
                  />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/60 pl-1">Availability Status</label>
                    <select
                      value={artFormData.status}
                      onChange={(e) => setArtFormData({...artFormData, status: e.target.value})}
                      className="w-full bg-[#3D2B1F]/5 border-2 border-transparent focus:border-[#8A9A5B] rounded-2xl p-3.5 text-xs font-medium text-[#3D2B1F] outline-none transition-colors appearance-none"
                    >
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/60 pl-1">High-Res Image URL</label>
                  <input
                    type="url"
                    value={artFormData.img}
                    onChange={(e) => setArtFormData({...artFormData, img: e.target.value})}
                    required
                    className="w-full bg-[#3D2B1F]/5 border-2 border-transparent focus:border-[#8A9A5B] rounded-2xl p-3.5 text-xs font-mono text-[#3D2B1F] outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/60 pl-1">Exhibition Description Notes</label>
                  <textarea
                    rows={3}
                    value={artFormData.description}
                    onChange={(e) => setArtFormData({...artFormData, description: e.target.value})}
                    required
                    className="w-full bg-[#3D2B1F]/5 border-2 border-transparent focus:border-[#8A9A5B] rounded-2xl p-4 text-xs font-medium text-[#3D2B1F] outline-none resize-none transition-colors"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsArtEditModalOpen(false)}
                    className="flex-1 bg-[#3D2B1F]/5 text-[#3D2B1F] font-black text-[10px] uppercase tracking-widest py-3.5 rounded-full hover:bg-[#3D2B1F]/10 transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingArtwork}
                    className="flex-1 bg-[#3D2B1F] text-[#FDFBF7] font-black text-[10px] uppercase tracking-widest py-3.5 rounded-full hover:bg-[#8A9A5B] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isSavingArtwork ? (
                      <>Saving <Loader2 className="animate-spin" size={12} /></>
                    ) : (
                      <>Commit Changes <Check size={12} /></>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link href="/browse" className="inline-flex items-center gap-2 group font-black uppercase tracking-[0.2em] text-[10px] bg-[#3D2B1F]/5 hover:bg-[#3D2B1F]/10 px-4 py-2 rounded-full transition-all duration-300">
            <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
            Back to Gallery
          </Link>

          {isArtistOwner && (
            <div className="flex items-center gap-2 bg-[#8A9A5B]/10 p-1.5 rounded-full border border-[#8A9A5B]/20">
              <span className="text-[9px] font-black uppercase tracking-wider text-[#8A9A5B] pl-3 pr-2">Your Studio Item:</span>
              <button 
                type="button"
                onClick={() => {
                  setArtFormData({
                    name: artwork.name || "",
                    price: artwork.price || 0,
                    category: artwork.category || "Painting",
                    tag: artwork.tag || "",
                    description: artwork.description || "",
                    img: artwork.img || "",
                    status: artwork.status || "available"
                  });
                  setIsArtEditModalOpen(true);
                }}
                className="p-2 rounded-full bg-[#FDFBF7] text-[#3D2B1F] hover:bg-[#E2B4BD] shadow-sm transition-colors" 
                title="Edit Masterpiece Details"
              >
                <Edit size={14} />
              </button>
              <button 
                type="button"
                disabled={isDeletingArtwork}
                onClick={handleDeleteArtwork}
                className="p-2 rounded-full bg-[#3D2B1F] text-[#FDFBF7] hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50" 
                title="Burn Listing from Repository"
              >
                {isDeletingArtwork ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
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
                
                {artwork.img ? (
                  <img src={artwork.img} alt={artwork.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-sm text-[#3D2B1F]/40 italic">
                    [ No Exhibition Asset Rendered ]
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

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8A9A5B] bg-[#8A9A5B]/10 px-3 py-1 rounded-full flex items-center gap-1">
                  <Paintbrush size={10} /> Certified Original
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black font-sans uppercase tracking-tight text-[#3D2B1F]">
                {artwork.name}
              </h1>
              
              <p className="text-xs font-bold tracking-wider opacity-60 mt-2 uppercase">
                Artist Desk:{" "}
                <Link 
                  href={getArtistId() ? `/profile/artist/${getArtistId()}/` : "/browse"} 
                  className="text-[#8A9A5B] hover:underline underline-offset-4 decoration-2"
                >
                  {typeof artwork.artist === 'object' ? artwork.artist?.name : "Independent Artist"}
                </Link>
              </p>
            </div>

            <div className="inline-flex items-baseline gap-3 bg-[#3D2B1F] text-[#FDFBF7] p-5 rounded-[2rem] shadow-lg w-fit pr-10">
              <span className="text-3xl font-black tracking-tight font-sans">
                ৳{artwork.price?.toLocaleString("bn-BD")}
              </span>
              <span className="text-[10px] font-black tracking-widest text-[#E2B4BD] uppercase">BDT / Fixed Rate</span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#3D2B1F]/5 p-4 rounded-[2rem] border border-[#3D2B1F]/5">
              <div className="bg-[#FDFBF7] p-3 rounded-[1.2rem] text-center shadow-sm flex flex-col items-center justify-center">
                <Layers size={12} className="text-[#8A9A5B] mb-1" />
                <p className="text-[8px] font-black uppercase tracking-wider text-[#3D2B1F]/50">Category</p>
                <p className="text-xs font-bold mt-0.5">{artwork.category || "General Painting"}</p>
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-[1.2rem] text-center shadow-sm flex flex-col items-center justify-center">
                <Tag size={12} className="text-[#E2B4BD] mb-1" />
                <p className="text-[8px] font-black uppercase tracking-wider text-[#3D2B1F]/50">Sub-Classification</p>
                <p className="text-xs font-bold mt-0.5">{artwork.tag || "Fine Art Layout"}</p>
              </div>
            </div>

            <p className="text-sm font-medium leading-relaxed text-[#3D2B1F]/80 pl-4 border-l-2 border-[#E2B4BD]">
              "{artwork.description}"
            </p>

            <div className="flex flex-col gap-2 mt-2">
              <div className="flex gap-4">
                {isTierRestricted && artwork.status !== "sold" && !isArtistOwner ? (
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/dashboard/user")}
                    className="flex-1 bg-[#E2B4BD] text-[#3D2B1F] border-[3px] border-[#3D2B1F] font-black uppercase tracking-[0.15em] text-xs py-4 px-6 rounded-full flex items-center justify-center gap-2 shadow-[4px_4px_0px_#3D2B1F] hover:shadow-none transition-all duration-300"
                  >
                    <Zap size={14} /> Upgrade to Unlock Vault Space
                  </motion.button>
                ) : (
                  <motion.button 
                    whileHover={!isPurchaseDisabled ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!isPurchaseDisabled ? { scale: 0.98 } : {}}
                    onClick={handlePurchase}
                    disabled={isPurchaseDisabled}
                    className={`flex-1 font-black uppercase tracking-[0.2em] text-xs py-4 px-6 rounded-full flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                      isPurchaseDisabled
                        ? "bg-[#3D2B1F]/10 text-[#3D2B1F]/30 cursor-not-allowed shadow-none line-through"
                        : "bg-[#8A9A5B] text-[#FDFBF7] hover:bg-[#3D2B1F] border-2 border-transparent focus:border-[#3D2B1F]"
                    }`}
                  >
                    <span>
                      {artwork.status === "sold" 
                        ? "Artwork Sold Out" 
                        : isArtistOwner 
                          ? "You Own This Piece" 
                          : paymentLoading
                            ? "Securing Session..."
                            : user 
                              ? "Buy Now" 
                              : "Log In to Acquire"}
                    </span>
                    <ShoppingBag size={16} strokeWidth={2.5} />
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onWishlistClick}
                  className={`p-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                    isWishlisted 
                      ? "bg-[#E2B4BD]/20 border-[#E2B4BD] text-[#E2B4BD]" 
                      : "border-[#3D2B1F]/20 text-[#3D2B1F] hover:border-[#E2B4BD] hover:text-[#E2B4BD]"
                  }`}
                >
                  <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={2.5} />
                </motion.button>
              </div>

              {isTierRestricted && artwork.status !== "sold" && !isArtistOwner && (
                <p className="text-[10px] text-center font-bold text-red-700 uppercase tracking-wider mt-1">
                  ⚠️ Limit Reached: You own {purchaseCount} items on the {activeTier} tier (Max: {activeTier === "free" ? 3 : 9}). Upgrade to acquire more art.
                </p>
              )}

              {isArtistOwner && (
                <p className="text-[10px] text-center font-bold text-red-700/70 tracking-wide mt-1">
                  ⚠️ System Rule Protection: Listing creators cannot purchase items from their own portfolio.
                </p>
              )}
            </div>

            <hr className="border-[#3D2B1F]/10 my-4" />
            
            {/* DISCUSSION FORUM ELEMENTS */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#3D2B1F] flex items-center gap-2">
                <MessageSquare size={14} /> Gallery Dialogue ({comments.length})
              </h3>

              {!user ? (
                <div className="text-center p-4 rounded-2xl bg-[#3D2B1F]/5 border border-dashed border-[#3D2B1F]/10">
                  <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider">
                    Log in to drop thread insights.
                  </p>
                  <Link href="/login" className="inline-block text-[9px] font-black uppercase text-[#8A9A5B] hover:underline mt-1">
                    Sign In to Account →
                  </Link>
                </div>
              ) : (!hasPurchased && !isArtistOwner) ? (
                <div className="text-center p-4 rounded-2xl bg-[#3D2B1F]/5 border border-[#3D2B1F]/10 flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1 text-[#8A9A5B] font-black uppercase tracking-wider text-[9px]">
                    <ShieldCheck size={12} /> Exclusive Collector Circle
                  </div>
                  <p className="text-[10px] font-medium opacity-60 max-w-sm mt-0.5">
                    Only verified collectors who acquired this canvas listing can leave insight review marks.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePostComment} className="flex gap-2 items-center bg-[#3D2B1F]/5 p-2 rounded-full border border-[#3D2B1F]/5">
                  <div className="w-7 h-7 bg-[#E2B4BD] text-[#3D2B1F] font-black text-[9px] rounded-full flex items-center justify-center uppercase shadow-sm">
                    {user.name ? user.name.substring(0, 2) : "ME"}
                  </div>
                  <input 
                    type="text" 
                    placeholder={isArtistOwner ? "Moderate studio discussion..." : "Leave a collector review on this canvas..."} 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-transparent px-3 py-2 text-xs font-medium focus:outline-none placeholder-[#3D2B1F]/40 text-[#3D2B1F]"
                  />
                  <button type="submit" className="p-2 rounded-full bg-[#3D2B1F] text-[#FDFBF7] hover:bg-[#8A9A5B] transition-colors">
                    <Send size={12} />
                  </button>
                </form>
              )}

              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {comments.map((comment) => {
                    const isCommentOwner = user && user.id === comment.userId;

                    return (
                      <motion.div 
                        key={comment._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-[#3D2B1F]/5 p-3.5 rounded-[1.5rem] border border-[#3D2B1F]/5 relative group/item"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-[#3D2B1F]/10 text-[#3D2B1F]/70 font-bold text-[8px] rounded-full flex items-center justify-center uppercase">
                              {comment.userName ? comment.userName.substring(0, 2) : "CR"}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider">{comment.userName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] opacity-40 font-bold">
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString("en-GB") : "Recent"}
                            </span>

                            {isCommentOwner && (
                              <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                                <button 
                                  type="button"
                                  onClick={() => handleStartEdit(comment._id, comment.comment)}
                                  className="text-[#3D2B1F]/50 hover:text-[#8A9A5B] transition-colors p-0.5"
                                  title="Edit Thought"
                                >
                                  <Edit size={10} />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleDeleteComment(comment._id)}
                                  className="text-[#3D2B1F]/50 hover:text-red-700 transition-colors p-0.5"
                                  title="Delete Thought"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-xs font-medium opacity-80 leading-relaxed pl-7">
                          {comment.comment}
                        </p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {comments.length === 0 && (
                  <p className="text-[10px] text-center italic opacity-40 uppercase tracking-widest py-4">
                    The discussion thread is currently vacant.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}