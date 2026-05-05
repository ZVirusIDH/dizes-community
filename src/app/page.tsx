"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Upload, Download, Filter, Dice6, ChevronRight, Languages, 
  Menu, X, LayoutGrid, LayoutList, Smartphone, Monitor, Package, 
  Trash2, CheckCircle2, Edit2 
} from "lucide-react";
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<any | null>(null);
  const [isForcedMobile, setIsForcedMobile] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [gridCols, setGridCols] = useState(6);
  const [listCols, setListCols] = useState(1);
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

  const fetchDice = async (sort: TabType = activeTab, page = currentPage, size = pageSize, onlyDeleted = showDeleted, fType = filterType) => {
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
      const { data, error, count } = await query.range(from, from + size - 1);
      if (error) throw error;
      
      // Si es moderación, cargamos emails de perfiles si es posible
      let finalData = data || [];
      if (isAdmin && sort === "pending") {
         const userIds = [...new Set(finalData.map((d: any) => d.user_id))];
         const { data: profiles } = await supabase.from("profiles").select("id, email, username").in("id", userIds);
         finalData = finalData.map((d: any) => ({
           ...d,
           author_email: profiles?.find(p => p.id === d.user_id)?.email || "---"
         }));
      }

      setDice(finalData);
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
      if (isMob) {
        setGridCols(prev => Math.min(prev, 4));
        setListCols(prev => Math.min(prev, 2));
      } else {
        setGridCols(prev => Math.max(prev, 4));
      }
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

  const deleteDice = async (id: string, ownerId?: string) => {
    const isOwner = user && ownerId === user.id;
    if (!isAdmin && !isOwner) return;
    if (!confirm(lang === "es" ? "¿Seguro que quieres borrar este dado?" : "Are you sure you want to delete this die?")) return;
    const { error } = await supabase.from("dice_packs").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (!error) fetchDice();
    else alert(error.message);
  };

  const permanentDelete = async (ids: string[]) => {
    if (!isAdmin) return;
    if (!confirm(lang === "es" ? `¿Seguro que quieres borrar PERMANENTEMENTE ${ids.length} elementos?` : `Are you sure you want to PERMANENTLY delete ${ids.length} items?`)) return;
    const { error } = await supabase.from("dice_packs").delete().in("id", ids);
    if (!error) {
      setSelectedDice([]);
      fetchDice();
    } else alert(error.message);
  };

  const restoreDice = async (ids: string[]) => {
    if (!isAdmin) return;
    const { error } = await supabase.from("dice_packs").update({ deleted_at: null }).in("id", ids);
    if (!error) {
      setSelectedDice([]);
      fetchDice();
    } else alert(error.message);
  };

  const toggleSelect = (id: string) => {
    setSelectedDice(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const approveDice = async (id: string) => {
    const { error } = await supabase.from("dice_packs").update({ status: "approved", is_published: true }).eq("id", id);
    if (!error) fetchDice();
  };

  const rejectDice = async (id: string) => {
    if (!confirm(lang === "es" ? "¿Rechazar este dado?" : "Reject this die?")) return;
    const { error } = await supabase.from("dice_packs").update({ status: "rejected", is_published: false }).eq("id", id);
    if (!error) fetchDice();
  };

  const [inspectingId, setInspectingId] = useState<string | null>(null);
  const [inspectedFaces, setInspectedFaces] = useState<any[]>([]);

  const toggleInspect = async (die: any) => {
    if (inspectingId === die.id) {
      setInspectingId(null);
      setInspectedFaces([]);
      return;
    }
    
    setInspectingId(die.id);
    if (die.share_code) {
      try {
        const binData = atob(die.share_code);
        const ui8Data = new Uint8Array(binData.length);
        for (let i = 0; i < binData.length; i++) ui8Data[i] = binData.charCodeAt(i);
        // Intentamos descompresión si es posible, si no, fallback a texto plano
        let jsonStr = "";
        try {
          const stream = new Blob([ui8Data]).stream().pipeThrough(new DecompressionStream("gzip"));
          const response = new Response(stream);
          jsonStr = await response.text();
        } catch {
          jsonStr = atob(die.share_code);
        }

        const decoded = JSON.parse(jsonStr);
        const isPack = Array.isArray(decoded);
        const mainDie = isPack ? decoded[0] : decoded;
        if (mainDie.faceContent) {
           const f = mainDie.faceContent.map((c: string, i: number) => ({
             content: c,
             type: mainDie.faceContentTypes?.[i] || 'NUMBERS',
             color: mainDie.faceColors?.[i] || mainDie.color,
             textColor: mainDie.faceContentColors?.[i] || mainDie.textColor
           }));
           setInspectedFaces(f);
        }
      } catch (e) { console.error("Inspect error:", e); }
    }
  };

  if (!isMounted) return null;

  const t = translations[lang];
  const mobileContainerClass = isForcedMobile ? "max-w-[375px] mx-auto border-x border-white/10 shadow-2xl" : "w-full";
  
  const filteredDice = (dice || []).filter((d: any) => {
    const searchLower = search.toLowerCase();
    const matchesName = d.name?.toLowerCase().includes(searchLower);
    const matchesTags = d.tags?.filter((tg: string) => !tg.startsWith("_pfc:")).some((tag: string) => tag.toLowerCase().includes(searchLower));
    return matchesName || matchesTags;
  });

  const activeCols = viewMode === "grid" ? gridCols : listCols;
  const gridColsStyle = { gridTemplateColumns: `repeat(${activeCols}, minmax(0, 1fr))` };
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
            <button 
              onClick={() => setIsForcedMobile(!isForcedMobile)}
              className={`p-2 rounded-lg border transition-all ${isForcedMobile ? "bg-blue-600 border-blue-500 text-white shadow-lg" : "bg-blue-500/10 border-blue-500/30 text-blue-400"}`}
            >
              {isForcedMobile ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </button>
          )}
        </div>

        <div className="flex-1 flex justify-end">
          <button 
            onClick={() => setIsSearchOpen(true)} 
            className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 transition-colors mr-2"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-0 z-50 bg-[#0a0a0c]/95 backdrop-blur-xl px-4 flex items-center border-b border-white/5"
            >
              <div className="relative w-full max-w-[1800px] mx-auto flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-black/60 border border-zinc-800 rounded-xl py-3 pl-11 pr-12 focus:outline-none focus:border-blue-500 text-sm font-medium transition-colors shadow-2xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onBlur={() => { if (!search) setIsSearchOpen(false); }}
                />
                <button 
                  onClick={() => { setIsSearchOpen(false); setSearch(""); }} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
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
              <button 
                onClick={() => { const s = !showDeleted; setShowDeleted(s); setCurrentPage(0); fetchDice(activeTab, 0, pageSize, s); }} 
                className={`p-2 rounded-lg border transition-all ${showDeleted ? "bg-red-600 border-red-500 text-white shadow-lg" : "bg-white/5 border-white/10 text-zinc-500"}`}
                title={lang === "es" ? "Papelera" : "Recycle Bin"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsAdmin(!isAdmin)} 
                className={`px-2 py-1 rounded text-[8px] font-black transition-all ${isAdmin ? "bg-red-500 text-white" : "bg-white/5 text-zinc-500"}`}
              >
                {isAdmin ? "ADMIN MODE" : "USER MODE"}
              </button>
            </div>
          )}
          
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 px-3 py-1.5 rounded-xl text-[10px] font-black border border-blue-500/20 transition-all active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-blue-500" />
            <span className={isForcedMobile ? "hidden" : "hidden sm:inline"}>{t.uploadBtn}</span>
          </button>
          
          {user ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-[10px] font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all uppercase overflow-hidden"
              >
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userProfile?.username?.[0] || user.email?.[0] || "U"
                )}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="brand-gradient px-4 py-1.5 rounded-xl text-[10px] font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
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

        {isAdmin && showDeleted && (
          <section className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{lang === "es" ? "MODO PAPELERA" : "RECYCLE BIN MODE"}</span>
              <span className="text-zinc-500 text-[10px] font-bold">{selectedDice.length} {lang === "es" ? "seleccionados" : "selected"}</span>
            </div>
            <div className="flex gap-2">
               {selectedDice.length > 0 && (
                 <>
                   <button onClick={() => restoreDice(selectedDice)} className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">{lang === "es" ? "Restaurar" : "Restore"}</button>
                   <button onClick={() => permanentDelete(selectedDice)} className="bg-red-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20">{lang === "es" ? "Borrar Selección" : "Delete Selected"}</button>
                 </>
               )}
            </div>
          </section>
        )}

        <section className="mb-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 relative z-[50]">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex bg-zinc-900/50 rounded-xl p-1 border border-white/5 shadow-inner">
               {[
                 { id: "trending", label: t.trending },
                 { id: "latest", label: t.latest },
                 ...(isAdmin ? [{ id: "pending", label: lang === "es" ? "PENDIENTES" : "PENDING" }] : [])
               ].map((tab) => (
                 <button 
                   key={tab.id} 
                   onClick={() => { setActiveTab(tab.id as any); fetchDice(tab.id as any); }}
                   className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === tab.id ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"}`}
                 >
                   {tab.label}
                 </button>
               ))}
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${isFiltersOpen ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/5 text-zinc-500 hover:text-white"}`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{t.advFilters}</span>
              </button>

              <AnimatePresence>
                {isFiltersOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-4 z-50"
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Content Type</label>
                        <div className="flex flex-col gap-1">
                          {["all", "dice", "icons"].map(opt => (
                            <button 
                              key={opt}
                              onClick={() => { setFilterType(opt as any); fetchDice(activeTab, currentPage, pageSize, showDeleted, opt as any); setIsFiltersOpen(false); }}
                              className={`text-left px-3 py-2 rounded-lg text-[10px] font-bold ${filterType === opt ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-white/5"}`}
                            >
                              {opt}
                            </button>
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
            <div className="flex bg-zinc-900/50 rounded-xl p-1 border border-white/5">
              {(viewMode === "grid") ? (
                (isActualMobile || isForcedMobile ? [1, 2, 3, 4] : [4, 5, 6, 7, 8]).map(n => (
                  <button key={n} onClick={() => setGridCols(n)} className={`w-8 h-8 flex items-center justify-center text-[9px] font-black rounded-lg ${gridCols === n ? "bg-blue-600 text-white" : "text-zinc-500"}`}>{n}</button>
                ))
              ) : (
                (isActualMobile || isForcedMobile ? [1, 2] : [1, 2, 3, 4]).map(n => (
                  <button key={n} onClick={() => setListCols(n)} className={`w-8 h-8 flex items-center justify-center text-[9px] font-black rounded-lg ${listCols === n ? "bg-blue-600 text-white" : "text-zinc-500"}`}>{n}</button>
                ))
              )}
            </div>

            <div className="flex bg-zinc-900/50 rounded-xl p-1 border border-white/5">
              <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-zinc-500"}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-blue-600 text-white" : "text-zinc-500"}`}><LayoutList className="w-4 h-4" /></button>
            </div>
          </div>
        </section>

        <div className="grid gap-3" style={gridColsStyle}>
          {dice === null ? (
            Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square bg-zinc-900/20 rounded-2xl animate-pulse" />)
          ) : dice.length === 0 ? (
            <div className="col-span-full py-20 text-center text-zinc-500 uppercase font-black text-[10px]">No dice found</div>
          ) : activeTab === "pending" && isAdmin ? (
             <div className="col-span-full space-y-12">
                {[
                  { id: 'new', label: lang === 'es' ? 'NUEVAS SUBIDAS' : 'NEW UPLOADS', filter: (d: any) => !d.updated_at || d.updated_at === d.created_at },
                  { id: 'updates', label: lang === 'es' ? 'ACTUALIZACIONES' : 'UPDATES', filter: (d: any) => d.updated_at && d.updated_at !== d.created_at }
                ].map(section => {
                  const items = filteredDice.filter(section.filter);
                  if (items.length === 0) return null;
                  return (
                    <div key={section.id} className="space-y-6">
                       <div className="flex items-center gap-4 px-2">
                          <h2 className="text-xs font-black tracking-[0.3em] text-blue-500 uppercase">{section.label}</h2>
                          <div className="flex-1 h-[1px] bg-blue-500/10" />
                          <span className="text-[10px] font-black text-zinc-600">{items.length} items</span>
                       </div>
                       <div className={`grid gap-4 ${gridColsStyle.gridTemplateColumns.includes('repeat(1') ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                          {items.map((die: any) => (
                            <div key={die.id} className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-6 flex flex-col md:flex-row gap-6 hover:border-blue-500/30 transition-all group">
                               <div className="w-32 h-32 bg-black/40 rounded-[2rem] flex items-center justify-center shrink-0 border border-white/5 overflow-hidden shadow-2xl relative" style={{ backgroundColor: die.color }}>
                                  {die.preview_face?.includes("<svg") ? (
                                    <div className="w-20 h-20" dangerouslySetInnerHTML={{ __html: die.preview_face }} />
                                  ) : (
                                    <span className="text-4xl font-black text-white">{die.preview_face || die.type.replace("D", "")}</span>
                                  )}
                               </div>
                               <div className="flex-1 min-w-0 flex flex-col justify-between py-2">
                                  <div>
                                     <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                           <h3 className="text-xl font-black tracking-tighter uppercase truncate">{die.name}</h3>
                                           <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[8px] font-black text-blue-400">{die.type}</span>
                                        </div>
                                        <button 
                                          onClick={() => toggleInspect(die)}
                                          className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase transition-all ${inspectingId === die.id ? "bg-blue-600 text-white shadow-lg" : "bg-white/5 text-zinc-500 hover:text-white"}`}
                                        >
                                          {inspectingId === die.id ? (lang === "es" ? "CERRAR" : "CLOSE") : (lang === "es" ? "VER CARAS" : "VIEW FACES")}
                                        </button>
                                     </div>
                                     <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">
                                        Subido por <span className="text-zinc-300">@{die.author}</span> • {die.author_email}
                                     </p>
                                     
                                     {inspectingId === die.id ? (
                                        <div className="bg-black/40 rounded-[1.5rem] p-4 mb-4 grid grid-cols-6 sm:grid-cols-8 gap-2 border border-white/5">
                                           {inspectedFaces.length > 0 ? inspectedFaces.map((face, i) => (
                                              <div 
                                                key={i} 
                                                className="aspect-square rounded-lg flex items-center justify-center text-[8px] font-black border border-white/10 overflow-hidden"
                                                style={{ backgroundColor: face.color || die.color, color: face.textColor || "#fff" }}
                                              >
                                                {face.content.includes("<svg") ? (
                                                   <div className="w-5 h-5" dangerouslySetInnerHTML={{ __html: face.content }} />
                                                ) : (
                                                   <span>{face.content}</span>
                                                )}
                                              </div>
                                           )) : (
                                              <div className="col-span-full py-4 text-center text-[8px] font-bold text-zinc-600 uppercase">Cargando caras...</div>
                                           )}
                                        </div>
                                     ) : (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                           {die.tags?.map((t: string, i: number) => !t.startsWith("_") && (
                                             <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-[8px] font-black text-zinc-400 border border-white/5 uppercase">#{t}</span>
                                           ))}
                                        </div>
                                     )}
                                  </div>

                                  <div className="flex flex-col sm:flex-row gap-3">
                                     <button onClick={() => approveDice(die.id)} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> {lang === "es" ? "APROBAR" : "APPROVE"}
                                     </button>
                                     <button onClick={() => setDiceToEdit(die)} className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2">
                                        <Edit2 className="w-4 h-4" /> {lang === "es" ? "EDITAR" : "EDIT"}
                                     </button>
                                     <button onClick={() => rejectDice(die.id)} className="px-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white py-3 rounded-2xl text-[10px] font-black uppercase transition-all border border-red-500/20 flex items-center justify-center gap-2">
                                        <Trash2 className="w-4 h-4" /> {lang === "es" ? "RECHAZAR" : "REJECT"}
                                     </button>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  );
                })}
             </div>
          ) : (
            filteredDice.map((die: any) => {
              const diceCount = parseInt(die.tags?.find((tg: string) => tg.startsWith("_count:"))?.split(":")[1] || (die.type?.toUpperCase() === 'PACK' ? "2" : "1"));
              const isRealPack = die.type?.toUpperCase() === 'PACK' || diceCount > 1;

              return (
                <motion.div 
                  key={die.id} 
                  whileHover={{ y: -4, scale: 1.02 }}
                  onClick={() => isAdmin && showDeleted ? toggleSelect(die.id) : setSelectedPack(die)} 
                  className={`relative border rounded-[2rem] p-3 cursor-pointer transition-all duration-300 ${viewMode === "list" ? "flex items-center gap-4" : "flex flex-col gap-3"} ${selectedDice.includes(die.id) ? "ring-4 ring-red-500 border-red-500" : isRealPack ? "bg-amber-500/[0.07] border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:shadow-[0_0_35px_rgba(245,158,11,0.25)]" : "bg-zinc-900/20 border-white/[0.05] hover:border-white/20"}`}
                >
                  {isRealPack && (
                    <div className="absolute -top-3 -right-2 z-20 flex items-center gap-1.5 bg-gradient-to-br from-yellow-400 via-amber-500 to-amber-700 text-black px-3 py-1 rounded-full text-[9px] font-black shadow-[0_4px_12px_rgba(245,158,11,0.4)] uppercase tracking-tighter border border-yellow-200/30">
                      <Package className="w-3 h-3" />
                      <span>PACK {diceCount > 1 ? `x${diceCount}` : ""}</span>
                    </div>
                  )}

                  <div className={`bg-black/40 rounded-xl flex items-center justify-center relative shrink-0 border border-white/5 overflow-hidden ${viewMode === "list" ? "w-12 h-12" : "aspect-square w-full"}`}>
                    <div 
                      className={`w-full h-full flex items-center justify-center font-black relative`} 
                      style={{ 
                        backgroundColor: die.color || "#27272a",
                        color: (die.tags?.find((tg: string) => tg.startsWith("_pfc:"))?.split(":")[1]) || (die.color?.toLowerCase() === "#ffffff" ? "#000000" : "#ffffff")
                      }}
                    >
                      {die.preview_face ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {die.preview_face.split("_DZS_SEP_").map((part: string, pIdx: number) => (
                            <div key={pIdx} className="absolute inset-0 flex items-center justify-center pointer-events-none p-1">
                              {part.includes("<svg") ? (
                                <div 
                                  className="w-full h-full"
                                  dangerouslySetInnerHTML={{ 
                                    __html: part.replace(/fill="[^"]*"/g, 'fill="currentColor"').replace(/stroke="[^"]*"/g, 'stroke="currentColor"') 
                                  }}
                                />
                              ) : (part.startsWith("http") || part.startsWith("blob:") || part.startsWith("data:")) ? (
                                <img src={part} alt="Preview" className="w-full h-full object-contain" />
                              ) : (
                                <span className={viewMode === "list" ? "text-[8px]" : "text-xl"}>{part}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="leading-none">{die.type?.replace("D", "") || "6"}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <h4 className="font-black text-[10px] md:text-xs truncate uppercase text-white leading-none">{die.name}</h4>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase leading-none">@{die.author} • {die.type}</p>
                    
                    {!showDeleted && (
                      <div className="flex gap-1 items-stretch mt-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); incrementDownload(die.id, die.downloads, die.share_code); setSelectedPack(die); }} 
                          className="flex-1 brand-gradient h-7 rounded-lg flex items-center justify-center"
                        >
                          <Download className="w-3 h-3 text-white" />
                        </button>
                        <div className="flex items-center gap-1 bg-blue-500/10 px-1.5 h-7 rounded-lg border border-blue-500/20">
                          <span className="text-[9px] font-black text-blue-400">{die.downloads || 0}</span>
                        </div>
                        {(isAdmin || (user && die.user_id === user.id)) && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); setDiceToEdit(die); }} className="p-1.5 bg-white/5 rounded-lg border border-white/5 text-zinc-500 hover:text-white transition-all"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={(e) => { e.stopPropagation(); deleteDice(die.id, die.user_id); }} className="p-1.5 bg-red-500/10 rounded-lg border border-red-500/20 text-red-500 hover:text-white transition-all"><Trash2 className="w-3 h-3" /></button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-8">
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 0}
              onClick={() => { const p = currentPage - 1; setCurrentPage(p); fetchDice(activeTab, p); }}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase disabled:opacity-30"
            >
              {lang === "es" ? "Anterior" : "Prev"}
            </button>
            <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-2 rounded-xl border border-blue-500/20">{currentPage + 1}</span>
            <button 
              disabled={(dice?.length || 0) < pageSize}
              onClick={() => { const p = currentPage + 1; setCurrentPage(p); fetchDice(activeTab, p); }}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase disabled:opacity-30"
            >
              {lang === "es" ? "Siguiente" : "Next"}
            </button>
          </div>
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

// Build Trigger: 2026-05-04 22:42 - Multi-Dice Color Overhaul
