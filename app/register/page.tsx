'use client';

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, Paintbrush, Link2 } from "lucide-react";
import toast from "react-hot-toast";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// --- Framer Motion Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    },
  },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

interface FloatingArtGlyphProps {
  glyph: string;
  delay?: number;
  initialPos?: { top?: string; bottom?: string; left?: string; right?: string };
}

function FloatingArtGlyph({ glyph, delay = 0, initialPos = {} }: FloatingArtGlyphProps) {
  const [drift, setDrift] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setDrift({
      x: Math.random() * 60 - 30,
      y: Math.random() * 60 - 30
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, ...initialPos }}
      animate={{
        opacity: [0, 0.25, 0.25, 0],
        x: [0, drift.x, drift.x * -0.5, 0],
        y: [0, drift.y, drift.y * 0.5, 0],
        rotate: [0, 15, -15, 0],
      }}
      transition={{
        duration: 14,
        delay: delay,
        ease: "easeInOut",
        repeat: Infinity,
      }}
      className="absolute text-4xl select-none z-0 filter drop-shadow-md"
    >
      {glyph}
    </motion.div>
  );
}

export default function RegisterPage() {
  // 🔄 UPDATED: Changed avatarUrl key to profilePicture to match MongoDB
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
    confirmPassword: "",
    profilePicture: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();

  // FIXED: Memoizing class names to completely avoid SSR string syntax parsing differences
  const containerClasses = useMemo(() => {
    return "bg-[#3D2B1F] w-full max-w-xl shadow-[0_35px_80px_rgba(61,43,31,0.25)] border-4 border-[#E2B4BD] relative z-10 px-10 py-12 md:px-14 md:py-14 rounded-[50%_50%_45%_55%_/_55%_45%_55%_45%] transition-all duration-700 hover:rounded-[48%_52%_50%_50%_/_50%_52%_48%_50%]";
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setRole = (selectedRole: "user" | "artist") => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long. 📜", {
        style: { background: '#FDFBF7', color: '#3D2B1F', borderRadius: '1rem', border: '2px solid #E2B4BD' }
      });
      return;
    }
    if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password)) {
      toast.error("Include both uppercase & lowercase text. 🎨", {
        style: { background: '#FDFBF7', color: '#3D2B1F', borderRadius: '1rem', border: '2px solid #E2B4BD' }
      });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match. 🏛️", {
        style: { background: '#FDFBF7', color: '#3D2B1F', borderRadius: '1rem', border: '2px solid #E2B4BD' }
      });
      return;
    }

    setIsSubmitting(true);
    const connectionToast = toast.loading("Forging credentials in the gallery vault...", {
      style: { background: "#3D2B1F", color: "#E2B4BD", borderRadius: "1rem", border: "1px solid #8A9A5B" },
    });

    try {
      // 🔄 UPDATED: Payload property is now profilePicture instead of avatarUrl
      await axios.post(`${BASE_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        profilePicture: formData.profilePicture
      });

      toast.success("Identity registered flawlessly! Welcome to Chitrabeethi. 🍃", {
        id: connectionToast,
        duration: 2500,
        style: { background: "#FDFBF7", color: "#3D2B1F", borderRadius: "1rem", border: "2px solid #8A9A5B" },
      });

      router.push("/login");
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error(err.response?.data?.message || "Registration trace rejected. Try again.", {
        id: connectionToast,
        duration: 4000,
        style: { background: '#FDFBF7', color: '#3D2B1F', borderRadius: '1rem', border: '2px solid #E2B4BD' }
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#3D2B1F] flex items-center justify-center pt-36 pb-24 px-6 relative overflow-hidden selection:bg-[#E2B4BD]/45">
      
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0 bg-[linear-gradient(to_right,#3D2B1F_1px,transparent_1px),linear-gradient(to_bottom,#3D2B1F_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="absolute inset-0 pointer-events-none z-0">
        <FloatingArtGlyph glyph="🏺" delay={0} initialPos={{ top: "14%", left: "8%" }} />
        <FloatingArtGlyph glyph="🖌️" delay={3} initialPos={{ bottom: "12%", right: "10%" }} />
        <FloatingArtGlyph glyph="📜" delay={6} initialPos={{ top: "30%", right: "6%" }} />
        <FloatingArtGlyph glyph="✨" delay={9} initialPos={{ bottom: "25%", left: "5%" }} />

        <div className="absolute top-1/4 left-1/3 w-[550px] h-[550px] bg-[#E2B4BD]/15 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[#8A9A5B]/15 rounded-full blur-[110px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={containerClasses}
      >
        <motion.div variants={itemVariants} className="text-center mb-6 mt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDFBF7]/10 border border-[#E2B4BD]/20 text-[10px] uppercase tracking-[0.2em] font-black text-[#E2B4BD] mb-3">
            <Sparkles size={10} className="text-[#8A9A5B]" /> Chitrabeethi Atelier
          </div>
          <h1 className="text-3xl font-black tracking-tight font-serif text-[#FDFBF7]">Join the Collection</h1>
          <p className="text-xs text-[#E2B4BD]/70 font-medium mt-1">
            Secure your credentials to enter the digital vault.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-xs md:max-w-sm mx-auto flex flex-col justify-center">
          <motion.div variants={itemVariants}>
            <label className="block text-[10px] font-black text-[#E2B4BD] uppercase tracking-widest mb-1.5 ml-1">
              Full Name
            </label>
            <div className="relative rounded-xl bg-[#FDFBF7]/5 border border-[#E2B4BD]/20 focus-within:border-[#E2B4BD] transition-all overflow-hidden">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#E2B4BD]/50">
                <User size={15} />
              </div>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Zainul Abedin"
                className="w-full pl-11 pr-5 py-2.5 text-xs font-semibold text-[#FDFBF7] placeholder-[#E2B4BD]/30 bg-transparent focus:outline-none"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-[10px] font-black text-[#E2B4BD] uppercase tracking-widest mb-1.5 ml-1">
              Email Address
            </label>
            <div className="relative rounded-xl bg-[#FDFBF7]/5 border border-[#E2B4BD]/20 focus-within:border-[#E2B4BD] transition-all overflow-hidden">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#E2B4BD]/50">
                <Mail size={15} />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="collector@chitrabeethi.com"
                className="w-full pl-11 pr-5 py-2.5 text-xs font-semibold text-[#FDFBF7] placeholder-[#E2B4BD]/30 bg-transparent focus:outline-none"
              />
            </div>
          </motion.div>

          {/* 🔄 UPDATED: Name and value updated to profilePicture */}
          <motion.div variants={itemVariants}>
            <label className="block text-[10px] font-black text-[#E2B4BD] uppercase tracking-widest mb-1.5 ml-1">
              Profile Picture URL
            </label>
            <div className="relative rounded-xl bg-[#FDFBF7]/5 border border-[#E2B4BD]/20 focus-within:border-[#E2B4BD] transition-all overflow-hidden">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#E2B4BD]/50">
                <Link2 size={15} />
              </div>
              <input
                type="url"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/avatar.jpg"
                className="w-full pl-11 pr-5 py-2.5 text-xs font-semibold text-[#FDFBF7] placeholder-[#E2B4BD]/30 bg-transparent focus:outline-none"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-[10px] font-black text-[#E2B4BD] uppercase tracking-widest mb-1.5 ml-1">
              Account Purpose
            </label>
            <div className="bg-[#3D2B1F] p-1 rounded-xl border border-[#E2B4BD]/20 grid grid-cols-2 text-center relative overflow-hidden">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-300 ${
                  formData.role === "user" 
                    ? "bg-[#E2B4BD] text-[#3D2B1F] shadow-md" 
                    : "text-[#E2B4BD] opacity-60 hover:opacity-100"
                }`}
              >
                Art Collector
              </button>
              <button
                type="button"
                onClick={() => setRole("artist")}
                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 ${
                  formData.role === "artist" 
                    ? "bg-[#8A9A5B] text-[#3D2B1F] shadow-md" 
                    : "text-[#E2B4BD] opacity-60 hover:opacity-100"
                }`}
              >
                <Paintbrush size={11} /> Creative Artist
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <motion.div variants={itemVariants}>
              <label className="block text-[10px] font-black text-[#E2B4BD] uppercase tracking-widest mb-1.5 ml-1">
                Password
              </label>
              <div className="relative rounded-xl bg-[#FDFBF7]/5 border border-[#E2B4BD]/20 focus-within:border-[#E2B4BD] transition-all overflow-hidden">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#E2B4BD]/50">
                  <Lock size={14} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold text-[#FDFBF7] bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#E2B4BD]/50 hover:text-[#E2B4BD] focus:outline-none"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-[10px] font-black text-[#E2B4BD] uppercase tracking-widest mb-1.5 ml-1">
                Verify Pass
              </label>
              <div className="relative rounded-xl bg-[#FDFBF7]/5 border border-[#E2B4BD]/20 focus-within:border-[#E2B4BD] transition-all overflow-hidden">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#E2B4BD]/50">
                  <Lock size={14} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold text-[#FDFBF7] bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#E2B4BD]/50 hover:text-[#E2B4BD] focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </motion.div>
          </div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-[#E2B4BD] hover:bg-[#d8a2ab] text-[#3D2B1F] rounded-xl font-black text-xs tracking-[0.15em] uppercase shadow-md transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {isSubmitting ? "Assembling Access Key..." : (
              <>
                Initialize Vault Account <ArrowRight size={13} />
              </>
            )}
          </motion.button>
        </form>

        <motion.p variants={itemVariants} className="text-center text-[11px] text-[#E2B4BD]/70 font-bold mt-6 mb-2">
          Already belong to the archive?
          <Link href="/login" className="text-[#FDFBF7] font-black hover:text-[#E2B4BD] transition-colors ml-1 underline underline-offset-4 decoration-2">
            Login here
          </Link>
        </motion.p>
      </motion.div>
    </main>
  );
}