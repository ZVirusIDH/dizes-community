const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/ruben/.gemini/antigravity/scratch/dizes-community/src/components/UploadModal.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add packItems state
content = content.replace(
  'const [metadata, setMetadata] = useState({ name: "", tags: "", description: "", color: "#3b82f6", type: "D6" });',
  'const [metadata, setMetadata] = useState({ name: "", tags: "", description: "", color: "#3b82f6", type: "D6" });\n  const [packItems, setPackItems] = useState<{name: string, type: string, color: string}[]>([]);'
);

// 2. validateCode: populate packItems
content = content.replace(
  'const mainDie = isPack ? decoded[0] : decoded;',
  'const mainDie = isPack ? decoded[0] : decoded;\n        \n        if (isPack) {\n          setPackItems(decoded.map((d: any, idx: number) => ({\n            name: d.name || `Die ${idx + 1}`,\n            type: d.type || "D6",\n            color: d.color || "#3b82f6"\n          })));\n        } else {\n          setPackItems([]);\n        }'
);

// 3. validateFile: populate packItems
content = content.replace(
  'const mainDie = isPack ? data[0] : data;',
  'const mainDie = isPack ? data[0] : data;\n\n      if (isPack) {\n        setPackItems(data.map((d: any, idx: number) => ({\n          name: d.name || `Die ${idx + 1}`,\n          type: d.type || "D6",\n          color: d.color || "#3b82f6"\n        })));\n      } else {\n        setPackItems([]);\n      }'
);

// 4. compressToB64 helper
content = content.replace(
  'const handleUpload = async () => {',
  'const compressToB64 = async (jsonStr: string) => {\n    const blob = new Blob([jsonStr]);\n    const stream = blob.stream().pipeThrough(new CompressionStream("gzip"));\n    const compressed = await new Response(stream).arrayBuffer();\n    const uint8 = new Uint8Array(compressed);\n    let binary = "";\n    for (let i = 0; i < uint8.length; i++) {\n      binary += String.fromCharCode(uint8[i]);\n    }\n    return btoa(binary);\n  };\n\n  const handleUpload = async () => {'
);

// 5. Modify handleUpload file processing block
const oldUploadBlock = `      let fileUrl = "";
      let shareCode = activeTab === "code" ? rawCode : null;

      // Si es un archivo .dizes, subimos imágenes y el archivo
      if (activeTab === "file" && file) {
        const timestamp = Date.now();
        const uploadedImages: {[path: string]: string} = {};

        // Subir cada imagen extraída a Supabase Storage
        for (const [name, blob] of Object.entries(extractedImages)) {
          const path = \`assets/\${timestamp}_\${name}\`;
          const { error: imgError } = await supabase.storage.from("dice-files").upload(path, blob);
          if (!imgError) {
            const { data: urlData } = supabase.storage.from("dice-files").getPublicUrl(path);
            uploadedImages[name] = urlData.publicUrl;
          }
        }

        // Leer el JSON original del archivo para actualizar las URLs
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        const dataFile = zipContent.file("data.json") || zipContent.file("config.json");
        if (dataFile) {
          const jsonStr = await dataFile.async("string");
          let diceData = JSON.parse(jsonStr);
          const isArr = Array.isArray(diceData);
          const items = isArr ? diceData : [diceData];

          // Actualizar URLs de imágenes locales a URLs públicas de Supabase
          items.forEach((d: any) => {
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

          // Generar nuevo share_code comprimido con las URLs públicas
          const updatedJson = JSON.stringify(isArr ? items : items[0]);
          const blob = new Blob([updatedJson]);
          // @ts-ignore
          const stream = blob.stream().pipeThrough(new CompressionStream("gzip"));
          const compressed = await new Response(stream).arrayBuffer();
          
          // Optimized binary to base64 to avoid stack overflow
          const uint8 = new Uint8Array(compressed);
          let binary = "";
          for (let i = 0; i < uint8.length; i++) {
            binary += String.fromCharCode(uint8[i]);
          }
          shareCode = btoa(binary);
        }

        const fileName = \`packs/\${timestamp}_\${file.name}\`;
        const { data: storageData, error: storageError } = await supabase.storage.from("dice-files").upload(fileName, file);
        if (storageError) throw storageError;
        const { data: urlData } = supabase.storage.from("dice-files").getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
      }

      const { error: dbError } = await supabase.from("dice_packs").insert([{
        name: metadata.name,
        author: authorName,
        user_id: session.user.id,
        tags: [metadata.tags],
        type: metadata.type,
        color: metadata.color,
        file_url: fileUrl,
        share_code: shareCode,
        preview_face: faces[selectedFaceIdx]?.originalContent || faces[selectedFaceIdx]?.content || null
      }]);`;

