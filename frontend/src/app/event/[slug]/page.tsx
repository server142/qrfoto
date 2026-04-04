"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Image as ImageIcon, CheckCircle2, MessageSquare,
  User, Loader2, Send, X, Mail, ArrowRight, QrCode, Plus, Download
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
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  // Upload state (Restored)
  const [uploading, setUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        fetchMedia();
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

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
      <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
      <p className="animate-pulse opacity-50 uppercase tracking-[0.2em] text-[10px] font-black">Iniciando Galería Pro...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden relative font-sans">
      {/* Ambient Glow */}
      <div
        className="fixed inset-0 opacity-10 blur-[120px] rounded-full mix-blend-screen scale-150 pointer-events-none transition-all duration-1000"
        style={{ background: event.branding_color }}
      />

      <div className="relative z-10 p-4 sm:p-6 flex flex-col min-h-screen max-w-lg mx-auto pb-24">
        {/* Header */}
        <header className="flex flex-col items-center text-center mt-4 sm:mt-6 mb-10 relative">
           <motion.div 
             initial={{ y: -20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-6 cursor-pointer active:scale-95 transition-transform"
           >
             <div className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ backgroundColor: event.branding_color }} />
             <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] italic">Live Gallery</p>
           </motion.div>
          
          <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter mb-2 uppercase leading-none drop-shadow-2xl">{event.name}</h1>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-widest bg-white/5 px-4 py-1 rounded-full border border-white/5">{new Date(event.event_date).toLocaleDateString()}</p>

          <Dialog>
            <DialogTrigger asChild>
              <button className="absolute top-0 right-0 p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all hover:scale-110 active:scale-90">
                <QrCode className="w-5 h-5 text-purple-400" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950/95 backdrop-blur-3xl border-white/10 text-white rounded-[3.5rem] p-12 max-w-[340px] mx-auto shadow-2xl">
              <div className="text-center space-y-8">
                <div className="space-y-2">
                   <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Compartir QR</h3>
                   <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Invita a más personas</p>
                </div>
                
                <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-purple-600/20 transform rotate-[-2deg] hover:rotate-0 transition-transform">
                  <QRCodeSVG value={`${getBaseUrl()}/event/${slug}`} size={220} />
                </div>
                
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-loose">
                  Escanea directamente desde la pantalla de tu compañero
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <main className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
             {/* ── GALLERY FEED (Pro Visualization) ── */}
             {!isUploadOpen && !isSuccess && (
               <motion.div
                 key="feed"
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="space-y-8"
               >
                 {media.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 text-center">
                     <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 opacity-20">
                       <ImageIcon className="w-12 h-12" />
                     </div>
                     <p className="text-sm font-black italic tracking-widest uppercase mb-4 opacity-40">Aún no hay recuerdos</p>
                     <Button 
                       onClick={() => setIsUploadOpen(true)}
                       className="bg-white text-black rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-white/5"
                     >
                       Sé el primero en participar
                     </Button>
                   </div>
                 ) : (
                   <div className="columns-2 gap-4 space-y-4 px-1">
                     {media.map((item, index) => (
                       <motion.div
                         key={item.id}
                         initial={{ opacity: 0, y: 40 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: (index % 10) * 0.1 }}
                         onClick={() => setSelectedMedia(item)}
                         className="relative break-inside-avoid rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl group cursor-zoom-in active:scale-[0.98] transition-transform"
                       >
                         {item.file_type === 'video' ? (
                           <div className="relative aspect-[3/4]">
                             <video src={item.file_url} className="w-full h-full object-cover" muted playsInline />
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white/40 animate-pulse" />
                             </div>
                           </div>
                         ) : (
                           <img 
                             src={item.file_url} 
                             className={`w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110`}
                             loading="lazy" 
                           />
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                            <p className="text-[10px] font-black text-white italic tracking-widest uppercase mb-1">{item.guest_name || 'Invitado'}</p>
                            {item.message && <p className="text-[9px] text-white/60 line-clamp-2 italic font-medium">"{item.message}"</p>}
                         </div>
                       </motion.div>
                     ))}
                   </div>
                 )}
               </motion.div>
             )}

            {/* ── MODAL: LIGHTBOX PRO ── */}
            <AnimatePresence>
              {selectedMedia && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col p-6"
                >
                  <header className="flex justify-between items-center mb-8">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1.2rem] flex items-center justify-center text-black font-black text-lg shadow-xl" style={{ backgroundColor: event.branding_color }}>
                          {selectedMedia.guest_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                           <p className="text-sm font-black italic uppercase tracking-widest">{selectedMedia.guest_name || 'Invitado'}</p>
                           <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Publicado en {event.name}</p>
                        </div>
                     </div>
                     <button 
                       onClick={() => setSelectedMedia(null)}
                       className="p-4 bg-white/5 rounded-full border border-white/10 hover:bg-white/10"
                     >
                       <X className="w-6 h-6" />
                     </button>
                  </header>

                  <div className="flex-1 flex flex-col items-center justify-center relative min-h-0">
                    <motion.div 
                      layoutId={`media-${selectedMedia.id}`}
                      className="w-full max-h-full rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/5"
                    >
                      {selectedMedia.file_type === 'video' ? (
                        <video src={selectedMedia.file_url} className="w-full h-full object-contain" autoPlay muted loop controls />
                      ) : (
                        <img src={selectedMedia.file_url} className="w-full h-full object-contain" />
                      )}
                    </motion.div>
                  </div>

                  <footer className="mt-8 space-y-6">
                    {selectedMedia.message && (
                      <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: event.branding_color }} />
                        <p className="text-lg font-medium italic text-white/90 leading-relaxed">
                          "{selectedMedia.message}"
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => handleDownload(selectedMedia.file_url, `QRFoto_${selectedMedia.id}`)}
                        className="flex-1 h-16 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 transition-all"
                      >
                         <Download className="w-5 h-5" /> Guardar Foto
                      </Button>
                      <Button 
                        onClick={() => setSelectedMedia(null)}
                        className="flex-1 h-16 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
                      >
                        Cerrar
                      </Button>
                    </div>
                  </footer>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── IDENTIFICACIÓN Y SUBIDA (Mismo flujo pero con mejor Estética) ── */}
            {isUploadOpen && !identity && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                <div className="text-center space-y-4 py-6">
                   <div className="w-24 h-24 rounded-[2.8rem] p-1 mx-auto mb-6 border-4 border-white/10 overflow-hidden shadow-2xl shadow-purple-500/10 rotate-3">
                    {event.cover_image_url ? (
                      <img src={event.cover_image_url} className="w-full h-full object-cover rounded-[2.3rem]" />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex items-center justify-center rounded-[2.3rem]">
                        <User className="w-10 h-10 text-white/20" />
                      </div>
                    )}
                  </div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">¡Bienvenido!</h2>
                  <p className="text-white/40 text-sm font-medium">Cuéntanos quién eres para participar en la gala.</p>
                </div>

                <div className="bg-zinc-900/60 backdrop-blur-3xl border border-white/10 p-8 rounded-[3.5rem] space-y-8 shadow-2xl">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-2 px-2">
                       Tu Nombre <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Pj. David M."
                      value={nameInput}
                      onChange={(e) => { setNameInput(e.target.value); setIdentityError(""); }}
                      className="bg-black/60 border-white/5 h-16 rounded-[1.5rem] focus:border-purple-500/30 text-white placeholder:text-white/5 text-lg font-bold px-6"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 flex items-center gap-2 px-2">
                       Correo <span className="text-white/20">(opcional)</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="david@ejemplo.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="bg-black/60 border-white/5 h-16 rounded-[1.5rem] focus:border-purple-500/30 text-white placeholder:text-white/5 text-lg font-bold px-6"
                    />
                  </div>

                  {identityError && (
                    <p className="text-red-400 text-xs font-bold text-center animate-pulse">{identityError}</p>
                  )}
                </div>

                <div className="flex gap-4">
                   <Button variant="ghost" onClick={() => setIsUploadOpen(false)} className="flex-1 h-16 rounded-3xl font-bold text-white/30 hover:text-white">Volver</Button>
                   <Button
                    onClick={handleIdentitySubmit}
                    className="flex-[2] h-18 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all text-black hover:brightness-110"
                    style={{ backgroundColor: event.branding_color }}
                  >
                    CONTINUAR <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {isSuccess && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900/60 backdrop-blur-3xl border-2 border-green-500/10 p-12 rounded-[4rem] flex flex-col items-center justify-center text-center shadow-2xl my-auto"
              >
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,197,94,0.3)] animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-3 leading-none">¡Brillante!</h2>
                <p className="text-white/40 mb-10 font-bold italic tracking-wide">Tu foto ya está iluminando el evento.</p>
                <Button
                  onClick={() => setIsSuccess(false)}
                  className="bg-white text-black font-black h-16 px-12 rounded-[2rem] uppercase tracking-widest text-[10px] shadow-2xl active:scale-95 transition-all"
                >
                  Subir otra
                </Button>
              </motion.div>
            )}

            {isUploadOpen && identity && !isSuccess && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl p-6 flex flex-col overflow-y-auto"
              >
                <div className="max-w-md mx-auto w-full pt-10">
                   <header className="flex justify-between items-center mb-12">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1.2rem] flex items-center justify-center text-black text-lg font-black shadow-xl shadow-purple-500/10" style={{ backgroundColor: event.branding_color }}>
                          {identity.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black italic uppercase tracking-[0.1em]">{identity.name}</p>
                          <p className="text-[9px] text-white/30 uppercase font-bold tracking-[0.3em] mt-0.5">Subiendo Momento</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setIsUploadOpen(false)} className="rounded-2xl bg-white/5 w-12 h-12 border border-white/10 hover:bg-red-500/10 group">
                        <X className="w-6 h-6 text-white group-hover:text-red-400 transition-colors" />
                      </Button>
                   </header>

                   {/* Upload Area */}
                   <div
                    onClick={() => !previewUrl && fileInputRef.current?.click()}
                    className={`relative bg-zinc-900/60 border-2 border-dashed border-white/10 rounded-[3.5rem] flex flex-col items-center justify-center text-center transition-all overflow-hidden mb-10 ${previewUrl ? 'aspect-square sm:aspect-video border-solid border-white/20' : 'py-20 px-8 cursor-pointer hover:border-purple-500/40 active:scale-[0.98]'}`}
                  >
                    {previewUrl ? (
                      <>
                        {selectedFile?.type.startsWith('video') ? (
                          <video src={previewUrl} className="w-full h-full object-cover" autoPlay muted loop />
                        ) : (
                          <img src={previewUrl} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute top-4 right-4 flex gap-2">
                           <button
                             onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setSelectedFile(null); }}
                             className="bg-red-500/80 backdrop-blur-md p-3 rounded-2xl shadow-xl hover:bg-red-500 transition-colors"
                           >
                             <X className="w-4 h-4 text-white" />
                           </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl animate-pulse" style={{ backgroundColor: `${event.branding_color}22`, border: `2px solid ${event.branding_color}44` }}>
                          <Camera className="w-10 h-10" style={{ color: event.branding_color }} />
                        </div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Capturar Vida</h2>
                        <p className="text-white/30 text-xs mt-2 font-black tracking-widest leading-relaxed">
                          Toca aquí para seleccionar <br/> una foto o video increíble
                        </p>
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

                  {/* Dedicatoria context */}
                  <div className="bg-zinc-900/40 p-8 rounded-[3rem] border border-white/5 shadow-2xl mb-12">
                    <label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 flex items-center gap-2 mb-4 px-2">
                       Mensaje Público <span className="text-white/10">(Saludando...)</span>
                    </label>
                    <textarea
                      placeholder="¡Felicidades a los novios! Los queremos mucho..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full bg-transparent border-none p-0 text-white focus:outline-none placeholder:text-white/5 text-lg font-medium italic leading-relaxed resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleSend}
                    disabled={uploading || (!selectedFile && !message)}
                    className="w-full h-20 bg-white text-black hover:bg-zinc-200 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 active:scale-[0.97] transition-all disabled:opacity-20 border-b-8 border-zinc-300"
                  >
                    {uploading ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : (
                      <><Send className="w-7 h-7" /> ENVIAR AHORA</>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="py-12 text-center">
           <div className="flex items-center justify-center gap-4 mb-4 opacity-10">
              <div className="h-px w-12 bg-white" />
              <div className="w-1 h-1 rounded-full bg-white" />
              <div className="h-px w-12 bg-white" />
           </div>
          <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black italic">
            QRFoto High End Events
          </p>
        </footer>

        {/* ── FAB PRO ── */}
        {!isUploadOpen && !isSuccess && (
           <motion.button
            initial={{ scale: 0, rotate: -45, y: 100 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsUploadOpen(true)}
            className="fixed bottom-10 right-8 w-20 h-20 rounded-[2.2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-40 border-4 border-black group overflow-hidden"
            style={{ backgroundColor: event.branding_color }}
           >
             <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
             <Plus className="w-8 h-8 text-black group-hover:scale-125 transition-transform" />
           </motion.button>
        )}
      </div>
    </div>
  );
}
