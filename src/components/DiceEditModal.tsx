"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface DiceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  dice: any;
  lang: "es" | "en";
  onUpdated: () => void;
  isAdmin?: boolean;
}

export default function DiceEditModal({ isOpen, onClose, dice, lang, onUpdated, isAdmin }: DiceEditModalProps) {
  const [metadata, setMetadata] = useState({ name: "", tags: "", type: "", color: "", preview_face: "", status: "approved" });
  const [jsonCode, setJsonCode] = useState("");
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [faces, setFaces] = useState<any[]>([]);
  const [selectedFaceIdx, setSelectedFaceIdx] = useState(-1);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const decodeBase64Gzip = async (base64str: string): Promise<string> => {
    try {
      const binData = atob(base64str);
      const ui8Data = new Uint8Array(binData.length);
      for (let i = 0; i < binData.length; i++) ui8Data[i] = binData.charCodeAt(i);
      // @ts-ignore
      const stream = new Blob([ui8Data]).stream().pipeThrough(new DecompressionStream("gzip"));
      const response = new Response(stream);
      return await response.text();
    } catch (e) {
      try { return atob(base64str); } catch { return ""; }
    }
  };

  useEffect(() => {
    if (dice) {
      setMetadata({
        name: dice.name || "",
        tags: dice.tags?.[0] || "",
        type: dice.type || "D6",
        color: dice.color || "#3b82f6",
        preview_face: dice.preview_face || "",
        status: dice.status || "approved"
      });

      if (dice.share_code) {
        decodeBase64Gzip(dice.share_code).then(jsonStr => {
           setJsonCode(jsonStr);
        });
      }

      if (dice.share_code) {
        decodeBase64Gzip(dice.share_code).then(jsonStr => {
          try {
            const decoded = JSON.parse(jsonStr);
            const isPack = Array.isArray(decoded);
            const mainDie = isPack ? decoded[0] : decoded;
            if (mainDie.faceContent) {
              const extractedFaces = mainDie.faceContent.map((c: string, i: number) => ({
                content: c,
                type: mainDie.faceContentTypes?.[i] || 'NUMBERS',
                color: mainDie.faceColors?.[i] || mainDie.color,
                textColor: mainDie.faceContentColors?.[i] || mainDie.textColor
              }));
              setFaces(extractedFaces);
              
              const currentIdx = extractedFaces.findIndex((f: any) => f.content === dice.preview_face);
              setSelectedFaceIdx(currentIdx);
            }
          } catch (e) { console.error("Parse error:", e); }
        });
      }
    }
  }, [dice]);

  const handleSave = async () => {
    setStatus("saving");
    setErrorMsg("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const isZvirus = session?.user?.email?.toLowerCase() === "zvirus@gmail.com";
      const forbiddenNames = ["ADMIN", "DIZES", "MODERATOR", "SUPPORT", "SYSTEM"];
      const upperName = metadata.name.toUpperCase().trim();

      if (!isZvirus && (forbiddenNames.some(f => upperName.includes(f)) || upperName.includes("ZVIRUS"))) {
        setStatus("error");
        setErrorMsg(lang === "es" ? "Nombre reservado" : "Reserved name");
        return;
      }

      let finalShareCode = dice.share_code;
      if (isAdvanced) {
         // Re-encode JSON if changed in advanced mode
         const uint8 = new TextEncoder().encode(jsonCode);
         // @ts-ignore
         const stream = new Blob([uint8]).stream().pipeThrough(new CompressionStream("gzip"));
         const response = new Response(stream);
         const buffer = await response.arrayBuffer();
         finalShareCode = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      }

      // Preparamos los tags: el primero es la categoría, el segundo el color del texto de previsualización
      const previewTextColor = (selectedFaceIdx >= 0 && faces[selectedFaceIdx]) 
        ? faces[selectedFaceIdx].textColor 
        : (dice.tags?.find((t: string) => t.startsWith("_pfc:"))?.split(":")[1] || "#ffffff");

      // Dividir los tags por coma y limpiar espacios
      const userTags = (metadata.tags || "").split(',').map(t => t.trim()).filter(Boolean);
      const finalTags = [...userTags];
      
      if (previewTextColor) finalTags.push(`_pfc:${previewTextColor}`);
      
      // Preservar el tag de conteo si existe
      const countTag = dice.tags?.find((t: string) => t.startsWith("_count:"));
      if (countTag) finalTags.push(countTag);

      // Campos básicos que cualquier dueño puede editar
      const updateData: any = {
        name: metadata.name.trim(),
        tags: finalTags,
        type: metadata.type,
        color: metadata.color,
        preview_face: metadata.preview_face
      };

      // Campos restringidos a Admin
      if (isAdmin) {
        updateData.status = metadata.status;
        if (isAdvanced) {
          updateData.share_code = finalShareCode;
        }
      }

      const { error } = await supabase
        .from("dice_packs")
        .update(updateData)
        .eq("id", dice.id);

      if (error) throw error;
      setStatus("success");
      onUpdated();
      setTimeout(() => {
        onClose();
        setStatus("idle");
      }, 1500);
    } catch (err: any) {
      console.error("Save Error:", err);
      const msg = err.message || "Unknown error";
      setErrorMsg(msg);
      setStatus("error");
    } finally {
      // No reseteamos el status a idle inmediatamente para que se vea el error/éxito
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
              <div className="flex flex-col">
                <h2 className="text-2xl font-black tracking-tighter uppercase">{lang === "es" ? "Editar Dado" : "Edit Dice"}</h2>
                {isAdmin && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setIsAdvanced(false)} className={`text-[9px] font-bold px-2 py-1 rounded-full border ${!isAdvanced ? "bg-blue-500 border-blue-500" : "border-white/20 text-zinc-500"}`}>BÁSICO</button>
                    <button onClick={() => setIsAdvanced(true)} className={`text-[9px] font-bold px-2 py-1 rounded-full border ${isAdvanced ? "bg-purple-500 border-purple-500" : "border-white/20 text-zinc-500"}`}>AVANZADO (JSON)</button>
                  </div>
                )}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-6">
               {!isAdvanced ? (
                 <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-xl font-black text-white shadow-xl relative overflow-hidden" style={{ backgroundColor: faces[selectedFaceIdx]?.color || metadata.color }}>
                    {(() => {
                      const content = faces[selectedFaceIdx]?.content || metadata.preview_face;
                      if (!content) return <span>{metadata.type.replace("D", "")}</span>;
                      if (content.includes("<svg")) return <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: content }} />;
                      if (content.startsWith("http")) return <img src={content} alt="Preview" className="w-full h-full object-contain p-1" />;
                      return <span>{content}</span>;
                    })()}
                  </div>

                  {faces.length > 0 && (
                    <div className="w-full mb-6">
                      <label className="text-[10px] text-zinc-500 font-bold uppercase ml-2 mb-2 block tracking-widest">{lang === "es" ? "Cara de previsualización" : "Preview face"}</label>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {faces.map((face, i) => (
                          <button 
                            key={i}
                            type="button"
                            onClick={() => { setSelectedFaceIdx(i); setMetadata({...metadata, preview_face: face.content}); }}
                            className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black border-2 transition-all overflow-hidden ${selectedFaceIdx === i ? "border-blue-500 scale-110 shadow-lg" : "border-white/5 opacity-50"}`}
                            style={{ backgroundColor: face.color || metadata.color }}
                          >
                            {face.content.includes("<svg") ? (
                              <div className="w-6 h-6 pointer-events-none" dangerouslySetInnerHTML={{ __html: face.content }} />
                            ) : face.content.startsWith("http") ? (
                              <img src={face.content} alt="" className="w-full h-full object-contain p-0.5" />
                            ) : (
                              <span style={{ color: face.textColor || "#fff" }}>{face.content}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
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
                        {["D2", "D4", "D6", "D8", "D10", "D12", "D20", "D100", "DX", "PACK"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    {isAdmin && (
                      <div className="pt-4 border-t border-white/5 mt-4">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase ml-2 block mb-2 tracking-widest">{lang === "es" ? "Estado de Moderación" : "Moderation Status"}</label>
                        <div className="flex gap-2">
                          {["approved", "pending", "rejected"].map(s => (
                            <button 
                              key={s} 
                              onClick={() => setMetadata({...metadata, status: s})}
                              className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all border ${metadata.status === s ? "bg-white text-black border-white" : "bg-black/40 text-zinc-500 border-zinc-800"}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
               </div>
               ) : (
                 <div className="bg-black/40 border border-purple-500/30 p-4 rounded-2xl h-[400px] flex flex-col">
                   <label className="text-[10px] text-purple-400 font-black uppercase mb-2 tracking-widest flex items-center gap-2">
                     <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                     JSON MASTER EDITOR
                   </label>
                   <textarea 
                     value={jsonCode}
                     onChange={(e) => setJsonCode(e.target.value)}
                     className="flex-1 bg-black/60 border border-zinc-800 rounded-xl p-4 text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                   />
                 </div>
               )}
               
               {status === "error" && (
                 <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex flex-col gap-1 text-red-500 text-[10px] font-bold">
                   <div className="flex items-center gap-2">
                     <X className="w-3 h-3" />
                     {lang === "es" ? "Error al guardar los cambios" : "Error saving changes"}
                   </div>
                   {errorMsg && <p className="opacity-70 ml-5 font-mono">{errorMsg}</p>}
                 </div>
               )}

               {status === "success" && (
                 <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center gap-2 text-green-500 text-[10px] font-bold">
                   <CheckCircle2 className="w-3 h-3" />
                   {lang === "es" ? "¡Cambios guardados con éxito!" : "Changes saved successfully!"}
                 </div>
               )}

               {status === "saving" && (
                 <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex items-center gap-2 text-blue-500 text-[10px] font-bold">
                   <Loader2 className="w-3 h-3 animate-spin" />
                   {lang === "es" ? "Guardando..." : "Saving..."}
                 </div>
               )}

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
