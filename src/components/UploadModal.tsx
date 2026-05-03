"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Upload, CheckCircle2, AlertCircle, Loader2, FileJson } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { supabase } from "@/lib/supabase";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "es" | "en";
}

const t = {
  es: {
    title: "Compartir Dados",
    dropZone: "Arrastra tu archivo .dizes aquí o haz clic para buscar",
    validating: "Validando archivo...",
    success: "¡Archivo válido! Listo para subir.",
    errorInvalid: "Archivo no válido. Asegúrate de que sea un archivo .dizes exportado desde la app.",
    errorNoData: "El archivo está corrupto (falta configuración).",
    uploading: "Subiendo a la comunidad...",
    publish: "Publicar Dado",
    cancel: "Cancelar",
    name: "Nombre del pack",
    tags: "Juego al que pertenece",
    description: "Descripción",
  },
  en: {
    title: "Share Dice",
    dropZone: "Drag your .dizes file here or click to browse",
    validating: "Validating file...",
    success: "Valid file! Ready to upload.",
    errorInvalid: "Invalid file. Make sure it's a .dizes file exported from the app.",
    errorNoData: "File is corrupt (missing configuration).",
    uploading: "Uploading to community...",
    publish: "Publish Dice",
    cancel: "Cancel",
    name: "Pack Name",
    tags: "Game name",
    description: "Description",
  }
};

