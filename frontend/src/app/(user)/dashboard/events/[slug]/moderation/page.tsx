"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  ShieldAlert,
  ServerCrash,
  Radio,
  Ban,
  MessageSquareWarning
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getApiUrl, getBaseUrl, getAuthHeaders } from "@/lib/api";
import { io } from "socket.io-client";

export default function ModerationPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Radar State
  const [activeGuests, setActiveGuests] = useState<any[]>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    let newSocket: any;
    
    // Cargar info del evento
    fetch(`${getApiUrl()}/events/slug/${slug}`, {
      headers: getAuthHeaders() as any
    })
      .then(res => res.json())
      .then(data => {
        setEvent(data);
        fetchMedia();

        // Connect Tracker
        const baseUrl = getBaseUrl().replace('http://', '').replace('https://', '').split(':')[0];
        const port = window.location.hostname === 'localhost' ? ':3001' : '';
        const socketUrl = window.location.hostname === 'localhost' ? `http://${baseUrl}${port}` : 'https://api.qrfoto.com.mx';
        
        newSocket = io(socketUrl);
        setSocket(newSocket);
        
        newSocket.on("connect", () => {
          // Join the room to listen to activeGuestsSync, but we don't send a deviceId since we are not a guest
          newSocket.emit("joinEvent", { eventId: data.id, name: "Moderador" });
        });

        newSocket.on("activeGuestsSync", (guests: any[]) => {
          // Filter out the moderator if needed, or just show all
          setActiveGuests(guests.filter(g => g.name !== "Moderador"));
        });

      })
      .catch(() => setLoading(false));

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [slug]);

  const fetchMedia = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/media/${slug}`);
      if (res.ok) {
        setMedia(await res.json());
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ ¿Estás seguro de eliminar esta foto? Se borrará de la pantalla en vivo y liberarás espacio. Esta acción no se puede deshacer.")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`${getApiUrl()}/media/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders() as any,
      });
      
      if (res.ok) {
        setMedia(media.filter(m => m.id !== id));
      } else {
        alert("Error al eliminar la imagen. Asegúrate de tener permisos.");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Error de red al intentar eliminar.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleWarnUser = (deviceId: string) => {
    if(!socket || !event) return;
    if(confirm("⚠️ ¿Enviar amonestación a este usuario?")) {
        socket.emit("warnGuest", { eventId: event.id, deviceId });
    }
  };

  const handleBlockUser = (deviceId: string) => {
    if(!socket || !event) return;
    if(confirm("⛔ ¿BLOQUEAR permanentemente a este usuario? Se activará la pantalla negra en su celular.")) {
        socket.emit("blockGuest", { eventId: event.id, deviceId });
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
      <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Cargando Centro de Moderación...</p>
    </div>
  );

  return (
    <div className="space-y-10 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard/events">
            <Button variant="ghost" size="icon" className="group rounded-2xl border border-zinc-100 hover:bg-zinc-50 h-14 w-14 bg-white shadow-sm transition-all">
              <ArrowLeft className="w-6 h-6 text-zinc-400 group-hover:text-red-500 transition-colors" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              <h1 className="text-3xl font-black italic tracking-tighter text-zinc-900 uppercase">
                Centro de Moderación
              </h1>
            </div>
            <p className="text-zinc-400 font-medium tracking-wide text-xs uppercase mt-1">
              Control En Vivo para <span className="text-red-500 font-bold">{event?.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* RADAR DE CONEXIONES LIVE */}
      <div className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <h2 className="text-xl font-black italic tracking-tighter text-zinc-900 uppercase">Radar en Vivo</h2>
          <span className="ml-auto bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-2 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> {activeGuests.length} Conectados
          </span>
        </div>

        {activeGuests.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Radio className="w-10 h-10 text-zinc-200 mb-3" />
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Nadie subiendo fotos en este momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {activeGuests.map((guest) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  key={guest.deviceId} 
                  className="bg-zinc-50 border border-zinc-100 p-5 rounded-[2rem] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-200 flex items-center justify-center text-zinc-500 font-black">
                      {guest.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black italic tracking-tight">{guest.name}</p>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{guest.deviceId.slice(0, 10)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button onClick={() => handleWarnUser(guest.deviceId)} size="icon" variant="ghost" className="h-10 w-10 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl">
                      <MessageSquareWarning className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleBlockUser(guest.deviceId)} size="icon" variant="ghost" className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl">
                      <Ban className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {media.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-[3rem] bg-white text-center">
              <ImageIcon className="w-16 h-16 text-zinc-200 mb-4" />
              <p className="text-lg font-black text-zinc-400 uppercase italic">Galería Limpia</p>
              <p className="text-xs text-zinc-400 font-medium max-w-sm mt-2">Aún no hay fotos en el evento o ya has borrado todo.</p>
            </div>
          ) : (
            media.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group relative bg-white border border-zinc-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all h-72 flex flex-col"
              >
                <div className="relative flex-1 bg-zinc-900">
                  {item.file_type === 'video' ? (
                    <video src={item.file_url} className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <img src={item.file_url} className="w-full h-full object-cover opacity-80" alt="Recuerdo" />
                  )}
                  {/* Overlay gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  {/* Info Invitado Arriba */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <span className="bg-black/50 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10">
                      {item.guest_name || 'Anónimo'}
                    </span>
                  </div>

                  {/* Acciones de Moderación (Ocultas hasta hover) */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-sm bg-black/40 transition-all duration-300 z-20">
                    <Button 
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-2xl h-14 px-6 font-black uppercase tracking-widest text-xs flex items-center gap-3 active:scale-95 transition-transform"
                    >
                      {deletingId === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                      Eliminar
                    </Button>
                  </div>
                </div>

                {/* Mensaje Abajo si lo hay */}
                {item.message && (
                  <div className="h-16 bg-white border-t border-zinc-100 flex items-center px-4 overflow-hidden">
                    <p className="text-xs text-zinc-600 font-medium italic truncate w-full">
                      "{item.message}"
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
