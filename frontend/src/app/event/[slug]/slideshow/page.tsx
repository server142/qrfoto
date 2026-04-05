"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Camera, User, MessageSquareQuote, QrCode } from "lucide-react";
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

        // CHECK IF SLIDESHOW IS ENABLED
        const settingsRes = await fetch(`${getApiUrl()}/admin/settings`);
        const settingsData = await settingsRes.json();

        if (settingsData && settingsData.isSlideshowEnabled === false) {
          setLoading(false);
          setEvent({ ...evData, disabled: true });
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

    const currentItem = media[currentIndex];
    if (!currentItem) return;
    const duration = currentItem.file_type === 'video' ? 18000 : 8000;

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

  const [qrOpen, setQrOpen] = useState(false);
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
          {/* Background Blurred Glow */}
          <div
            className="absolute inset-0 -z-10 opacity-40 blur-[180px] scale-150 rotate-12 transition-all duration-1000"
            style={{
              backgroundImage: currentMedia.file_url ? `url(${currentMedia.file_url})` : 'none',
              backgroundColor: currentMedia.file_url ? 'transparent' : event.branding_color,
              backgroundSize: 'cover'
            }}
          />

          {!currentMedia.file_url ? (
            /* FULL SCREEN TYPOGRAPHY FOR MESSAGES ONLY */
            <div className="max-w-4xl p-12 text-center space-y-12 relative px-20">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                <MessageSquareQuote className="w-16 h-16 mx-auto mb-10 opacity-20" style={{ color: event.branding_color }} />
                <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-none whitespace-pre-wrap drop-shadow-2xl">
                  "{currentMedia.message}"
                </h2>
                <div className="mt-12 flex items-center justify-center gap-6">
                  <div className="h-[2px] w-12 bg-white/10" />
                  <p className="text-2xl font-bold uppercase tracking-widest text-white/60">{currentMedia.guest_name}</p>
                  <div className="h-[2px] w-12 bg-white/10" />
                </div>
              </motion.div>
            </div>
          ) : (
            /* PHOTO OR VIDEO */
            <div className="w-full h-full relative flex items-center justify-center">
              {currentMedia.file_type === 'video' ? (
                <video
                  src={currentMedia.file_url}
                  autoPlay
                  muted
                  className="w-full h-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                  onEnded={() => setCurrentIndex((prev) => (prev + 1) % media.length)}
                  onError={() => setCurrentIndex((prev) => (prev + 1) % media.length)}
                />
              ) : (
                <img
                  src={currentMedia.file_url}
                  className="w-full h-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                  alt="Memory"
                  onError={() => setCurrentIndex((prev) => (prev + 1) % media.length)}
                />
              )}

              {/* ELEGANT MESSAGE OVERLAY ON PHOTOS */}
              {currentMedia.message && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ delay: 0.4, duration: 0.7, type: "spring" }}
                  className="absolute bottom-32 left-12 max-w-xl"
                >
                  <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: event.branding_color }} />
                    <MessageSquareQuote className="absolute -top-4 -left-4 w-20 h-20 text-white/5 -rotate-12" />
                    <p className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug drop-shadow-sm mb-6">
                      {currentMedia.message}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: event.branding_color }}>
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-black uppercase tracking-widest text-white/60">{currentMedia.guest_name}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Overlay: Branding & Info */}
      <div className="absolute top-0 inset-x-0 p-12 flex justify-between items-start pointer-events-none bg-gradient-to-b from-black/80 to-transparent z-40">
        <div>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic drop-shadow-2xl" style={{ color: event.branding_color }}>
            {event.name}
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2 ml-1">Live Social Wall</p>
        </div>

        {/* Real-time indicator & Logo */}
        <div className="flex flex-col items-end gap-6 pointer-events-auto">
          <Logo size="md" isDark={true} className="drop-shadow-2xl opacity-80" />
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setQrOpen(true)}
              className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-full flex items-center gap-3 shadow-2xl hover:bg-white/10 transition-all active:scale-95"
            >
              <QrCode className="w-5 h-5" style={{ color: event.branding_color }} />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Código Invitado</p>
            </Button>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-full flex items-center gap-3 shadow-2xl hidden md:flex">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: event.branding_color }} />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Sync</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Overlay (Bottom Right - Small & Discreet for Desktop Viewers) */}
      <div className="absolute bottom-10 right-10 z-50 flex flex-col items-center gap-3 group hidden lg:flex">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-3 rounded-[2rem] shadow-2xl border-4"
          style={{ borderColor: event.branding_color }}
        >
          <QRCodeSVG
            value={`${process.env.NEXT_PUBLIC_FRONTEND_URL ?? getBaseUrl()}/event/${slug}`}
            size={120}
            level="H"
          />
        </motion.div>
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
          <QrCode className="w-3 h-3 text-white/40" />
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Scanner</p>
        </div>
      </div>

      {/* QR MODAL (For manual interactions) */}
      <AnimatePresence>
        {qrOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQrOpen(false)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-10 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-12 rounded-[4rem] flex flex-col items-center gap-10 shadow-[0_0_100px_rgba(255,255,255,0.1)] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl" onClick={() => setQrOpen(false)}>
                <Logo size="sm" />
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-4xl font-black italic tracking-tighter text-zinc-900 uppercase">¡Unete a la Galería!</h3>
                <p className="text-zinc-400 font-bold tracking-[0.2em] text-xs uppercase">Escanea para subir tus momentos</p>
              </div>

              <div className="p-1 border-4 rounded-[3.5rem]" style={{ borderColor: event.branding_color }}>
                <QRCodeSVG
                  value={`${process.env.NEXT_PUBLIC_FRONTEND_URL ?? getBaseUrl()}/event/${slug}`}
                  size={400}
                  level="H"
                />
              </div>

              <Button
                onClick={() => setQrOpen(false)}
                className="h-16 px-12 rounded-full font-black uppercase tracking-widest text-sm"
                style={{ backgroundColor: event.branding_color, color: 'white' }}
              >
                Cerrar y ver Galería
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Progress (Line) */}
      <div className="absolute bottom-0 left-0 h-1.5 bg-white/5 w-full z-50">
        <motion.div
          key={`${currentIndex}-${media.length}`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: currentMedia?.file_type === 'video' ? 18 : 8, ease: "linear" }}
          className="h-full"
          style={{ backgroundColor: event.branding_color }}
        />
      </div>
    </div>
  );
}
