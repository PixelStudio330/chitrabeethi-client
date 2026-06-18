'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User,
  Mail,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  Paintbrush,
} from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

// --- Framer Motion Animations ---
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

// --- Floating Fluid Emojis ---
interface FloatingEmojiProps {
  emoji: string;
  delay?: number;
  initialPos?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  rotateRange?: number;
}

function FloatingEmoji({
  emoji,
  delay = 0,
  initialPos = { top: "50%", left: "50%" },
  rotateRange = 15,
}: FloatingEmojiProps) {
  const driftX = useState(() => Math.random() * 60 - 30)[0];
  const driftY = useState(() => Math.random() * 60 - 30)[0];
  const rotateEnd = useState(
    (() => Math.random() * (rotateRange * 2) - rotateRange)
  )[0];

  return (
    <motion.div
      initial={{ opacity: 0, ...initialPos }}
      animate={{
        opacity: [0, 0.25, 0.25, 0],
        x: [0, driftX, driftX * -0.5, 0],
        y: [0, driftY, driftY * -0.5, 0],
        rotate: [0, rotateEnd, rotateEnd * -0.5, 0],
      }}
      transition={{
        duration: 14,
        delay,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
      }}
      className="absolute text-4xl select-none z-0 filter drop-shadow-sm"
    >
      {emoji}
    </motion.div>
  );
}

