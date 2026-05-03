"use client";

import { useState, useEffect } from "react";
import { X, Download, Copy, CheckCircle2, Loader2, Package, Dice6 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";

interface DiceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pack: any | null;
  lang: "es" | "en";
}

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

export default function DiceViewerModal({ isOpen, onClose, pack, lang }: DiceViewerModalProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen || !pack) return;
    loadData();
    // Cleanup object URLs on unmount or pack change
    return () => {
      Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [isOpen, pack]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (pack.share_code) {
        const jsonStr = await decodeBase64Gzip(pack.share_code);
        const parsed = JSON.parse(jsonStr);
        setData(Array.isArray(parsed) ? parsed : [parsed]);
      } else if (pack.file_url) {
        const response = await fetch(pack.file_url);
        const blob = await response.blob();
        const zip = new JSZip();
        const content = await zip.loadAsync(blob);
        const dataFile = content.file("data.json") || content.file("config.json");
        if (dataFile) {
          const jsonStr = await dataFile.async("string");
          const parsed = JSON.parse(jsonStr);
          setData(Array.isArray(parsed) ? parsed : [parsed]);

          // Extract images from the 'images/' folder
          const newImageUrls: Record<string, string> = {};
          const files = Object.keys(content.files);
          for (const path of files) {
            if (path.startsWith("images/") && !content.files[path].dir) {
              const fileName = path.split('/').pop();
              if (fileName) {
                const fileBlob = await content.files[path].async("blob");
                newImageUrls[fileName] = URL.createObjectURL(fileBlob);
              }
            }
          }
          setImageUrls(newImageUrls);
        }
      }
    } catch (e) {
      console.error("Failed to load dice data:", e);
    }
    setLoading(false);
  };

  const copyCode = () => {
    if (pack?.share_code) {
      navigator.clipboard.writeText(pack.share_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !pack) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-zinc-900 border border-zinc-800 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
          
          <div className="p-6 md:p-8 flex items-start justify-between border-b border-white/5 bg-black/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-xl" style={{ backgroundColor: pack.color }}>
                {pack.type === 'PACK' ? <Package className="w-7 h-7" /> : pack.type.replace("D", "")}
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">{pack.name}</h2>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-xs font-bold text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">@{pack.author}</span>
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase">{pack.type}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                <p className="font-bold text-sm uppercase tracking-widest">{lang === 'es' ? 'Cargando dados...' : 'Loading dice...'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.map((die, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/5 rounded-3xl p-6">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white" style={{ backgroundColor: die.color || pack.color }}>
                        {die.type.replace("D", "")}
                      </div>
                      <div>
                        <h3 className="font-black text-lg">{die.name}</h3>
                        <p className="text-xs text-zinc-500 font-bold">{die.type} • {die.faceContent?.length || 0} {lang === 'es' ? 'caras' : 'faces'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {die.faceContent?.map((mainContent: string, fIdx: number) => {
                        const secContent = die.faceSecondaryContent?.[fIdx] || "";
                        const scale = die.faceScales?.[fIdx] ?? 1.0;
                        const iconX = die.faceIconOffsetX?.[fIdx] ?? 0;
                        const iconY = die.faceIconOffsetY?.[fIdx] ?? 0;
                        const textS = die.faceTextScales?.[fIdx] ?? 1.0;
                        const textX = die.faceTextOffsetX?.[fIdx] ?? 0;
                        const textY = die.faceTextOffsetY?.[fIdx] ?? 0;
                        
                        // Colors
                        const faceBg = die.faceColors?.[fIdx] || die.color || "#27272a";
                        const faceTint = die.faceContentColors?.[fIdx] || die.textColor || "#ffffff";
                        const skipTint = die.faceSkipTinting?.[fIdx] === true;
                        
                        const renderContent = (content: string, isSec: boolean = false) => {
                          if (!content) return null;
                          const trimmed = content.trim();
                          const isSvg = trimmed.includes("<svg");
                          const isFile = trimmed.startsWith("file://");
                          const isAsset = trimmed.startsWith("asset:");
                          const fileName = isFile ? trimmed.replace("file://", "") : "";
                          
                          const faceType = die.faceContentTypes?.[fIdx] || 'NUMBERS';
                          const isIcon = isSvg || isFile || isAsset;
                          
                          // Match Android scaling factors relative to 120px base
                          let baseSize = 120;
                          if (isIcon) {
                             if (faceType === 'ICON_NUMBER') baseSize = 56; // ~0.47 * 120
                             else baseSize = 78; // ~0.65 * 120
                          }

                          const tX = isIcon ? iconX : textX;
                          const tY = isIcon ? iconY : textY;
                          const s = (isIcon ? scale : textS);
                          
                          // Use absolute positioning with transform for the 120px virtual space
                          const transform = `translate(${tX}px, ${tY}px) scale(${s})`;
                          
                          const effectiveColor = skipTint ? "currentColor" : faceTint;
                          
                          const renderImage = (url: string) => {
                            if (skipTint) {
                              return <img src={url} alt="Asset" className="w-full h-full object-contain" />;
                            }
                            return <div 
                              className="w-full h-full"
                              style={{ 
                                backgroundColor: effectiveColor,
                                maskImage: `url('${url}')`,
                                WebkitMaskImage: `url('${url}')`,
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                WebkitMaskPosition: 'center'
                              }} 
                            />;
                          };

                          if (isIcon) {
                            let url = "";
                            if (isSvg) url = `data:image/svg+xml;utf8,${encodeURIComponent(content)}`;
                            else if (isFile) url = imageUrls[fileName] || "";
                            else if (isAsset) url = `/${trimmed.replace("asset:", "")}`;

                            return (
                              <div 
                                className="absolute inset-0 flex items-center justify-center pointer-events-none" 
                                style={{ transform }}
                              >
                                <div style={{ width: baseSize, height: baseSize }} className="flex items-center justify-center">
                                  {url ? renderImage(url) : (isFile ? <span className="text-[8px] text-zinc-500">Image</span> : null)}
                                </div>
                              </div>
                            );
                          }

                          // Text rendering
                          const baseFontSize = faceType === 'ICON_NUMBER' ? 16 : 54;
                          return (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform }}>
                              <span 
                                className="font-black truncate max-w-full px-1 text-center leading-tight" 
                                style={{ 
                                  color: faceTint, 
                                  fontSize: `${baseFontSize}px` 
                                }}
                              >
                                {content}
                              </span>
                            </div>
                          );
                        };

                        return (
                          <div key={fIdx} className="aspect-square rounded-2xl flex items-center justify-center relative group p-1 shadow-inner overflow-hidden" style={{ backgroundColor: faceBg }}>
                            <span className="absolute top-1 left-1.5 text-[7px] font-black mix-blend-difference text-white/40 z-10">{fIdx + 1}</span>
                            
                            {/* Virtual 120px container to match Android coordinates */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-[120px] h-[120px] relative shrink-0" style={{ transform: 'scale(0.66)' }}> {/* scale(0.66) to fit approx 80px face */}
                                {renderContent(mainContent)}
                                {secContent && renderContent(secContent, true)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 bg-black/40 border-t border-white/5 flex gap-4">
            {pack.file_url && (
              <a href={pack.file_url} download className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest text-center transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                {lang === 'es' ? 'Descargar Archivo' : 'Download File'}
              </a>
            )}
            {pack.share_code && (
              <button onClick={copyCode} className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? (lang === 'es' ? 'Copiado!' : 'Copied!') : (lang === 'es' ? 'Copiar Código' : 'Copy Code')}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
