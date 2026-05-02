"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface DiceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  dice: any;
  lang: "es" | "en";
  onUpdated: () => void;
}

export default function DiceEditModal({ isOpen, onClose, dice, lang, onUpdated }: DiceEditModalProps) {
  const [metadata, setMetadata] = useState({ name: "", tags: "", type: "", color: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  useEffect(() => {
    if (dice) {
      setMetadata({
        name: dice.name || "",
        tags: dice.tags?.[0] || "",
        type: dice.type || "D6",
        color: dice.color || "#3b82f6"
      });
    }
  }, [dice]);

  const handleSave = async () => {
    setStatus("saving");
    try {
      const { error } = await supabase
        .from("dice_packs")
        .update({
          name: metadata.name,
          tags: [metadata.tags],
          type: metadata.type,
          color: metadata.color
        })
        .eq("id", dice.id);

      if (error) throw error;
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Save Error:", err);
      setStatus("error");
    } finally {
      setStatus("idle");
    }
  };

  if (!dice) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-zinc-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black tracking-tighter uppercase">{lang === "es" ? "Editar Dado" : "Edit Dice"}</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-6">
               <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-xl font-black text-white shadow-xl relative overflow-hidden" style={{ backgroundColor: metadata.color }}>
                    {dice.preview_face?.includes("<svg") ? (
                      <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: dice.preview_face }} />
                    ) : (
                      <span>{dice.preview_face || metadata.type.replace("D", "")}</span>
                    )}
                  </div>
                  
                  <div className="w-full text-left space-y-4">
                    <div>
                      <label className="text-[10px] text-zinc-500 font-bold uppercase ml-2 block mb-1">{lang === "es" ? "Nombre" : "Name"}</label>
                      <input 
                        type="text" 
                        value={metadata.name}
                        onChange={(e) => setMetadata({...metadata, name: e.target.value})}
                        className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 font-bold uppercase ml-2 block mb-1">{lang === "es" ? "Categoría / Tags" : "Category / Tags"}</label>
                      <input 
                        type="text" 
                        value={metadata.tags}
                        onChange={(e) => setMetadata({...metadata, tags: e.target.value})}
                        className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 font-bold uppercase ml-2 block mb-1">{lang === "es" ? "Tipo" : "Type"}</label>
                      <select 
                        value={metadata.type}
                        onChange={(e) => setMetadata({...metadata, type: e.target.value})}
                        className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                      >
                        {["D2", "D4", "D6", "D8", "D10", "D12", "D20", "D100", "PACK"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button onClick={onClose} className="flex-1 py-4 rounded-2xl bg-zinc-800 font-bold text-xs uppercase tracking-widest hover:bg-zinc-700 transition-colors">{lang === "es" ? "Cancelar" : "Cancel"}</button>
                  <button 
                    disabled={status === "saving"}
                    onClick={handleSave} 
                    className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest brand-gradient shadow-xl flex items-center justify-center gap-3"
                  >
                    {status === "saving" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {lang === "es" ? "Guardar" : "Save"}
                  </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
