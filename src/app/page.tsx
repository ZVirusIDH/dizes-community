"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, Download, Filter, Dice6, ChevronRight, Languages, Menu, X, LayoutGrid, LayoutList, Smartphone, Monitor, Package, Trash2, CheckCircle2, Edit2 } from "lucide-react";
import UploadModal from "@/components/UploadModal";
import DiceViewerModal from "@/components/DiceViewerModal";
import AuthModal from "@/components/AuthModal";
import ProfileModal from "@/components/ProfileModal";
import DiceEditModal from "@/components/DiceEditModal";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

type Language = "es" | "en";
type ViewMode = "grid" | "list";
type TabType = "trending" | "latest" | "pending" | "downloads";

const translations = {
  es: {
    heroTitle1: "Bienvenido a la",
    heroTitle2: "Comunidad de Dizes",
    heroDesc: "Comparte y descarga configuraciones de dados. Diseñada para miles de creadores.",
    searchPlaceholder: "Buscar...",
    featuredPack: "DESTACADO",
    trending: "TENDENCIAS",
    latest: "ÚLTIMOS",
    topRated: "TOP",
    advFilters: "Filtros",
    uploadBtn: "Subir",
    signIn: "Entrar",
    featured: "Inicio",
    categories: "Categorías",
    getConfig: "BAJAR",
    loadMore: "Ver más",
    footerText: "© 2026 Dizes Community.",
    viewMode: "Ver",
    columns: "Columnas"
  },
  en: {
    heroTitle1: "Welcome to",
    heroTitle2: "Dizes Community",
    heroDesc: "Share and download dice configurations. Built for thousands of creators.",
    searchPlaceholder: "Search...",
    featuredPack: "FEATURED",
    trending: "TRENDING",
    latest: "LATEST",
    topRated: "TOP",
    advFilters: "Filters",
    uploadBtn: "Upload",
    signIn: "Sign In",
    featured: "Home",
    categories: "Categories",
    getConfig: "GET",
    loadMore: "Load More",
    footerText: "© 2026 Dizes Community.",
    viewMode: "View",
    columns: "Cols"
  }
};

