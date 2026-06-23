'use client';

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  Sparkles,
  Paintbrush,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Edit3,
  SlidersHorizontal,
  Grid,
  Search,
  Filter,
  ArrowUpDown,
  Inbox,
  Heart,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import api from "../../../../lib/axios";

// --- Framer Motion Animations ---
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

interface ArtistProfile {
  name: string;
  photoUrl?: string;
  profilePicture?: string;
  avatar?: string;
  img?: string;
  role?: string;
}

interface Artwork {
  _id: string;
  name: string;      
  price: number;
  img: string;        
  category: string;
  status: string;
  createdAt?: string;
  artist?: ArtistProfile; 
}

interface ToastState {
  text: string;
  type: "success" | "error" | "loading";
  icon?: string;
}

export default function ProfilePage() {
  const { user, isLoading, logout, setUser } = useAuth();
  const router = useRouter();
  const params = useParams();

  const profileArtistId = params?.id || user?.id || user?._id;
  const isOwner = user && (user.id === profileArtistId || user._id === profileArtistId);

  const [formData, setFormData] = useState({
    name: "",
    photoUrl: "",
  });

  // --- Password State Fields ---
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [publicArtistInfo, setPublicArtistInfo] = useState<ArtistProfile | null>(null);
  const [loadingArtworks, setLoadingArtworks] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ status: "", text: "" });
  const [updating, setUpdating] = useState(false);

  // --- Wishlist Management Array Map ---
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const [togglingWishlistId, setTogglingWishlistId] = useState<string | null>(null);

  // --- Advanced Search, Multi-Filter & Sorting State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<string>("newest");

  // --- Custom Local Toast State Mechanism ---
  const [toastMessage, setToastMessage] = useState<ToastState | null>(null);

  const triggerToast = (text: string, type: "success" | "error" | "loading", icon?: string, duration = 3000) => {
    setToastMessage({ text, type, icon });
    if (type !== "loading") {
      setTimeout(() => {
        setToastMessage(current => current?.text === text ? null : current);
      }, duration);
    }
  };

  // Fetch the logged-in user's initial wishlist array
  useEffect(() => {
    const fetchUserWishlist = async () => {
      const currentUserId = user?.id || user?._id;
      if (!currentUserId) return;
      
      try {
        const response = await api.get(`/api/wishlist?userId=${currentUserId}`);
        if (response.data?.success) {
          const itemsArray = response.data.data || [];
          const ids = itemsArray.map((item: any) => 
            typeof item.artwork === 'object' && item.artwork !== null 
              ? item.artwork._id 
              : item.artwork
          ).filter(Boolean);
          setWishlistedIds(ids);
        }
      } catch (err) {
        console.error("Failed to aggregate current user wishlist map:", err);
      }
    };

    if (!isLoading && user) {
      fetchUserWishlist();
    }
  }, [user, isLoading]);

  useEffect(() => {
    const fetchFreshUserData = async () => {
      if (isLoading) return;

      if (!user && !params?.id) {
        router.push("/login");
        return;
      }

      if (user && isOwner) {
        try {
          const currentId = user.id || user._id;
          const response = await api.get(`/api/auth/user/${currentId}`);
          const freshUser = response.data?.user || response.data;

          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem("user", JSON.stringify(freshUser));

            const savedDbImage = freshUser.profilePicture || freshUser.photoUrl || freshUser.avatar || freshUser.img || "";
            setFormData({
              name: freshUser.name || "",
              photoUrl: savedDbImage.includes("ui-avatars.com") ? "" : savedDbImage,
            });
            return;
          }
        } catch (err) {
          console.error("Failed to sync fresh user dataset from database:", err);
        }

        const savedDbImage = (user as any)?.profilePicture || (user as any)?.photoUrl || (user as any)?.avatar || (user as any)?.img || "";
        setFormData({
          name: user.name || "",
          photoUrl: savedDbImage.includes("ui-avatars.com") ? "" : savedDbImage,
        });
      }
    };

    fetchFreshUserData();
  }, [isLoading, router, isOwner, params]);

  useEffect(() => {
    const fetchArtistArtworks = async () => {
      if (!profileArtistId) return;
      try {
        setLoadingArtworks(true);
        const response = await api.get(`/api/artworks?artist=${profileArtistId}`);
        let fetchedArtworks: Artwork[] = [];

        if (response.data?.success) {
          fetchedArtworks = response.data.artworks || response.data.data || [];
        } else {
          fetchedArtworks = response.data || [];
        }
        
        setArtworks(fetchedArtworks);

        if (!isOwner && fetchedArtworks.length > 0 && fetchedArtworks[0].artist) {
          setPublicArtistInfo(fetchedArtworks[0].artist);
        } else if (!isOwner) {
          try {
            const userRes = await api.get(`/api/auth/user/${profileArtistId}`);
            if (userRes.data) setPublicArtistInfo(userRes.data.user || userRes.data);
          } catch (e) {
            console.error("Could not fetch explicit public user metadata bundle", e);
          }
        }
      } catch (err) {
        console.error("Error loading artist portfolio items:", err);
      } finally {
        setLoadingArtworks(false);
      }
    };

    fetchArtistArtworks();
  }, [profileArtistId, isOwner]);

  // --- Wishlist Interaction Action Trigger Handler ---
  const handleToggleWishlist = async (artworkId: string) => {
    const currentUserId = user?.id || user?._id;
    if (!currentUserId) {
      triggerToast("Please securely sign in to register your favorite collections.", "error");
      router.push("/login");
      return;
    }

    if (togglingWishlistId) return;

    try {
      setTogglingWishlistId(artworkId);
      const response = await api.post("/api/wishlist/toggle", {
        artworkId,
        userId: currentUserId
      });

      if (response.data?.success) {
        if (response.data.added) {
          setWishlistedIds(prev => [...prev, artworkId]);
          triggerToast("Artwork saved to wishlist reference.", "success", "💖");
        } else {
          setWishlistedIds(prev => prev.filter(id => id !== artworkId));
          triggerToast("Artwork removed from wishlist.", "success", "💔");
        }
      }
    } catch (error) {
      console.error("Wishlist operation mutation request rejected:", error);
       triggerToast("Failed to alter catalog card wishlist index metadata.", "error");
     } finally {
       setTogglingWishlistId(null);
     }
   };

  // --- Dynamic Categories Generator ---
  const categories = useMemo(() => {
    const uniqueCats = new Set(artworks.map(art => art.category));
    return ["All", ...Array.from(uniqueCats).filter(Boolean)];
  }, [artworks]);

  // --- Multi-Criteria Pipeline Filtering and Sorting System ---
  const filteredAndSortedArtworks = useMemo(() => {
    return artworks
      .filter((art) => {
        if (!art) return false;

        const targetCategory = art.category || "";
        const matchesCategory =
          selectedCategory === "All" ||
          targetCategory.toLowerCase() === selectedCategory.toLowerCase();

        const targetName = art.name || "";
        const matchesSearch = targetName.toLowerCase().includes(searchQuery.toLowerCase());

        const currentPrice = art.price ?? 0;
        const matchesMinPrice = minPrice === "" || currentPrice >= Number(minPrice);
        const matchesMaxPrice = maxPrice === "" || currentPrice <= Number(maxPrice);

        return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
      })
      .sort((a, b) => {
        const priceA = a.price ?? 0;
        const priceB = b.price ?? 0;

        if (sortBy === "price-low") return priceA - priceB;
        if (sortBy === "price-high") return priceB - priceA;
        if (sortBy === "newest") {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }
        return 0;
      });
  }, [artworks, searchQuery, selectedCategory, minPrice, maxPrice, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-4xl"
        >
          ✨
        </motion.div>
        <p className="text-[10px] tracking-[0.2em] font-black uppercase text-[#3D2B1F]/40 animate-pulse">
          Loading Creator Environment...
        </p>
      </div>
    );
  }

  const displayProfileName = isOwner 
    ? (user?.name || "Your Studio") 
    : (publicArtistInfo?.name || "Verified Creator");

  const getAvatarUrl = () => {
    const isValidUrl = (url: any) => url && String(url).trim() !== "" && !String(url).includes("ui-avatars.com");

    if (isOwner) {
      if (formData.photoUrl && formData.photoUrl.trim() !== "") return formData.photoUrl;
      if (isValidUrl(user?.profilePicture)) return user?.profilePicture;
      if (isValidUrl(user?.photoUrl)) return user?.photoUrl;
      if (isValidUrl((user as any)?.avatar)) return (user as any).avatar;
      if (isValidUrl((user as any)?.img)) return (user as any).img;
      return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.name || "Studio")}`;
    } else {
      if (isValidUrl((publicArtistInfo as any)?.profilePicture)) return (publicArtistInfo as any).profilePicture;
      if (isValidUrl((publicArtistInfo as any)?.photoUrl)) return (publicArtistInfo as any).photoUrl;
      if (isValidUrl((publicArtistInfo as any)?.avatar)) return (publicArtistInfo as any).avatar;
      if (isValidUrl((publicArtistInfo as any)?.img)) return (publicArtistInfo as any).img;
      return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent((publicArtistInfo as any)?.name || "Artist")}`;
    }
  };

  const displayProfilePicture = getAvatarUrl();
  const displayProfileRole = isOwner ? (user?.role || "Artist") : (publicArtistInfo?.role || "Artist");

