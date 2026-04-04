"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Palette, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";

export default function EventSettingsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [name, setName] = useState("");
  const [brandingColor, setBrandingColor] = useState("#8b5cf6");
  const [coverUrl, setCoverUrl] = useState("");

  useEffect(() => {
    fetch(`${getApiUrl()}/events/${slug}`)
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
    try {
      const res = await fetch(`${getApiUrl()}/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          branding_color: brandingColor,
          cover_image_url: coverUrl
        }),
      });
      if (res.ok) {
        alert("Configuración guardada correctamente! ✨");
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  if (loading) return <div className="text-white p-10 font-bold animate-pulse">Cargando configuración...</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/events">
          <Button variant="ghost" size="icon" className="rounded-full border border-white/10">
            <ArrowLeft className="w-5 h-5 text-white/50" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Editar Evento</h2>
          <p className="text-white/50 mt-1">Configura la identidad visual de tu galería.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Side: Form */}
        <div className="space-y-6">
          <Card className="bg-zinc-950 border-white/10 p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-white/70">Nombre Público del Evento</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="bg-black border-white/10 text-white h-12"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-400">
                <Palette className="w-5 h-5" />
                <h3 className="font-semibold">Branding y Colores</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-white/40">Color Principal</Label>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="color" 
                      value={brandingColor}
                      onChange={(e) => setBrandingColor(e.target.value)}
                      className="w-12 h-12 rounded-lg bg-transparent cursor-pointer border-0"
                    />
                    <Input 
                      value={brandingColor}
                      readOnly
                      className="bg-black border-white/10 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400">
                <ImageIcon className="w-5 h-5" />
                <h3 className="font-semibold">Imagen de Portada</h3>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase text-white/40">URL de la imagen (S3/Cloudinary)</Label>
                <Input 
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-black border-white/10 text-white"
                />
              </div>
            </div>

            <Button 
                onClick={handleSave}
                className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Guardar Cambios
            </Button>
          </Card>
        </div>

        {/* Right Side: Preview */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/30">Vista Previa (Móvil)</h3>
          <div className="w-full aspect-[9/16] max-w-[300px] mx-auto border-[8px] border-zinc-800 rounded-[3rem] bg-black overflow-hidden shadow-2xl relative">
            {/* Mock Landing Guest */}
            <div className={`h-full flex flex-col`}>
                <div className="h-32 w-full relative overflow-hidden">
                    <div 
                        className="absolute inset-0 opacity-50 blur-xl"
                        style={{ backgroundColor: brandingColor }}
                    />
                    {coverUrl ? (
                        <img src={coverUrl} className="w-full h-full object-cover relative z-10" />
                    ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-white/20">Sin Portada</div>
                    )}
                </div>
                <div className="flex-1 p-6 text-center space-y-6 pt-10">
                    <h4 className="text-xl font-bold" style={{ color: brandingColor }}>{name}</h4>
                    <p className="text-xs text-white/40">Bienvenido, haz clic abajo para subir tu foto.</p>
                    <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-lg" style={{ backgroundColor: brandingColor }}>
                        <ImageIcon className="w-8 h-8 text-white" />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
