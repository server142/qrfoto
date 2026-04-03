"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Image as ImageIcon, CheckCircle2, MessageSquare,
  User, Loader2, Send, X, Mail, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiUrl } from "@/lib/api";

const STORAGE_KEY = "qrfoto_guest_identity";

interface GuestIdentity {
  name: string;
  email: string;
}

export default function GuestUploadPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Guest identification state
  const [identity, setIdentity] = useState<GuestIdentity | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [identityError, setIdentityError] = useState("");

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load event data
    fetch(`${getApiUrl()}/events/slug/${slug}`)
      .then(res => res.json())
      .then(data => { setEvent(data); setLoading(false); });

    // Check if guest has already identified themselves (from previous visit)
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GuestIdentity;
        if (parsed.name) setIdentity(parsed);
      } catch {}
    }
  }, [slug]);

  const handleIdentitySubmit = () => {
    if (!nameInput.trim()) {
      setIdentityError("Por favor escribe tu nombre para continuar.");
      return;
    }
    const guest: GuestIdentity = {
      name: nameInput.trim(),
      email: emailInput.trim(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guest));
    setIdentity(guest);
    setIdentityError("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSend = async () => {
    if (!selectedFile && !message) return;
    setUploading(true);
    const formData = new FormData();
    if (selectedFile) formData.append("file", selectedFile);

    const url = new URL(`${getApiUrl()}/media/${slug}/upload`);
    url.searchParams.append("guest_name", identity?.name || "Invitado");
    if (identity?.email) url.searchParams.append("guest_email", identity.email);
    if (message) url.searchParams.append("message", message);

    try {
      const res = await fetch(url.toString(), { method: "POST", body: formData });
      if (res.ok) {
        setIsSuccess(true);
        setSelectedFile(null);
        setPreviewUrl(null);
        setMessage("");
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        alert("Error al enviar. Intenta de nuevo.");
      }
    } catch {
      alert("Error de conexión. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
      <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
      <p className="animate-pulse opacity-50 uppercase tracking-[0.2em] text-xs font-black">Sincronizando...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden relative font-sans">
      {/* Ambient Glow */}
      <div
        className="fixed inset-0 opacity-20 blur-[120px] rounded-full mix-blend-screen scale-150 pointer-events-none"
        style={{ background: event.branding_color }}
      />

      <div className="relative z-10 p-6 flex flex-col min-h-screen max-w-lg mx-auto">
        {/* Header */}
        <header className="flex flex-col items-center text-center mt-6 mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-[2rem] p-1 mb-4 border-2 border-white/10 overflow-hidden"
          >
            {event.cover_image_url ? (
              <img src={event.cover_image_url} className="w-full h-full object-cover rounded-[1.8rem]" />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center rounded-[1.8rem]">
                <ImageIcon className="w-8 h-8 text-white/20" />
              </div>
            )}
          </motion.div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-1 italic">{event.name}</h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: event.branding_color }} />
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">En Vivo ahora</p>
          </div>
        </header>

        <main className="flex-1 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {/* ── PASO 1: IDENTIFICACIÓN ── */}
            {!identity ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Bienvenida */}
                <div className="text-center space-y-2 py-4">
                  <div
                    className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 shadow-2xl"
                    style={{ backgroundColor: event.branding_color }}
                  >
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">¡Bienvenido!</h2>
                  <p className="text-white/40 text-sm">
                    Cuéntanos quién eres para que tus fotos queden identificadas en la galería.
                  </p>
                </div>

                <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-6 rounded-[2rem] space-y-5 shadow-xl">
                  {/* Nombre */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                      <User className="w-3 h-3" /> Tu Nombre <span className="text-red-400">*</span>
                    </label>
                    <Input
                      placeholder="¿Cómo te llamas?"
                      value={nameInput}
                      onChange={(e) => { setNameInput(e.target.value); setIdentityError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleIdentitySubmit()}
                      className="bg-black/40 border-white/5 h-12 rounded-xl focus:border-white/20 text-white placeholder:text-white/20"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Tu Correo <span className="text-white/20">(opcional)</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="tu@correo.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleIdentitySubmit()}
                      className="bg-black/40 border-white/5 h-12 rounded-xl focus:border-white/20 text-white placeholder:text-white/20"
                    />
                    <p className="text-[10px] text-white/20 italic">
                      Solo lo usamos para identificarte. No enviamos spam.
                    </p>
                  </div>

                  {identityError && (
                    <p className="text-red-400 text-xs font-bold">{identityError}</p>
                  )}
                </div>

                <Button
                  onClick={handleIdentitySubmit}
                  className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all text-black"
                  style={{ backgroundColor: event.branding_color }}
                >
                  Entrar a la Galería <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>

            /* ── PASO 2: ÉXITO ── */
            ) : isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900/40 backdrop-blur-2xl border-2 border-green-500/20 p-12 rounded-[3rem] flex flex-col items-center justify-center text-center shadow-2xl"
              >
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-500/40 animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-3">¡Publicado!</h2>
                <p className="text-white/50 mb-10 font-medium italic">
                  Tu recuerdo ya está brillando en la galería.
                </p>
                <Button
                  onClick={() => setIsSuccess(false)}
                  className="bg-white text-black font-extrabold h-14 px-10 rounded-2xl uppercase tracking-widest text-xs"
                >
                  Enviar otro
                </Button>
              </motion.div>

            /* ── PASO 3: SUBIR FOTO/MENSAJE ── */
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Identidad activa */}
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black"
                      style={{ backgroundColor: event.branding_color }}
                    >
                      {identity.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black">{identity.name}</p>
                      {identity.email && <p className="text-[10px] text-white/30">{identity.email}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => { localStorage.removeItem(STORAGE_KEY); setIdentity(null); }}
                    className="text-[10px] text-white/20 hover:text-white/60 uppercase tracking-widest font-black transition-colors"
                  >
                    Cambiar
                  </button>
                </div>

                {/* Selector de Media */}
                <div
                  onClick={() => !previewUrl && fileInputRef.current?.click()}
                  className={`relative bg-zinc-900/40 backdrop-blur-3xl border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center transition-all overflow-hidden ${previewUrl ? 'aspect-video' : 'py-12 px-8 cursor-pointer hover:border-white/20'}`}
                >
                  {previewUrl ? (
                    <>
                      {selectedFile?.type.startsWith('video') ? (
                        <video src={previewUrl} className="w-full h-full object-cover" autoPlay muted loop />
                      ) : (
                        <img src={previewUrl} className="w-full h-full object-cover" />
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setSelectedFile(null); }}
                        className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-2xl" style={{ backgroundColor: event.branding_color }}>
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-xl font-black uppercase italic tracking-tighter">Capturar Momento</h2>
                      <p className="text-white/40 text-xs mt-1 font-medium italic">Toca para subir foto o video</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {/* Mensaje */}
                <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-6 rounded-[2rem] shadow-xl">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2 mb-3">
                    <MessageSquare className="w-3 h-3" /> Dedicatoria o Saludo <span className="text-white/20">(opcional)</span>
                  </label>
                  <textarea
                    placeholder="¡Felicidades! Gracias por incluirme en este momento tan especial..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-white focus:border-white/20 outline-none transition-colors placeholder:text-white/20 text-sm resize-none"
                  />
                </div>

                <Button
                  onClick={handleSend}
                  disabled={uploading || (!selectedFile && !message)}
                  className="w-full h-16 bg-white text-black hover:bg-zinc-200 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-40"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <><Send className="w-5 h-5" /> Enviar a la Pantalla</>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-auto py-10 text-center">
          <p className="text-[9px] text-white/10 uppercase tracking-[0.5em] font-black">
            Live Experience Powered by QRFoto
          </p>
        </footer>
      </div>
    </div>
  );
}
