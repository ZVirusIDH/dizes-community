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

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-zinc-900 px-4 text-zinc-500">{lang === "es" ? "O continúa con" : "Or continue with"}</span></div>
            </div>

            <button 
              onClick={async () => {
                setLoading(true);
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: window.location.origin }
                });
                if (error) setMessage({ type: "error", text: error.message });
              }}
              className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-white/5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>

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
