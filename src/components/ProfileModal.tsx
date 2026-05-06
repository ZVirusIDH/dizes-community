"use client";

import { useState, useEffect } from "react";
import { X, User, Camera, Loader2, Trash2, Calendar, Clock, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  lang: "es" | "en";
  isAdmin: boolean;
  isTestUser: boolean;
  setIsTestUser: (val: boolean) => void;
}

const t = {
  es: {
    title: "Mi Perfil",
    editProfile: "Editar Datos",
    myUploads: "Mis Subidas",
    username: "Nombre de usuario",
    avatar: "Avatar (Máx 512x512)",
    save: "Guardar Cambios",
    changePassword: "Cambiar Contraseña",
    newPassword: "Nueva Contraseña",
    delete: "Eliminar",
    confirmDelete: "¿Seguro que quieres borrar este dado? Desaparecerá de la web.",
    noUploads: "No has subido nada todavía.",
    loading: "Cargando...",
    success: "Perfil actualizado",
    error: "Error al actualizar",
    deletedContent: "Contenido Eliminado (Admin)",
    logout: "Cerrar Sesión"
  },
  en: {
    title: "My Profile",
    editProfile: "Edit Profile",
    myUploads: "My Uploads",
    username: "Username",
    avatar: "Avatar (Max 512x512)",
    save: "Save Changes",
    changePassword: "Change Password",
    newPassword: "New Password",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this die? It will disappear from the web.",
    noUploads: "You haven't uploaded anything yet.",
    loading: "Loading...",
    success: "Profile updated",
    error: "Update error",
    deletedContent: "Deleted Content (Admin)",
    logout: "Logout"
  }
};

