"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, Download, Filter, Dice6, ChevronRight, Languages, Menu, X, LayoutGrid, LayoutList, Smartphone, Monitor, Package, Trash2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import UploadModal from "@/components/UploadModal";
import DiceViewerModal from "@/components/DiceViewerModal";
import AuthModal from "@/components/AuthModal";
import ProfileModal from "@/components/ProfileModal";
import DiceEditModal from "@/components/DiceEditModal";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

type Language = "es" | "en";
type ViewMode = "grid" | "list";

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
  const ADMIN_EMAIL = "zvirus@gmail.com"; // Email maestro del administrador
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
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dice, setDice] = useState<any[] | null>(null);
  const [isTestUser, setIsTestUser] = useState(false);
   const [activeTab, setActiveTab] = useState<"trending" | "latest" | "pending">("trending");
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(0);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedDice, setSelectedDice] = useState<string[]>([]);

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

  useEffect(() => {
    setIsMounted(true);
    const browserLang = navigator.language.split("-")[0];
    if (browserLang === "en") setLang("en");
    
    const checkMobile = () => {
      const isMob = window.innerWidth < 768;
      if (isMob) setColumns(3);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    fetchDice(activeTab);

    // Session check
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

    // Action check (Deep Link from App for Upload)
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get("action");
    const code = urlParams.get("code");
    if (action === "upload" && code) {
      setIsUploadOpen(true);
      // Wait for modal to mount or use a state to pass the code
      sessionStorage.setItem("upload_code", code);
    }

    return () => subscription.unsubscribe();
  }, []);

  const activeUser = isTestUser ? { id: 'test-user-id', email: 'test@user.com', user_metadata: { username: 'Tester' } } : user;
  const activeIsAdmin = isTestUser ? false : isAdmin;

  const [diceToEdit, setDiceToEdit] = useState<any | null>(null);

  const fetchDice = async (sort: "trending" | "latest" | "pending" = activeTab, page = currentPage, size = pageSize, onlyDeleted = showDeleted) => {
    try {
      let query = supabase.from("dice_packs").select("*", { count: "exact" });
      
      if (onlyDeleted) {
        query = query.not("deleted_at", "is", null);
      } else {
        query = query.is("deleted_at", null);
        
        if (sort === "pending") {
          query = query.eq("status", "pending");
        } else {
          // Regular users only see published & approved
          if (!isAdmin) {
            query = query.eq("is_published", true).eq("status", "approved");
          } else {
            // Admins see all approved ones in trending/latest
            query = query.eq("status", "approved");
          }
        }
      }
      
      if (sort === "trending") {
        query = query.order("downloads", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const from = page * size;
      const to = from + size - 1;

      const { data, error } = await query.range(from, to);
      if (error) throw error;
      setDice(data || []);
    } catch (err) {
      console.error("Error fetching dice:", err);
      setDice([]); 
    }
  };

  const incrementDownload = async (id: string, currentDownloads: number, shareCode?: string) => {
    if (shareCode) {
      window.location.href = `dizes://community?code=${shareCode}`;
    }
    await supabase.from("dice_packs").update({ downloads: (currentDownloads || 0) + 1 }).eq("id", id);
    fetchDice();
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

  const deleteDice = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm(lang === "es" ? "¿Seguro que quieres borrar este dado?" : "Are you sure you want to delete this die?")) return;
    const { error } = await supabase.from("dice_packs").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (!error) fetchDice();
    else alert(error.message);
  };

  const renameDice = async (id: string, oldName: string) => {
    if (!isAdmin) return;
    const newName = prompt(lang === "es" ? "Nuevo nombre:" : "New name:", oldName);
    if (newName && newName !== oldName) {
      const { error } = await supabase.from("dice_packs").update({ name: newName }).eq("id", id);
      if (!error) fetchDice();
      else alert(error.message);
    }
  };

  const t = translations[lang];

  if (!isMounted) return null;

  // Clases dinámicas para forzar el modo móvil
  const mobileContainerClass = isForcedMobile ? "max-w-[375px] mx-auto border-x border-white/10 shadow-2xl" : "w-full";
  const mobileTextClass = isForcedMobile ? "text-center" : "text-center";
  const gridColsClass = viewMode === "list" ? "grid-cols-1" :
    columns === 2 ? 'grid-cols-2' :
    columns === 3 ? 'grid-cols-3' :
    columns === 4 ? 'grid-cols-4' : 
    columns === 6 ? 'grid-cols-6' : 
    columns === 8 ? 'grid-cols-8' :
    'grid-cols-10';

  return (
    <div className={`flex flex-col min-h-screen bg-[#060607] text-white transition-all duration-500 overflow-clip ${mobileContainerClass}`}>
      {/* Navbar */}
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

        {/* Barra de Búsqueda Integrada */}
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
                  onBlur={() => {
                    // Close automatically if they click outside and didn't type anything
                    if (!search) setIsSearchOpen(false);
                  }}
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
                  userProfile?.username?.[0] || user.user_metadata?.username?.[0] || user.email?.[0] || "U"
                )}
              </button>
              <button onClick={() => supabase.auth.signOut()} className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
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
      
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} lang={lang} />
      {user && <ProfileModal isOpen={isProfileOpen} onClose={() => { setIsProfileOpen(false); fetchDice(); }} user={user} lang={lang} isAdmin={isAdmin} isTestUser={isTestUser} setIsTestUser={setIsTestUser} />}


      {/* Main Content */}
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

        {/* Admin Toolbar */}
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
               <button onClick={() => permanentDelete(dice?.map(d => d.id) || [])} className="bg-zinc-800 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-red-600 transition-all">{lang === "es" ? "Vaciar Todo" : "Clear All"}</button>
            </div>
          </section>
        )}

        {/* Toolbar */}
        <section className="mb-6 py-2 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-1">
             {[
               { id: "trending", label: t.trending },
               { id: "latest", label: t.latest },
               ...(isAdmin ? [{ id: "pending", label: lang === "es" ? "PENDIENTES" : "PENDING" }] : [])
             ].map((tab) => (
               <button 
                 key={tab.id} 
                 onClick={() => { setActiveTab(tab.id as any); fetchDice(tab.id as any); }}
                 className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-zinc-500 hover:text-white"}`}
               >
                 {tab.label}
               </button>
             ))}
          </div>

          {viewMode === "grid" && (
            <div className="flex items-center gap-4">
              <div className="flex bg-zinc-900/50 rounded-md p-0.5 border border-white/5">
                {(isActualMobile || isForcedMobile ? [2, 3, 4] : [2, 4, 6, 8, 10]).map(n => (
                  <button key={n} onClick={() => setColumns(n)} className={`w-6 h-5 text-[9px] font-bold rounded ${columns === n ? "bg-blue-600 text-white" : "text-zinc-500"}`}>{n}</button>
                ))}
              </div>
            </div>
          )}

          <div className="flex bg-zinc-900/50 rounded-md p-0.5 border border-white/5">
            <button onClick={() => setViewMode("grid")} className={`p-1 rounded ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-zinc-500"}`}><LayoutGrid className="w-3.5 h-3.5" /></button>
            <button onClick={() => setViewMode("list")} className={`p-1 rounded ${viewMode === "list" ? "bg-blue-600 text-white" : "text-zinc-500"}`}><LayoutList className="w-3.5 h-3.5" /></button>
          </div>
        </section>

        {/* Grid */}
        <div className={`grid gap-3 ${gridColsClass} ${viewMode === "list" ? "grid-cols-1" : ""}`}>
          {dice === null ? (
            Array.from({ length: columns * 2 }).map((_, i) => (
              <div key={i} className="bg-zinc-900/20 border border-white/[0.03] rounded-2xl p-3 animate-pulse">
                <div className="h-3 w-2/3 bg-white/5 rounded-full mb-3" />
                <div className="aspect-square w-full bg-white/5 rounded-xl mb-3" />
                <div className="h-2 w-1/2 bg-white/5 rounded-full" />
              </div>
            ))
          ) : dice.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <Package className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">{showDeleted ? (lang === "es" ? "La papelera está vacía" : "Recycle bin is empty") : (lang === "es" ? "No se encontraron dados" : "No dice found")}</p>
            </div>
          ) : (
            dice.filter(d => d.name?.toLowerCase().includes(search.toLowerCase()) || d.tags?.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()))).map((die) => (
              <motion.div 
                key={die.id} 
                whileHover={{ y: -2 }} 
                onClick={() => isAdmin && showDeleted ? toggleSelect(die.id) : setSelectedPack(die)} 
                className={`bg-zinc-900/20 border border-white/[0.03] rounded-2xl p-3 group cursor-pointer hover:border-white/10 transition-all shadow-xl hover:shadow-blue-500/5 ${viewMode === "list" ? "flex items-center gap-4" : "flex flex-col gap-1.5"} ${selectedDice.includes(die.id) ? "ring-2 ring-red-500 bg-red-500/5 border-red-500/30" : ""}`}
              >
                
                {/* Top: Name & Game & Multi-select Checkbox */}
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="flex flex-col gap-1 min-w-0">
                    <h4 className="font-black text-[10px] md:text-xs truncate uppercase tracking-tight leading-none">{die.name}</h4>
                    {die.tags && die.tags.length > 0 && (
                      <p className="text-[8px] text-zinc-500 font-bold truncate uppercase opacity-80 leading-none">{die.tags[0]}</p>
                    )}
                  </div>
                  {isAdmin && showDeleted && (
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${selectedDice.includes(die.id) ? "bg-red-500 border-red-500" : "border-white/20 bg-black/40"}`}>
                      {selectedDice.includes(die.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                  )}
                </div>

                {/* Middle: Dice Preview */}
                <div className={`bg-black/40 rounded-xl flex items-center justify-center relative shrink-0 overflow-hidden border border-white/5 ${viewMode === "list" ? "w-10 h-10" : "aspect-square w-full"}`}>
                   <div className={`rounded-lg flex items-center justify-center text-white font-black overflow-hidden shadow-2xl border border-white/10 ${viewMode === "list" ? "w-6 h-6 text-[10px]" : "w-16 h-16 text-2xl"}`} style={{ backgroundColor: die.color }}>
                     {die.preview_face ? (
                       die.preview_face.includes("<svg") ? (
                         <div className={`${viewMode === "list" ? "w-4 h-4" : "w-10 h-10"}`} dangerouslySetInnerHTML={{ __html: die.preview_face }} />
                       ) : (
                         <span>{die.preview_face}</span>
                       )
                     ) : (
                       die.type === 'PACK' ? <Package className={`${viewMode === "list" ? "w-3 h-3" : "w-8 h-8"}`} /> : die.type.replace("D", "")
                     )}
                   </div>
                   <div className="absolute top-2 right-2">
                      <span className="bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[7px] font-black text-zinc-400 uppercase border border-white/5">{die.type}</span>
                   </div>
                </div>

                {/* Below Preview: Author */}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[9px] text-zinc-600 font-bold truncate opacity-60">@{die.author}</p>
                </div>

                {/* Bottom: Action Buttons & Stats */}
                <div className="flex flex-col gap-1.5 mt-1">
                  {!showDeleted ? (
                    <div className="flex gap-1 items-stretch">
                      {activeTab === "pending" && isAdmin ? (
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            const { error } = await supabase.from("dice_packs").update({ status: 'approved' }).eq("id", die.id);
                            if (!error) fetchDice();
                            else alert(error.message);
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white h-9 rounded-xl transition-all flex items-center justify-center font-black text-[9px] uppercase tracking-widest shadow-lg shadow-green-500/20 gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {lang === "es" ? "Aprobar" : "Approve"}
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              incrementDownload(die.id, die.downloads, die.share_code);
                              setSelectedPack(die); 
                            }} 
                            className="flex-1 brand-gradient hover:brightness-110 h-9 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-blue-500/10"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <div className="flex items-center gap-1.5 bg-blue-500/10 px-2 h-9 rounded-xl border border-blue-500/20 shadow-inner shrink-0">
                            <Download className="w-3 h-3 text-blue-500" />
                            <span className="text-[10px] font-black text-blue-400">{die.downloads || 0}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); restoreDice([die.id]); }} 
                        className="flex-1 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white p-2 rounded-xl text-[8px] font-black border border-blue-500/20 transition-all uppercase"
                      >
                        {lang === "es" ? "Restaurar" : "Restore"}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); permanentDelete([die.id]); }} 
                        className="flex-1 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white p-2 rounded-xl text-[8px] font-black border border-red-500/20 transition-all uppercase"
                      >
                        {lang === "es" ? "Borrar" : "Delete"}
                      </button>
                    </div>
                  )}
                  
                  {isAdmin && !showDeleted && (
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDiceToEdit(die); }} 
                        className="flex-1 bg-white/5 hover:bg-zinc-800 text-zinc-500 hover:text-white p-2 rounded-xl text-[8px] font-black border border-white/5 transition-all"
                      >
                        EDIT
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteDice(die.id); }} 
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-xl text-[8px] font-black border border-red-500/20 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination & Page Size */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-8">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{lang === "es" ? "Por página" : "Per page"}</span>
            <div className="flex bg-zinc-900/50 rounded-xl p-1 border border-white/5">
              {[10, 20, 30].map(size => (
                <button 
                  key={size} 
                  onClick={() => { setPageSize(size); setCurrentPage(0); fetchDice(activeTab, 0, size); }}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${pageSize === size ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 0}
              onClick={() => { const p = currentPage - 1; setCurrentPage(p); fetchDice(activeTab, p); }}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              {lang === "es" ? "Anterior" : "Prev"}
            </button>
            <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-2 rounded-xl border border-blue-500/20">
              {currentPage + 1}
            </span>
            <button 
              disabled={(dice?.length || 0) < pageSize}
              onClick={() => { const p = currentPage + 1; setCurrentPage(p); fetchDice(activeTab, p); }}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              {lang === "es" ? "Siguiente" : "Next"}
            </button>
          </div>
        </div>
      </main>

      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user} 
        lang={lang}
        isAdmin={isAdmin}
        isTestUser={isTestUser}
        setIsTestUser={setIsTestUser}
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} lang={lang} />
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} lang={lang} />
      <DiceViewerModal isOpen={!!selectedPack} onClose={() => setSelectedPack(null)} pack={selectedPack} lang={lang} />
      <DiceEditModal 
        isOpen={!!diceToEdit} 
        onClose={() => setDiceToEdit(null)} 
        dice={diceToEdit} 
        lang={lang} 
        onUpdated={() => fetchDice()} 
      />
    </div>
  );
}
