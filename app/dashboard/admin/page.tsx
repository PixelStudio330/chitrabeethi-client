"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Palette, 
  Receipt, 
  DollarSign, 
  Trash2, 
  ShieldAlert, 
  PieChart as PieIcon, 
  BarChart3, 
  Search, 
  X, 
  UserCheck
} from "lucide-react";

// Color Palette Theme Sync
const CARD_BG_COLORS = ["bg-[#FDFBF7]", "bg-[#F5E6E8]", "bg-[#EFF2E7]"];

// System Categories for Content Taxonomy Mapping
const TARGET_CATEGORIES = ["Painting", "Acrylic Art", "Sculpture", "Photography", "All"];

// Interfaces to type-safe your dynamic data streams
interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface ArtworkData {
  _id: string;
  name: string;
  artist: string | { name: string; email: string } | any;
  price: number;
  category: string;
}

interface TransactionData {
  _id: string;
  transactionId: string;
  type: string;
  buyerEmail: string;
  amount: number;
  createdAt: string;
  buyerId?: { name: string; email: string };
  artworkId?: { name: string; price: number; category: string };
}

export default function AdminDashboard() {
  // Navigation State Engine
  const [activeTab, setActiveTab] = useState<"users" | "artworks" | "transactions">("users");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Live Database Core Streams
  const [users, setUsers] = useState<UserData[]>([]);
  const [artworks, setArtworks] = useState<ArtworkData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);

  // Analytics Aggregation Streams
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalArtists: 0,
    totalArtworksSold: 0,
    totalRevenue: 0
  });
  const [categoryDistribution, setCategoryDistribution] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- CORE DATABASE DATA SYNCHRONIZER ENGINE ---
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Fetch Users Management Matrix
      const usersRes = await fetch("http://localhost:5000/api/auth/users");
      const usersJson = await usersRes.json();
      if (usersJson.success) setUsers(usersJson.data);

      // 2. Fetch Global Artworks Catalog
      const artworksRes = await fetch("http://localhost:5000/api/artworks");
      const artworksJson = await artworksRes.json();
      const loadedArtworks = Array.isArray(artworksJson) ? artworksJson : artworksJson.data || [];
      setArtworks(loadedArtworks);

      // 3. Fetch Ledger Transactions Records
      const txRes = await fetch("http://localhost:5000/api/payments/all-transactions");
      const txJson = await txRes.json();
      if (txJson.success) setTransactions(txJson.data);

      // 4. Fetch Dynamic Pre-calculated Analytics Summary Stream
      const analyticsRes = await fetch("http://localhost:5000/api/payments/admin-analytics");
      const analyticsJson = await analyticsRes.json();
      if (analyticsJson.success) {
        setMetrics(analyticsJson.metrics);
        setCategoryDistribution(analyticsJson.categoryDistribution);
      }
    } catch (error) {
      console.error("Dashboard canvas synchronization error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Run synchronization on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- MUTATION ACTIONS HANDLERS ---
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/update-role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId, newRole })
      });
      const data = await res.json();
      
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        fetchDashboardData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      alert("Failed to communicate role sync modification parameters with server.");
    }
  };

  const handleDeleteArtwork = async (artId: string) => {
    if (!confirm("Are you sure you want to permanently purge this masterpiece from the database?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/artworks/${artId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setArtworks(prev => prev.filter(art => art._id !== artId));
        fetchDashboardData();
      } else {
        alert("Failed to delete the chosen artwork from database records.");
      }
    } catch (error) {
      alert("Error processing artwork delete request parameter.");
    }
  };

  // Safe calculation to extract item raw units count
  const getCategoryCountValue = (cat: string) => {
    if (cat === "All") return artworks.length;
    return categoryDistribution[cat] || 0;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3D2B1F] pt-32 pb-24 px-4 md:px-12 relative overflow-hidden font-sans select-none">
      
      {/* Structural Cozy-Web Ambient Borders & Textures */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3D2B1F/0.02_1px,transparent_1px),linear-gradient(to_bottom,#3D2B1F/0.02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-[10%] left-[-80px] w-[450px] h-[450px] bg-[#E2B4BD]/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[-100px] w-[500px] h-[500px] bg-[#8A9A5B]/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- ADMINISTRATIVE BRAND HEADER --- */}
        <div className="mb-14 border-b-[3px] border-[#3D2B1F] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E2B4BD]/20 rounded-full border border-[#E2B4BD]/40 text-[#A84A5B] text-xs font-black uppercase tracking-widest mb-3 animate-pulse">
            <ShieldAlert size={12} /> Root Administration Workspace
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-[#3D2B1F] leading-none">
            CORE SYSTEM <span className="text-[#8A9A5B] italic font-normal">DASHBOARD</span>
          </h1>
        </div>

        {/* --- DYNAMIC PLATFORM ANALYTICS METRIC MATRIX --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          <div className="bg-[#FDFBF7] border-[3px] border-[#3D2B1F] rounded-[26px] p-5 shadow-[5px_5px_0px_0px_#3D2B1F]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#3D2B1F]/60">Total Base Users</span>
              <div className="p-2 bg-[#3D2B1F]/5 rounded-xl text-[#3D2B1F]"><Users size={14} /></div>
            </div>
            <h3 className="text-2xl font-black tracking-tight">{metrics.totalUsers} Profiles</h3>
            <p className="text-[8px] uppercase font-bold text-[#3D2B1F]/40 mt-1">Registered authentication instances</p>
          </div>

          <div className="bg-[#F5E6E8] border-[3px] border-[#3D2B1F] rounded-[26px] p-5 shadow-[5px_5px_0px_0px_#3D2B1F]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#3D2B1F]/60">Total Creators</span>
              <div className="p-2 bg-[#E2B4BD]/20 rounded-xl text-[#A84A5B]"><UserCheck size={14} /></div>
            </div>
            <h3 className="text-2xl font-black tracking-tight">{metrics.totalArtists} Artists</h3>
            <p className="text-[8px] uppercase font-bold text-[#3D2B1F]/40 mt-1">Platform volume drivers</p>
          </div>

          <div className="bg-[#EFF2E7] border-[3px] border-[#3D2B1F] rounded-[26px] p-5 shadow-[5px_5px_0px_0px_#3D2B1F]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#3D2B1F]/60">Artworks Acquired</span>
              <div className="p-2 bg-[#8A9A5B]/20 rounded-xl text-[#556B2F]"><Palette size={14} /></div>
            </div>
            <h3 className="text-2xl font-black tracking-tight">{metrics.totalArtworksSold} Masterpieces</h3>
            <p className="text-[8px] uppercase font-bold text-[#3D2B1F]/40 mt-1">Successful checkout actions</p>
          </div>

          <div className="bg-[#3D2B1F] border-[3px] border-[#3D2B1F] rounded-[26px] p-5 shadow-[5px_5px_0px_0px_#E2B4BD]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Platform Gross Turnover</span>
              <div className="p-2 bg-white/10 rounded-xl text-[#E2B4BD]"><DollarSign size={14} /></div>
            </div>
            <h3 className="text-2xl font-black tracking-tight text-[#FDFBF7]">৳{metrics.totalRevenue.toLocaleString()}</h3>
            <p className="text-[8px] uppercase font-bold text-[#FAECF0]/40 mt-1">Subscription + Buy checkouts</p>
          </div>
        </div>

        {/* --- VISUALIZATION CHARTS OVERVIEW ELEMENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 bg-[#FDFBF7] border-[3px] border-[#3D2B1F] rounded-[32px] p-6 shadow-[6px_6px_0px_0px_#3D2B1F]">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-6 text-[#3D2B1F]">
              <BarChart3 size={16} className="text-[#8A9A5B]" /> System Revenue Progression (Stripe Webhook Streams)
            </div>
            <div className="h-44 w-full flex items-end justify-between pt-4 px-2 border-b-2 border-l-2 border-[#3D2B1F]/20 relative">
              {[25, 45, 35, 70, 55, 100].map((val, idx) => (
                <div key={idx} className="w-1/6 flex flex-col items-center group cursor-pointer h-full justify-end">
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: `${val}%` }} 
                    transition={{ type: "spring", delay: idx * 0.05 }}
                    className="w-8 bg-[#8A9A5B] border-2 border-[#3D2B1F] rounded-t-md hover:bg-[#E2B4BD] transition-colors relative"
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#3D2B1F] text-white text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {val}%
                    </span>
                  </motion.div>
                  <span className="text-[8px] font-black uppercase tracking-tighter text-[#3D2B1F]/40 mt-2">Wk {idx+1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Count Distribution Matrix Breakdown */}
          <div className="bg-[#FDFBF7] border-[3px] border-[#3D2B1F] rounded-[32px] p-6 shadow-[6px_6px_0px_0px_#3D2B1F] flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#3D2B1F]">
              <PieIcon size={16} className="text-[#A84A5B]" /> Catalog Volumes by Category Taxonomy
            </div>
            
            <div className="my-4 flex justify-center items-center relative">
              <div className="w-28 h-28 rounded-full border-[12px] border-[#3D2B1F] border-r-[#E2B4BD] border-b-[#8A9A5B] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-[#FDFBF7] border-[3px] border-[#3D2B1F]" />
              </div>
            </div>

            <div className="space-y-1.5">
              {TARGET_CATEGORIES.map((cat, uIdx) => (
                <div key={cat} className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      cat === "Painting" ? "bg-[#3D2B1F]" : 
                      cat === "Acrylic Art" ? "bg-[#E2B4BD]" : 
                      cat === "Sculpture" ? "bg-[#8A9A5B]" : 
                      cat === "Photography" ? "bg-[#A84A5B]" : "bg-stone-400"
                    }`} /> 
                    {cat}
                  </span>
                  <span className="text-[#3D2B1F]/80 px-2 py-0.5 bg-[#3D2B1F]/5 rounded border border-[#3D2B1F]/10 font-mono text-[10px]">
                    {getCategoryCountValue(cat)} Artworks
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- POSITION-OPTIMIZED SEARCH & TAB ACTION CONTROLS --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-4 border-[#3D2B1F] pb-3 mb-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-none w-full md:w-auto">
            {[
              { id: "users", label: "Manage Users Matrix", icon: Users },
              { id: "artworks", label: "Manage All Artworks", icon: Palette },
              { id: "transactions", label: "All Platform Transactions", icon: Receipt }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSearchQuery(""); }}
                  className={`px-5 py-3 rounded-t-2xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 border-2 border-b-0 transition-all cursor-pointer border-[#3D2B1F] whitespace-nowrap
                  ${isActive ? "bg-[#3D2B1F] text-white translate-y-[3px]" : "bg-[#FDFBF7]/40 text-[#3D2B1F]/60 hover:bg-[#3D2B1F]/5"}`}
                >
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tabular Search Filter Component shifted right over the grid panel */}
          <div className="relative group w-full md:w-72 mb-[3px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40 group-focus-within:text-[#8A9A5B] transition-colors" size={14} />
            <input 
              type="text"
              placeholder={`Search partition records...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/60 border-2 border-[#3D2B1F] rounded-2xl pl-9 pr-8 py-2.5 text-[11px] font-bold text-[#3D2B1F] focus:outline-none focus:border-[#8A9A5B] transition-all shadow-[3px_3px_0px_0px_#3D2B1F]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3D2B1F]/40 hover:text-[#3D2B1F]">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* --- CONTAINER-BOUNDED LIVE REGISTERED SYSTEM DATA GRID --- */}
        <div className="bg-white border-[3px] border-[#3D2B1F] rounded-[32px] overflow-hidden shadow-[8px_8px_0px_0px_#3D2B1F]">
          
          {/* Scroll Control Structural Viewport Shell */}
          <div className="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse table-auto">
              
              <thead className="sticky top-0 z-20 bg-[#3D2B1F] text-[#FDFBF7] text-[10px] font-black uppercase tracking-widest border-b-[3px] border-[#3D2B1F]">
                <tr>
                  {activeTab === "users" && (
                    <>
                      <th className="p-5 bg-[#3D2B1F]">User Profiler Name</th>
                      <th className="p-5 bg-[#3D2B1F]">Communication Email</th>
                      <th className="p-5 bg-[#3D2B1F]">Active Scope Role</th>
                      <th className="p-5 bg-[#3D2B1F] text-center">Authorization Actions</th>
                    </>
                  )}
                  {activeTab === "artworks" && (
                    <>
                      <th className="p-5 bg-[#3D2B1F]">Masterpiece Title</th>
                      <th className="p-5 bg-[#3D2B1F]">Creator Identity</th>
                      <th className="p-5 bg-[#3D2B1F]">Assigned Taxonomy</th>
                      <th className="p-5 bg-[#3D2B1F]">Acquisition Price</th>
                      <th className="p-5 bg-[#3D2B1F] text-center">Purge Control</th>
                    </>
                  )}
                  {activeTab === "transactions" && (
                    <>
                      <th className="p-5 bg-[#3D2B1F]">Stripe Transaction ID</th>
                      <th className="p-5 bg-[#3D2B1F]">Classification Type</th>
                      <th className="p-5 bg-[#3D2B1F]">Payer Destination Email</th>
                      <th className="p-5 bg-[#3D2B1F]">Gross Settlement</th>
                      <th className="p-5 bg-[#3D2B1F]">Timestamp</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y-2 divide-[#3D2B1F]/10 text-xs font-medium text-[#3D2B1F]">
                <AnimatePresence mode="popLayout">
                  
                  {activeTab === "users" && users
                    .filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((userInstance, idx) => (
                      <motion.tr 
                        key={userInstance._id} 
                        layout 
                        className={`${CARD_BG_COLORS[idx % CARD_BG_COLORS.length]} hover:bg-white transition-colors`}
                      >
                        <td className="p-5 font-black uppercase tracking-tight">{userInstance.name}</td>
                        <td className="p-5 font-mono text-[11px] text-[#3D2B1F]/70">{userInstance.email}</td>
                        <td className="p-5">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border-2 border-[#3D2B1F]
                            ${userInstance.role === "admin" ? "bg-[#E2B4BD]" : userInstance.role === "artist" ? "bg-[#8A9A5B] text-white" : "bg-white"}`}>
                            {userInstance.role}
                          </span>
                        </td>
                        <td className="p-5 text-center">
                          <select 
                            value={userInstance.role} 
                            onChange={(e) => handleRoleChange(userInstance._id, e.target.value)}
                            className="bg-[#FDFBF7] border-2 border-[#3D2B1F] rounded-xl px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider outline-none cursor-pointer focus:border-[#8A9A5B]"
                          >
                            <option value="user">User (Buyer)</option>
                            <option value="artist">Artist</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </motion.tr>
                    ))
                  }

                  {activeTab === "artworks" && artworks
                    .filter(a => {
                      const artistName = typeof a.artist === "object" ? a.artist?.name : a.artist;
                      return a.name?.toLowerCase().includes(searchQuery.toLowerCase()) || artistName?.toLowerCase().includes(searchQuery.toLowerCase());
                    })
                    .map((artworkInstance, idx) => {
                      const displayArtist = typeof artworkInstance.artist === "object" ? artworkInstance.artist?.name : artworkInstance.artist;
                      return (
                        <motion.tr 
                          key={artworkInstance._id} 
                          layout 
                          className={`${CARD_BG_COLORS[idx % CARD_BG_COLORS.length]} hover:bg-white transition-colors`}
                        >
                          <td className="p-5 font-black uppercase tracking-tight text-[#A84A5B]">{artworkInstance.name}</td>
                          <td className="p-5 font-bold italic">{displayArtist || "Unknown Artist"}</td>
                          <td className="p-5"><span className="text-[10px] font-black bg-[#3D2B1F]/5 px-2 py-0.5 rounded-md border border-[#3D2B1F]/10">{artworkInstance.category}</span></td>
                          <td className="p-5 font-bold font-sans">৳{artworkInstance.price?.toLocaleString()}</td>
                          <td className="p-5 text-center">
                            <button 
                              onClick={() => handleDeleteArtwork(artworkInstance._id)}
                              className="p-2.5 bg-[#F5E6E8] hover:bg-[#A84A5B] hover:text-white border-2 border-[#3D2B1F] rounded-xl transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  }

                  {activeTab === "transactions" && transactions
                    .filter(t => t.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) || t.buyerEmail?.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((txnInstance, idx) => (
                      <motion.tr 
                        key={txnInstance._id} 
                        layout 
                        className={`${CARD_BG_COLORS[idx % CARD_BG_COLORS.length]} hover:bg-white transition-colors`}
                      >
                        <td className="p-5 font-mono text-[11px] font-black tracking-wider text-[#3D2B1F]/80 truncate max-w-[180px]">
                          {txnInstance.transactionId}
                        </td>
                        <td className="p-5">
                          <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border
                            ${txnInstance.type === "purchase" ? "bg-[#EFF2E7] border-[#8A9A5B] text-[#556B2F]" : "bg-[#F5E6E8] border-[#E2B4BD] text-[#A84A5B]"}`}>
                            {txnInstance.type}
                          </span>
                        </td>
                        <td className="p-5 font-mono text-[11px] text-[#3D2B1F]/70">{txnInstance.buyerEmail}</td>
                        <td className="p-5 font-black font-sans text-stone-900">
                          ৳{txnInstance.amount?.toLocaleString()}
                        </td>
                        <td className="p-5 text-[10px] font-bold uppercase text-[#3D2B1F]/50">
                          {new Date(txnInstance.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                      </motion.tr>
                    ))
                  }

                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Loading / Empty States Fallback Render Blocks */}
          {isLoading ? (
            <div className="p-16 text-center text-xs uppercase font-black tracking-widest text-[#3D2B1F]/40 bg-[#FDFBF7] animate-pulse">
              Synchronizing with active database nodes...
            </div>
          ) : (
            ((activeTab === "users" && users.length === 0) || 
             (activeTab === "artworks" && artworks.length === 0) || 
             (activeTab === "transactions" && transactions.length === 0)) && (
              <div className="p-16 text-center text-xs uppercase font-black tracking-widest text-[#3D2B1F]/40 bg-[#FDFBF7]">
                No active records found in this partition context.
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}