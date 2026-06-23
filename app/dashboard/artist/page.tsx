"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Heart, 
  Sparkles, 
  DollarSign, 
  X, 
  Edit2, 
  FolderHeart,
  TrendingUp,
  Loader2,
  Tag,
  Eye,
  Image as ImageIcon,
  UploadCloud,
  SlidersHorizontal,
  Search
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getArtworks, ArtworkData } from "../../../utils/api";

const BASE_URL = "http://localhost:5000/api/artworks";

const CATEGORIES = ["Painting", "Acrylic Art", "Sculpture", "Photography", "Canvas", "Paper"];

const CARD_BG_COLORS = [
  "bg-[#FDFBF7]", 
  "bg-[#F5E6E8]", 
  "bg-[#EFF2E7]", 
];

export default function ArtistDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Real Database Core Streams
  const [artworks, setArtworks] = useState<ArtworkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Layout Engine States
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [activeTab, setActiveTab] = useState<"inventory" | "analytics">("inventory");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);

  // Strict Schema Mapping Form Schema
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "Painting",
    img: "",
    tag: "",
    status: "available"
  });

  // Dynamic Data Sync Pipeline Hook
  const fetchArtistWorks = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const allArt = await getArtworks();
      
      // Filter list locally to present pieces uploaded by active authenticated profile context
      const personalPieces = allArt.filter((art: any) => art.artist?._id === user?.id || art.artist === user?.id);
      setArtworks(personalPieces);
    } catch (err: any) {
      console.error("Failed syncing vault assets:", err);
      setErrorMsg("Unable to establish interface link with Chitrabeethi Database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchArtistWorks();
    }
  }, [user]);

  // Form Field Dynamic Mutator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value
    }));
  };

  // --- DYNAMIC IMGBB ENVIROMENT-BASED UPLOAD PIPELINE ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      setErrorMsg("ImgBB API structural config missing in application ecosystem context.");
      return;
    }

    setUploadingImage(true);
    setErrorMsg(null);

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: uploadData,
      });

      const jsonRes = await res.json();
      if (jsonRes.success && jsonRes.data?.url) {
        setFormData(prev => ({ ...prev, img: jsonRes.data.url }));
      } else {
        throw new Error(jsonRes.error?.message || "Parsing interface failed inside upload stream.");
      }
    } catch (err: any) {
      console.error("ImgBB Upload Failure:", err);
      setErrorMsg(err.message || "Could not link file system asset to server storage vault.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Open Modal Helper Resetting Schema Form Inputs safely
  const openAddModal = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "Painting",
      img: "",
      tag: "",
      status: "available"
    });
    setModalMode("add");
    setIsModalOpen(true);
  };

  const openEditModal = (artwork: any) => {
    setFormData({
      name: artwork.name,
      description: artwork.description,
      price: artwork.price,
      category: artwork.category || "Painting",
      img: artwork.img,
      tag: artwork.tag || "",
      status: artwork.status || "available"
    });
    setSelectedArtworkId(artwork._id);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // --- CRUD ACTION AXIOS/FETCH ENGINES ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadingImage) return; // Prevent submission while assets are inflight
    setActionLoading(true);
    setErrorMsg(null);

    const payload = {
      ...formData,
      authUser: {
        id: user?.id,
        role: user?.role || "artist"
      }
    };

    try {
      let response;
      if (modalMode === "add") {
        response = await fetch(BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${BASE_URL}/${selectedArtworkId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const jsonRes = await response.json();
      if (!jsonRes.success) throw new Error(jsonRes.message);

      setIsModalOpen(false);
      fetchArtistWorks();
    } catch (err: any) {
      setErrorMsg(err.message || "Operation failed inside target repository.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteArtwork = async (artworkId: string) => {
    if (!confirm("Are you sure you want to permanently purge this asset selection?")) return;
    
    try {
      const response = await fetch(`${BASE_URL}/${artworkId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authUser: { id: user?.id, role: user?.role || "artist" }
        })
      });
      const jsonRes = await response.json();
      if (!jsonRes.success) throw new Error(jsonRes.message);
      
      fetchArtistWorks();
    } catch (err: any) {
      alert(err.message || "Failed running mutation request.");
    }
  };

  const navigateToDetails = (id: string) => {
    router.push(`/product-details/${id}`);
  };

  // Navigate back to the artist's updated nested public showcase layout view
  const navigateToPublicProfile = () => {
    if (user?.id) {
      router.push(`/profile/artist/${user.id}`);
    } else {
      router.push("/browse");
    }
  };

  // --- COMPUTE VELOCITY METRICS MATRIX FROM DATABASE DATA ---
  const dynamicRevenue = artworks
    .filter(art => art.status === "sold")
    .reduce((acc, curr) => acc + curr.price, 0);

  const velocityGraphData = CATEGORIES.map(cat => {
    const categoryItems = artworks.filter(art => art.category === cat);
    const valuation = categoryItems.reduce((sum, item) => sum + item.price, 0);
    return {
      category: cat,
      count: categoryItems.length,
      label: `${categoryItems.length} Pieces (৳${valuation.toLocaleString()})`
    };
  });

  const maxPiecesCount = Math.max(...velocityGraphData.map(d => d.count), 1);

  // Filter artworks dynamically based on selection and artwork name search
  const filteredArtworks = artworks.filter(art => {
    if (!art) return false;
    
    const matchesCategory = selectedCategoryFilter === "All" || art.category === selectedCategoryFilter;
    
    const targetName = art.name || "";
    const cleanQuery = searchQuery.toLowerCase().trim();
    const matchesSearch = cleanQuery === "" || targetName.toLowerCase().includes(cleanQuery);
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D2B1F] pt-32 pb-24 px-4 md:px-12 relative overflow-hidden font-sans select-none">
      
      {/* Structural Bubbly Grids & Ambient Texture Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3D2B1F/0.02_1px,transparent_1px),linear-gradient(to_bottom,#3D2B1F/0.02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-100px] w-[500px] h-[500px] bg-[#E2B4BD]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-[-50px] w-[350px] h-[350px] bg-[#8A9A5B]/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- DASHBOARD STUDIO HEADER --- */}
        <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-[3px] border-[#3D2B1F] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8A9A5B]/10 rounded-full border border-[#8A9A5B]/20 text-[#8A9A5B] text-xs font-black uppercase tracking-widest mb-3">
              <Sparkles size={12} /> Studio Workshop Controller
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-[#3D2B1F] leading-none">
              ARTIST <span className="text-[#E2B4BD] italic font-normal">DASHBOARD</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Quick link button to view their own updated profile route live */}
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={navigateToPublicProfile}
              className="bg-[#FDFBF7] text-[#3D2B1F] border-[3px] border-[#3D2B1F] rounded-2xl text-xs font-black uppercase tracking-widest px-5 py-4 flex items-center gap-2 transition-all hover:bg-[#3D2B1F]/5"
            >
              👁️ Live Gallery Profile
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={openAddModal}
              className="bg-[#8A9A5B] text-[#FDFBF7] border-[3px] border-[#3D2B1F] shadow-[5px_5px_0px_0px_#3D2B1F] rounded-2xl text-xs font-black uppercase tracking-widest px-6 py-4 flex items-center gap-2 transition-all"
            >
              <Plus size={14} strokeWidth={3} /> Publish Masterpiece
            </motion.button>
          </div>
        </div>

        {/* --- LIVE WORKSPACE STATISTICS STRIP --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          <div className="bg-[#FDFBF7] border-[3px] border-[#3D2B1F] rounded-[30px] p-6 shadow-[6px_6px_0px_0px_#3D2B1F]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#3D2B1F]/60">Settled Revenue</span>
              <div className="p-2 bg-[#8A9A5B]/20 rounded-xl text-[#8A9A5B]"><DollarSign size={16} /></div>
            </div>
            <h3 className="text-3xl font-black tracking-tight">৳{dynamicRevenue.toLocaleString()}</h3>
            <p className="text-[9px] uppercase font-bold text-[#3D2B1F]/50 mt-1">Calculated from total items sold out</p>
          </div>

          <div className="bg-[#F5E6E8] border-[3px] border-[#3D2B1F] rounded-[30px] p-6 shadow-[6px_6px_0px_0px_#3D2B1F]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#3D2B1F]/60">Gallery Deployment</span>
              <div className="p-2 bg-[#E2B4BD]/30 rounded-xl text-[#E2B4BD]"><Heart size={16} fill="currentColor" /></div>
            </div>
            <h3 className="text-3xl font-black tracking-tight">{artworks.length} Artifacts</h3>
            <p className="text-[9px] uppercase font-bold text-[#3D2B1F]/50 mt-1">Active sync items inside repository</p>
          </div>

          {/* DYNAMIC VELOCITY HOVER CHART COMPONENT */}
          <div className="bg-[#EFF2E7] border-[3px] border-[#3D2B1F] rounded-[30px] p-6 shadow-[6px_6px_0px_0px_#3D2B1F] relative flex flex-col justify-between overflow-visible">
            <div className="flex justify-between items-center mb-2 relative">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#3D2B1F]/60">Media Category Volume</span>
                <span className="text-[10px] font-bold text-[#8A9A5B] mt-0.5 flex items-center gap-1"><TrendingUp size={11} /> Realtime Metrics</span>
              </div>

              <AnimatePresence>
                {hoveredBarIndex !== null && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    className="absolute right-0 -top-2 bg-[#3D2B1F] text-[#FDFBF7] text-[9px] font-black tracking-wider uppercase px-2.5 py-1.5 rounded-xl border-2 border-[#FDFBF7] shadow-md pointer-events-none z-30"
                  >
                    {velocityGraphData[hoveredBarIndex].label}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-16 flex items-end gap-2 pt-2 px-1 relative w-full">
              {velocityGraphData.map((item, idx) => {
                const heightPercent = `${(item.count / maxPiecesCount) * 100}%`;
                return (
                  <div 
                    key={item.category}
                    className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: heightPercent }}
                      transition={{ type: "spring", stiffness: 140, delay: idx * 0.04 }}
                      className={`w-full rounded-t-lg border-2 border-[#3D2B1F] transition-colors ${
                        hoveredBarIndex === idx ? "bg-[#8A9A5B]" : "bg-[#3D2B1F]/15 group-hover:bg-[#E2B4BD]"
                      }`}
                    />
                    <span className="text-[7px] font-black text-[#3D2B1F]/50 mt-1 uppercase tracking-tighter truncate max-w-full">{item.category.slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* --- NAVIGATION ROOM TAB VIEW SWITCHER & FILTER CHIPS --- */}
        <div className="flex flex-col gap-6 border-b-2 border-[#3D2B1F]/10 pb-6 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <button 
                onClick={() => setActiveTab("inventory")}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === "inventory" ? "bg-[#3D2B1F] text-[#FDFBF7] shadow-md" : "text-[#3D2B1F]/60 hover:text-[#3D2B1F] hover:bg-[#3D2B1F]/5"
                }`}
              >
                📋 Collection Matrix ({filteredArtworks.length !== artworks.length ? `${filteredArtworks.length}/${artworks.length}` : artworks.length})
              </button>

              {/* Artwork Search Bar Field Container */}
              <div className="relative group w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40 group-focus-within:text-[#8A9A5B] transition-colors" size={14} />
                <input 
                  type="text"
                  placeholder="Search by artwork name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/50 border border-[#3D2B1F]/10 rounded-xl pl-9 pr-4 py-2 text-[11px] font-bold text-[#3D2B1F] focus:outline-none focus:border-[#8A9A5B] focus:bg-white transition-all shadow-inner"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40 hover:text-[#3D2B1F]"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic Horizon Filtering Engine */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
              <div className="flex items-center gap-1.5 bg-[#3D2B1F]/5 rounded-2xl p-1 border border-[#3D2B1F]/10">
                <div className="px-2.5 text-[#3D2B1F]/60">
                  <SlidersHorizontal size={12} strokeWidth={2.5} />
                </div>
                {["All", ...CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                      selectedCategoryFilter === cat
                        ? "bg-[#3D2B1F] text-[#FDFBF7]"
                        : "text-[#3D2B1F]/70 hover:text-[#3D2B1F] hover:bg-[#3D2B1F]/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- RENDERING SYSTEM ERROR NOTIFICATION ACCENT --- */}
        {errorMsg && (
          <div className="mb-8 p-4 bg-[#E2B4BD]/20 border-2 border-[#E2B4BD] rounded-2xl text-xs font-bold text-[#3D2B1F] text-center uppercase tracking-wide relative">
            ⚠️ {errorMsg}
            <button onClick={() => setErrorMsg(null)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"><X size={12} /></button>
          </div>
        )}

        {/* --- ARTWORKS RECONSTRUCTED INTERACTION GRID INSIDE SCROLLABLE CONTAINER --- */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24 gap-2 text-xs font-black uppercase tracking-widest text-[#3D2B1F]/40">
            <Loader2 className="animate-spin text-[#8A9A5B]" size={18} /> Loading backend logs...
          </div>
        ) : (
          <div className="max-h-[760px] overflow-y-auto pr-2 custom-dashboard-scroll rounded-[32px] border border-[#3D2B1F]/5 p-2 bg-[#3D2B1F]/[0.01]">
            <style jsx global>{`
              .custom-dashboard-scroll::-webkit-scrollbar {
                width: 6px;
              }
              .custom-dashboard-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-dashboard-scroll::-webkit-scrollbar-thumb {
                background: #3D2B1F;
                border-radius: 10px;
              }
              .custom-dashboard-scroll {
                scrollbar-width: thin;
                scrollbar-color: #3D2B1F transparent;
              }
            `}</style>
            
            <AnimatePresence mode="popLayout">
              {filteredArtworks.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 max-w-sm mx-auto">
                  <div className="w-16 h-16 bg-[#3D2B1F]/5 rounded-full flex items-center justify-center text-[#3D2B1F]/30 mx-auto mb-4"><FolderHeart size={24} /></div>
                  <h3 className="text-sm font-black uppercase tracking-wider">No Matching Pieces</h3>
                  <p className="text-xs text-[#3D2B1F]/60 mt-1.5 font-medium">No assets matches this specific query layer in the workspace selection stack right now.</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredArtworks.map((art, index) => {
                    const cardBg = CARD_BG_COLORS[index % CARD_BG_COLORS.length];
                    
                    let statusBadgeColor = "bg-[#8A9A5B]"; 
                    if (art.status === "sold") statusBadgeColor = "bg-[#E2B4BD]";
                    if (art.status === "unpublished") statusBadgeColor = "bg-stone-400 text-[#FDFBF7]";

                    return (
                      <motion.div
                        key={art._id}
                        layout
                        whileHover={{ y: -6 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        className={`group relative ${cardBg} border-[3px] border-[#3D2B1F] rounded-[32px] p-5 shadow-[6px_6px_0px_0px_#3D2B1F] flex flex-col justify-between`}
                      >
                        <div className={`absolute -top-3 -left-3 border-2 border-[#3D2B1F] text-[#3D2B1F] text-[8px] font-black uppercase tracking-wider px-3 py-1 rounded-full rotate-[-4deg] z-10 ${statusBadgeColor}`}>
                          {art.status} ✨
                        </div>

                        <div 
                          onClick={() => navigateToDetails(art._id)}
                          className="w-full aspect-square bg-[#3D2B1F]/5 border-2 border-[#3D2B1F]/10 rounded-[22px] overflow-hidden mb-4 relative cursor-pointer"
                        >
                          <img src={art.img} alt={art.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-2 right-2 bg-[#3D2B1F] text-[#FDFBF7] text-[9px] font-black px-2.5 py-1 rounded-lg">
                            ৳{art.price}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[#8A9A5B] text-[8px] font-black tracking-widest uppercase">{art.category}</span>
                              <span className="text-[#3D2B1F]/40 text-[8px] font-bold">•</span>
                              <span className="text-[#3D2B1F]/60 text-[8px] font-black uppercase tracking-wider bg-[#3D2B1F]/5 px-1.5 py-0.5 rounded-md">{art.tag}</span>
                            </div>
                            <h4 className="text-xl font-bold italic tracking-tight text-[#3D2B1F] lowercase">{art.name}</h4>
                            <p className="text-[11px] text-[#3D2B1F]/70 font-medium line-clamp-2 mt-1 leading-relaxed">{art.description}</p>
                          </div>

                          <div className="flex flex-col gap-2 mt-5">
                            <button
                              onClick={() => navigateToDetails(art._id)}
                              className="w-full bg-[#E2B4BD] text-[#3D2B1F] border-2 border-[#3D2B1F] hover:bg-[#E2B4BD]/80 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#3D2B1F]"
                            >
                              <Eye size={12} strokeWidth={3} /> View Details
                            </button>

                            <div className="flex gap-2">
                              <button 
                                onClick={() => openEditModal(art)}
                                className="flex-1 bg-[#FDFBF7] border-2 border-[#3D2B1F] hover:bg-[#3D2B1F]/5 text-[#3D2B1F] py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                              >
                                <Edit2 size={11} /> Configure
                              </button>
                              <button 
                                onClick={() => handleDeleteArtwork(art._id)}
                                className="p-2.5 bg-[#F5E6E8] hover:bg-[#E2B4BD]/40 text-[#3D2B1F] border-2 border-[#3D2B1F] rounded-xl transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* --- RECONSTRUCTED DYNAMIC SCHEMA ENTRY FORM MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-[#3D2B1F]/40 backdrop-blur-sm" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[#FDFBF7] border-[3px] border-[#3D2B1F] rounded-[36px] w-full max-w-lg p-6 md:p-8 relative z-10 shadow-[8px_8px_0px_0px_#3D2B1F] overflow-y-auto max-h-[90vh]"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 p-2 bg-[#3D2B1F]/5 rounded-full hover:bg-[#3D2B1F]/10 text-[#3D2B1F] transition-colors"><X size={14} /></button>
              
              <div className="mb-6">
                <h3 className="text-2xl font-black uppercase tracking-tight text-[#3D2B1F]">
                  {modalMode === "add" ? "Publish Masterpiece 🎨" : "Configure Listing Parameters ✨"}
                </h3>
                <p className="text-[11px] text-[#3D2B1F]/60 font-medium">Your setup validation layers map explicitly into current active MongoDB registry schema fields.</p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/60 pl-1">Artwork Title (name)</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="E.g., Honey Haze Whisper" required className="w-full bg-[#FDFBF7] border-2 border-[#3D2B1F]/20 focus:border-[#8A9A5B] rounded-2xl px-4 py-2.5 text-xs font-bold text-[#3D2B1F] outline-none transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/60 pl-1">Price (৳ BDT)</label>
                    <input type="number" name="price" value={formData.price || ""} onChange={handleInputChange} placeholder="E.g., 15000" required className="w-full bg-[#FDFBF7] border-2 border-[#3D2B1F]/20 focus:border-[#8A9A5B] rounded-2xl px-4 py-2.5 text-xs font-bold text-[#3D2B1F] outline-none transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/60 pl-1">Schema Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-[#FDFBF7] border-2 border-[#3D2B1F]/20 focus:border-[#8A9A5B] rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#3D2B1F] outline-none cursor-pointer">
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/60 pl-1">Status Loop Allocation</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-[#FDFBF7] border-2 border-[#3D2B1F]/20 focus:border-[#8A9A5B] rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#3D2B1F] outline-none cursor-pointer">
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="unpublished">Unpublished</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/60 pl-1">Classification Sub-tag</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40" size={14} />
                      <input type="text" name="tag" value={formData.tag} onChange={handleInputChange} placeholder="E.g., Original Acrylic, Pure Watercolor" required className="w-full bg-[#FDFBF7] border-2 border-[#3D2B1F]/20 focus:border-[#8A9A5B] rounded-2xl pl-11 pr-4 py-2.5 text-xs font-bold text-[#3D2B1F] outline-none transition-colors" />
                    </div>
                  </div>
                </div>

                {/* --- SEAMLESS VISUAL UPLOAD AREA COMPONENT --- */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/60 pl-1">Artwork Canvas Image Asset</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors relative overflow-hidden bg-[#3D2B1F]/5 min-h-[90px] ${
                      formData.img ? "border-[#8A9A5B]/40" : "border-[#3D2B1F]/30 hover:border-[#8A9A5B]"
                    }`}
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#3D2B1F]/50">
                        <Loader2 className="animate-spin text-[#8A9A5B]" size={16} />
                        Uploading to ImgBB...
                      </div>
                    ) : formData.img ? (
                      <div className="flex items-center gap-3 w-full px-2">
                        <img src={formData.img} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-[#3D2B1F]/20 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-[#8A9A5B] uppercase tracking-wide">Sync Successful ✨</p>
                          <p className="text-[9px] text-[#3D2B1F]/60 font-mono truncate">{formData.img}</p>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({ ...prev, img: "" }));
                          }}
                          className="p-1.5 bg-[#F5E6E8] hover:bg-[#E2B4BD]/40 rounded-lg text-[#3D2B1F] border border-[#3D2B1F]/10 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={18} className="text-[#3D2B1F]/40" />
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#3D2B1F]/70">Upload from local device</p>
                        <p className="text-[8px] font-medium text-[#3D2B1F]/40">Supports PNG, JPG, WebP via Environment Pipeline</p>
                      </>
                    )}
                  </div>
                </div>

                {/* --- BACKUP MANUAL CDN ENTRY STAGE --- */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/60 pl-1">Fallback Image CDN Link (img)</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40" size={14} />
                    <input type="url" name="img" value={formData.img} onChange={handleInputChange} placeholder="https://i.ibb.co/..." required className="w-full bg-[#FDFBF7] border-2 border-[#3D2B1F]/20 focus:border-[#8A9A5B] rounded-2xl pl-11 pr-4 py-2.5 text-xs font-mono text-[#3D2B1F] outline-none transition-colors" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#3D2B1F]/60 pl-1">Exhibition Description Notes</label>
                  <textarea name="description" rows={3} value={formData.description} onChange={handleInputChange} placeholder="Narrate the cozy backstory canvas lore details..." required className="w-full bg-[#FDFBF7] border-2 border-[#3D2B1F]/20 focus:border-[#8A9A5B] rounded-2xl p-4 text-xs font-medium text-[#3D2B1F] outline-none resize-none transition-colors" />
                </div>

                <button type="submit" disabled={actionLoading || uploadingImage} className="w-full bg-[#3D2B1F] text-[#FDFBF7] border-2 border-[#3D2B1F] rounded-2xl py-3.5 font-black text-xs uppercase tracking-widest hover:bg-[#8A9A5B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
                  {actionLoading ? <Loader2 className="animate-spin" size={14} /> : modalMode === "add" ? "Submit Registration 🐾" : "Update Asset Listing ✨"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}