export default function UploadModal({ isOpen, onClose, lang }: UploadModalProps) {
  const [activeTab, setActiveTab] = useState<"file" | "code">("file");
  const [file, setFile] = useState<File | null>(null);
  const [rawCode, setRawCode] = useState("");
  const [status, setStatus] = useState<"idle" | "validating" | "success" | "error" | "uploading">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [faces, setFaces] = useState<any[]>([]);
  const [extractedImages, setExtractedImages] = useState<{[path: string]: Blob}>({});
  const [selectedFaceIdx, setSelectedFaceIdx] = useState(0);
  const [metadata, setMetadata] = useState({ name: "", tags: "", description: "", color: "#3b82f6", type: "D6", isPublished: true });
  const [packItems, setPackItems] = useState<{name: string, type: string, color: string}[]>([]);
  const dict = t[lang];

  useEffect(() => {
    if (isOpen) {
      const savedCode = sessionStorage.getItem("upload_code");
      if (savedCode) {
        setActiveTab("code");
        validateCode(savedCode);
        sessionStorage.removeItem("upload_code");
      }
    }
  }, [isOpen]);

  const decodeBase64Gzip = async (base64str: string): Promise<string> => {
    try {
      const binData = atob(base64str);
      const ui8Data = new Uint8Array(binData.length);
      for (let i = 0; i < binData.length; i++) {
        ui8Data[i] = binData.charCodeAt(i);
      }
      const stream = new Blob([ui8Data]).stream().pipeThrough(new DecompressionStream("gzip"));
      const response = new Response(stream);
      return await response.text();
    } catch (e) {
      return atob(base64str);
    }
  };

  const validateCode = async (text: string) => {
    try {
      setStatus("validating");
      // Handle potential spaces from URL decoding of '+' characters
      const cleanText = text.replace(/\s/g, "+");
      const base64Regex = /[A-Za-z0-9+/=]{20,}/;
      const match = cleanText.match(base64Regex);
      
      if (match) {
        const extractedCode = match[0];
        const jsonStr = await decodeBase64Gzip(extractedCode);
        const decoded = JSON.parse(jsonStr);
        const isPack = Array.isArray(decoded);
        const mainDie = isPack ? decoded[0] : decoded;
        
        if (isPack) {
          setPackItems(decoded.map((d: any, idx: number) => ({
            name: d.name || `Die ${idx + 1}`,
            type: d.type || "D6",
            color: d.color || "#3b82f6"
          })));
        } else {
          setPackItems([]);
        }
        
        setMetadata({
          name: isPack ? "Dice Pack" : (mainDie.name || "Custom Die"),
          tags: isPack ? "Pack" : (mainDie.type || "Die"),
          description: isPack ? "A collection of dice." : `A single ${mainDie.type || 'D6'} die.`,
          color: isPack ? "#3b82f6" : (mainDie.color || "#3b82f6"),
          type: isPack ? "PACK" : (mainDie.type || "D6"),
          isPublished: true
        });

        if (mainDie.faceContent) {
          setFaces(mainDie.faceContent.map((c: string, i: number) => ({
            content: c,
            type: mainDie.faceContentTypes?.[i] || 'NUMBERS',
            color: mainDie.faceColors?.[i] || mainDie.color,
            textColor: mainDie.faceContentColors?.[i] || mainDie.textColor
          })));
        }

        setRawCode(extractedCode);
        setStatus("success");
      } else {
        throw new Error("No valid Base64 found");
      }
    } catch (e) {
      console.error("Validation error:", e);
      setStatus("error");
      setErrorMsg(lang === "es" ? "Código no válido o incompatible" : "Invalid or incompatible code");
    }
  };

  const validateFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".dizes")) {
      setStatus("error");
      setErrorMsg(dict.errorInvalid);
      return;
    }
    setStatus("validating");
    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(selectedFile);
      const dataFile = content.file(/.*\.json$/)[0];
      if (!dataFile) {
        const filenames = Object.keys(content.files).join(", ");
        throw new Error(lang === "es" ? `No se encontró configuración JSON. Archivos: ${filenames}` : `No JSON found. Files: ${filenames}`);
      }

      const jsonPath = dataFile.name;
      const baseDir = jsonPath.includes("/") ? jsonPath.substring(0, jsonPath.lastIndexOf("/") + 1) : "";

      const data = JSON.parse(await dataFile.async("string"));
      const isPack = Array.isArray(data);
      const mainDie = isPack ? data[0] : data;
      
      if (!mainDie) throw new Error(lang === "es" ? "El JSON no contiene datos de dados válidos" : "JSON does not contain valid dice data");

      if (isPack) {
        setPackItems(data.map((d: any, idx: number) => ({
          name: d.name || `Die ${idx + 1}`,
          type: d.type || "D6",
          color: d.color || "#3b82f6"
        })));
      } else {
        setPackItems([]);
      }

      // Extraer imágenes del ZIP
      const images: {[path: string]: Blob} = {};
      const previews: {[path: string]: string} = {};
      
      const imagesPrefix = baseDir + "images/";
      const imageEntries = Object.keys(content.files).filter(k => k.startsWith(imagesPrefix));
      for (const entry of imageEntries) {
        if (content.files[entry].dir) continue;
        const blob = await content.files[entry].async("blob");
        const name = entry.replace(imagesPrefix, "");
        images[name] = blob;
        previews[name] = URL.createObjectURL(blob);
      }
      setExtractedImages(images);

      setMetadata({
        name: isPack ? selectedFile.name.replace(".dizes", "") : (mainDie.name || selectedFile.name.replace(".dizes", "")),
        tags: isPack ? selectedFile.name.replace(".dizes", "") : (mainDie.type || "Die"),
        description: "",
        color: mainDie.color || "#3b82f6",
        type: isPack ? "PACK" : (mainDie.type || "D6"),
        isPublished: true
      });

      if (mainDie.faceContent) {
        setFaces(mainDie.faceContent.map((c: string, i: number) => {
          let content = c;
          // Si el contenido es una referencia a imagen local, usamos la preview
          if (c.startsWith("file://")) {
            const imgName = c.substring(c.lastIndexOf("/") + 1);
            if (previews[imgName]) content = previews[imgName];
          }
          return {
            content: content,
            originalContent: c,
            type: mainDie.faceContentTypes?.[i] || 'NUMBERS',
            color: mainDie.faceColors?.[i] || mainDie.color,
            textColor: mainDie.faceContentColors?.[i] || mainDie.textColor
          };
        }));
      }
      
      setFile(selectedFile);
      setStatus("success");
    } catch (err: any) {
      console.error("Validation error:", err);
      setStatus("error");
      setErrorMsg(`${dict.errorNoData} (Detail: ${err.message || 'unknown error'})`);
    }
  };

  const compressToB64 = async (jsonStr: string) => {
    const blob = new Blob([jsonStr]);
    const stream = blob.stream().pipeThrough(new CompressionStream("gzip"));
    const compressed = await new Response(stream).arrayBuffer();
    const uint8 = new Uint8Array(compressed);
    let binary = "";
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    return btoa(binary);
  };

  const handleUpload = async () => {
    if (status === "uploading") return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setStatus("error");
      setErrorMsg(lang === "es" ? "Debes iniciar sesión para publicar" : "You must be signed in to publish");
      return;
    }

    setStatus("uploading");
    try {
      const { data: profile } = await supabase.from("profiles").select("username, is_trusted, is_admin, max_published").eq("id", session.user.id).single();
      const authorName = profile?.username || session.user.user_metadata?.username || session.user.email?.split("@")[0] || "User";
      
      // Quota check
      if (metadata.isPublished && !profile?.is_admin) {
        const { count } = await supabase.from("dice_packs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id)
          .is("deleted_at", null)
          .eq("is_published", true);
          
        const maxPublished = profile?.max_published ?? 30;
        if ((count || 0) >= maxPublished) {
          throw new Error(lang === "es" ? `Límite de ${maxPublished} dados alcanzado.` : `Limit of ${maxPublished} dice reached.`);
        }
      }

      const moderationStatus = (profile?.is_trusted || profile?.is_admin) ? "approved" : "pending";

      let fileUrl = "";
      let shareCode = activeTab === "code" ? rawCode : null;
      let inserts: any[] = [];
      let isArr = false;
      let items: any[] = [];

      if (activeTab === "file" && file) {
        const timestamp = Date.now();
        const uploadedImages: {[path: string]: string} = {};

        for (const [name, blob] of Object.entries(extractedImages)) {
          const path = `assets/${timestamp}_${name}`;
          const { error: imgError } = await supabase.storage.from("dice-files").upload(path, blob);
          if (!imgError) {
            const { data: urlData } = supabase.storage.from("dice-files").getPublicUrl(path);
            uploadedImages[name] = urlData.publicUrl;
          }
        }

        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        const dataFile = zipContent.file(/.*\.json$/)[0];
        if (dataFile) {
          const jsonStr = await dataFile.async("string");
          let diceData = JSON.parse(jsonStr);
          isArr = Array.isArray(diceData);
          items = isArr ? diceData : [diceData];

          items.forEach((d: any, idx: number) => {
            if (isArr && packItems[idx]) {
              d.name = packItems[idx].name;
            }
            if (d.faceContent) {
              d.faceContent = d.faceContent.map((c: string) => {
                if (c.startsWith("file://")) {
                  const name = c.substring(c.lastIndexOf("/") + 1);
                  return uploadedImages[name] || c;
                }
                return c;
              });
            }
            if (d.faceSecondaryContent) {
              d.faceSecondaryContent = d.faceSecondaryContent.map((c: string) => {
                if (c.startsWith("file://")) {
                  const name = c.substring(c.lastIndexOf("/") + 1);
                  return uploadedImages[name] || c;
                }
                return c;
              });
            }
          });

          const updatedJson = JSON.stringify(isArr ? items : items[0]);
          shareCode = await compressToB64(updatedJson);
        }

        const fileName = `packs/${timestamp}_${file.name}`;
        const { error: storageError } = await supabase.storage.from("dice-files").upload(fileName, file);
        if (storageError) throw storageError;
        const { data: urlData } = supabase.storage.from("dice-files").getPublicUrl(fileName);
        fileUrl = urlData.publicUrl || "";
      } else if (activeTab === "code") {
         const jsonStr = await decodeBase64Gzip(rawCode);
         const decoded = JSON.parse(jsonStr);
         isArr = Array.isArray(decoded);
         items = isArr ? decoded : [decoded];
         items.forEach((d: any, idx: number) => {
            if (isArr && packItems[idx]) d.name = packItems[idx].name;
         });
         shareCode = await compressToB64(JSON.stringify(isArr ? items : items[0]));
      }

      // Determine the correct preview face content (ensure it's the uploaded URL if it was a local file)
      let finalPreviewFace = faces[selectedFaceIdx]?.originalContent || faces[selectedFaceIdx]?.content || "";
      if (finalPreviewFace.startsWith("file://") || finalPreviewFace.startsWith("blob:")) {
        const name = finalPreviewFace.substring(finalPreviewFace.lastIndexOf("/") + 1);
        finalPreviewFace = uploadedImages[name] || finalPreviewFace;
      }

      inserts.push({
        name: metadata.name,
        author: authorName,
        user_id: session.user.id,
        tags: [metadata.tags, `_pfc:${faces[selectedFaceIdx]?.textColor || "#ffffff"}`],
        type: metadata.type,
        color: metadata.color,
        file_url: fileUrl || "",
        share_code: shareCode,
        preview_face: finalPreviewFace,
        is_published: metadata.isPublished,
        status: moderationStatus
      });

      if (isArr && items.length > 1) {
        for (let i = 0; i < items.length; i++) {
          const die = items[i];
          const dieShareCode = await compressToB64(JSON.stringify(die));
          inserts.push({
            name: die.name || `Die ${i+1}`,
            author: authorName,
            user_id: session.user.id,
            tags: [metadata.name], // Tagged with pack name
            type: die.type || "D6",
            color: die.color || "#3b82f6",
            file_url: "",
            share_code: dieShareCode,
            preview_face: die.faceContent ? die.faceContent[0] : "",
            is_published: metadata.isPublished,
            status: moderationStatus
          });
        }
      }

      const cleanInserts = inserts.map(item => ({
        ...item,
        file_url: item.file_url || "",
        preview_face: item.preview_face || ""
      }));

      const { error: dbError } = await supabase.from("dice_packs").insert(cleanInserts);

      if (dbError) throw dbError;
      setStatus("success");
      setTimeout(() => { onClose(); window.location.reload(); }, 1500);
    } catch (err: any) {
      console.error("Upload Error:", err);
      setStatus("error");
      setErrorMsg(`Error al publicar: ${err.message || JSON.stringify(err)}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
            
            {/* Status Overlay */}
            <AnimatePresence>
              {(status === "uploading" || status === "validating") && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[101] bg-zinc-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-blue-500/20 animate-ping rounded-[2rem]" />
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin relative z-10" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter italic">
                    {status === "uploading" ? (lang === "es" ? "SUBIENDO..." : "UPLOADING...") : (lang === "es" ? "VALIDANDO..." : "VALIDATING...")}
                  </h3>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest opacity-60">
                    {status === "uploading" ? (lang === "es" ? "Preparando tus dados para la comunidad" : "Preparing your dice for the community") : (lang === "es" ? "Comprobando integridad del archivo" : "Checking file integrity")}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tighter uppercase">{status === "success" ? (lang === "es" ? "CONFIRMAR" : "CONFIRM") : dict.title}</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>

            {status === "idle" || status === "error" ? (
              <>
                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 mb-6">
                  <button onClick={() => { setActiveTab("file"); setStatus("idle"); }} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === "file" ? "bg-white text-black" : "text-zinc-500"}`}>
                    {lang === "es" ? "ARCHIVO" : "FILE"}
                  </button>
                  <button onClick={() => { setActiveTab("code"); setStatus("idle"); }} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === "code" ? "bg-white text-black" : "text-zinc-500"}`}>
                    {lang === "es" ? "CÓDIGO" : "CODE"}
                  </button>
                </div>

                {activeTab === "file" ? (
                  <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); validateFile(e.dataTransfer.files[0]); }} className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer ${status === "error" ? "border-red-500/50" : "border-zinc-800 hover:border-blue-500/50"}`} onClick={() => document.getElementById("fileInput")?.click()}>
                    <input id="fileInput" type="file" className="hidden" accept=".dizes" onChange={e => { if (e.target.files?.[0]) validateFile(e.target.files[0]); }} />
                    <Upload className="w-8 h-8 text-blue-500 mx-auto mb-4" />
                    <p className="font-bold text-xs text-zinc-400">{status === "error" ? errorMsg : dict.dropZone}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea 
                      className="w-full bg-black/40 border border-zinc-800 rounded-2xl p-4 text-[10px] font-mono h-32 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder={lang === "es" ? "Pega el código aquí..." : "Paste code here..."}
                      onChange={(e) => validateCode(e.target.value)}
                    />
                    {status === "error" && <p className="text-red-500 text-[10px] font-bold ml-2">{errorMsg}</p>}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-xl font-black text-white shadow-xl relative overflow-hidden" style={{ backgroundColor: faces[selectedFaceIdx]?.color || metadata.color }}>
                    {faces[selectedFaceIdx] ? (
                      faces[selectedFaceIdx].content.includes("<svg") ? (
                        <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: faces[selectedFaceIdx].content }} />
                      ) : faces[selectedFaceIdx].content.startsWith("blob:") || faces[selectedFaceIdx].content.startsWith("http") || faces[selectedFaceIdx].content.startsWith("data:") ? (
                        <img src={faces[selectedFaceIdx].content} alt="Face" className="w-full h-full object-cover" />
                      ) : (
                        <span style={{ color: faces[selectedFaceIdx].textColor || "#fff" }}>{faces[selectedFaceIdx].content}</span>
                      )
                    ) : metadata.type.replace("D", "")}
                  </div>
                  
                  <div className="w-full mb-4">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase ml-2 mb-2 block">{lang === "es" ? "Selecciona cara de referencia" : "Select reference face"}</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {faces.map((face, i) => (
                        <button 
                          key={i}
                          onClick={() => setSelectedFaceIdx(i)}
                          className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black border-2 transition-all overflow-hidden ${selectedFaceIdx === i ? "border-blue-500 scale-110 shadow-lg" : "border-white/5 opacity-50"}`}
                          style={{ backgroundColor: face.color || metadata.color }}
                        >
                          {face.content.includes("<svg") ? (
                            <div className="w-6 h-6 pointer-events-none" dangerouslySetInnerHTML={{ __html: face.content }} />
                          ) : face.content.startsWith("blob:") || face.content.startsWith("http") || face.content.startsWith("data:") ? (
                            <img src={face.content} alt="Face" className="w-full h-full object-cover" />
                          ) : (
                            <span style={{ color: face.textColor || "#fff" }}>{face.content}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="w-full text-left space-y-3">
                    <div>
                      <label className="text-[10px] text-zinc-500 font-bold uppercase ml-2">{lang === "es" ? "Nombre del Dado/Pack" : "Dice/Pack Name"}</label>
                      <input 
                        type="text" 
                        value={metadata.name}
                        onChange={(e) => setMetadata({...metadata, name: e.target.value})}
                        className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-2 mt-1 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 font-bold uppercase ml-2">{lang === "es" ? "Juego / Categoría" : "Game / Category"}</label>
                      <input 
                        type="text" 
                        value={metadata.tags}
                        onChange={(e) => setMetadata({...metadata, tags: e.target.value})}
                        className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-2 mt-1 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div className="flex items-center justify-between bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 !mt-6">
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-black uppercase tracking-tight">{lang === "es" ? "Publicar en Comunidad" : "Publish to Community"}</span>
                        <span className="text-[8px] text-zinc-500 font-bold uppercase">{lang === "es" ? "Visible para otros usuarios" : "Visible to other users"}</span>
                      </div>
                      <button 
                        onClick={() => setMetadata({...metadata, isPublished: !metadata.isPublished})}
                        className={`w-10 h-6 rounded-full relative transition-all ${metadata.isPublished ? "bg-blue-600" : "bg-zinc-700"}`}
                      >
                        <motion.div 
                          animate={{ x: metadata.isPublished ? 20 : 4 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="w-3 h-3 bg-white rounded-full absolute top-1.5 shadow-sm"
                        />
                      </button>
                    </div>

                    {packItems.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase ml-2 mb-2 block">{lang === "es" ? "Dados en este pack (Opcional)" : "Dice in this pack (Optional)"}</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide pr-2">
                          {packItems.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center text-[10px] font-black border border-white/10" style={{ backgroundColor: item.color }}>{item.type.replace("D", "")}</div>
                              <input 
                                type="text"
                                value={item.name}
                                onChange={e => {
                                  const newItems = [...packItems];
                                  newItems[idx].name = e.target.value;
                                  setPackItems(newItems);
                                }}
                                placeholder={lang === "es" ? "Nombre del dado" : "Die name"}
                                className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-blue-500 transition-colors"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => { setFile(null); setRawCode(""); setStatus("idle"); }} className="flex-1 py-4 rounded-2xl bg-zinc-800 font-bold text-xs uppercase tracking-widest">{dict.cancel}</button>
                  <button 
                    disabled={status === "uploading"}
                    onClick={handleUpload} 
                    className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest brand-gradient shadow-xl flex items-center justify-center gap-3 transition-all ${status === "uploading" ? "opacity-50 cursor-not-allowed" : "hover:brightness-110 active:scale-95"}`}
                  >
                    {status === "uploading" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {lang === "es" ? "Publicando..." : "Publishing..."}
                      </>
                    ) : (
                      dict.publish
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