const currentDbImageValue = (user as any)?.profilePicture || (user as any)?.photoUrl || (user as any)?.avatar || (user as any)?.img || "";
  
  // Adjusted to track modifications when text inside password configurations changes as well
  const isFormChanged =
    formData.name.trim() !== (user?.name || "") ||
    formData.photoUrl.trim() !== (currentDbImageValue.includes("ui-avatars.com") ? "" : currentDbImageValue) ||
    password.trim() !== "";

  const handleUpdateProfile = async (e: React.FormEvent) => {
    if (!isFormChanged || updating || !isOwner) return;
    e.preventDefault();

    if (password !== confirmPassword) {
      triggerToast("Passwords do not match. 🏛️", "error");
      return;
    }

    setMessage({ status: "", text: "" });
    setUpdating(true);
    triggerToast("Updating account information...", "loading");

    try {
      const payload = {
        userId: user.id || user._id,
        name: formData.name.trim(),
        photoUrl: formData.photoUrl.trim(),
        ...(password.trim() !== "" && { password })
      };

      const response = await api.put(
        "/api/auth/update-profile",
        payload,
        { withCredentials: true }
      );

      if (response.data?.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Reset password state fields smoothly on successful update
        setPassword("");
        setConfirmPassword("");
        setIsEditing(false);
        triggerToast("Profile saved successfully.", "success");

        setTimeout(() => { window.location.reload(); }, 400);
      }
    } catch (err: any) {
      const errTxt = err?.response?.data?.message || "Failed to sync changes with server.";
      setMessage({ status: "error", text: errTxt });
      triggerToast(errTxt, "error");
      setUpdating(false);
    }
  };

  const handleDeleteArtwork = async (artworkId: string) => {
    if (!window.confirm("Are you certain you want to remove this piece from your gallery portfolio?")) return;
    
    try {
      const response = await api.delete(`/api/artworks/${artworkId}`, {
        data: {
          authUser: {
            id: (user as any)?.id || (user as any)?._id,
role: (user as any)?.role || "artist"
          }
        }
      });
      if (response.data?.success) {
        triggerToast("Artwork unlisted successfully.", "success");
        setArtworks(prev => prev.filter(item => item._id !== artworkId));
      }
    } catch (err) {
      triggerToast("Could not complete removal transaction.", "error");
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF6F0] text-[#3D2B1F] py-20 px-4 md:px-8 relative selection:bg-[#8A9A5B]/20 pt-45 overflow-hidden">
      
      {/* --- IN-HOUSE ANIMATED TOAST SYSTEM --- */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: -20, scale: 0.9, x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-28 left-1/2 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-white/90 backdrop-blur-md border border-[#EADFC9] shadow-xl min-w-[280px] max-w-md pointer-events-auto"
          >
            <div className="flex-shrink-0 flex items-center justify-center">
              {toastMessage.icon ? (
                <span className="text-base">{toastMessage.icon}</span>
              ) : toastMessage.type === "loading" ? (
                <Loader2 size={16} className="text-[#8A9A5B] animate-spin" />
              ) : toastMessage.type === "success" ? (
                <CheckCircle2 size={16} className="text-[#8A9A5B]" />
              ) : (
                <AlertCircle size={16} className="text-red-600" />
              )}
            </div>
            <p className="text-xs font-bold text-[#3D2B1F] tracking-wide leading-tight">
              {toastMessage.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#3D2B1F_1px,transparent_1px),linear-gradient(to_bottom,#3D2B1F_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-start">
        
        {/* LEFT COLUMN: ARTIST METADATA PROFILE BLOCK */}
        <motion.div 
          variants={containerVariants as any}
          initial="hidden"
          animate="visible"
          className="lg:col-span-4 space-y-6 lg:sticky lg:top-24"
        >
          <motion.div variants={itemVariants as any} className="bg-white/60 backdrop-blur-md border border-[#EADFC9] rounded-[2rem] p-6 shadow-sm relative overflow-hidden">
            <div className="flex flex-col items-center text-center space-y-4">
              
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-[#FAF6F0] border-2 border-[#3D2B1F]/10 p-1.5 shadow-inner flex items-center justify-center">
                  <img
                    src={displayProfilePicture}
                    alt={displayProfileName}
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayProfileName)}`;
                    }}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#8A9A5B] text-white text-[9px] tracking-wider font-black px-2 py-0.5 rounded-md shadow-sm uppercase">
                  {displayProfileRole}
                </div>
              </div>

              <div className="space-y-1 w-full">
                <h1 className="text-xl font-bold tracking-tight text-[#3D2B1F]">
                  {displayProfileName}
                </h1>
                {isOwner && user?.email && (
                  <p className="text-xs font-medium text-[#3D2B1F]/60 break-all select-all">
                    {user.email}
                  </p>
                )}
                <p className="text-[10px] uppercase tracking-[0.15em] font-black text-[#3D2B1F]/40">
                  Collective Verified
                </p>
              </div>

              {isOwner && (
                <div className="pt-2 w-full flex flex-col gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full text-center px-4 py-2.5 rounded-xl border border-[#EADFC9] hover:bg-white text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    {isEditing ? "View Showcase Portfolio" : "Configure Studio Profile"}
                  </button>
                  <button
                    onClick={logout}
                    className="w-full text-center px-4 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut size={12} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {isOwner && isEditing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/80 backdrop-blur-md border border-[#EADFC9] rounded-[2rem] p-6 shadow-sm overflow-hidden"
              >
                <h3 className="text-xs font-black uppercase tracking-widest text-[#3D2B1F]/40 mb-4 flex items-center gap-2">
                  <SlidersHorizontal size={12} /> Account Parameters
                </h3>
                
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#3D2B1F]/70 uppercase ml-1">Email Address</label>
                    <input
                      type="text"
                      value={user?.email || ""}
                      disabled
                      className="w-full p-3 bg-[#FAF6F0]/50 rounded-xl border border-[#EADFC9]/40 text-xs font-semibold text-[#3D2B1F]/50 cursor-not-allowed select-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#3D2B1F]/70 uppercase ml-1">Public Handle Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Display Name"
                      className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-[#EADFC9]/60 text-xs font-semibold focus:outline-none focus:border-[#8A9A5B]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#3D2B1F]/70 uppercase ml-1">Avatar Content URL</label>
                    <input
                      type="url"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/your-image.jpg"
                      className="w-full p-3 bg-[#FAF6F0] rounded-xl border border-[#EADFC9]/60 text-xs font-semibold focus:outline-none focus:border-[#8A9A5B]"
                    />
                  </div>

                  {/* PASSWORD INPUT LOGIC CONTAINER ROW BLOCK */}
                  <div className="grid grid-cols-1 gap-4 mt-4 pt-4 border-t border-[#3D2B1F]/10">
                    <div>
                      <label className="block text-[10px] font-black text-[#3D2B1F]/60 uppercase tracking-widest mb-1.5 ml-1">
                        New Password (Leave blank to keep current)
                      </label>
                      <div className="relative rounded-xl bg-[#3D2B1F]/5 border border-[#3D2B1F]/20 focus-within:border-[#3D2B1F] transition-all overflow-hidden">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#3D2B1F]/50">
                          <Lock size={14} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold text-[#3D2B1F] bg-transparent focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#3D2B1F]/50 hover:text-[#3D2B1F] focus:outline-none"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-[#3D2B1F]/60 uppercase tracking-widest mb-1.5 ml-1">
                        Verify New Password
                      </label>
                      <div className="relative rounded-xl bg-[#3D2B1F]/5 border border-[#3D2B1F]/20 focus-within:border-[#3D2B1F] transition-all overflow-hidden">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#3D2B1F]/50">
                          <Lock size={14} />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold text-[#3D2B1F] bg-transparent focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#3D2B1F]/50 hover:text-[#3D2B1F] focus:outline-none"
                        >
                          {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isFormChanged && (
                    <motion.button
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="submit"
                      disabled={updating}
                      className="w-full py-3 bg-[#3D2B1F] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#3D2B1F]/90 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Paintbrush size={12} /> Save Updates
                    </motion.button>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* RIGHT COLUMN: ARTWORKS CATALOG UTILITY */}
        <div className="lg:col-span-8 bg-white/40 backdrop-blur-md border border-[#EADFC9] rounded-[2.5rem] p-6 shadow-sm flex flex-col">
          
          {/* Main Search Controls Frame Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#EADFC9] gap-4">
            <div className="flex items-center gap-2">
              <Grid size={16} className="text-[#3D2B1F]/60" />
              <h2 className="text-xs uppercase font-black tracking-[0.2em] text-[#3D2B1F]/80">
                Exhibited Artworks Portfolio
              </h2>
            </div>
            
            {/* Search Query input field */}
            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40" />
              <input 
                type="text"
                placeholder="Search gallery portfolio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF6F0]/80 border border-[#EADFC9] pl-9 pr-4 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-[#8A9A5B] transition-colors"
              />
            </div>
          </div>

          {/* Advanced Sorting & Filter Parameters Stack Panel */}
          <div className="flex flex-col gap-4 py-4 border-b border-[#EADFC9]/60">
            {/* Category Filter Badges */}
            {!loadingArtworks && artworks.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <Filter size={13} className="text-[#3D2B1F]/40 shrink-0 mr-1" />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                      selectedCategory === cat 
                        ? "bg-[#3D2B1F] text-white shadow-sm" 
                        : "bg-white border border-[#EADFC9] text-[#3D2B1F]/70 hover:border-[#8A9A5B] hover:text-[#3D2B1F]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Price constraints inputs & sorting selectors */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
              {/* Range block bounds */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <SlidersHorizontal size={12} className="text-[#3D2B1F]/50" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#3D2B1F]/60">Price Range:</span>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="number" 
                    placeholder="Min ৳"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-20 bg-white border border-[#EADFC9] rounded-lg px-2 py-1 text-[11px] font-bold text-[#3D2B1F] focus:outline-none focus:border-[#8A9A5B]"
                  />
                  <span className="text-[#3D2B1F]/40 text-[10px] font-bold">to</span>
                  <input 
                    type="number" 
                    placeholder="Max ৳"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-20 bg-white border border-[#EADFC9] rounded-lg px-2 py-1 text-[11px] font-bold text-[#3D2B1F] focus:outline-none focus:border-[#8A9A5B]"
                  />
                </div>
              </div>

              {/* Sorting Options Selector */}
              <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end">
                <ArrowUpDown size={12} className="text-[#3D2B1F]/50" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#3D2B1F]/60">Sort By:</span>
                <select
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-[#EADFC9] text-[#3D2B1F] rounded-lg px-2 py-1 text-[11px] font-black uppercase tracking-wider focus:outline-none focus:border-[#8A9A5B] cursor-pointer transition-all"
                >
                  <option value="newest">Newest Artwork</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* --- SCROLLABLE ART CONTAINER (INDEPENDENT INTERNAL VERTICAL SCROLLBAR) --- */}
          <div className="mt-6 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#3D2B1F]/20 scrollbar-track-transparent">
            {loadingArtworks ? (
              <div className="py-20 text-center text-xs italic opacity-50 tracking-wider">
                Syncing catalog items...
              </div>
            ) : filteredAndSortedArtworks.length === 0 ? (
              <div className="bg-[#FAF6F0]/50 border border-dashed border-[#EADFC9] rounded-[2rem] p-16 text-center flex flex-col items-center justify-center">
                <Inbox size={24} className="text-[#3D2B1F]/30 mb-2" />
                <p className="text-xs italic text-[#3D2B1F]/50 uppercase tracking-widest font-bold">
                  No artworks found matching your criteria.
                </p>
              </div>
            ) : (
              /* Two Columns Grid Exhibition Layout */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                <AnimatePresence mode="popLayout">
                  {filteredAndSortedArtworks.map((art) => {
                    const isWishlisted = wishlistedIds.includes(art._id);
                    
                    return (
                      <motion.div
                        key={art._id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="group bg-white rounded-3xl overflow-hidden border border-[#EADFC9] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative"
                      >
                        {/* --- WISHLIST TOGGLE BUTTON OVERLAY --- */}
                        {!isOwner && (
                          <button
                            type="button"
                            disabled={togglingWishlistId === art._id}
                            onClick={() => handleToggleWishlist(art._id)}
                            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-md border border-[#EADFC9]/60 text-[#3D2B1F] shadow-sm hover:scale-110 active:scale-95 transition-all duration-300"
                            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                          >
                            <Heart 
                              size={14} 
                              className={`transition-colors duration-300 ${
                                isWishlisted ? "fill-red-500 text-red-500" : "text-[#3D2B1F]/70"
                              }`} 
                            />
                          </button>
                        )}

                        {/* Image Display */}
                        <div className="relative w-full aspect-square bg-[#FAF6F0] overflow-hidden border-b border-[#EADFC9]/50">
                          <img
                            src={art.img || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600"}
                            alt={art.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {art.status === "sold" && (
                            <div className="absolute inset-0 bg-[#3D2B1F]/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                              <span className="bg-white text-[#3D2B1F] text-[9px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-md shadow">
                                Acquired / Sold
                              </span>
                            </div>
                          )}
                          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[9px] text-[#3D2B1F] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-[#EADFC9]/60 z-10">
                            {art.category}
                          </span>
                        </div>

                        {/* Body Content */}
                        <div className="p-5 flex-1 flex flex-col gap-4">
                          <div>
                            <h4 className="font-bold text-base tracking-tight text-[#3D2B1F] line-clamp-1 italic">
                              {art.name}
                            </h4>
                            <p className="text-xs font-black text-[#8A9A5B] mt-1">
                              ৳{art.price?.toLocaleString('en-BD')} BDT
                            </p>
                          </div>

                          {/* Operational Actions */}
                          <div className="grid grid-cols-1 gap-2 pt-2 border-t border-[#FAF6F0] mt-auto">
                            <Link 
                              href={`/product-details/${art._id}`}
                              className="w-full border border-[#3D2B1F]/20 text-[#3D2B1F] py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#FAF6F0] transition-all uppercase text-[9px] font-black tracking-widest"
                            >
                              <Eye size={12} /> Inspect Details
                            </Link>

                            {isOwner && (
                              <div className="grid grid-cols-1 gap-2 mt-1">
                                <button
                                  type="button"
                                  onClick={() => router.push('/dashboard/artist')}
                                  className="w-full bg-[#EADFC9]/40 hover:bg-[#3D2B1F] hover:text-white text-[#3D2B1F] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-[9px] font-bold uppercase tracking-wider"
                                  title="Modify Listing in Dashboard"
                                >
                                  <Edit3 size={11} /> Modify
                                </button>
                           
                                <button
                                  type="button"
                                  onClick={() => handleDeleteArtwork(art._id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all text-[9px] font-bold uppercase tracking-wider"
                                  title="De-list Product Artwork"
                                >
                                  <Trash2 size={11} /> Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}