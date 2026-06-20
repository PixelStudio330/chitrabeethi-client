'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  User,
  Mail,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  Paintbrush,
  Eye,
  Trash2,
  Edit3,
  SlidersHorizontal,
  Grid
} from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

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

// 🌟 FIX: Updated structure to map perfectly to the backend schema fields
interface Artwork {
  _id: string;
  name: string;      // Matches schema "name" instead of title
  price: number;
  img: string;        // Matches schema "img" instead of imageUrl
  category: string;
  status: string;
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

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loadingArtworks, setLoadingArtworks] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ status: "", text: "" });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user && !params?.id) {
        router.push("/login");
      } else if (user && isOwner) {
        setFormData({
          name: user.name || "",
          photoUrl: user.photoUrl || user.profilePicture || "",
        });
      }
    }
  }, [user, isLoading, router, isOwner, params]);

  // Fetch Artist's Specific Portfolio Items
  useEffect(() => {
    const fetchArtistArtworks = async () => {
      if (!profileArtistId) return;
      try {
        setLoadingArtworks(true);
        const response = await api.get(`/api/artworks?artist=${profileArtistId}`);
        if (response.data?.success) {
          setArtworks(response.data.artworks || response.data.data || []);
        } else {
          setArtworks(response.data || []);
        }
      } catch (err) {
        console.error("Error loading artist portfolio items:", err);
      } finally {
        setLoadingArtworks(false);
      }
    };

    fetchArtistArtworks();
  }, [profileArtistId]);

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

  const currentAvatarUrl = user?.photoUrl || user?.profilePicture || "";
  const isFormChanged =
    formData.name.trim() !== (user?.name || "") ||
    formData.photoUrl.trim() !== currentAvatarUrl;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormChanged || updating || !isOwner) return;

    setMessage({ status: "", text: "" });
    setUpdating(true);

    const loadingToast = toast.loading("Updating account information...", {
      style: {
        background: "#F4EBE1",
        color: "#3D2B1F",
        borderRadius: "1rem",
        border: "1px solid #EADFC9",
        fontSize: "12px",
        fontWeight: "bold",
      },
    });

    try {
      const response = await api.put(
        "/api/auth/update-profile",
        {
          userId: user.id || user._id,
          name: formData.name.trim(),
          photoUrl: formData.photoUrl.trim(),
        },
        { withCredentials: true }
      );

      if (response.data?.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        setIsEditing(false);
        toast.success("Profile saved successfully.", { id: loadingToast });

        setTimeout(() => {
          window.location.reload();
        }, 400);
      }
    } catch (err: any) {
      const errTxt = err?.response?.data?.message || "Failed to sync changes with server.";
      setMessage({ status: "error", text: errTxt });
      toast.error(errTxt, { id: loadingToast });
      setUpdating(false);
    }
  };

  const handleDeleteArtwork = async (artworkId: string) => {
    if (!window.confirm("Are you certain you want to remove this piece from your gallery portfolio?")) return;
    
    try {
      const response = await api.delete(`/api/artworks/${artworkId}`, {
        data: {
          authUser: {
            id: user.id || user._id,
            role: user.role || "artist" 
          }
        }
      });
      if (response.data?.success) {
        toast.success("Artwork unlisted successfully.");
        setArtworks(prev => prev.filter(item => item._id !== artworkId));
      }
    } catch (err) {
      toast.error("Could not complete removal transaction.");
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF6F0] text-[#3D2B1F] py-20 px-4 md:px-8 relative selection:bg-[#8A9A5B]/20">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#3D2B1F_1px,transparent_1px),linear-gradient(to_bottom,#3D2B1F_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-start">
        
        {/* LEFT COLUMN: ARTIST METADATA PROFILE BLOCK */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-4 space-y-6 lg:sticky lg:top-24"
        >
          <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md border border-[#EADFC9] rounded-[2rem] p-6 shadow-sm relative overflow-hidden">
            <div className="flex flex-col items-center text-center space-y-4">
              
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-[#FAF6F0] border-2 border-[#3D2B1F]/10 p-1.5 shadow-inner">
                  <img
                    src={isOwner ? (formData.photoUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=Studio") : (currentAvatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=Studio")}
                    alt="Verified Platform Artist"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#8A9A5B] text-white text-[9px] tracking-wider font-black px-2 py-0.5 rounded-md shadow-sm uppercase">
                  Artist
                </div>
              </div>

              <div className="space-y-1 w-full">
                <h1 className="text-xl font-bold tracking-tight text-[#3D2B1F]">
                  {isOwner ? user?.name : (artworks[0] ? "Verified Curator" : "Platform Gallery Artist")}
                </h1>
                <p className="text-xs text-[#3D2B1F]/60 font-medium truncate px-4">
                  {isOwner ? user?.email : "Collector Contact Available"}
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

        {/* RIGHT COLUMN: ARTWORKS CATALOG / EXHIBITION */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#EADFC9] pb-4">
            <div className="flex items-center gap-2">
              <Grid size={16} className="text-[#3D2B1F]/60" />
              <h2 className="text-xs uppercase font-black tracking-[0.2em] text-[#3D2B1F]/80">
                Exhibited Artworks Portfolio
              </h2>
            </div>
            <span className="text-[10px] font-mono bg-[#EADFC9]/40 px-2.5 py-1 rounded-full text-[#3D2B1F]/70">
              {artworks.length} Items Listed
            </span>
          </div>

          {loadingArtworks ? (
            <div className="py-20 text-center text-xs italic opacity-50 tracking-wider">
              Syncing catalog items...
            </div>
          ) : artworks.length === 0 ? (
            <div className="bg-white/30 border border-dashed border-[#EADFC9] rounded-[2rem] p-16 text-center">
              <p className="text-xs italic text-[#3D2B1F]/50 uppercase tracking-widest">
                No catalog works currently on exhibition.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {artworks.map((art) => (
                <motion.div
                  key={art._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-white rounded-3xl overflow-hidden border border-[#EADFC9] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Display */}
                  <div className="relative aspect-[4/3] w-full bg-[#FAF6F0] overflow-hidden border-b border-[#EADFC9]/50">
                    <img
                      src={art.img || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600"}
                      alt={art.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    {art.status === "sold" && (
                      <div className="absolute inset-0 bg-[#3D2B1F]/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-white text-[#3D2B1F] text-[9px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-md shadow">
                          Acquired / Sold
                        </span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[9px] text-[#3D2B1F] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-[#EADFC9]/60">
                      {art.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-base tracking-tight text-[#3D2B1F] line-clamp-1">
                        {art.name}
                      </h4>
                      <p className="text-xs font-black text-[#8A9A5B] mt-1">
                        ৳{art.price?.toLocaleString('en-BD')} BDT
                      </p>
                    </div>

                    {/* Operational Actions */}
                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-[#FAF6F0]">
                      <Link 
                        href={`/product-details/${art._id}`}
                        className="w-full border border-[#3D2B1F]/20 text-[#3D2B1F] py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#FAF6F0] transition-all uppercase text-[9px] font-black tracking-widest"
                      >
                        <Eye size={12} /> Inspect Details
                      </Link>

                      {isOwner && (
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => router.push(`/product-details/${art._id}/edit`)}
                            className="bg-[#EADFC9]/40 hover:bg-[#EADFC9]/70 text-[#3D2B1F] py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all text-[9px] font-bold uppercase tracking-wider"
                            title="Edit Listing Details"
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
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}