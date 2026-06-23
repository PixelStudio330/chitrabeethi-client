"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Subtle background decorative blobs/shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 rounded-full bg-[#E2B4BD]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-[#8A9A5B]/15 blur-3xl pointer-events-none" />

      {/* Main Content Container */}
      <div className="max-w-md w-full text-center z-10 flex flex-col items-center">
        
        {/* Floating Empty Art Frame Visual */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-64 h-64 flex items-center justify-center mb-8"
        >
          {/* Decorative Back shadow / Canvas Glow */}
          <div className="absolute inset-4 bg-[#E2B4BD]/30 rounded-2xl transform rotate-6 scale-95" />
          
          {/* The Outer Frame */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute inset-0 border-[12px] border-[#3D2B1F] bg-[#FDFBF7] rounded-xl shadow-xl flex flex-col items-center justify-center p-4"
          >
            {/* The Inner Frame/Matting Mat */}
            <div className="w-full h-full border-2 border-dashed border-[#3D2B1F]/30 rounded flex flex-col items-center justify-center bg-white/50">
              <span className="text-7xl font-serif font-bold text-[#E2B4BD]">404</span>
              
              {/* Little cute botanical/art detail line */}
              <div className="flex gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-[#8A9A5B]" />
                <span className="w-6 h-2 rounded-full bg-[#3D2B1F]/20" />
                <span className="w-2 h-2 rounded-full bg-[#8A9A5B]" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Text Details */}
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-serif text-3xl font-bold text-[#3D2B1F] tracking-tight mb-3"
        >
          The Canvas is Empty
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-[#3D2B1F]/80 text-sm leading-relaxed max-w-sm mb-8 font-sans"
        >
          It looks like this masterpiece hasn't been painted yet, or it wandered off into another wing of the Chitrabeethi gallery. 
        </motion.p>

        {/* Interactive Navigation Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#8A9A5B] hover:bg-[#78884f] text-[#FDFBF7] font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 group"
          >
            <span>Return to ArtHub</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>
      </div>

      {/* Tiny aesthetic corner accent */}
      <div className="absolute bottom-6 left-6 font-serif text-xs text-[#3D2B1F]/30 tracking-widest hidden sm:block">
        CHITRABEETHI • চিত্রবীথি
      </div>
    </div>
  );
}