"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Link from "next/link";
import { KeyRound, Mail, Loader2, Sparkles } from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch(`${getApiUrl()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Credenciales inválidas o el servidor no responde.");
      }

      const data = await res.json();
      document.cookie = `token=${data.access_token}; path=/`;
      
      // Role-based redirection
      if (data.user.role === 'SuperAdmin') {
          router.push("/admin");
      } else {
          router.push("/dashboard/events"); 
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-10 text-center space-y-2">
            <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5 }}
                className="inline-block"
            >
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
            </motion.div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">QRFoto Events</h1>
            <p className="text-white/40 font-medium">Inicia sesión en tu portal de cliente</p>
        </div>

        <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] p-10 shadow-3xl shadow-purple-500/5">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white/60 text-[10px] uppercase tracking-widest font-black ml-1">Correo electrónico</Label>
              <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <Input 
                    type="email" 
                    placeholder="admin@qrfoto.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-black/40 border-white/5 text-white h-14 pl-12 focus:border-purple-500/50 rounded-2xl transition-all"
                  />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-white/60 text-[10px] uppercase tracking-widest font-black">Contraseña</Label>
                <a href="#" className="text-[10px] text-purple-400 font-bold uppercase tracking-widest hover:text-purple-300">¿Perdiste la clave?</a>
              </div>
              <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-black/40 border-white/5 text-white h-14 pl-12 focus:border-purple-500/50 rounded-2xl transition-all"
                  />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 rounded-xl text-center font-bold">
                {error}
              </motion.div>
            )}

            <Button disabled={loading} type="submit" className="w-full h-14 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-white/5 active:scale-95 transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Entrar al Panel"}
            </Button>

            <div className="pt-8 border-t border-white/5 text-center">
               <Link href="/register" className="text-white/40 hover:text-white transition-colors text-xs font-medium">
                  ¿No tienes cuenta? <span className="text-purple-400 font-black uppercase tracking-wider ml-1">Regístrate gratis</span>
               </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
