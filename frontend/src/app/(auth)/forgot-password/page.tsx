"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { Logo } from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const res = await fetch(`${getApiUrl()}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setStatus("success");
      setMessage(data.message);
    } catch (err: any) {
      setStatus("error");
      setMessage("Error al procesar la solicitud.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50/50 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-10 text-center">
            <Link href="/" className="inline-block transform hover:scale-105 transition-transform mb-6">
                <Logo size="lg" />
            </Link>
        </div>

        <div className="bg-white border border-zinc-100 rounded-[3.5rem] p-10 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.05)] text-center">
          {status === "success" ? (
            <div className="space-y-8 py-4">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 mb-6">
                <MailCheck className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic">¡Correo Enviado!</h2>
              <p className="text-zinc-500 font-bold leading-tight">{message}</p>
              <div className="pt-8">
                <Link href="/login">
                  <Button className="w-full h-16 bg-zinc-900 text-white hover:bg-zinc-800 rounded-full font-black uppercase tracking-widest text-sm shadow-xl">
                    Volver al Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase italic leading-none">Recuperar Clave</h2>
                <p className="text-zinc-400 font-bold text-sm">Te enviaremos un enlace mágico para entrar.</p>
              </div>

              <div className="space-y-3 text-left">
                <Label className="text-zinc-400 text-xs uppercase tracking-widest font-black ml-1">Tu Correo Institucional</Label>
                <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 transition-colors group-focus-within:text-purple-600" />
                    <Input 
                      type="email" 
                      placeholder="hola@tuempresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-zinc-50 border-zinc-100 text-zinc-900 h-16 pl-14 pr-6 focus:ring-purple-600/20 rounded-2xl font-bold"
                    />
                </div>
              </div>

              {status === "error" && (
                <div className="bg-red-50 border border-red-100 text-red-500 text-xs py-4 rounded-2xl font-black uppercase tracking-tight">
                  {message}
                </div>
              )}

              <Button disabled={status === "loading"} type="submit" className="w-full h-16 bg-purple-600 text-white hover:bg-purple-700 rounded-full font-black uppercase tracking-widest text-sm shadow-2xl shadow-purple-600/30 transition-all">
                {status === "loading" ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Enviar Instrucciones"}
              </Button>

              <Link href="/login" className="flex items-center justify-center gap-2 text-zinc-400 hover:text-purple-600 transition-colors font-black text-xs uppercase tracking-widest pt-4">
                <ArrowLeft className="w-4 h-4" /> Volver al Login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
