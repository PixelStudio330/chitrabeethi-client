'use client';

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

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

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Memoizing premium organic canvas shape
  const containerClasses = useMemo(() => {
    return "bg-[#3D2B1F] w-full max-w-xl shadow-[0_35px_80px_rgba(61,43,31,0.25)] border-4 border-[#E2B4BD] relative z-10 px-10 py-12 md:px-14 md:py-14 rounded-[54%_46%_52%_48%_/_48%_52%_48%_52%] transition-all duration-700 hover:rounded-[50%_50%_45%_55%_/_55%_45%_55%_45%]";
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleRedirection = (role: string) => {
    if (role === 'admin') {
      router.push('/dashboard/admin');
    } else if (role === 'artist') {
      router.push('/dashboard/artist');
    } else {
      router.push('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const vaultToast = toast.loading("Decrypting credentials from the archive...", {
      style: { background: "#3D2B1F", color: "#E2B4BD", borderRadius: "1rem", border: "1px solid #8A9A5B" },
    });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication trace rejected.');
      }

      login(data.token, data.user);

      toast.success(`Welcome back, collector! Entry authorized. 🍃`, {
        id: vaultToast,
        duration: 2500,
        style: { background: "#FDFBF7", color: "#3D2B1F", borderRadius: "1rem", border: "2px solid #8A9A5B" },
      });

      handleRoleRedirection(data.user.role);

    } catch (err: any) {
      setLoading(false);
      toast.error(err.message || "Invalid archive signature. Try again.", {
        id: vaultToast,
        duration: 4000,
        style: { background: '#FDFBF7', color: '#3D2B1F', borderRadius: '1rem', border: '2px solid #E2B4BD' }
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#3D2B1F] flex items-center justify-center pt-36 pb-24 px-6 relative overflow-hidden selection:bg-[#E2B4BD]/45">
      
      {/* Structural Blueprint Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0 bg-[linear-gradient(to_right,#3D2B1F_1px,transparent_1px),linear-gradient(to_bottom,#3D2B1F_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Atmospheric Blur Vector Blobs & Drifting Glyphs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <FloatingArtGlyph glyph="🖼️" delay={1} initialPos={{ top: "18%", left: "10%" }} />
        <FloatingArtGlyph glyph="🔑" delay={4} initialPos={{ bottom: "15%", right: "12%" }} />
        <FloatingArtGlyph glyph="✨" delay={7} initialPos={{ top: "28%", right: "8%" }} />
        <FloatingArtGlyph glyph="🏺" delay={10} initialPos={{ bottom: "22%", left: "7%" }} />

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
          <h1 className="text-3xl font-black tracking-tight font-serif text-[#FDFBF7]">Welcome Back</h1>
          <p className="text-xs text-[#E2B4BD]/70 font-medium mt-1">
            Re-verify your credentials to step into your creative dashboard.
          </p>
        </motion.div>

        {/* TRADITIONAL FORM ACTIONS */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xs md:max-w-sm mx-auto flex flex-col justify-center">
          
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

          <motion.div variants={itemVariants}>
            <label className="block text-[10px] font-black text-[#E2B4BD] uppercase tracking-widest mb-1.5 ml-1">
              Secret Password
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
                className="w-full pl-11 pr-10 py-2.5 text-xs font-semibold text-[#FDFBF7] bg-transparent focus:outline-none"
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

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#E2B4BD] hover:bg-[#d8a2ab] text-[#3D2B1F] rounded-xl font-black text-xs tracking-[0.15em] uppercase shadow-md transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? "Authorizing Identity..." : (
              <>
                Unlock Studio Archive <ArrowRight size={13} />
              </>
            )}
          </motion.button>
        </form>

        {/* PREMIUM DECORATED INTERSECTION LINE */}
        <motion.div variants={itemVariants} className="relative my-6 max-w-xs md:max-w-sm mx-auto flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E2B4BD]/10"></div>
          </div>
          <span className="relative bg-[#3D2B1F] px-3 text-[9px] font-mono uppercase tracking-[0.2em] text-[#E2B4BD]/50 font-black">
            Or Sync Identity Via
          </span>
        </motion.div>

        {/* SOCIAL IDENTITY PROVIDER MODULE */}
        <motion.div variants={itemVariants} className="w-full flex justify-center max-w-xs md:max-w-sm mx-auto">
          <div className="w-full scale-[0.98] hover:scale-[1.01] transition-transform duration-300">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (credentialResponse.credential) {
                  const authenticatingToast = toast.loading("Verifying social key parameters...", {
                    style: { background: "#3D2B1F", color: "#E2B4BD", borderRadius: "1rem", border: "1px solid #8A9A5B" },
                  });

                  const result = await loginWithGoogle(credentialResponse.credential);

                  if (result.success && result.role) {
                    toast.success("Google clearance granted. Synchronized perfectly! 🍃", {
                      id: authenticatingToast,
                      duration: 2500,
                      style: { background: "#FDFBF7", color: "#3D2B1F", borderRadius: "1rem", border: "2px solid #8A9A5B" },
                    });
                    handleRoleRedirection(result.role);
                  } else {
                    toast.error(result.error || 'Google pipeline verification rejected.', {
                      id: authenticatingToast,
                      duration: 4000,
                      style: { background: '#FDFBF7', color: '#3D2B1F', borderRadius: '1rem', border: '2px solid #E2B4BD' }
                    });
                  }
                }
              }}
              onError={() => {
                toast.error("Handshake terminated by remote authorization window.", {
                  style: { background: '#FDFBF7', color: '#3D2B1F', borderRadius: '1rem', border: '2px solid #E2B4BD' }
                });
              }}
              theme="filled_black" // Blends with your deep chocolate surface
              shape="pill"
              width="100%"
            />
          </div>
        </motion.div>

        <motion.p variants={itemVariants} className="text-center text-[11px] text-[#E2B4BD]/70 font-bold mt-6 mb-2">
          New to the collective?
          <Link href="/register" className="text-[#FDFBF7] font-black hover:text-[#E2B4BD] transition-colors ml-1 underline underline-offset-4 decoration-2">
            Create an account
          </Link>
        </motion.p>
      </motion.div>
    </main>
  );
}