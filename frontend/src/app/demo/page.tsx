"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Upload, Zap, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1533174000220-db6338b1f8eb?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1543604085-8468b426002f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800",
];

export default function GalleryDemo() {
  const [images, setImages] = useState<string[]>([]);
  const [showTutorial, setShowTutorial] = useState(true);

  // Simulate real-time Socket.io uploads
  useEffect(() => {
    if (showTutorial) return;
    
    // Add initial images
    setImages(MOCK_IMAGES.slice(0, 3));

    // Simulate new guests uploading photos every 3 seconds
    let index = 3;
    const interval = setInterval(() => {
      if (index < MOCK_IMAGES.length) {
        setImages((prev) => [MOCK_IMAGES[index], ...prev]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [showTutorial]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* --- 4. How it works (Tutorial Modal) --- */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-2xl w-full text-center shadow-2xl"
            >
              <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                ¿Cómo funciona QRFoto Events?
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8 text-left">
                <div className="bg-white/5 p-4 rounded-2xl">
                  <QrCode className="text-purple-400 w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-2">1. Escanea</h3>
                  <p className="text-sm text-white/60">Tus invitados escanean el código QR en la pantalla grande o mesa.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl">
                  <Upload className="text-pink-400 w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-2">2. Captura</h3>
                  <p className="text-sm text-white/60">Toman una foto o video desde su celular sin iniciar sesión.</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl">
                  <Zap className="text-yellow-400 w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-2">3. Disfruta</h3>
                  <p className="text-sm text-white/60">Aparece instantáneamente y de forma animada en la pared principal.</p>
                </div>
              </div>

              <Button 
                onClick={() => setShowTutorial(false)}
                className="w-full h-12 text-lg bg-white text-black hover:bg-white/90 rounded-xl"
              >
                Simular Evento en Vivo
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- 3. Live Gallery Demo --- */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Boda de Ana & Diego</h1>
            <p className="text-white/50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Evento en Vivo • {images.length} memorias subidas
            </p>
          </div>
          
          <div className="hidden md:flex flex-col items-center bg-white/5 p-3 rounded-xl border border-white/10">
            <QrCode className="w-20 h-20 mb-2" />
            <span className="text-xs uppercase font-bold tracking-wider text-purple-400">Escanea para subir</span>
          </div>
        </header>

        {/* Masonry-style Grid with Framer Motion */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          <AnimatePresence>
            {images.map((imgUrl, idx) => (
              <motion.div
                key={imgUrl}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15, 
                  mass: 1 
                }}
                className="relative group overflow-hidden rounded-2xl break-inside-avoid shadow-xl shadow-purple-900/10"
              >
                <img 
                  src={imgUrl} 
                  alt="Guest memory"
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Overlay data */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    Invitado Anónimo
                  </p>
                  <p className="text-xs text-white/70 mt-1">Hace unos segundos</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-900/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>
    </div>
  );
}
