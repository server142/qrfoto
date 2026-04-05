"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Link from "next/link";
import { KeyRound, Mail, Loader2, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { Logo } from "@/components/Logo";

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
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50/50 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-10 text-center space-y-4">
            <Link href="/" className="inline-block transform hover:scale-105 transition-transform">
                <Logo size="lg" />
            </Link>
            <div className="space-y-1">
                <h1 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">Bienvenido de nuevo</h1>
                <p className="text-zinc-400 font-bold text-sm">Es hora de crear experiencias virales.</p>
            </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-[3.5rem] p-10 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <ShieldCheck className="w-32 h-32 -mr-16 -mt-16 text-purple-600" />
          </div>

          <form onSubmit={handleLogin} className="space-y-8 relative z-10">
            <div className="space-y-3">
              <Label className="text-zinc-400 text-xs uppercase tracking-widest font-black ml-1">Correo electrónico</Label>
              <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-purple-600 transition-colors" />
                  <Input 
                    type="email" 
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-zinc-50 border-zinc-100 text-zinc-900 h-16 pl-14 pr-6 focus:ring-purple-600/20 rounded-2xl transition-all font-bold"
                  />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-zinc-400 text-xs uppercase tracking-widest font-black">Contraseña</Label>
                <Link href="/forgot-password" title="Recuperar Clave" className="text-[10px] text-purple-600 font-black uppercase tracking-widest hover:underline">¿Olvidaste tu clave?</Link>
              </div>
              <div className="relative group">
                  <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-purple-600 transition-colors" />
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-zinc-50 border-zinc-100 text-zinc-900 h-16 pl-14 pr-6 focus:ring-purple-600/20 rounded-2xl transition-all font-bold"
                  />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-100 text-red-500 text-xs py-4 rounded-2xl text-center font-black uppercase tracking-tight">
                {error}
              </motion.div>
            )}

            <Button disabled={loading} type="submit" className="w-full h-16 bg-purple-600 text-white hover:bg-purple-700 rounded-full font-black uppercase tracking-normal sm:tracking-widest text-sm sm:text-lg shadow-2xl shadow-purple-600/30 active:scale-95 transition-all group">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                    Entrar al Panel
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>

            <div className="pt-10 border-t border-zinc-100 text-center">
               <Link href="/register" className="group">
                  <p className="text-zinc-400 font-bold text-sm">
                    ¿Aún no tienes cuenta? 
                    <span className="text-purple-600 font-black uppercase tracking-wider ml-1 group-hover:underline">Regístrate GRATIS</span>
                  </p>
               </Link>
            </div>
          </form>
        </div>
        
        <div className="mt-12 text-center">
            <p className="text-zinc-300 text-[10px] font-black uppercase tracking-[0.3em]">
                Seguridad de grado bancario habilitada
            </p>
        </div>
      </motion.div>
    </div>
  );
}
