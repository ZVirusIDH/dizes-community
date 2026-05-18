"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { 
  Dice6, Languages, ChevronLeft, ShieldCheck, 
  Database, Lock, FileText, Mail, EyeOff 
} from "lucide-react";

type Language = "es" | "en";

export default function PrivacyPolicy() {
  const [lang, setLang] = useState<Language>("es");

  return (
    <div className="flex flex-col min-h-screen bg-[#060607] text-white font-sans antialiased selection:bg-blue-600/30">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header / Navbar */}
      <nav className="glass sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-white/5">
        <a 
          href="/" 
          className="flex items-center gap-2 group text-zinc-400 hover:text-white transition-colors py-1.5 px-3 rounded-xl hover:bg-white/5"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {lang === "es" ? "Volver" : "Back"}
          </span>
        </a>

        <div className="flex items-center gap-3">
          <div className="w-7 h-7 brand-gradient rounded-lg flex items-center justify-center">
            <Dice6 className="text-white w-4 h-4" />
          </div>
          <span className="font-black text-sm tracking-tighter">
            Dizes <span className="text-blue-500">Community</span>
          </span>
        </div>

        <button 
          onClick={() => setLang(lang === "es" ? "en" : "es")} 
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 hover:bg-white/5 text-zinc-400 hover:text-white transition-all active:scale-95 text-[10px] font-black uppercase tracking-wider"
        >
          <Languages className="w-3.5 h-3.5 text-blue-500" />
          <span>{lang === "es" ? "English" : "Español"}</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-4 py-12 w-full max-w-3xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-500 mb-2">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              {lang === "es" ? (
                <>
                  Política de <span className="text-gradient">Privacidad</span>
                </>
              ) : (
                <>
                  Privacy <span className="text-gradient">Policy</span>
                </>
              )}
            </h1>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              {lang === "es" 
                ? "Última actualización: 25 de Abril, 2026" 
                : "Last updated: April 25, 2026"
              }
            </p>
          </div>

          {/* Intro Card */}
          <div className="glass rounded-[2rem] p-6 border border-white/5 space-y-4">
            <p className="text-zinc-300 text-sm leading-relaxed font-medium">
              {lang === "es" ? (
                <>
                  Dizes (<strong>&quot;nosotros&quot;</strong>, <strong>&quot;nuestro&quot;</strong>) se compromete a proteger su privacidad. Esta Política de Privacidad explica cómo manejamos la información cuando utiliza la aplicación móvil Dizes.
                </>
              ) : (
                <>
                  Dizes (<strong>&quot;we&quot;</strong>, <strong>&quot;our&quot;</strong>, or <strong>&quot;us&quot;</strong>) is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use the Dizes mobile application.
                </>
              )}
            </p>
          </div>

          {/* Privacy Points */}
          <div className="space-y-6">
            {/* Section 1 */}
            <div className="glass rounded-[2rem] p-6 border border-white/5 space-y-4 hover:border-blue-500/20 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black uppercase tracking-wider">
                  {lang === "es" ? "1. Recopilación y uso de información" : "1. Information Collection and Use"}
                </h2>
              </div>
              <div className="space-y-3 pl-1">
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {lang === "es" ? (
                    <>
                      Dizes está diseñada para ser una aplicación <strong>100% offline</strong> (sin conexión) y <strong>privada</strong>.
                    </>
                  ) : (
                    <>
                      Dizes is designed to be a <strong>100% offline</strong> and <strong>private</strong> application.
                    </>
                  )}
                </p>
                <ul className="space-y-2 text-zinc-300 text-sm leading-relaxed list-none">
                  <li className="flex items-start gap-2.5">
                    <span className="text-blue-500 mt-1 shrink-0">•</span>
                    <span>
                      <strong>{lang === "es" ? "Datos personales:" : "Personal Data:"}</strong>{" "}
                      {lang === "es" 
                        ? "NO recopilamos, almacenamos ni transmitimos ninguna información de identificación personal (PII)."
                        : "We do NOT collect, store, or transmit any personally identifiable information (PII)."
                      }
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-blue-500 mt-1 shrink-0">•</span>
                    <span>
                      <strong>{lang === "es" ? "Datos de uso:" : "Usage Data:"}</strong>{" "}
                      {lang === "es"
                        ? "NO recopilamos análisis, informes de errores ni ninguna información sobre cómo utiliza la aplicación."
                        : "We do NOT collect analytics, crash reports, or any information about how you use the app."
                      }
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-blue-500 mt-1 shrink-0">•</span>
                    <span>
                      <strong>{lang === "es" ? "Acceso de terceros:" : "Third-Party Access:"}</strong>{" "}
                      {lang === "es"
                        ? "NO compartimos ningún dato con terceros porque no recopilamos ningún dato en primer lugar."
                        : "We do NOT share any data with third parties because we do not collect any data in the first place."
                      }
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 2 */}
            <div className="glass rounded-[2rem] p-6 border border-white/5 space-y-4 hover:border-blue-500/20 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black uppercase tracking-wider">
                  {lang === "es" ? "2. Almacenamiento" : "2. Storage"}
                </h2>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed pl-1">
                {lang === "es" ? (
                  <>
                    Todos sus datos (diseños de dados personalizados, favoritos, carpetas e historial) se almacenan <strong>localmente en su dispositivo</strong>. Si desinstala la aplicación, estos datos se eliminarán a menos que haya realizado una copia de seguridad manual de su configuración.
                  </>
                ) : (
                  <>
                    All your data (custom dice designs, favorites, folders, and history) is stored <strong>locally on your device</strong>. If you uninstall the application, this data will be deleted unless you have made a manual backup of your configuration.
                  </>
                )}
              </p>
            </div>

            {/* Section 3 */}
            <div className="glass rounded-[2rem] p-6 border border-white/5 space-y-4 hover:border-blue-500/20 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <EyeOff className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black uppercase tracking-wider">
                  {lang === "es" ? "3. Permisos" : "3. Permissions"}
                </h2>
              </div>
              <div className="space-y-2 text-zinc-300 text-sm leading-relaxed pl-1">
                <p>
                  {lang === "es" 
                    ? "Dizes puede solicitar los siguientes permisos:"
                    : "Dizes may request the following permissions:"
                  }
                </p>
                <div className="flex items-start gap-2.5 mt-2 bg-black/20 p-3.5 rounded-2xl border border-white/[0.03]">
                  <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                  <span>
                    <strong>{lang === "es" ? "Almacenamiento/Galería:" : "Storage/Gallery:"}</strong>{" "}
                    {lang === "es"
                      ? "Solo para permitirle importar sus propios iconos PNG/SVG a la aplicación. NO accedemos a ningún otro archivo en su dispositivo."
                      : "Only to allow you to import your own PNG/SVG icons into the application. We do NOT access any other files on your device."
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="glass rounded-[2rem] p-6 border border-white/5 space-y-4 hover:border-blue-500/20 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black uppercase tracking-wider">
                  {lang === "es" ? "4. Privacidad infantil" : "4. Children's Privacy"}
                </h2>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed pl-1">
                {lang === "es" ? (
                  <>
                    Dado que no recopilamos ningún dato, Dizes es segura para usuarios de todas las edades.
                  </>
                ) : (
                  <>
                    Since we do not collect any data, Dizes is safe for users of all ages.
                  </>
                )}
              </p>
            </div>

            {/* Section 5 */}
            <div className="glass rounded-[2rem] p-6 border border-white/5 space-y-4 hover:border-blue-500/20 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black uppercase tracking-wider">
                  {lang === "es" ? "5. Cambios en esta política" : "5. Changes to This Policy"}
                </h2>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed pl-1">
                {lang === "es" ? (
                  <>
                    Podemos actualizar nuestra Política de Privacidad de vez en cuando. Dado que no disponemos de su información de contacto, le recomendamos que revise la política dentro de la aplicación o en nuestra página de la tienda.
                  </>
                ) : (
                  <>
                    We may update our Privacy Policy from time to time. Since we do not have your contact information, we encourage you to review the policy within the app or on our store page.
                  </>
                )}
              </p>
            </div>

            {/* Section 6 */}
            <div className="glass rounded-[2rem] p-6 border border-white/5 space-y-4 hover:border-blue-500/20 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black uppercase tracking-wider">
                  {lang === "es" ? "6. Contacto" : "6. Contact Us"}
                </h2>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed pl-1">
                {lang === "es" ? (
                  <>
                    Si tiene alguna pregunta sobre esta Política de Privacidad, puede ponerse en contacto con el desarrollador (ZVirus) a través de los enlaces de contacto proporcionados dentro de la aplicación o a través de la comunidad web.
                  </>
                ) : (
                  <>
                    If you have any questions about this Privacy Policy, you can contact the developer (ZVirus) through the contact links provided within the application or via the web community.
                  </>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-zinc-500 text-[10px] font-bold">
        <p>© 2026 Dizes Community. {lang === "es" ? "Todos los derechos reservados." : "All rights reserved."}</p>
      </footer>
    </div>
  );
}