export default function Home() {
  const ADMIN_EMAIL = "zvirus@gmail.com";
  const [lang, setLang] = useState<Language>("es");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<any | null>(null);
  const [isForcedMobile, setIsForcedMobile] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [columns, setColumns] = useState(6);
  const [search, setSearch] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dice, setDice] = useState<any[] | null>(null);
  const [isTestUser, setIsTestUser] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("trending");
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(0);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isActualMobile, setIsActualMobile] = useState(false);
  const [selectedDice, setSelectedDice] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "dice" | "icons">("all");
  const [diceToEdit, setDiceToEdit] = useState<any | null>(null);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (data) {
        setUserProfile(data);
        if (data.is_admin) setIsAdmin(true);
        return data;
      }
    } catch (e) { console.error("Error loading profile:", e); }
    return null;
  };

  const fetchDice = async (sort: TabType = activeTab, page = currentPage, size = pageSize, fType = filterType, onlyDeleted = showDeleted) => {
    try {
      let query = supabase.from("dice_packs").select("*", { count: "exact" });
      
      if (onlyDeleted) {
        query = query.not("deleted_at", "is", null);
      } else {
        query = query.is("deleted_at", null);
        
        if (sort === "pending") {
          query = query.eq("status", "pending");
        } else {
          if (!isAdmin) {
            query = query.eq("is_published", true).eq("status", "approved");
          } else {
            query = query.eq("status", "approved");
          }

          if (fType === "dice") {
            query = query.neq("type", "D2");
          } else if (fType === "icons") {
            query = query.eq("type", "D2");
          }
        }
      }
      
      if (sort === "trending" || sort === "downloads") {
        query = query.order("downloads", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const from = page * size;
      const { data, error } = await query.range(from, from + size - 1);
      if (error) throw error;
      setDice(data || []);
    } catch (err) {
      console.error("Error fetching dice:", err);
      setDice([]); 
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const browserLang = navigator.language.split("-")[0];
    if (browserLang === "en") setLang("en");
    
    const checkMobile = () => {
      const isMob = window.innerWidth < 768;
      setIsActualMobile(isMob);
      if (isMob) setColumns(3);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    fetchDice(activeTab);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUserProfile(session.user.id);
      if (session?.user?.email === ADMIN_EMAIL) setIsAdmin(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUserProfile(session.user.id);
      else setUserProfile(null);
      if (session?.user?.email === ADMIN_EMAIL) setIsAdmin(true);
      else setIsAdmin(false);
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("action") === "upload" && urlParams.get("code")) {
      setIsUploadOpen(true);
      sessionStorage.setItem("upload_code", urlParams.get("code")!);
    }

    return () => subscription.unsubscribe();
  }, []);

  if (!isMounted) return null;

  const t = translations[lang];
  const mobileContainerClass = isForcedMobile ? "max-w-[375px] mx-auto border-x border-white/10 shadow-2xl" : "w-full";
  const filteredDice = (dice || []).filter((d: any) => {
    const searchLower = search.toLowerCase();
    const matchesName = d.name?.toLowerCase().includes(searchLower);
    const matchesTags = d.tags?.filter((tg: string) => !tg.startsWith("_pfc:")).some((tag: string) => tag.toLowerCase().includes(searchLower));
    return matchesName || matchesTags;
  });

  const gridColsClass = viewMode === "list" ? "grid-cols-1" : `grid-cols-${columns}`;
  const mainClass = `flex flex-col min-h-screen bg-[#060607] text-white transition-all duration-500 overflow-clip ${mobileContainerClass}`;

  return (
    <div className={mainClass}>
      <nav className="glass sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-white/5 gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-7 h-7 brand-gradient rounded-lg flex items-center justify-center">
            <Dice6 className="text-white w-4 h-4" />
          </div>
          <span className={`font-black text-base tracking-tighter ${isForcedMobile ? "hidden" : "hidden lg:inline"}`}>Dizes <span className="text-blue-500">Community</span></span>
          {isAdmin && (
            <button onClick={() => setIsForcedMobile(!isForcedMobile)} className={`p-2 rounded-lg border transition-all ${isForcedMobile ? "bg-blue-600 border-blue-500 text-white shadow-lg" : "bg-blue-500/10 border-blue-500/30 text-blue-400"}`}>
              {isForcedMobile ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </button>
          )}
        </div>

        <div className="flex-1 flex justify-end">
          <button onClick={() => setIsSearchOpen(true)} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 transition-colors mr-2">
            <Search className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {isSearchOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute inset-0 z-50 bg-[#0a0a0c]/95 backdrop-blur-xl px-4 flex items-center border-b border-white/5">
              <div className="relative w-full max-w-[1800px] mx-auto flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input type="text" autoFocus placeholder={t.searchPlaceholder} className="w-full bg-black/60 border border-zinc-800 rounded-xl py-3 pl-11 pr-12 focus:outline-none focus:border-blue-500 text-sm font-medium transition-colors shadow-2xl" value={search} onChange={(e) => setSearch(e.target.value)} onBlur={() => { if (!search) setIsSearchOpen(false); }} />
                <button onClick={() => { setIsSearchOpen(false); setSearch(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setLang(lang === "es" ? "en" : "es")} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Languages className="w-4 h-4 text-zinc-500" />
          </button>
          {user?.email === ADMIN_EMAIL && (
            <div className="flex items-center gap-1">
              <button onClick={() => { const s = !showDeleted; setShowDeleted(s); setCurrentPage(0); fetchDice(activeTab, 0, pageSize, filterType, s); }} className={`p-2 rounded-lg border transition-all ${showDeleted ? "bg-red-600 border-red-500 text-white shadow-lg" : "bg-white/5 border-white/10 text-zinc-500"}`}>
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={() => setIsAdmin(!isAdmin)} className={`px-2 py-1 rounded text-[8px] font-black transition-all ${isAdmin ? "bg-red-500 text-white" : "bg-white/5 text-zinc-500"}`}>
                {isAdmin ? "ADMIN" : "USER"}
              </button>
            </div>
          )}
          <button onClick={() => setIsUploadOpen(true)} className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 px-3 py-1.5 rounded-xl text-[10px] font-black border border-blue-500/20 transition-all">
            <Upload className="w-3.5 h-3.5 text-blue-500" />
            <span className={isForcedMobile ? "hidden" : "hidden sm:inline"}>{t.uploadBtn}</span>
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setIsProfileOpen(true)} className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-[10px] font-black shadow-lg shadow-blue-500/20 transition-all uppercase overflow-hidden">
                {userProfile?.avatar_url ? <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : (userProfile?.username?.[0] || user.email?.[0] || "U")}
              </button>
              <button onClick={() => supabase.auth.signOut()} className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} className="brand-gradient px-4 py-1.5 rounded-xl text-[10px] font-black shadow-lg shadow-blue-500/20 transition-all">
              {t.signIn}
            </button>
          )}
        </div>
      </nav>

      <main className="flex-1 px-4 py-8 w-full max-w-[1800px] mx-auto">
        <section className="mb-12 flex flex-col items-center text-center gap-6">
          <div className="max-w-2xl mx-auto px-4">
            <h1 className={`font-black tracking-tighter mb-4 leading-tight ${isForcedMobile ? "text-2xl" : "text-3xl md:text-5xl"}`}>
              {t.heroTitle1} <br />
              <span className="text-gradient">{t.heroTitle2}</span>
            </h1>
            <p className={`text-zinc-500 font-medium leading-relaxed mx-auto ${isForcedMobile ? "text-[10px] max-w-[250px]" : "text-sm max-w-sm"}`}>{t.heroDesc}</p>
          </div>
        </section>

        <section className="mb-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 relative z-[50]">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex bg-zinc-900/50 rounded-xl p-1 border border-white/5 shadow-inner">
               {["trending", "latest", ...(isAdmin ? ["pending"] : [])].map((tabId) => (
                 <button key={tabId} onClick={() => { setActiveTab(tabId as any); fetchDice(tabId as any); }} className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === tabId ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"}`}>
                   {tabId === "trending" ? t.trending : tabId === "latest" ? t.latest : "PENDING"}
                 </button>
               ))}
            </div>
            <div className="relative">
              <button onClick={() => setIsFiltersOpen(!isFiltersOpen)} className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${isFiltersOpen ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/5 text-zinc-500"}`}>
                <Filter className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{t.advFilters}</span>
              </button>
              <AnimatePresence>
                {isFiltersOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-4 z-50">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Content Type</label>
                        <div className="flex flex-col gap-1">
                          {["all", "dice", "icons"].map(opt => (
                            <button key={opt} onClick={() => { setFilterType(opt as any); fetchDice(activeTab, currentPage, pageSize, opt as any); setIsFiltersOpen(false); }} className={`text-left px-3 py-2 rounded-lg text-[10px] font-bold ${filterType === opt ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-white/5"}`}>{opt}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            {viewMode === "grid" && (
              <div className="flex bg-zinc-900/50 rounded-xl p-1 border border-white/5">
                {(isActualMobile || isForcedMobile ? [2, 3, 4] : [2, 4, 6, 8, 10]).map(n => (
                  <button key={n} onClick={() => setColumns(n)} className={`w-8 h-8 flex items-center justify-center text-[9px] font-black rounded-lg ${columns === n ? "bg-blue-600 text-white" : "text-zinc-500"}`}>{n}</button>
                ))}
              </div>
            )}
            <div className="flex bg-zinc-900/50 rounded-xl p-1 border border-white/5">
              <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-zinc-500"}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-blue-600 text-white" : "text-zinc-500"}`}><LayoutList className="w-4 h-4" /></button>
            </div>
          </div>
        </section>

        <div className={`grid gap-3 ${gridColsClass}`}>
          {dice === null ? (
            Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square bg-zinc-900/20 rounded-2xl animate-pulse" />)
          ) : dice.length === 0 ? (
            <div className="col-span-full py-20 text-center text-zinc-500 uppercase font-black text-[10px]">No dice found</div>
          ) : (
            filteredDice.map((die: any) => (
              <motion.div key={die.id} onClick={() => setSelectedPack(die)} className={`bg-zinc-900/20 border border-white/[0.03] rounded-2xl p-3 cursor-pointer hover:border-white/10 transition-all ${viewMode === "list" ? "flex items-center gap-4" : "flex flex-col gap-2"}`}>
                <div className={`bg-black/40 rounded-xl flex items-center justify-center relative shrink-0 border border-white/5 ${viewMode === "list" ? "w-12 h-12" : "aspect-square w-full"}`}>
                   <div className="w-full h-full flex items-center justify-center font-black" style={{ backgroundColor: die.color || "#27272a" }}>{die.type}</div>
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className="font-black text-[10px] md:text-xs truncate uppercase text-white">{die.name}</h4>
                   <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tight">@{die.author}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} lang={lang} isAdmin={isAdmin} isTestUser={isTestUser} setIsTestUser={setIsTestUser} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} lang={lang} />
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} lang={lang} />
      <DiceViewerModal isOpen={!!selectedPack} onClose={() => setSelectedPack(null)} pack={selectedPack} lang={lang} />
      <DiceEditModal isOpen={!!diceToEdit} onClose={() => setDiceToEdit(null)} dice={diceToEdit} lang={lang} onUpdated={() => fetchDice()} />
    </div>
  );
}
