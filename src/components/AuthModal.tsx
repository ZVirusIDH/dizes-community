"use client";

import { useState } from "react";
import { X, Mail, Lock, User, Loader2, LogIn, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "es" | "en";
}

const t = {
  es: {
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    email: "Email",
    password: "Contraseña",
    username: "Nombre de usuario",
    error: "Error",
    successSignUp: "¡Registro exitoso! Por favor revisa tu email para confirmar.",
    successSignIn: "¡Bienvenido de nuevo!",
    alreadyHaveAccount: "¿Ya tienes cuenta? Entrar",
    dontHaveAccount: "¿No tienes cuenta? Regístrate",
    loading: "Cargando...",
    actionSignIn: "Entrar",
    actionSignUp: "Crear Cuenta",
  },
  en: {
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    username: "Username",
    error: "Error",
    successSignUp: "Sign up successful! Please check your email to confirm.",
    successSignIn: "Welcome back!",
    alreadyHaveAccount: "Already have an account? Sign In",
    dontHaveAccount: "Don't have an account? Sign Up",
    loading: "Loading...",
    actionSignIn: "Sign In",
    actionSignUp: "Create Account",
    forgotPassword: "Forgot password?",
    resetEmailSent: "Recovery email sent!",
  }
};

export default function AuthModal({ isOpen, onClose, lang }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const dict = t[lang];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const forbiddenUsernames = ["ADMIN", "DIZES", "MODERATOR", "SUPPORT", "SYSTEM"];
      const upperName = username.toUpperCase().trim();
      
      if (isSignUp && (forbiddenUsernames.some(f => upperName.includes(f)) || upperName.includes("ZVIRUS"))) {
        throw new Error(lang === "es" ? "Este nombre de usuario está reservado." : "This username is reserved.");
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            },
          },
        });
        if (error) throw error;
        setMessage({ type: "success", text: dict.successSignUp });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ type: "success", text: dict.successSignIn });
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || dict.error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }} 
            className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[100px] rounded-full" />

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black tracking-tighter uppercase">
                {isSignUp ? dict.signUp : dict.signIn}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder={dict.username}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-all font-bold text-sm"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="email" 
                  placeholder={dict.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-all font-bold text-sm"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="password" 
                  placeholder={dict.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-all font-bold text-sm"
                />
              </div>

              <AnimatePresence>
                {message && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border ${message.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-green-500/10 border-green-500/20 text-green-400"}`}
                  >
                    {message.type === "error" ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                    <p className="text-xs font-bold">{message.text}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full brand-gradient py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />)}
                {loading ? dict.loading : (isSignUp ? dict.actionSignUp : dict.actionSignIn)}
              </button>
            </form>

            <div className="mt-8 text-center space-y-4">
              <button 
                onClick={async () => {
                  if (!email) {
                    setMessage({ type: "error", text: lang === "es" ? "Introduce tu email primero" : "Enter your email first" });
                    return;
                  }
                  setLoading(true);
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin,
                  });
                  setLoading(false);
                  if (error) setMessage({ type: "error", text: error.message });
                  else setMessage({ type: "success", text: lang === "es" ? "¡Email de recuperación enviado!" : "Recovery email sent!" });
                }}
                className="block w-full text-zinc-500 hover:text-white font-bold text-[10px] transition-colors"
              >
                {lang === "es" ? "¿Olvidaste tu contraseña?" : "Forgot password?"}
              </button>

              <button 
                onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
                className="text-zinc-500 hover:text-blue-400 font-bold text-xs transition-colors underline-offset-4 hover:underline"
              >
                {isSignUp ? dict.alreadyHaveAccount : dict.dontHaveAccount}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