export default function ProfileModal({ isOpen, onClose, user, lang, isAdmin, isTestUser, setIsTestUser }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"data" | "uploads" | "deleted" | "users">("data");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [uploads, setUploads] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProfileMetadata, setUserProfileMetadata] = useState<any>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const dict = {
    ...t[lang],
    users: lang === "es" ? "Usuarios" : "Users",
    diceCount: lang === "es" ? "Dados" : "Dice",
    vip: "VIP",
    setVip: lang === "es" ? "Hacer VIP" : "Make VIP",
    removeVip: lang === "es" ? "Quitar VIP" : "Remove VIP"
  };

  useEffect(() => {
    if (isOpen && user) {
      loadProfile(); // Carga siempre el perfil para los badges
      if (activeTab === "uploads" || activeTab === "deleted") loadUploads();
      if (activeTab === "users" && isAdmin) loadUsers();
    }
  }, [isOpen, user, activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: pError } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (pError) throw pError;

      // Obtenemos conteo de dados por usuario
      const { data: diceData, error: dError } = await supabase.from("dice_packs").select("user_id").is("deleted_at", null);
      if (dError) throw dError;

      const diceCounts = diceData.reduce((acc: any, curr: any) => {
        acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
        return acc;
      }, {});

      setUsers(profiles.map(p => ({
        ...p,
        dice_count: diceCounts[p.id] || 0
      })));
    } catch (e) {
      console.error("Error loading users:", e);
    }
    setLoading(false);
  };

  const loadProfile = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) {
      setUsername(data.username || "");
      setAvatarUrl(data.avatar_url || "");
      setUserProfileMetadata(data);
    } else {
      setUsername(user.user_metadata?.username || "");
    }
  };

  const loadUploads = async () => {
    setLoading(true);
    let query = supabase.from("dice_packs").select("*").order("created_at", { ascending: false });
    
    if (activeTab === "uploads") {
      query = query.eq("user_id", user.id).is("deleted_at", null);
    } else if (activeTab === "deleted" && isAdmin) {
      query = query.not("deleted_at", "is", null);
    } else {
       setLoading(false);
       return;
    }

    const { data } = await query;
    if (data) setUploads(data);
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const forbiddenUsernames = ["ADMIN", "DIZES", "MODERATOR", "SUPPORT", "SYSTEM"];
    const upperName = username.toUpperCase().trim();
    if (forbiddenUsernames.some(f => upperName.includes(f)) || upperName.includes("ZVIRUS")) {
       if (user.email !== "zvirus@gmail.com") {
         setMessage({ type: "error", text: lang === "es" ? "Nombre reservado" : "Reserved username" });
         setLoading(false);
         return;
       }
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    });

    if (error) setMessage({ type: "error", text: dict.error });
    else {
       // Si hay contraseña nueva, la actualizamos
       if (newPassword) {
         const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
         if (pwdError) {
           setMessage({ type: "error", text: pwdError.message });
           setLoading(false);
           return;
         }
         setNewPassword("");
       }
       setMessage({ type: "success", text: dict.success });
    }
    
    setLoading(false);
    setTimeout(() => setMessage(null), 2000);
  };

  const softDelete = async (id: string) => {
    if (!confirm(dict.confirmDelete)) return;
    const { error } = await supabase.from("dice_packs").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (!error) loadUploads();
  };

  const hardDelete = async (id: string) => {
    if (!confirm("¿BORRAR PERMANENTEMENTE?")) return;
    const { error } = await supabase.from("dice_packs").delete().eq("id", id);
    if (!error) loadUploads();
  };

  const recoverItem = async (id: string) => {
    const { error } = await supabase.from("dice_packs").update({ deleted_at: null }).eq("id", id);
    if (!error) loadUploads();
  };

  const toggleVip = async (targetUser: any) => {
    const isVip = targetUser.max_published >= 60;
    const newMax = isVip ? 30 : 60;
    const newTrusted = !isVip; // Si lo hacemos VIP (newMax=60), es trusted.
    
    const { error } = await supabase.from("profiles").update({
      max_published: newMax,
      is_trusted: newTrusted
    }).eq("id", targetUser.id);

    if (!error) {
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, max_published: newMax, is_trusted: newTrusted } : u));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full brand-gradient flex items-center justify-center text-xl font-black shadow-xl overflow-hidden">
                  {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : username[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black tracking-tighter uppercase">{dict.title}</h2>
                    {isAdmin && (
                      <span className="bg-blue-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black shadow-lg shadow-blue-500/20">ADMIN</span>
                    )}
                    {(userProfileMetadata?.max_published || 0) >= 60 && (
                      <span className="bg-amber-500 text-black text-[8px] px-2 py-0.5 rounded-full font-black animate-pulse shadow-lg shadow-amber-500/20">VIP</span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{user.email}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex bg-black/40 border-b border-white/5 overflow-x-auto scrollbar-hide">
              <button onClick={() => setActiveTab("data")} className={`flex-1 min-w-[80px] py-4 text-[10px] font-black transition-all ${activeTab === "data" ? "text-blue-500 border-b-2 border-blue-500" : "text-zinc-500"}`}>{dict.editProfile}</button>
              <button onClick={() => setActiveTab("uploads")} className={`flex-1 min-w-[80px] py-4 text-[10px] font-black transition-all ${activeTab === "uploads" ? "text-blue-500 border-b-2 border-blue-500" : "text-zinc-500"}`}>{dict.myUploads}</button>
              {isAdmin && <button onClick={() => setActiveTab("users")} className={`flex-1 min-w-[80px] py-4 text-[10px] font-black transition-all ${activeTab === "users" ? "text-blue-500 border-b-2 border-blue-500" : "text-zinc-500"}`}>{dict.users}</button>}
              {isAdmin && <button onClick={() => setActiveTab("deleted")} className={`flex-1 min-w-[80px] py-4 text-[10px] font-black transition-all ${activeTab === "deleted" ? "text-red-500 border-b-2 border-red-500" : "text-zinc-500"}`}>{dict.deletedContent}</button>}
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {activeTab === "data" ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* ... (resto del formulario igual) ... */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">{dict.username}</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500 font-bold text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">{dict.avatar} URL</label>
                    <div className="relative">
                      <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input type="text" placeholder="https://..." value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500 font-bold text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">{dict.newPassword}</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500 font-bold text-sm" />
                    </div>
                  </div>

                  {message && (
                    <div className={`flex items-center gap-2 p-4 rounded-2xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                      {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <p className="text-xs font-bold">{message.text}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="w-full brand-gradient py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : dict.save}
                  </button>

                   {isAdmin && (
                    <button 
                      type="button"
                      onClick={() => { setIsTestUser(!isTestUser); onClose(); }} 
                      className="w-full mt-4 bg-orange-500/10 border border-orange-500/20 py-4 rounded-2xl text-[10px] font-black text-orange-500 uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      {isTestUser ? (lang === "es" ? "SALIR DE MODO TEST" : "EXIT TEST MODE") : (lang === "es" ? "SIMULAR USUARIO TEST" : "SIMULATE TEST USER")}
                    </button>
                  )}

                  <div className="pt-4 border-t border-white/5 mt-8">
                    <button 
                      type="button"
                      onClick={() => { supabase.auth.signOut(); onClose(); }}
                      className="w-full bg-red-500/10 border border-red-500/20 py-4 rounded-2xl text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      {dict.logout}
                    </button>
                  </div>
                </form>
              ) : activeTab === "users" && isAdmin ? (
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
                  ) : (
                    users.map(u => (
                      <div key={u.id} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center text-sm font-black shadow-lg overflow-hidden shrink-0">
                            {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : (u.username?.[0] || 'U')}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm truncate flex items-center gap-2">
                              {u.username || 'User'}
                              {u.max_published >= 60 && <span className="bg-amber-500 text-black text-[7px] px-1.5 py-0.5 rounded-full font-black">VIP</span>}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[8px] font-black text-blue-500 uppercase">{u.dice_count} {dict.diceCount}</p>
                              {u.is_trusted && (
                                <span className="bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded text-[6px] font-bold uppercase">Trusted</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleVip(u)}
                          className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${u.max_published >= 60 ? "bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black" : "bg-white/5 border border-white/5 text-zinc-500 hover:bg-white/10"}`}
                        >
                          {u.max_published >= 60 ? dict.removeVip : dict.setVip}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
                  ) : uploads.length === 0 ? (
                    <p className="text-center text-zinc-500 font-bold py-10">{dict.noUploads}</p>
                  ) : (
                    <>
                      {[
                        { id: 'approved', label: lang === 'es' ? 'Aprobados' : 'Approved', color: 'text-green-500', icon: <CheckCircle2 className="w-3 h-3" /> },
                        { id: 'pending', label: lang === 'es' ? 'Pendientes de Revisión' : 'Pending Review', color: 'text-yellow-500', icon: <Clock className="w-3 h-3" /> },
                        { id: 'rejected', label: lang === 'es' ? 'No Aprobados' : 'Not Approved', color: 'text-red-500', icon: <AlertCircle className="w-3 h-3" /> }
                      ].map(section => {
                        const items = uploads.filter(u => u.status === section.id);
                        if (items.length === 0 && activeTab === "uploads") return null;
                        if (activeTab === "deleted" && section.id !== "approved") return null; // En la papelera admin no agrupamos por status de la misma forma

                        return (
                          <div key={section.id} className="space-y-3">
                            <div className={`flex items-center gap-2 px-2`}>
                              <span className={`${section.color} bg-current/10 p-1 rounded-md`}>{section.icon}</span>
                              <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${section.color}`}>{section.label}</h3>
                              <div className="flex-1 h-[1px] bg-white/5 ml-2" />
                              <span className="text-[10px] font-black text-zinc-600">{items.length}</span>
                            </div>

                            <div className="space-y-2">
                              {items.map(item => (
                                <div key={item.id} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-colors">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg" style={{ backgroundColor: item.color }}>
                                      {item.type === 'PACK' ? 'P' : item.type.replace("D", "")}
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-sm">{item.name}</h4>
                                      <div className="flex items-center gap-3 text-[8px] font-black uppercase mt-1">
                                        <span className={`flex items-center gap-1 ${item.is_published ? 'text-blue-500' : 'text-zinc-500'}`}>
                                          {item.is_published ? (lang === 'es' ? 'Público' : 'Public') : (lang === 'es' ? 'Privado' : 'Private')}
                                        </span>
                                        <span className="text-zinc-600">•</span>
                                        <span className="text-zinc-600">{new Date(item.created_at).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                     {activeTab === "uploads" && (
                                       <button 
                                         onClick={async () => {
                                           const { error } = await supabase.from("dice_packs").update({ is_published: !item.is_published }).eq("id", item.id);
                                           if (!error) loadUploads();
                                         }}
                                         className={`p-2 rounded-xl transition-all border ${item.is_published ? "bg-blue-500/10 border-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white" : "bg-zinc-800 border-white/5 text-zinc-500 hover:bg-white/10"}`}
                                         title={lang === 'es' ? 'Cambiar Visibilidad' : 'Toggle Visibility'}
                                       >
                                         {item.is_published ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                       </button>
                                     )}
                                     {activeTab === "uploads" ? (
                                       <button onClick={() => softDelete(item.id)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all"><Trash2 className="w-4 h-4" /></button>
                                     ) : (
                                       <div className="flex gap-2">
                                         <button onClick={() => recoverItem(item.id)} className="px-3 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-black text-[8px] uppercase">RECOVER</button>
                                         <button onClick={() => hardDelete(item.id)} className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-black text-[8px]">FINAL DELETE</button>
                                       </div>
                                     )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
