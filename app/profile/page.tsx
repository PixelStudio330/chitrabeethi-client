'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import {
  LogOut,
  Paintbrush,
  Eye,
  EyeOff,
  Lock,
  SlidersHorizontal,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import api from "../../lib/axios";

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

  const [publicArtistInfo, setPublicArtistInfo] = useState<ArtistProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ status: "", text: "" });
  const [updating, setUpdating] = useState(false);

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
    const fetchArtistInfoOnly = async () => {
      if (!profileArtistId || isOwner) return;
      try {
        const userRes = await api.get(`/api/auth/user/${profileArtistId}`);
        if (userRes.data) {
          setPublicArtistInfo(userRes.data.user || userRes.data);
        }
      } catch (e) {
        console.error("Could not fetch explicit public user metadata bundle", e);
      }
    };

    fetchArtistInfoOnly();
  }, [profileArtistId, isOwner]);

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

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10 items-start">
        
        {/* LEFT CARD BLOCK: STATUS & OVERVIEW CONTAINER */}
        <motion.div 
          variants={containerVariants as any}
          initial="hidden"
          animate="visible"
          className="md:col-span-5 space-y-6"
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
                    {isEditing ? "View Profile Summary" : "Configure Studio Profile"}
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
        </motion.div>

        {/* RIGHT CARD BLOCK: MAIN PARAMETERS WORKSPACE PANEL */}
        <div className="md:col-span-7 w-full">
          <AnimatePresence mode="wait">
            {isOwner && isEditing ? (
              <motion.div 
                key="editing-pane"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
            ) : (
              <motion.div
                key="summary-pane"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white/40 backdrop-blur-md border border-[#EADFC9] rounded-[2rem] p-6 shadow-sm space-y-4"
              >
                <h3 className="text-xs font-black uppercase tracking-widest text-[#3D2B1F]/40 flex items-center gap-2">
                  Account Core Details
                </h3>
                <div className="bg-[#FAF6F0]/50 rounded-2xl border border-[#EADFC9]/50 p-4 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#3D2B1F]/50 uppercase block">Workspace Role</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8A9A5B]">{displayProfileRole}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#3D2B1F]/50 uppercase block">Registered Email</span>
                    <span className="text-xs font-semibold text-[#3D2B1F] select-all break-all">{user?.email || publicArtistInfo?.role || "Not Configured"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#3D2B1F]/50 uppercase block">Account Identity ID</span>
                    <span className="text-[11px] font-mono font-medium text-[#3D2B1F]/70 select-all">{profileArtistId}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </main>
  );
}