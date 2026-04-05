"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sparkles, UserPlus, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { Logo } from "@/components/Logo";
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
        const data = await res.json();
        if (data.access_token) {
          document.cookie = `token=${data.access_token}; path=/`;

          // If they came from a Pricing card selection, auto-checkout
          const query = new URLSearchParams(window.location.search);
          const planParam = query.get("plan");
          if (planParam) {
            try {
              const checkoutRes = await fetch(`${getApiUrl()}/payments/checkout`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${data.access_token}`
                },
                body: JSON.stringify({ planId: planParam, userId: "", currency: typeof localStorage !== 'undefined' && localStorage.getItem('qrfoto_lang') === 'en' ? 'usd' : 'mxn' }),
              });
              const checkoutData = await checkoutRes.json();
              if (checkoutData.url) {
                window.location.href = checkoutData.url;
                return;
              }
            } catch (err) {
              console.error("Auto-checkout failed", err);
            }
          }
        }
        // Redirect to dashboard if no specific plan was selected
        router.push("/dashboard/events?welcome=true");
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
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-100/50 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center relative z-10"
      >
        {/* Left Side: Marketing / Visual */}
        <div className="hidden lg:block space-y-10">
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>

          <h2 className="text-5xl font-black leading-tight italic tracking-tighter text-zinc-900">
            Lleva tus eventos <br /> al <span className="text-purple-600 underline">siguiente nivel.</span>
          </h2>

          <div className="space-y-6">
            {[
              "Acceso instantáneo sin aplicaciones.",
              "Galerías en tiempo real con IA.",
              "Descarga masiva de recuerdos.",
              "Control total de tu marca."
            ].map((text, i) => (
              <div key={i} className="flex gap-4 items-center font-bold text-zinc-500">
                <CheckCircle2 className="text-purple-600 w-6 h-6" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50 relative overflow-hidden group">
            <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-purple-100 opacity-50 group-hover:scale-110 transition-transform" />
            <p className="text-zinc-600 font-medium italic relative z-10">"QRFoto cambió la forma en que mis clientes ven sus eventos. La interacción es inmediata."</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">M</div>
              <span className="font-bold text-sm">Miguel, Organizador de Bodas</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <Card className="bg-white border-zinc-100 p-10 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.05)] rounded-[3.5rem] relative">
          <div className="absolute top-0 right-0 p-8">
            <UserPlus className="w-20 h-20 text-zinc-50 -mr-10 -mt-10" />
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none mb-3">Únete a <Logo size="md" /></h1>
            <p className="text-zinc-400 font-bold text-sm">Empieza tu prueba gratuita en 30 segundos.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-zinc-400 text-xs uppercase tracking-widest font-black">Nombre</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej. Juan"
                  className="bg-zinc-50 border-zinc-100 text-zinc-900 h-14 rounded-2xl focus:ring-purple-600/20 font-bold px-5"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label className="text-zinc-400 text-xs uppercase tracking-widest font-black">Apellido</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej. Pérez"
                  className="bg-zinc-50 border-zinc-100 text-zinc-900 h-14 rounded-2xl focus:ring-purple-600/20 font-bold px-5"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-zinc-400 text-xs uppercase tracking-widest font-black">Email Corporativo / Personal</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hola@ejemplo.com"
                className="bg-zinc-50 border-zinc-100 text-zinc-900 h-14 rounded-2xl focus:ring-purple-600/20 font-bold px-5"
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="text-zinc-400 text-xs uppercase tracking-widest font-black">Contraseña Segura</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-zinc-50 border-zinc-100 text-zinc-900 h-14 rounded-2xl focus:ring-purple-600/20 font-bold px-5"
                required
              />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-red-500 text-xs text-center font-black bg-red-50 py-3 rounded-2xl border border-red-100">
                {error}
              </motion.p>
            )}

            <Button disabled={loading} type="submit" className="w-full h-16 bg-purple-600 text-white hover:bg-purple-700 rounded-full font-black uppercase tracking-normal sm:tracking-widest shadow-2xl shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-95 text-sm sm:text-lg">
              {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : "Crear mi cuenta GRATIS"}
            </Button>
          </form>

          <div className="mt-10 pt-10 border-t border-zinc-100 text-center">
            <p className="text-zinc-400 font-bold text-sm mb-4">¿Ya eres parte de la comunidad?</p>
            <Link href="/login">
              <Button variant="outline" className="w-full h-14 border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-full font-bold transition-all flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Entrar a mi cuenta
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
