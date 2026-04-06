"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Camera, User, MessageSquareQuote, QrCode, MonitorUp, X, Ban } from "lucide-react";
import { io } from "socket.io-client";
import { getApiUrl, getBaseUrl } from "@/lib/api";
import { QRCodeSVG } from "qrcode.react";
import { Logo } from "@/components/Logo";
import { useTranslation } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";

export default function SlideshowPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const [media, setMedia] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [version, setVersion] = useState(0); // Contador monotónico: fuerza re-ejecución aunque el índice no cambie
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    let socket: any;

    const init = async () => {
      try {
        const evRes = await fetch(`${getApiUrl()}/events/slug/${slug}`);
        const evData = await evRes.json();

        if (!evData || !evData.id) {
          console.error("CRITICAL: Event ID not found. Real-time updates disabled.");
          setLoading(false);
          return;
        }

        setEvent(evData);

        // CHECK IF SLIDESHOW IS ENABLED (public endpoint — no auth needed)
        const settingsRes = await fetch(`${getApiUrl()}/admin/public-settings`);
        const settingsData = await settingsRes.json();

        if (settingsData && settingsData.isSlideshowEnabled === false) {
          setLoading(false);
          setEvent({ ...evData, disabled: true });
          return;
        }

        if (evData.status === 'Finished') {
          setLoading(false);
          setEvent(evData);
          return;
        }

        const medRes = await fetch(`${getApiUrl()}/media/${slug}`);
        const medData = await medRes.json();
        setMedia(medData);
        setLoading(false);

        // REAL-TIME SETUP
        const parsedUrl = new URL(getApiUrl(), window.location.origin);
        const socketUrl = parsedUrl.origin;

        socket = io(socketUrl, {
          transports: ['websocket'],
          reconnectionAttempts: 10,
          timeout: 10000,
        });

        socket.on("connect", () => {
          console.log("SUCCESS: Connected to QRFoto Real-time Engine");
          socket.emit('joinEvent', evData.id);
        });

        socket.on("mediaAdded", (newMedia: any) => {
          setMedia((prev) => {
            if (prev.find(m => m.id === newMedia.id)) return prev;
            return [newMedia, ...prev];
          });
          setCurrentIndex(0);
          setVersion(v => v + 1); // Fuerza que el timer se reinicie aunque el índice ya fuera 0
        });

        socket.on("connect_error", (err: any) => {
          console.error("Socket Error:", err.message);
        });
      } catch (err) {
        console.error("Error loading slideshow:", err);
      }
    };

    init();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [slug]);

  // Automatic Rotation
  // IMPORTANTE: depende de `version` (no de `currentIndex`) para evitar el bug de stale closure
  // donde setCurrentIndex(0) no dispara re-render si currentIndex ya era 0, congelando el slideshow.
  useEffect(() => {
    if (media.length === 0) return;

    const duration = 8000; // 8 seconds per slide

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % media.length);
      setVersion(v => v + 1); // Siempre incrementa → el efecto siempre se vuelve a programar
    }, duration);

    return () => clearTimeout(timer);
  }, [version, media]); // `version` garantiza re-ejecución aunque currentIndex no cambie

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
      <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
      <p className="tracking-widest uppercase text-xs opacity-50 font-black">{t.slideshow.syncing}</p>
    </div>
  );

  if (event?.status === 'Finished') return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-10 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]" />
      <div className="w-40 h-40 rounded-[3rem] border-4 border-white/5 flex items-center justify-center mb-10 relative z-10 shadow-3xl">
        <Ban className="w-16 h-16 text-white/20" />
      </div>
      <h1 className="text-6xl md:text-8xl font-black mb-6 uppercase tracking-tighter italic relative z-10 text-white/80">{event.name}</h1>
      <p className="text-2xl text-white/40 max-w-2xl font-medium tracking-tight relative z-10 border-t border-white/5 pt-8">
        Este evento ha finalizado. La galería pública ha sido deshabilitada.
      </p>
    </div>
  );

  if (event?.disabled) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-10 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]" />
      <div className="w-32 h-32 rounded-full border-4 border-dashed border-red-500/20 flex items-center justify-center mb-8 relative z-10">
        <QrCode className="w-12 h-12 text-white/20" />
      </div>
      <h1 className="text-6xl font-black mb-4 uppercase tracking-tighter italic relative z-10 text-white/80">{t.slideshow.disabled_title}</h1>
      <p className="text-xl text-white/40 max-w-xl font-medium tracking-tight relative z-10">
        {t.slideshow.disabled_desc}
      </p>
    </div>
  );

  if (media.length === 0) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-10 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]" />
      <div className="w-32 h-32 rounded-full border-4 border-dashed border-white/10 flex items-center justify-center mb-8 relative z-10">
        <Camera className="w-12 h-12 text-white/20 animate-pulse" />
      </div>
      <h1 className="text-6xl font-black mb-4 uppercase tracking-tighter italic relative z-10" style={{ color: event?.branding_color }}>{t.slideshow.ready_title}</h1>
      <p className="text-xl text-white/40 max-w-xl font-medium tracking-tight relative z-10">{t.slideshow.ready_desc}</p>
    </div>
  );

  const currentMedia = media[currentIndex];

  return (
    <div className="h-screen bg-black overflow-hidden relative font-sans selection:bg-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMedia.id}
          initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {currentMedia.file_type === 'video' ? (
            <video
              src={currentMedia.file_url}
              className="w-full h-full object-contain shadow-2xl"
              autoPlay
              muted
              playsInline
            />
          ) : (
            <img
              src={currentMedia.file_url}
              alt="Moment"
              className="w-full h-full object-contain shadow-2xl"
            />
          )}

          {/* User Badge / Social Proof */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-12 left-12 flex items-center gap-6 bg-black/40 backdrop-blur-3xl px-8 py-5 rounded-[2.5rem] border border-white/10 shadow-2xl"
          >
            <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-black text-2xl font-black shadow-xl" style={{ backgroundColor: event?.branding_color || '#a855f7' }}>
              {currentMedia.guest_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-1">Capturado por</p>
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{currentMedia.guest_name || t.slideshow.guest}</h3>
            </div>
          </motion.div>

          {/* Dedicatoria context */}
          {currentMedia.message && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute bottom-12 right-12 max-w-md bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: event?.branding_color }} />
              <MessageSquareQuote className="absolute top-4 right-6 w-12 h-12 text-white/5" />
              <p className="text-2xl font-medium text-white italic leading-relaxed">
                "{currentMedia.message}"
              </p>
            </motion.div>
          )}

          {/* Watermark Logo */}
          <div className="absolute top-12 left-12 opacity-30 grayscale contrast-125">
            <Logo size="md" isDark={true} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Floating Info Pill (Fixed to the top right) */}
      <div className="absolute top-12 right-12 flex flex-col items-end gap-3 z-50">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/60 backdrop-blur-3xl px-6 py-3 rounded-full border border-white/10 flex items-center gap-3 shadow-2xl"
        >
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          <p className="text-[10px] font-black text-white italic tracking-[0.2em] uppercase">QRFoto Life Stream</p>
          <div className="h-4 w-px bg-white/20 mx-1" />
          <p className="text-[10px] font-black text-white italic tracking-[0.2em] uppercase opacity-40">{event?.name}</p>
        </motion.div>

        <button
          onClick={() => setQrOpen(true)}
          className="bg-white/5 hover:bg-white/10 backdrop-blur-3xl px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3 transition-all hover:scale-110"
        >
          <QrCode className="w-4 h-4 text-white/60" />
          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Mostrar QR</span>
        </button>
      </div>

      {/* Floating Help Button */}
      <button
        onClick={() => setHelpOpen(true)}
        className="absolute bottom-12 right-12 md:bottom-auto md:top-40 md:right-12 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 flex items-center justify-center transition-all z-50"
      >
        <MonitorUp className="w-5 h-5 text-white/30" />
      </button>

      {/* MODAL: QR Fullscreen Overlay */}
      <AnimatePresence>
        {qrOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-10"
            onClick={() => setQrOpen(false)}
          >
            <button className="absolute top-12 right-12 w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <X className="w-10 h-10" />
            </button>

            <div className="bg-white p-16 rounded-[4rem] shadow-[0_0_100px_rgba(255,255,255,0.1)] mb-12 rotate-[-2deg]">
              <QRCodeSVG value={`${getBaseUrl()}/event/${slug}`} size={450} />
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter">{t.slideshow.ready_title}</h2>
              <p className="text-xl text-white/40 font-medium tracking-wide uppercase">{t.slideshow.ready_desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: HELP Fullscreen Overlay */}
      <AnimatePresence>
        {helpOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] bg-zinc-950/98 backdrop-blur-3xl flex flex-col items-center justify-center p-10 text-center"
            onClick={() => setHelpOpen(false)}
          >
            <div className="max-w-2xl space-y-12">
              <h2 className="text-6xl font-black italic uppercase tracking-tighter">Guía de Visualización</h2>
              <div className="grid grid-cols-2 gap-8 text-left">
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                  <p className="text-purple-400 font-black mb-4 uppercase tracking-widest text-xs">Modo TV / Pantalla</p>
                  <p className="text-sm font-medium leading-relaxed opacity-60 italic">Presiona F11 en tu teclado para entrar en modo pantalla completa y ocultar las barras del navegador.</p>
                </div>
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                  <p className="text-purple-400 font-black mb-4 uppercase tracking-widest text-xs">Carga Dinámica</p>
                  <p className="text-sm font-medium leading-relaxed opacity-60 italic">Las nuevas fotos aparecen automáticamente al principio de la rotación sin necesidad de refrescar.</p>
                </div>
              </div>
              <Button className="h-16 px-12 bg-white text-black font-black uppercase rounded-full">Entendido</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Background Glow (Dynamic Color) */}
      <div
        className="fixed inset-0 -z-50 opacity-20 blur-[150px] scale-150 animate-pulse"
        style={{ background: `radial-gradient(circle, ${event?.branding_color || '#a855f7'} 0%, transparent 70%)` }}
      />
    </div>
  );
}
