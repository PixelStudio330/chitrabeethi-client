"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// Updated to 4 fine art painting items as requested
const ARTWORKS = [
  { id: 1, name: "Symphony of the Sacred Lotus", price: 45000, img: "/tuna.jpg", tag: "Original Acrylic", category: "Canvas" },
  { id: 2, name: "Whispering River Mornings", price: 32000, img: "/menu4.jpg", tag: "Pure Watercolor", category: "Paper" },
  { id: 3, name: "Echoes of the Mystic Baul", price: 65000, img: "/special sushi.png", tag: "Heritage Collection", category: "Paper" },
  { id: 4, name: "Serenity in the Golden Crimson Haze", price: 28000, img: "/menu5.jpg", tag: "Fine Art Print", category: "Canvas" },
];

export default function Home() {
  const [filter, setFilter] = useState("Canvas");
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempValue, setTempValue] = useState<string>("");

  const filteredArtworks = ARTWORKS.filter(artwork => artwork.category === filter);

  const handleInputChange = (val: string) => {
    const numericValue = val.replace(/\D/g, "");
    setTempValue(numericValue);
  };

  const handleBlur = (id: number) => {
    const finalVal = tempValue === "" ? 0 : parseInt(tempValue, 10);
    setQuantities(prev => ({ ...prev, [id]: finalVal }));
    setEditingId(null);
    setTempValue("");
  };

  const updateQty = (id: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  return (
    <>
      <main className="bg-[#FDFBF7] min-h-screen pt-20 md:pt-32 pb-20 overflow-x-hidden font-sans text-[#3D2B1F]">
        
        {/* --- HERO SECTION --- */}
        <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 md:px-10 overflow-hidden">
          
          {/* Decorative Orbs - Left */}
          <div className="absolute top-10 -left-10 md:-left-24 w-40 md:w-64 h-64 select-none pointer-events-none z-0">
            <div className="relative w-full h-full">
              <div className="absolute top-0 left-0 w-32 h-32 md:w-80 md:h-80 bg-[#e2b4bd] opacity-20 rounded-full" />
              <div className="absolute top-6 left-6 w-24 h-24 md:w-60 md:h-60 bg-[#5C4033] opacity-20 rounded-full shadow-lg" />
              <div className="absolute top-48 left-16 md:top-60 md:left-24 w-16 h-16 md:w-44 md:h-44 bg-[#8A9A5B] opacity-10 rounded-full" />
            </div>
          </div>

          {/* Hero Decorative Background - Right */}
          <div className="absolute top-[15%] -right-16 md:top-[20%] md:right-0 w-64 md:w-120 h-auto md:h-150 select-none pointer-events-none z-0">
            <div className="relative h-full w-full flex items-center justify-end">
              <div className="absolute w-80 h-64 md:w-120 md:h-96 lg:w-160 lg:h-160 bg-[#5C4033] opacity-10 rounded-full translate-x-1/2" />
              <div className="absolute w-64 h-64 md:w-[320px] md:h-[320px] lg:w-[500px] lg:h-[500px] bg-[#8A9A5B] opacity-20 rounded-full translate-x-[52%]" />
              <div className="absolute w-48 h-48 md:w-[240px] md:h-[240px] lg:w-[320px] lg:h-[320px] bg-[#5C4033] opacity-100 rounded-full shadow-2xl translate-x-[58%] border-2 md:border-4 border-[#E2B4BD]" />

              <motion.img 
                initial={{ opacity: 0, x: 20, rotate: -90 }}
                animate={{ opacity: 1, x: 0, rotate: -90 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src="/cherry-blossom.png" 
                alt="Lotus Bloom Accent"
                className="absolute right-[-40px] md:right-[-140px] lg:right-[-180px] w-[250px] md:w-[450px] lg:w-[600px] scale-75 md:scale-100 object-contain z-20 drop-shadow-[-20px_0px_30px_rgba(0,0,0,0.15)] opacity-40"
              />
            </div>
          </div>

          <div className="text-center z-10 flex flex-col items-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 bg-[#3D2B1F] rounded-full -z-10 shadow-[0_0_80px_rgba(61,43,31,0.4)] border border-white/5" />
              
              <h1 className="text-[50px] sm:text-[100px] md:text-[220px] font-bold text-[#e2b4bd] leading-none select-none tracking-tighter drop-shadow-2xl font-sans pt-18 pb-8">
                চিত্রবীথি
              </h1>
              
              <div className="flex flex-col items-center mt-[-5px] md:mt-[-20px]">
                  <p className="text-lg md:text-3xl tracking-[0.8em] md:tracking-[1.2em] font-black text-[#3D2B1F] uppercase border-t-[2px] md:border-t-[4px] border-[#3D2B1F] pt-2 md:pt-4 leading-none">
                    চিত্রবীথি
                  </p>
                  <p className="text-[8px] md:text-[11px] tracking-[0.3em] md:tracking-[0.6em] text-[#5C4033] uppercase mt-4 md:mt-6 font-bold opacity-70">
                      CHITRABEETHI • THE FINE ART GALLERY — ESTD 2026
                  </p>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 mt-12 z-20 relative w-full max-w-7xl lg:-ml-32">
            <motion.div 
              animate={{ y: [0, -25, 0], rotate: [0, 1, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="flex-shrink-0"
            >
              <div className="relative group">
                <div className="w-[280px] h-[280px] md:w-[480px] md:h-[480px] lg:w-[580px] lg:h-[580px] bg-white/10 backdrop-blur-xl rounded-full border-[6px] md:border-[10px] border-[#3D2B1F]/10 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/hero.png" 
                    alt="Main Gallery Exhibition" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                  />
                </div>
              </div>
            </motion.div>

            <div className="max-w-md lg:text-left text-center px-4">
              <h2 className="text-[#3D2B1F] text-3xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] italic">
                THE SOUL OF THE <br /> 
                <span className="text-[#E2B4BD]">BENGAL</span> <span className="text-[#8A9A5B]">CANVAS</span>
              </h2>
              <p className="text-[10px] md:text-sm text-[#5C4033] mt-4 md:mt-6 uppercase tracking-[0.15em] md:tracking-[0.2em] font-bold leading-relaxed">
                Reality is a lie meant for the living. Die a little to the world, and let your wildest imagination spill onto the canvas.
              </p>
              <div className="mt-6 md:mt-8 flex flex-wrap gap-3 md:gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => window.location.href = '/track'}
                  className="bg-[#3D2B1F] text-[#E2B4BD] text-[9px] md:text-[10px] py-3 md:py-4 px-8 md:px-10 rounded-full uppercase tracking-widest font-black hover:bg-[#8A9A5B] hover:text-[#3D2B1F] transition-all duration-300 shadow-xl"
                >
                  View Gallery
                </button>
                <button className="border-2 border-[#3D2B1F] text-[#3D2B1F] text-[9px] md:text-[10px] py-3 md:py-4 px-8 md:px-10 rounded-full uppercase tracking-widest font-black hover:bg-[#3D2B1F] hover:text-[#E2B4BD] transition-all duration-300">
                  Our Story
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- STICKY FILTER --- */}
        <div className="sticky top-0 z-50 w-full py-6 md:py-10 flex justify-center bg-[#FDFBF7]/95 backdrop-blur-lg border-b border-[#3D2B1F]/10">
          <div className="bg-[#3D2B1F] p-1.5 md:p-2 rounded-full flex gap-1 shadow-lg">
            {[ 'Canvas', 'Paper' ].map((cat) => (
              <button 
                key={cat} 
                onClick={() => setFilter(cat)}
                className={`px-8 md:px-12 py-3 md:py-4 rounded-full text-[10px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-black transition-all duration-500
                ${filter === cat 
                  ? 'bg-[#E2B4BD] text-[#3D2B1F] scale-105 shadow-xl' 
                  : 'bg-transparent text-[#E2B4BD]/60 hover:text-white hover:bg-white/5'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- ARTWORK CARD GRID --- */}
        <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-36 md:gap-y-48 gap-x-14 mt-32 md:mt-44 px-6 md:px-10">
          <AnimatePresence mode="popLayout">
            {filteredArtworks.map((artwork) => {
              const quantity = quantities[artwork.id] || 0;
              const displayVal = editingId === artwork.id ? tempValue : quantity;

              return (
                <motion.div 
                  key={artwork.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  whileHover={{ y: -10 }}
                  className="relative bg-[#3D2B1F] rounded-[40px] md:rounded-[60px] p-6 md:p-8 pt-28 md:pt-36 flex flex-col items-center group shadow-2xl border border-white/5"
                >
                  <div className="absolute -top-24 md:-top-32 w-56 h-56 md:w-72 md:h-72 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#8A9A5B]/20 rounded-full blur-xl group-hover:bg-[#8A9A5B]/40 transition-all duration-700" />
                      <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-[6px] md:border-[8px] border-[#3D2B1F] bg-[#E2B4BD] overflow-hidden shadow-xl group-hover:scale-105 transition-transform duration-700 ease-out">
                          <img src={artwork.img} alt={artwork.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-[#3D2B1F]/20 to-transparent pointer-events-none" />
                      </div>
                  </div>

                  <div className="text-center w-full mb-6 md:mb-8">
                    <span className="text-[#8A9A5B] text-[8px] md:text-[9px] font-black tracking-[0.3em] md:tracking-[0.4em] uppercase mb-1 md:mb-2 block">{artwork.tag}</span>
                    <h3 className="text-[#E2B4BD] font-black text-xl md:text-2xl tracking-[0.05em] uppercase italic leading-tight">{artwork.name}</h3>
                    <p className="text-[9px] md:text-[10px] text-[#E2B4BD]/60 mt-3 md:mt-4 leading-relaxed px-2 md:px-4 uppercase tracking-[0.1em] font-medium opacity-70">
                      Finished with premium museum glazing. Includes Certificate of Authenticity.
                    </p>
                  </div>

                  <div className="mt-auto w-full flex items-center justify-between bg-white/5 rounded-[25px] md:rounded-[30px] p-1.5 md:p-2 border border-white/5">
                    <div className="flex-1 py-2 md:py-3 px-4 md:px-6 rounded-[20px] md:rounded-[24px] bg-gradient-to-r from-[#8A9A5B] to-[#5C4033] shadow-lg">
                        <span className="text-[#E2B4BD] font-black text-xl md:text-2xl italic tracking-tighter font-sans">৳{artwork.price.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <AnimatePresence mode="wait">
                        {(quantity > 0 || editingId === artwork.id) ? (
                          <motion.div 
                            key="qty-controls"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-center bg-[#E2B4BD] rounded-[18px] md:rounded-[22px] p-1 shadow-lg"
                          >
                            <button onClick={() => updateQty(artwork.id, -1)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-[#3D2B1F] font-black text-lg hover:text-[#8A9A5B] transition-colors">-</button>
                            <input 
                              type="text"
                              value={displayVal}
                              onFocus={() => { setEditingId(artwork.id); setTempValue(quantity.toString()); }}
                              onChange={(e) => handleInputChange(e.target.value)}
                              onBlur={() => handleBlur(artwork.id)}
                              className="w-8 md:w-10 text-center bg-transparent text-[#3D2B1F] font-black text-xs md:text-sm border-none focus:outline-none focus:ring-0 p-0"
                            />
                            <button onClick={() => updateQty(artwork.id, 1)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-[#3D2B1F] font-black text-lg hover:text-[#8A9A5B] transition-colors">+</button>
                          </motion.div>
                        ) : (
                          <motion.button 
                            key="add-btn"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            whileHover={{ scale: 1.05, backgroundColor: "#8A9A5B", color: "#3D2B1F" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateQty(artwork.id, 1)}
                            className="w-12 h-12 md:w-16 md:h-16 bg-[#E2B4BD] rounded-[18px] md:rounded-[22px] flex items-center justify-center text-[#3D2B1F] font-black text-xl md:text-2xl shadow-lg transition-colors cursor-pointer"
                          >
                            +
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </section>
      </main>
    </>
  );
}