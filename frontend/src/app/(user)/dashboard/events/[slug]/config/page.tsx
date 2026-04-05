"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Save, 
  Palette, 
  Image as ImageIcon, 
  ChevronRight, 
  Monitor, 
  Smartphone,
  Eye,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { getApiUrl, getAuthHeaders } from "@/lib/api";

export default function EventSettingsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [brandingColor, setBrandingColor] = useState("#8b5cf6");
  const [coverUrl, setCoverUrl] = useState("");

  useEffect(() => {
    fetch(`${getApiUrl()}/events/${slug}`, {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => {
        setEvent(data);
        setName(data.name);
        setBrandingColor(data.branding_color || "#8b5cf6");
        setCoverUrl(data.cover_image_url || "");
        setLoading(false);
      });
  }, [slug]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${getApiUrl()}/events/${event.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name,
          branding_color: brandingColor,
          cover_image_url: coverUrl
        }),
      });
      if (res.ok) {
        alert("¡Configuración guardada! ✨");
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating event:", error);
    } finally {
        setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
        <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Cargando Ajustes...</p>
    </div>
  );

  return (
    <div className="space-y-10 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
            <Link href="/dashboard/events">
                <Button variant="ghost" size="icon" className="group rounded-2xl border border-zinc-100 hover:bg-zinc-50 h-14 w-14 bg-white shadow-sm transition-all">
                    <ArrowLeft className="w-6 h-6 text-zinc-400 group-hover:text-purple-600 transition-colors" />
                </Button>
            </Link>
            <div>
                <h2 className="text-3xl font-black tracking-tighter italic text-zinc-900 leading-none">
                    Ajustes de <span className="text-purple-600">Marca</span>
                </h2>
                <p className="text-zinc-400 font-bold text-sm mt-2 uppercase tracking-widest">
                    Personaliza la experiencia para tus invitados
                </p>
            </div>
        </div>

        <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="h-16 px-10 bg-purple-600 text-white hover:bg-purple-700 rounded-full font-black uppercase tracking-widest text-sm shadow-2xl shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-95 group"
        >
            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <div className="flex items-center gap-2">
                    <Save className="w-5 h-5 mr-1" /> Guardar Cambios
                </div>
            )}
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Configuration Panels */}
        <div className="lg:col-span-7 space-y-8">
          <Card className="bg-white border-zinc-100 p-10 rounded-[3rem] shadow-xl shadow-zinc-100/50 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Settings className="w-32 h-32 text-purple-600 -mr-10 -mt-10" />
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                        <Globe className="w-5 h-5" />
                    </div>
                    <Label className="text-zinc-900 text-lg font-black italic tracking-tight italic">Identidad Visual</Label>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-black ml-1">Nombre Público</Label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Boda de Ana & Diego"
                    className="bg-zinc-50 border-zinc-100 text-zinc-900 h-16 rounded-2xl focus:ring-purple-600/20 font-bold px-6 text-lg"
                  />
                  <p className="text-[10px] text-zinc-300 font-bold ml-1">Este nombre aparecerá en la parte superior de la galería.</p>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Palette className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black italic text-zinc-900 tracking-tight">Colores del Tema</h3>
              </div>
              
              <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100">
                  <div className="space-y-4">
                    <Label className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-black ml-1">Color de Acento</Label>
                    <div className="flex gap-6 items-center">
                      <div className="relative">
                          <input 
                            type="color" 
                            value={brandingColor}
                            onChange={(e) => setBrandingColor(e.target.value)}
                            className="w-20 h-20 rounded-3xl bg-white p-2 cursor-pointer border border-zinc-200 shadow-xl"
                          />
                          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 border shadow-sm">
                             <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <Input 
                          value={brandingColor.toUpperCase()}
                          readOnly
                          className="bg-white border-zinc-200 text-zinc-900 font-black h-14 rounded-2xl px-6 text-center tracking-widest"
                        />
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest text-center">Código Hexadecimal</p>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <ImageIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black italic text-zinc-900 tracking-tight">Multimedia</h3>
              </div>
              
              <div className="space-y-4">
                <Label className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-black ml-1">URL de Imagen de Portada</Label>
                <div className="relative group">
                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 transition-colors group-focus-within:text-indigo-600" />
                    <Input 
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://bucket.s3.amazonaws.com/mi-portada.jpg"
                      className="bg-zinc-50 border-zinc-100 text-zinc-900 h-16 rounded-2xl focus:ring-indigo-600/20 font-bold pl-16 pr-6"
                    />
                </div>
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                   <Sparkles className="w-4 h-4 text-indigo-400 mt-1" />
                   <p className="text-[10px] text-indigo-600 font-bold leading-relaxed italic">
                        Tip: Usa imágenes horizontales de alta calidad (1920x1080) para un mejor impacto visual en la bienvenida.
                   </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: High Fidelity Preview */}
        <div className="lg:col-span-5 sticky top-28">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-zinc-400" />
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400 italic">Live Preview</h3>
                </div>
                <div className="flex bg-zinc-100 p-1 rounded-full border border-zinc-200">
                    <button className="p-2 bg-white rounded-full shadow-sm">
                        <Smartphone className="w-4 h-4 text-purple-600" />
                    </button>
                    <button className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
                        <Monitor className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <motion.div 
                animate={{ rotateY: [0, 2, -2, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
                className="w-full aspect-[9/18.5] max-w-[340px] mx-auto border-[12px] border-zinc-900 rounded-[3.5rem] bg-white overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.15)] relative ring-1 ring-white/20 ring-inset"
            >
                {/* Smartphone Details */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-7 bg-zinc-900 rounded-b-[1.5rem] z-50 flex items-center justify-center">
                    <div className="w-8 h-2 bg-zinc-800 rounded-full" />
                </div>
                
                {/* Mock Guest View UI */}
                <div className="h-full flex flex-col bg-[#FDFDFD]">
                    <div className="h-48 w-full relative overflow-hidden bg-zinc-100">
                        <AnimatePresence mode="wait">
                            {coverUrl ? (
                                <motion.img 
                                    key={coverUrl}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    src={coverUrl} 
                                    className="w-full h-full object-cover relative z-10" 
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-8 space-y-4 text-center">
                                    <div className="w-12 h-12 rounded-full bg-zinc-200 animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Esperando imagen de portada...</p>
                                </div>
                            )}
                        </AnimatePresence>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-20" />
                        <div className="absolute bottom-6 left-6 z-30">
                             <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-black italic italic">QR</div>
                        </div>
                    </div>

                    <div className="flex-1 p-8 text-center space-y-8 flex flex-col items-center pt-10">
                        <Link href="/">
                            <span className="text-[10px] font-black tracking-[0.5em] text-zinc-300 uppercase mb-4 block">Powered by QRFoto</span>
                        </Link>
                        
                        <div className="space-y-2">
                           <motion.h4 
                            animate={{ color: brandingColor }}
                            className="text-2xl font-black italic tracking-tighter leading-tight"
                           >
                            {name || "Nombre del Evento"}
                           </motion.h4>
                           <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Galería Interactiva Live</p>
                        </div>

                        <div className="w-full h-px bg-zinc-100" />

                        <div className="space-y-6 flex-1 flex flex-col justify-center">
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed">¡Bienvenido! Comparte aquí tus mejores momentos y descúbrelos en la pantalla principal.</p>
                            
                            <motion.div 
                                animate={{ backgroundColor: brandingColor, boxShadow: `0 20px 40px ${brandingColor}30` }}
                                className="w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center relative group"
                            >
                                <Zap className="absolute -top-2 -right-2 text-yellow-400 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <ImageIcon className="w-10 h-10 text-white" />
                            </motion.div>
                            
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">Toca para subir fotos</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <p className="text-center text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">Esta es una aproximación visual de la interfaz del invitado.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
