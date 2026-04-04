"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Plus, Calendar, QrCode, ExternalLink, Trash2, Settings, Image as ImageIcon, Loader2, Printer, Download, Power, CheckCircle, Star, Share2, FileText } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getApiUrl, getBaseUrl } from "@/lib/api";

import { useTranslation } from "@/lib/LanguageContext";

export default function EventsPage() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [localConfig, setLocalConfig] = useState<any>(null);

  // Modal Finish State
  const [finishingEvent, setFinishingEvent] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState("");
  const [exporting, setExporting] = useState<string | null>(null);


  // Helper to get token from cookies
  const getToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/events`, {
        headers: {
          "Authorization": `Bearer ${getToken()}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Fetch local network config
    fetch(`${getApiUrl()}/config`)
      .then(r => r.json())
      .then(d => setLocalConfig(d))
      .catch(() => { });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;
    setIsCreating(true);

    try {
      const res = await fetch(`${getApiUrl()}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          name,
          description,
          event_date: new Date(date).toISOString(),
          expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }),
      });
      if (res.ok) {
        setOpen(false);
        setName("");
        setDescription("");
        setDate("");
        await fetchEvents();
      }
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.events.delete_confirm)) return;
    try {
      const res = await fetch(`${getApiUrl()}/events/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${getToken()}`
        }
      });
      if (res.ok) {
        await fetchEvents();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const submitFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finishingEvent) return;
    setIsFinishing(true);
    setFinishError("");

    try {
      const res = await fetch(`${getApiUrl()}/events/${finishingEvent.id}/status`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${getToken()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password,
          rating: rating > 0 ? rating : undefined,
          comment: comment.trim() !== '' ? comment : undefined
        })
      });

      if (res.ok) {
        setFinishingEvent(null);
        setPassword("");
        setRating(0);
        setComment("");
        await fetchEvents();
      } else {
        const d = await res.json();
        setFinishError(d.message || t.user_dashboard.finish_modal.wrong_password);
      }
    } catch (err) {
      setFinishError(t.user_dashboard.finish_modal.wrong_password);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleShare = async (event: any) => {
    const url = `${getBaseUrl()}/event/${event.slug}`;
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: event.name,
          text: `¡Únete a la galería de ${event.name} en QRFoto!`,
          url: url
        });
      } catch (err) {
        console.log("Share failed or cancelled");
      }
    } else {
      navigator.clipboard.writeText(url);
      alert(t.nav?.change_lang === 'English' ? "Link copied to clipboard!" : "¡Enlace copiado al portapapeles!");
    }
  };

  const handleExportPDF = async (event: any) => {
    setExporting(event.id);
    try {
      // Dynamic imports - SAFEST way to avoid server crashes
      const { jsPDF } = await import("jspdf");
      await import("jspdf-autotable");

      const res = await fetch(`${getApiUrl()}/media/${event.slug}`);
      const media = res.ok ? await res.json() : [];

      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(168, 85, 247);
      doc.text("QRFoto - Reporte de Evento", 14, 22);
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`Evento: ${event.name}`, 14, 32);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha: ${new Date(event.event_date).toLocaleDateString()}`, 14, 40);
      doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 46);
      
      const tableColumn = ["#", "Invitado", "Mensaje", "Fecha/Hora"];
      const tableRows = media.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((m: any, i: number) => [
        i + 1,
        m.guest_name || "Invitado",
        m.message || "-",
        new Date(m.created_at).toLocaleString()
      ]);

      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        theme: 'grid',
        headStyles: { fillColor: [168, 85, 247], textColor: [255, 255, 255] },
        styles: { fontSize: 9 }
      });

      doc.save(`${event.slug}-reporte.pdf`);
    } catch (err) {
      console.error("Export error:", err);
      alert("Error al generar PDF. Por favor, asegúrate de haber ejecutado 'npm install jspdf jspdf-autotable' en el servidor.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-950/50 p-6 sm:p-10 rounded-[2.5rem] border border-white/5 gap-6 sm:gap-0">
        <div className="space-y-2">
          <div className="flex items-center gap-4 group">
            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 transition-colors group-hover:bg-purple-500/20">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter italic text-white leading-none">
              Mis <span className="text-purple-500">Eventos</span>
            </h2>
          </div>
          <p className="text-[10px] sm:text-xs text-white/40 uppercase font-black tracking-[0.2em] ml-16 sm:ml-20 italic">
            {t.events.subtitle}
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto h-14 px-8 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-white/5 transition-all active:scale-95 group">
              <Plus className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90" />
              {t.events.create_btn}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950/95 backdrop-blur-xl border-white/10 text-white rounded-[2.5rem] p-8 sm:p-12 max-w-md shadow-2xl shadow-purple-600/5">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter mb-2">{t.events.create_dialog_title}</DialogTitle>
              <DialogDescription className="text-white/40 text-sm">{t.events.create_dialog_subtitle}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label className="text-white/60 text-[10px] uppercase tracking-widest font-black">{t.events.event_name}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Boda de Ana & Diego"
                  className="bg-black/40 border-white/5 text-white h-12 rounded-xl focus:border-purple-500/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-[10px] uppercase tracking-widest font-black">{t.events.event_date}</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-black/40 border-white/5 text-white h-12 rounded-xl focus:border-purple-500/50 [color-scheme:dark]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-[10px] uppercase tracking-widest font-black">{t.events.note}</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.events.placeholder_note}
                  className="bg-black/40 border-white/5 text-white h-12 rounded-xl focus:border-purple-500/50"
                />
              </div>
              <Button disabled={isCreating} type="submit" className="w-full h-14 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-purple-600/10 transition-all">
                {isCreating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t.events.submit_create}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading && events.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
          <p className="text-white/30 uppercase text-xs font-bold tracking-widest">{t.events.syncing}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.length === 0 ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-zinc-950/30">
              <Calendar className="w-16 h-16 text-white/5 mx-auto mb-6" />
              <h3 className="text-2xl font-black uppercase italic text-white/40">{t.events.no_events}</h3>
              <p className="text-white/30 text-sm mt-2 font-medium">{t.events.no_events_desc}</p>
            </div>
          ) : (
            events.map((event: any) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={event.id}>
                <Card className="bg-zinc-950 border-white/10 p-8 flex flex-col hover:border-purple-500/30 transition-all group rounded-[2rem] shadow-2xl relative overflow-hidden h-full">
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors italic leading-none">{event.name}</h3>
                      <p className="text-[10px] text-white/30 mt-2 uppercase font-black tracking-[0.2em]">{new Date(event.event_date).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                      <QrCode className="w-6 h-6 text-white/40" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-6 mb-8 relative z-10">
                    <div className="bg-white p-5 rounded-[2.5rem] flex flex-col items-center justify-center shadow-2xl shadow-purple-600/10 scale-100 group-hover:scale-105 transition-transform">
                      <QRCodeSVG
                        value={
                          window.location.hostname === 'localhost' && localConfig?.frontendUrl
                            ? `${localConfig.frontendUrl}/event/${event.slug}`
                            : `${getBaseUrl()}/event/${event.slug}`
                        }
                        size={160}
                        level="H"
                        includeMargin={false}
                      />
                      <p className="text-[9px] text-black/20 mt-4 font-mono font-bold tracking-tighter truncate w-full text-center">
                        QRFOTO-EID-{event.slug.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 relative z-10">
                    <Link href={`/event/${event.slug}/slideshow`} target="_blank" className="flex-1">
                      <Button
                        disabled={event.status !== 'Active'}
                        className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-30 rounded-2xl font-black uppercase tracking-widest text-[9px] h-12 gap-1.5 shadow-lg transition-all"
                      >
                        <ExternalLink className="w-3 h-3" /> PRESENTACIÓN
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleShare(event)}
                      className="flex-1 bg-purple-600 text-white hover:bg-purple-500 rounded-2xl font-black uppercase tracking-widest text-[9px] h-12 gap-1.5 shadow-lg transition-all"
                    >
                      <Share2 className="w-3 h-3" /> {(t as any).events?.share_btn || "Compartir"}
                    </Button>
                    <Link href={`/event/${event.slug}/card`} target="_blank" className="flex-1">
                      <Button className="w-full bg-white/5 hover:bg-white/10 text-white/80 rounded-2xl text-[10px] h-12 font-bold uppercase border border-white/5">
                        <Printer className="w-3.5 h-3.5 mr-1" /> {t.events.print}
                      </Button>
                    </Link>
                    <Button
                      onClick={async () => {
                        window.open(`${getApiUrl()}/media/${event.slug}/download`, '_blank');
                      }}
                      className="flex-1 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 rounded-2xl text-[10px] h-12 font-bold uppercase border border-purple-500/10"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> DESCARGAR
                    </Button>

                    <Button
                      onClick={() => handleExportPDF(event)}
                      disabled={exporting === event.id}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white/80 rounded-2xl text-[10px] h-12 font-bold uppercase border border-white/5"
                    >
                      {exporting === event.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 mr-1" />}
                      EXPORTAR
                    </Button>

                    <Button
                      onClick={() => setFinishingEvent({ ...event, isReactivating: event.status !== 'Active' })}
                      className={`flex-1 rounded-2xl text-[10px] h-12 font-bold uppercase border ${event.status === 'Active' ? 'bg-orange-500/10 text-orange-400 border-orange-500/10 hover:bg-orange-500/20' : 'bg-green-500/10 text-green-400 border-green-500/10 hover:bg-green-500/20'}`}
                    >
                      {event.status === 'Active' ? <Power className="w-3.5 h-3.5 mr-1" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                      {event.status === 'Active' ? "FINALIZAR" : t.events.activate_btn}
                    </Button>

                    <Link href={`/dashboard/events/${event.id}/config`} className="flex-1">
                      <Button className="w-full bg-white/5 hover:bg-white/10 text-white/80 rounded-2xl text-[10px] h-12 font-bold uppercase border border-white/5">
                        <Settings className="w-3.5 h-3.5 mr-1" /> {t.events.edit}
                      </Button>
                    </Link>
                    <Button onClick={() => handleDelete(event.id)} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl text-[10px] h-12 font-bold uppercase border border-red-500/10">
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> {t.events.delete}
                    </Button>
                  </div>

                  {/* Bg decoration */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-600/10 to-transparent -rotate-45 translate-x-12 -translate-y-12" />
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      <Dialog open={!!finishingEvent} onOpenChange={(val) => { if (!val) setFinishingEvent(null); }}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white rounded-[2rem] p-10 max-w-sm shadow-2xl shadow-purple-600/5">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter mb-2 text-center text-purple-500">
              {finishingEvent?.isReactivating ? t.events.activate_btn : t.user_dashboard.finish_modal.title}
            </DialogTitle>
            <DialogDescription className="text-white/40 text-sm text-center">
              {t.user_dashboard.finish_modal.subtitle}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitFinish} className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="text-white/60 text-[10px] uppercase tracking-widest font-black">{t.user_dashboard.finish_modal.password}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/40 border-white/5 text-white h-12 rounded-xl focus:border-purple-500/50"
                required
              />
              {finishError && <p className="text-red-500 text-xs mt-1">{finishError}</p>}
            </div>

            {!finishingEvent?.isReactivating && (
              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="text-center space-y-2">
                  <Label className="text-white/90 text-sm font-black">{t.user_dashboard.finish_modal.rating_title}</Label>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">{t.user_dashboard.finish_modal.rating_desc}</p>
                </div>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star className={`w-8 h-8 ${rating >= star ? 'fill-yellow-500 text-yellow-500' : 'text-white/20'}`} />
                    </button>
                  ))}
                </div>

                <div className="space-y-2 mt-4">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t.user_dashboard.finish_modal.comment_placeholder}
                    className="bg-black/40 border-white/5 text-white h-12 rounded-xl focus:border-purple-500/50"
                  />
                </div>
              </div>
            )}

            <Button disabled={isFinishing} type="submit" className="w-full h-14 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-purple-600/10 transition-all mt-4">
              {isFinishing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t.user_dashboard.finish_modal.submit}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
