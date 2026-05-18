"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Database, Lock, FileText, Mail, 
  EyeOff, Languages, Gem, Zap, Cpu 
} from "lucide-react";

type Language = "es" | "en";

export default function LumiMinePrivacy() {
  const [lang, setLang] = useState<Language>("es");

  return (
    <div className="flex flex-col min-h-screen bg-[#070b13] text-[#F8FAFC] font-sans antialiased selection:bg-[#00e5ff]/30 relative overflow-hidden">
      {/* Dynamic Laser & Glowing Background Accents */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#00e5ff]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Decorative Cyan Laser Line */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent opacity-80" />

      {/* Navigation / Header */}
      <nav className="sticky top-0 z-50 bg-[#070b13]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#00e5ff] to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)]">
            <Gem className="text-[#070b13] w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight">
              Lumi<span className="text-[#00e5ff]">Mine</span>
            </span>
            <span className="text-[9px] font-bold text-zinc-500 block uppercase tracking-widest -mt-1">
              Puzzle Game
            </span>
          </div>
        </div>

        {/* Language Selector */}
        <button 
          onClick={() => setLang(lang === "es" ? "en" : "es")} 
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-[#00e5ff]/30 hover:bg-[#00e5ff]/5 text-zinc-300 hover:text-white transition-all active:scale-95 text-xs font-bold uppercase tracking-wider shadow-sm"
        >
          <Languages className="w-4 h-4 text-[#00e5ff]" />
          <span>{lang === "es" ? "English" : "Español"}</span>
        </button>
      </nav>

      {/* Main Content Container */}
      <main className="flex-1 px-4 py-16 w-full max-w-3xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-10"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-3xl bg-[#00e5ff]/10 border border-[#00e5ff]/20 text-[#00e5ff] mb-2 shadow-[0_0_30px_rgba(0,229,255,0.15)]">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {lang === "es" ? (
                <>
                  Política de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-blue-400">Privacidad</span>
                </>
              ) : (
                <>
                  Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-blue-400">Policy</span>
                </>
              )}
            </h1>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              {lang === "es" 
                ? "Última actualización: 18 de Mayo, 2026" 
                : "Last updated: May 18, 2026"
              }
            </p>
          </div>

          {/* Intro Card */}
          <div className="bg-[#0e1626]/60 backdrop-blur-md rounded-3xl p-8 border border-white/5 shadow-xl relative overflow-hidden group hover:border-[#00e5ff]/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#00e5ff]/5 to-transparent rounded-bl-full pointer-events-none" />
            <p className="text-zinc-300 text-base leading-relaxed font-medium">
              {lang === "es" ? (
                <>
                  En <strong className="text-white">Zetapp</strong>, representada por Ruben, nos tomamos muy en serio tu privacidad. Esta política de privacidad describe cómo la aplicación móvil <strong className="text-[#00e5ff]">LumiMine</strong> recopila, utiliza y protege tu información.
                </>
              ) : (
                <>
                  At <strong className="text-white">Zetapp</strong>, represented by Ruben, we take your privacy very seriously. This privacy policy describes how the mobile application <strong className="text-[#00e5ff]">LumiMine</strong> collects, uses, and protects your information.
                </>
              )}
            </p>
          </div>

          {/* Privacy Cards List */}
          <div className="space-y-6">
            
            {/* Section 1 */}
            <div className="bg-[#0e1626]/40 backdrop-blur-md rounded-[2rem] p-8 border border-white/5 hover:border-[#00e5ff]/20 transition-all duration-300 shadow-lg space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center text-[#00e5ff] shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                  <Cpu className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wider">
                  {lang === "es" ? "1. Recopilación de Información" : "1. Information Collection"}
                </h2>
              </div>
              
              <div className="space-y-4 text-zinc-300 text-sm leading-relaxed pl-1">
                <p>
                  {lang === "es" ? (
                    <>
                      <strong className="text-[#00e5ff]">LumiMine</strong> es un videojuego de puzzles que se ejecuta completamente de forma local en tu dispositivo móvil. <strong className="text-white">No recopilamos, almacenamos ni transmitimos ninguna información personal</strong> identificable de nuestros usuarios.
                    </>
                  ) : (
                    <>
                      <strong className="text-[#00e5ff]">LumiMine</strong> is a puzzle game that runs completely locally on your mobile device. <strong className="text-white">We do not collect, store, or transmit any personally identifiable information</strong> from our users.
                    </>
                  )}
                </p>
                
                <ul className="space-y-3 mt-4">
                  <li className="flex items-start gap-3 bg-black/20 p-4 rounded-2xl border border-white/[0.02]">
                    <Database className="w-5 h-5 text-[#00e5ff] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">{lang === "es" ? "Datos del Juego:" : "Gameplay Data:"}</strong>{" "}
                      {lang === "es"
                        ? "Toda la información sobre tus partidas, configuraciones personales, niveles completados, puntuaciones más altas y plantillas personalizadas en el Modo Creativo se almacena exclusivamente de forma local en la memoria de tu dispositivo."
                        : "All information regarding your games, personal settings, completed levels, high scores, and custom templates in Creative Mode is stored exclusively locally on your device's memory."
                      }
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-black/20 p-4 rounded-2xl border border-white/[0.02]">
                    <EyeOff className="w-5 h-5 text-[#00e5ff] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">{lang === "es" ? "Información del Dispositivo:" : "Device Information:"}</strong>{" "}
                      {lang === "es"
                        ? "No recopilamos datos técnicos sobre tu dispositivo, dirección IP, identificadores publicitarios ni geolocalización."
                        : "We do not collect technical data about your device, IP address, advertising identifiers, or geolocation."
                      }
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 2 */}
            <div className="bg-[#0e1626]/40 backdrop-blur-md rounded-[2rem] p-8 border border-white/5 hover:border-[#00e5ff]/20 transition-all duration-300 shadow-lg space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center text-[#00e5ff] shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wider">
                  {lang === "es" ? "2. Servicios de Terceros y Publicidad" : "2. Third-Party Services & Ads"}
                </h2>
              </div>
              <div className="space-y-4 text-zinc-300 text-sm leading-relaxed pl-1">
                <p>
                  {lang === "es" ? (
                    <>
                      Para ofrecerte la mejor experiencia de juego, <strong className="text-[#00e5ff]">LumiMine</strong> cumple con los siguientes estándares:
                    </>
                  ) : (
                    <>
                      To provide you with the best gaming experience, <strong className="text-[#00e5ff]">LumiMine</strong> complies with the following standards:
                    </>
                  )}
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 bg-black/20 p-4 rounded-2xl border border-white/[0.02]">
                    <Zap className="w-5 h-5 text-[#00e5ff] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">{lang === "es" ? "Sin Publicidad de Terceros:" : "No Third-Party Ads:"}</strong>{" "}
                      {lang === "es"
                        ? "El juego no contiene anuncios molestos de redes externas, eliminando cualquier rastreador publicitario de tu dispositivo."
                        : "The game does not contain intrusive ads from external networks, removing any advertising trackers from your device."
                      }
                    </span>
                  </li>
                  <li className="flex items-start gap-3 bg-black/20 p-4 rounded-2xl border border-white/[0.02]">
                    <ShieldCheck className="w-5 h-5 text-[#00e5ff] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">{lang === "es" ? "Sin Analíticas ni SDKs de Seguimiento:" : "No Analytics or Tracking SDKs:"}</strong>{" "}
                      {lang === "es"
                        ? "No integramos herramientas de analítica externas (como Google Analytics, Firebase, etc.) que puedan rastrear tu comportamiento."
                        : "We do not integrate external analytics tools (such as Google Analytics, Firebase, etc.) that could track your behavior."
                      }
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="bg-[#0e1626]/40 backdrop-blur-md rounded-[2rem] p-8 border border-white/5 hover:border-[#00e5ff]/20 transition-all duration-300 shadow-lg space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center text-[#00e5ff] shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wider">
                  {lang === "es" ? "3. Privacidad de Menores" : "3. Children's Privacy"}
                </h2>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed pl-1">
                {lang === "es" ? (
                  <>
                    Dado que <strong className="text-[#00e5ff]">LumiMine</strong> no recopila ningún tipo de información personal, el juego es <strong className="text-white">completamente seguro para niños</strong> y cumple íntegramente con los requisitos de la Ley de Protección de la Privacidad Infantil en Internet (COPPA) y el Reglamento General de Protección de Datos (RGPD).
                  </>
                ) : (
                  <>
                    Since <strong className="text-[#00e5ff]">LumiMine</strong> does not collect any personal information, the game is <strong className="text-white">completely safe for children</strong> and fully complies with the requirements of the Children's Online Privacy Protection Act (COPPA) and the General Data Protection Regulation (GDPR).
                  </>
                )}
              </p>
            </div>

            {/* Section 4 */}
            <div className="bg-[#0e1626]/40 backdrop-blur-md rounded-[2rem] p-8 border border-white/5 hover:border-[#00e5ff]/20 transition-all duration-300 shadow-lg space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center text-[#00e5ff] shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wider">
                  {lang === "es" ? "4. Seguridad de los Datos" : "4. Data Security"}
                </h2>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed pl-1">
                {lang === "es" ? (
                  <>
                    Al almacenarse todo de forma local, la seguridad de tus datos de juego depende directamente de la seguridad de tu dispositivo móvil. Te recomendamos mantener tu dispositivo actualizado y protegido.
                  </>
                ) : (
                  <>
                    Since all data is stored locally, the security of your game progress depends directly on the security of your mobile device. We recommend keeping your device updated and secured.
                  </>
                )}
              </p>
            </div>

            {/* Section 5 */}
            <div className="bg-[#0e1626]/40 backdrop-blur-md rounded-[2rem] p-8 border border-white/5 hover:border-[#00e5ff]/20 transition-all duration-300 shadow-lg space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center text-[#00e5ff] shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wider">
                  {lang === "es" ? "5. Cambios a esta Política" : "5. Policy Changes"}
                </h2>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed pl-1">
                {lang === "es" ? (
                  <>
                    Es posible que actualicemos esta política de privacidad en el futuro para reflejar mejoras en el juego. Cualquier cambio se publicará directamente en esta página, manteniendo siempre el compromiso de no recopilar información personal.
                  </>
                ) : (
                  <>
                    We may update this privacy policy in the future to reflect improvements in the game. Any changes will be posted directly on this page, always keeping our commitment not to collect personal information.
                  </>
                )}
              </p>
            </div>

            {/* Section 6 */}
            <div className="bg-[#0e1626]/40 backdrop-blur-md rounded-[2rem] p-8 border border-white/5 hover:border-[#00e5ff]/20 transition-all duration-300 shadow-lg space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center text-[#00e5ff] shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wider">
                  {lang === "es" ? "6. Contacto" : "6. Contact"}
                </h2>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed pl-1">
                {lang === "es" ? (
                  <>
                    Si tienes alguna pregunta o sugerencia sobre nuestra política de privacidad, no dudes en ponerte en contacto con nosotros a través de nuestro correo de soporte oficial de Zetapp.
                  </>
                ) : (
                  <>
                    If you have any questions or suggestions about our privacy policy, feel free to contact us through our official Zetapp support email.
                  </>
                )}
              </p>
            </div>

          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-zinc-500 text-xs font-bold mt-12 bg-[#05080e]/60">
        <p>&copy; 2026 <span className="text-zinc-400">Zetapp</span>. All rights reserved / Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