const newUploadBlock = `      let fileUrl = "";
      let shareCode = activeTab === "code" ? rawCode : null;
      let inserts: any[] = [];
      let isArr = false;
      let items: any[] = [];

      if (activeTab === "file" && file) {
        const timestamp = Date.now();
        const uploadedImages: {[path: string]: string} = {};

        for (const [name, blob] of Object.entries(extractedImages)) {
          const path = \`assets/\${timestamp}_\${name}\`;
          const { error: imgError } = await supabase.storage.from("dice-files").upload(path, blob);
          if (!imgError) {
            const { data: urlData } = supabase.storage.from("dice-files").getPublicUrl(path);
            uploadedImages[name] = urlData.publicUrl;
          }
        }

        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        const dataFile = zipContent.file("data.json") || zipContent.file("config.json");
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

        const fileName = \`packs/\${timestamp}_\${file.name}\`;
        const { error: storageError } = await supabase.storage.from("dice-files").upload(fileName, file);
        if (storageError) throw storageError;
        const { data: urlData } = supabase.storage.from("dice-files").getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
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

      // Add main pack/die
      inserts.push({
        name: metadata.name,
        author: authorName,
        user_id: session.user.id,
        tags: [metadata.tags],
        type: metadata.type,
        color: metadata.color,
        file_url: fileUrl,
        share_code: shareCode,
        preview_face: faces[selectedFaceIdx]?.originalContent || faces[selectedFaceIdx]?.content || null
      });

      // Add individual dice from pack
      if (isArr && items.length > 1) {
        for (let i = 0; i < items.length; i++) {
          const die = items[i];
          const dieShareCode = await compressToB64(JSON.stringify(die));
          inserts.push({
            name: die.name || \`Die \${i+1}\`,
            author: authorName,
            user_id: session.user.id,
            tags: [metadata.name], // Tagged with pack name
            type: die.type || "D6",
            color: die.color || "#3b82f6",
            file_url: null,
            share_code: dieShareCode,
            preview_face: die.faceContent ? die.faceContent[0] : null
          });
        }
      }

      const { error: dbError } = await supabase.from("dice_packs").insert(inserts);`;

content = content.replace(oldUploadBlock, newUploadBlock);

// 6. UI for packItems
const oldUIBlock = `                    <div>
                      <label className="text-[10px] text-zinc-500 font-bold uppercase ml-2">{lang === "es" ? "Juego / Categoría" : "Game / Category"}</label>
                      <input 
                        type="text" 
                        value={metadata.tags}
                        onChange={(e) => setMetadata({...metadata, tags: e.target.value})}
                        className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-2 mt-1 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>`;

const newUIBlock = `                    <div>
                      <label className="text-[10px] text-zinc-500 font-bold uppercase ml-2">{lang === "es" ? "Juego / Categoría" : "Game / Category"}</label>
                      <input 
                        type="text" 
                        value={metadata.tags}
                        onChange={(e) => setMetadata({...metadata, tags: e.target.value})}
                        className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-2 mt-1 text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
                      />
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
                  </div>`;

content = content.replace(oldUIBlock, newUIBlock);

fs.writeFileSync(filePath, content);
console.log('Update complete');