export default function ProfilePage() {
  const { user, isLoading, logout, setUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    photoUrl: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ status: "", text: "" });
  const [updating, setUpdating] = useState(false);

  // Sync initial setup safely checking both layout variables fallback fields
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else {
        setFormData({
          name: user.name || "",
          photoUrl: user.photoUrl || user.profilePicture || "",
        });
      }
    }
  }, [user, isLoading, router]);

  // Global Page Loading Canvas
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FBF8F3] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-6xl"
        >
          🎨
        </motion.div>
        <p className="text-xs tracking-widest font-black uppercase text-[#4E6E58]/60 animate-pulse">
          Opening Sanctuary Gates...
        </p>
      </div>
    );
  }

  // Double field fallback matches dirty state comparison strings precisely
  const currentAvatarUrl = user.photoUrl || user.profilePicture || "";
  const isFormChanged =
    formData.name.trim() !== (user.name || "") ||
    formData.photoUrl.trim() !== currentAvatarUrl;

  // Profile Update Function
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormChanged || updating) return;

    setMessage({ status: "", text: "" });
    setUpdating(true);

    const loadingToast = toast.loading("Weaving changes into the database...", {
      style: {
        background: "#F4EBE1",
        color: "#4A3E3D",
        borderRadius: "1.25rem",
        border: "2px solid #E6D5C3",
        fontSize: "13px",
        fontWeight: "bold",
      },
    });

    try {
      const response = await api.put(
        "/api/auth/update-profile",
        {
          userId: user.id || user._id, // Includes unique record index identifier context
          name: formData.name.trim(),
          photoUrl: formData.photoUrl.trim(),
        },
        { withCredentials: true }
      );

      if (response.data?.success) {
        const updatedUser = response.data.user;

        // Syncs local app contexts seamlessly with mapped model properties
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        setFormData({
          name: updatedUser.name || "",
          photoUrl: updatedUser.photoUrl || updatedUser.profilePicture || "",
        });
        setIsEditing(false);

        toast.success("Profile re-rendered beautifully! 🎨", { id: loadingToast });

        // Short timeout gives local states room to transition safely
        setTimeout(() => {
          window.location.reload();
        }, 600);
      }
    } catch (err: any) {
      console.error("PROFILE UPDATE ERROR:", err);
      const errTxt = err?.response?.data?.message || "Canvas synchronization failed.";
      setMessage({ status: "error", text: errTxt });
      toast.error(errTxt, { id: loadingToast });
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Safe travels, friend! 🌿");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout execution error:", err);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF6F0] flex items-center justify-center py-24 px-4 relative overflow-hidden selection:bg-[#F0A8A8]/30">
      
      {/* Dynamic Graphic Studio Background */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-0 bg-[linear-gradient(to_right,#5C4D4D_1px,transparent_1px),linear-gradient(to_bottom,#5C4D4D_1px,transparent_1px)] bg-[size:32px_32px]" />
      
      {/* Decorative Floating Fluid Emojis */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <FloatingEmoji emoji="🌸" delay={0} initialPos={{ top: "12%", left: "10%" }} />
        <FloatingEmoji emoji="🎨" delay={3} initialPos={{ bottom: "15%", left: "8%" }} />
        <FloatingEmoji emoji="🌿" delay={6} initialPos={{ top: "25%", right: "12%" }} />
        <FloatingEmoji emoji="✨" delay={9} initialPos={{ bottom: "20%", right: "10%" }} />
        
        {/* Soft Organic Paint Blurs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#4E6E58]/4 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#F0A8A8]/8 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        {updating ? (
          /* Custom Pulsing Palette Canvas Mask Loader */
          <motion.div
            key="palette-loader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-xl bg-[#FCFAF7] border-[3px] border-[#4E6E58] rounded-[3rem] p-16 flex flex-col items-center justify-center text-center shadow-2xl relative z-20 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:16px_16px]" />
            <motion.div
              animate={{
                scale: [1, 1.12, 0.98, 1.12, 1],
                rotate: [0, 8, -8, 4, 0],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-8xl mb-6 select-none filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.08)]"
            >
              🎨
            </motion.div>
            <h3 className="text-xl font-black text-[#3C3232] tracking-tight">
              Mixing New Pigments
            </h3>
            <p className="text-xs text-[#7A6A6A] font-medium mt-2 max-w-xs leading-relaxed">
              Updating your profile properties across the registry ledger. Please hold steady...
            </p>
          </motion.div>
        ) : (
          /* Primary Profile Dashboard Assembly */
          <motion.div
            key="profile-dashboard"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-2xl flex flex-col items-stretch relative z-10 gap-6"
          >
            {/* ASYMMETRIC AVATAR HEADER CARD */}
            <motion.div
              variants={itemVariants}
              className="bg-[#FCFAF7] border-[3px] border-[#EADFC9] rounded-[3rem] p-8 shadow-[0_20px_50px_rgba(78,110,88,0.05)] relative overflow-hidden flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left"
            >
              {/* Scrapbook Frame Avatar Cluster */}
              <div className="relative group flex-shrink-0 cursor-help">
                <div className="absolute inset-0 bg-[#4E6E58] rounded-[2.2rem] transform translate-x-2 translate-y-2 opacity-20 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-300" />
                <div className="absolute inset-0 bg-[#F0A8A8] rounded-[2.2rem] transform -rotate-3 opacity-30 group-hover:rotate-3 transition-transform duration-300" />
                <motion.div 
                  whileHover={{ scale: 1.04, rotate: 0 }}
                  className="relative w-32 h-32 rounded-[2.5rem] border-[3px] border-[#3C3232] overflow-hidden bg-white p-2.5 rotate-3 shadow-md transition-all duration-300"
                >
                  <img
                    src={
                      formData.photoUrl || 
                      currentAvatarUrl || 
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=Nyra"
                    }
                    alt="Sanctuary Resident Avatar"
                    className="w-full h-full object-cover rounded-[1.8rem] bg-[#FAF6F0]"
                  />
                </motion.div>
              </div>

              <div className="flex-1 space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E8EFE9] border border-[#C4D7CB] text-[9px] uppercase tracking-widest font-black text-[#3B5443]">
                  <Sparkles size={11} className="text-[#4E6E58] animate-pulse" />
                  Sanctuary Resident Registry
                </div>

                <h1 className="text-3xl font-black text-[#3C3232] tracking-tight leading-none">
                  {user.name || "Anonymous Maker"}
                </h1>

                <p className="text-xs text-[#7A6A6A] font-bold flex items-center justify-center sm:justify-start gap-2 italic bg-[#FAF5E7] border border-[#EADFC9]/60 px-3 py-1.5 rounded-xl w-max max-w-full">
                  <Mail size={13} className="text-[#4E6E58] flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
              </div>
            </motion.div>

            {/* ARTISTIC CONFIGURATION DECK */}
            <motion.div
              variants={itemVariants}
              className="bg-[#FCFAF7] rounded-[3rem] p-8 md:p-10 shadow-[0_30px_60px_rgba(78,110,88,0.06)] border-[3px] border-[#EADFC9] relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-[#4E6E58]" />

              <AnimatePresence>
                {message.text && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold bg-[#FDF1F1] border-2 border-[#F0C7C7] text-[#613A3A]"
                  >
                    <AlertCircle size={16} className="text-[#DB8B8B] flex-shrink-0" />
                    <span>{message.text}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* MONIKER EDIT DISPATCH */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#5C4D4D] uppercase tracking-wider ml-1 flex items-center gap-2">
                      <User size={14} className="text-[#4E6E58]" />
                      Chosen Moniker
                    </label>
                    <div className="relative rounded-2xl bg-white border-2 border-[#EADFC9] focus-within:border-[#4E6E58] focus-within:shadow-sm transition-all overflow-hidden">
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Your display persona"
                        className="w-full px-5 py-4 bg-transparent text-sm text-[#3C3232] font-semibold placeholder-[#C6B6B6] focus:outline-none disabled:bg-[#FAF8F5] disabled:text-[#A89898] disabled:cursor-not-allowed transition-colors"
                      />
                    </div>
                  </div>

                  {/* READ-ONLY ANCHORED CORE EMAIL */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#5C4D4D] uppercase tracking-wider ml-1 flex items-center gap-2 opacity-60">
                      <Mail size={14} className="text-[#A89898]" />
                      Locked Core Email
                    </label>
                    <div className="w-full px-5 py-4 rounded-2xl bg-[#FAF6F0]/60 border-2 border-[#EADFC9]/60 text-sm text-[#A89898] font-bold flex items-center cursor-not-allowed select-none italic">
                      {user.email}
                    </div>
                  </div>
                </div>

                {/* RESOURCE AVATAR INTERFACE STRING */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#5C4D4D] uppercase tracking-wider ml-1 flex items-center gap-2">
                    <ImageIcon size={14} className="text-[#4E6E58]" />
                    Avatar Vector Resource Link
                  </label>
                  <div className="relative rounded-2xl bg-white border-2 border-[#EADFC9] focus-within:border-[#4E6E58] focus-within:shadow-sm transition-all overflow-hidden">
                    <input
                      type="url"
                      disabled={!isEditing}
                      value={formData.photoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, photoUrl: e.target.value })
                      }
                      placeholder="https://images.unsplash.com/your-signature-canvas.jpg"
                      className="w-full px-5 py-4 bg-transparent text-sm text-[#3C3232] font-semibold placeholder-[#C6B6B6] focus:outline-none disabled:bg-[#FAF8F5] disabled:text-[#A89898] disabled:cursor-not-allowed transition-colors"
                    />
                  </div>
                </div>

                {/* BOTTOM COMPONENT MANAGEMENT DESK */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-dashed border-[#EADFC9]/80">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "#FFF1F1" }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleLogout}
                    className="w-full sm:w-auto px-5 py-3.5 border-2 border-[#F0C7C7] text-[#613A3A] rounded-2xl font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all bg-transparent"
                  >
                    <LogOut size={14} />
                    Depart Sanctuary
                  </motion.button>

                  <div className="flex w-full sm:w-auto items-center justify-end gap-3">
                    {!isEditing ? (
                      <motion.button
                        whileHover={{
                          scale: 1.02,
                          borderColor: "#B2A48D",
                          backgroundColor: "#F7F2E9",
                        }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="w-full sm:w-auto px-6 py-3.5 border-2 border-[#EADFC9] text-[#5C4D4D] rounded-2xl font-black text-xs tracking-wider uppercase flex items-center justify-center bg-transparent transition-all"
                      >
                        Remix Profile Properties
                      </motion.button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              name: user.name || "",
                              photoUrl: user.photoUrl || user.profilePicture || "",
                            });
                          }}
                          className="text-xs font-black uppercase text-[#A89898] hover:text-[#5C4D4D] tracking-wider transition-colors px-4 py-2"
                        >
                          Discard
                        </button>

                        <AnimatePresence>
                          {isFormChanged && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.9, x: 8 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.9, x: 8 }}
                              transition={{ duration: 0.25 }}
                              whileHover={{ scale: 1.02, backgroundColor: "#425E4B" }}
                              whileTap={{ scale: 0.98 }}
                              type="submit"
                              className="w-full sm:w-auto px-6 py-3.5 bg-[#4E6E58] text-[#FCFAF7] rounded-2xl font-black text-xs tracking-wider uppercase shadow-[0_8px_24px_rgba(78,110,88,0.15)] transition-all flex items-center justify-center gap-2"
                            >
                              Bake Canvas
                              <Paintbrush size={13} />
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}