"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sparkles, UserPlus, ArrowLeft, Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${getApiUrl()}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
      });

      if (res.ok) {
        // Redirect to pricing so they choose a plan immediately
        router.push("/pricing?registered=true");
      } else {
        const data = await res.json();
        setError(data.message || "Error al registrarse");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-600/10 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
                <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Únete a QRFoto</h1>
            <p className="text-white/40 mt-2">Crea tu cuenta SaaS y empieza a innovar.</p>
        </div>

        <Card className="bg-zinc-950 border-white/10 p-8 shadow-2xl shadow-purple-500/10 rounded-[2rem]">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-white/70 text-xs uppercase tracking-widest font-bold">Nombre</Label>
                    <Input 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ej. Juan"
                        className="bg-black/50 border-white/10 text-white h-12 focus:ring-purple-500/50"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-white/70 text-xs uppercase tracking-widest font-bold">Apellido</Label>
                    <Input 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ej. Pérez"
                        className="bg-black/50 border-white/10 text-white h-12 focus:ring-purple-500/50"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70 text-xs uppercase tracking-widest font-bold">Email</Label>
              <Input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@ejemplo.com"
                className="bg-black/50 border-white/10 text-white h-12 focus:ring-purple-500/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70 text-xs uppercase tracking-widest font-bold">Contraseña</Label>
              <Input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-black/50 border-white/10 text-white h-12 focus:ring-purple-500/50"
                required
              />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs text-center font-medium bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                {error}
              </motion.p>
            )}

            <Button disabled={loading} type="submit" className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-white/5 transition-all active:scale-95">
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Crear mi cuenta"}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <Link href="/login" className="text-white/40 hover:text-white transition-colors text-sm flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Ya tengo una cuenta
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
