"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Image as ImageIcon, CheckCircle2, MessageSquare,
  User, Loader2, Send, X, Mail, ArrowRight, QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiUrl, getBaseUrl } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";

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

  const [media, setMedia] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchMedia = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/media/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data);
      }
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    // Load event data
    fetch(`${getApiUrl()}/events/slug/${slug}`)
      .then(res => res.json())
      .then(data => { setEvent(data); setLoading(false); });

    // Initial media fetch
    fetchMedia();

    // Polling for live updates every 10 seconds
    const interval = setInterval(fetchMedia, 10000);

    // Check if guest has already identified themselves (from previous visit)
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GuestIdentity;
        if (parsed.name) setIdentity(parsed);
      } catch {}
    }

    return () => clearInterval(interval);
  }, [slug]);

  const handleIdentitySubmit = () => {
    if (!nameInput.trim()) {
      setIdentityError("Por favor escribe tu nombre para participar.");
      return;
    }
    const guest: GuestIdentity = {
      name: nameInput.trim(),
      email: emailInput.trim(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guest));
    setIdentity(guest);
    setIdentityError("");
    // After identity, open upload form by default or just show gallery
    setIsUploadOpen(true);
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
        setIsUploadOpen(false);
        fetchMedia(); // Refresh immediately
        setTimeout(() => setIsSuccess(false), 3000);
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
      <p className="animate-pulse opacity-50 uppercase tracking-[0.2em] text-[10px] font-black">Sincronizando Galería...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden relative font-sans">
      {/* Ambient Glow */}
      <div
        className="fixed inset-0 opacity-10 blur-[120px] rounded-full mix-blend-screen scale-150 pointer-events-none"
        style={{ background: event.branding_color }}
      />

      <div className="relative z-10 p-4 sm:p-6 flex flex-col min-h-screen max-w-lg mx-auto pb-24">
        {/* Header */}
        <header className="flex flex-col items-center text-center mt-4 sm:mt-6 mb-8 relative">
           <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-4 cursor-pointer active:scale-95 transition-transform">
             <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: event.branding_color }} />
             <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">En vivo</p>
           </div>
          
          <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter mb-1 uppercase leading-none">{event.name}</h1>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">{new Date(event.event_date).toLocaleDateString()}</p>

          <Dialog>
            <DialogTrigger asChild>
              <button className="absolute top-0 right-0 p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <QrCode className="w-5 h-5 text-purple-400" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-white/10 text-white rounded-[3rem] p-10 max-w-[320px] mx-auto">
              <div className="text-center space-y-6">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Compartir QR</h3>
                <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-purple-500/20">
                  <QRCodeSVG value={`${getBaseUrl()}/event/${slug}`} size={200} />
                </div>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-loose">
                  Invita a otros escaneando este código directamente desde tu pantalla
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <main className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
             {/* ── FEED MODE (Default) ── */}
             {!isUploadOpen && !isSuccess && (
               <motion.div
                 key="feed"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="space-y-6"
               >
                 {media.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                     <ImageIcon className="w-16 h-16 mb-4" />
                     <p className="text-sm font-black italic tracking-widest uppercase mb-4">No hay fotos aún</p>
                     <Button 
                       onClick={() => identity ? setIsUploadOpen(true) : null}
                       className="bg-white/10 border border-white/10 rounded-full px-6 text-[10px] font-black uppercase text-white"
                     >
                       Sé el primero en subir
                     </Button>
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-3 sm:gap-4">
                     {media.map((item, index) => (
                       <motion.div
                         key={item.id}
                         initial={{ opacity: 0, scale: 0.9, y: 20 }}
                         animate={{ opacity: 1, scale: 1, y: 0 }}
                         transition={{ delay: index * 0.05 }}
                         className="relative aspect-square rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-white/5 shadow-xl group"
                       >
                         {item.file_type === 'video' ? (
                           <video src={item.file_url} className="w-full h-full object-cover" muted playsInline />
                         ) : (
                           <img src={item.file_url} className="w-full h-full object-cover" loading="lazy" />
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                            <p className="text-[10px] font-black text-white italic truncate">{item.guest_name || 'Invitado'}</p>
                            {item.message && <p className="text-[8px] text-white/50 truncate italic">"{item.message}"</p>}
                         </div>
                       </motion.div>
                     ))}
                   </div>
                 )}
               </motion.div>
             )}

            {/* ── PASO 1: IDENTIFICACIÓN ── */}
            {isUploadOpen && !identity && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Bienvenida */}
                <div className="text-center space-y-2 py-4">
                   <div className="w-20 h-20 rounded-[2.5rem] p-1 mx-auto mb-6 border-2 border-white/10 overflow-hidden shadow-2xl">
                    {event.cover_image_url ? (
                      <img src={event.cover_image_url} className="w-full h-full object-cover rounded-[2.3rem]" />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex items-center justify-center rounded-[2.3rem]">
                        <ImageIcon className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">¡Participa!</h2>
                  <p className="text-white/40 text-sm">
                    Ingresa tus datos para subir fotos a la pantalla del evento.
                  </p>
                </div>

                <div className="bg-zinc-900/60 backdrop-blur-3xl border border-white/10 p-6 sm:p-8 rounded-[3rem] space-y-6 shadow-2xl">
                  {/* Nombre */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 px-1">
                      <User className="w-3 h-3" /> Tu Nombre <span className="text-red-400">*</span>
                    </label>
                    <Input
                      placeholder="Ej. Carlos G."
                      value={nameInput}
                      onChange={(e) => { setNameInput(e.target.value); setIdentityError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleIdentitySubmit()}
                      className="bg-black/60 border-white/5 h-14 rounded-2xl focus:border-purple-500/50 text-white placeholder:text-white/10 text-lg sm:text-base font-bold"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 px-1">
                      <Mail className="w-3 h-3" /> Correo <span className="text-white/20">(opcional)</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleIdentitySubmit()}
                      className="bg-black/60 border-white/5 h-14 rounded-2xl focus:border-purple-500/50 text-white placeholder:text-white/10 text-lg sm:text-base font-bold"
                    />
                  </div>

                  {identityError && (
                    <p className="text-red-400 text-xs font-bold text-center">{identityError}</p>
                  )}
                </div>

                <div className="flex gap-4">
                   <Button
                    variant="ghost"
                    onClick={() => setIsUploadOpen(false)}
                    className="flex-1 h-16 rounded-[1.8rem] font-bold text-white/40 hover:text-white"
                  >
                    Volver
                  </Button>
                  <Button
                    onClick={handleIdentitySubmit}
                    className="flex-[2] h-16 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all text-black hover:opacity-90"
                    style={{ backgroundColor: event.branding_color }}
                  >
                    Entrar <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── PASO 2: ÉXITO ── */}
            {isSuccess && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900/40 backdrop-blur-2xl border-2 border-green-500/20 p-12 rounded-[3.5rem] flex flex-col items-center justify-center text-center shadow-2xl my-auto"
              >
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-green-500/40 animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">¡Súper!</h2>
                <p className="text-white/40 mb-8 font-medium italic text-sm">
                  Tu foto ya está en la pantalla gigante.
                </p>
                <Button
                  onClick={() => { setIsSuccess(false); setIsUploadOpen(true); }}
                  className="bg-white text-black font-black h-14 px-10 rounded-2xl uppercase tracking-[0.2em] text-[10px]"
                >
                  Subir otra
                </Button>
              </motion.div>
            )}

            {/* ── PASO 3: SUBIR FOTO/MENSAJE (Modal-style) ── */}
            {isUploadOpen && identity && !isSuccess && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl p-6 flex flex-col overflow-y-auto"
              >
                <div className="max-w-md mx-auto w-full pt-10">
                   <header className="flex justify-between items-center mb-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-black text-sm font-black" style={{ backgroundColor: event.branding_color }}>
                          {identity.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black">{identity.name}</p>
                          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Participando</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setIsUploadOpen(false)} className="rounded-full bg-white/5 border border-white/10">
                        <X className="w-5 h-5 text-white/60" />
                      </Button>
                   </header>

                   {/* Selector de Media */}
                   <div
                    onClick={() => !previewUrl && fileInputRef.current?.click()}
                    className={`relative bg-zinc-900 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center text-center transition-all overflow-hidden ${previewUrl ? 'aspect-square sm:aspect-video' : 'py-16 px-8 cursor-pointer hover:border-white/20 mb-8 shadow-2xl shadow-purple-500/5'}`}
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
                          className="absolute top-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-full border border-white/10 hover:bg-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-2xl" style={{ backgroundColor: event.branding_color }}>
                          <Camera className="w-8 h-8 text-black" />
                        </div>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter">Subir Recuerdo</h2>
                        <p className="text-white/40 text-xs mt-2 font-medium italic">Selecciona una foto o video </p>
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
                  <div className="bg-zinc-900 border border-white/10 p-6 rounded-[2.5rem] shadow-xl mb-10 mt-8">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2 mb-4 px-2">
                      <MessageSquare className="w-3 h-3 text-purple-500" /> Dedicatoria <span className="text-white/10 italic">(opcional)</span>
                    </label>
                    <textarea
                      placeholder="¡Felicidades! Un momento inolvidable..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white focus:border-purple-500/30 outline-none transition-colors placeholder:text-white/10 text-base font-medium italic resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleSend}
                    disabled={uploading || (!selectedFile && !message)}
                    className="w-full h-18 bg-white text-black hover:bg-zinc-200 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed border-b-4 border-zinc-300"
                  >
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <><Send className="w-6 h-6" /> Publicar ahora</>
                    )}
                  </Button>
                  
                  <p className="text-center text-[9px] text-white/20 mt-8 uppercase tracking-[0.3em] font-black">
                    Tu privacidad es importante. Solo invitados con el QR pueden ver esto.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="py-8 text-center">
          <p className="text-[9px] text-white/10 uppercase tracking-[0.5em] font-black">
            Powered by QRFoto Events
          </p>
        </footer>

        {/* ── FLOATING ACTION BUTTON (FAB) ── */}
        {!isUploadOpen && !isSuccess && (
           <motion.button
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => identity ? setIsUploadOpen(true) : setIsUploadOpen(true)}
            className="fixed bottom-8 right-6 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-purple-600/40 z-40 border-4 border-black group overflow-hidden"
            style={{ backgroundColor: event.branding_color }}
           >
             <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
             <Camera className="w-7 h-7 text-black group-hover:rotate-12 transition-transform" />
           </motion.button>
        )}
      </div>
    </div>
  );
}
