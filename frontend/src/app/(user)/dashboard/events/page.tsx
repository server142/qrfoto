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
import {
  Plus,
  Calendar,
  QrCode,
  ExternalLink,
  Trash2,
  Settings,
  Image as ImageIcon,
  Loader2,
  Printer,
  Download,
  Power,
  CheckCircle,
  Star,
  Share2,
  FileText,
  ChevronRight,
  MoreVertical,
  Activity,
  Box
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  const [createError, setCreateError] = useState("");
  const [exporting, setExporting] = useState<string | null>(null);

  const getToken = () => {
    return typeof document !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;
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
        setCreateError("");
        setName("");
        setDescription("");
        setDate("");
        await fetchEvents();
      } else {
        const data = await res.json();
        setCreateError(data.message || "Error al crear el evento");
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
          text: `¡Únete a la galería de ${event.name} de QRFoto!`,
          url: url
        });
      } catch (err) {
        console.log("Share failed or cancelled");
      }
    } else {
      navigator.clipboard.writeText(url);
      alert(t.language === 'en' ? "Link copied to clipboard!" : "¡Enlace copiado al portapapeles!");
    }
  };

  const handleExportPDF = async (event: any) => {
    setExporting(event.id);
    try {
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
      alert("Error al generar PDF.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter italic text-zinc-900 leading-none">
            {t.language === 'en' ? 'My ' : 'Mis '} <span className="text-purple-600">{t.language === 'en' ? 'Events' : 'Eventos'}</span>
          </h2>
          <p className="text-zinc-400 font-bold text-sm mt-3 uppercase tracking-widest">{t.events.subtitle}</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button className="h-16 px-10 bg-zinc-900 text-white hover:bg-zinc-800 rounded-full font-black uppercase tracking-widest text-sm shadow-2xl shadow-zinc-200 transition-all active:scale-95 group">
              <Plus className="w-5 h-5 mr-3 transition-transform group-hover:rotate-90" />
              {t.events.create_btn}
            </Button>
          } />
          <DialogContent className="bg-white border-zinc-100 text-zinc-900 rounded-[3rem] p-10 max-w-md shadow-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                <Box className="text-purple-600 w-8 h-8" />
              </div>
              <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter mb-2">{t.events.create_dialog_title}</DialogTitle>
              <DialogDescription className="text-zinc-400 font-medium">{t.events.create_dialog_subtitle}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-black ml-1">{t.events.event_name}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.events.placeholder_event_name}
                  className="bg-zinc-50 border-zinc-100 text-zinc-900 h-14 rounded-2xl focus:ring-purple-600/20 font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-black ml-1">{t.events.event_date}</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-zinc-50 border-zinc-100 text-zinc-900 h-14 rounded-2xl focus:ring-purple-600/20 font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-black ml-1">{t.events.note}</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.events.placeholder_note}
                  className="bg-zinc-50 border-zinc-100 text-zinc-900 h-14 rounded-2xl focus:ring-purple-600/20 font-bold"
                />
              </div>

              {createError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-bold uppercase tracking-wider text-center">
                  {createError}
                </div>
              )}

              <Button disabled={isCreating} type="submit" className="w-full h-16 bg-purple-600 text-white rounded-full font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-600/20 text-lg sm:text-base">
                {isCreating ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : t.events.submit_create}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <AnimatePresence mode="wait">
        {loading && events.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-40 flex flex-col items-center justify-center">
            <Loader2 className="w-16 h-16 animate-spin text-purple-600 mb-6" />
            <p className="text-zinc-400 uppercase text-xs font-black tracking-[0.3em]">{t.events.syncing}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {events.length === 0 ? (
              <div className="col-span-full py-40 text-center border-4 border-dashed border-zinc-100 rounded-[3rem] bg-white shadow-xl shadow-zinc-100/50">
                <Calendar className="w-24 h-24 text-zinc-100 mx-auto mb-8" />
                <h3 className="text-3xl font-black uppercase italic text-zinc-300 tracking-tighter">{t.events.no_events}</h3>
                <p className="text-zinc-400 text-sm mt-3 font-bold max-w-sm mx-auto">{t.events.no_events_desc}</p>
                <Button variant="ghost" onClick={() => setOpen(true)} className="mt-8 text-purple-600 font-black uppercase tracking-widest text-xs hover:bg-purple-50">{t.events.start_here} <ChevronRight className="w-4 h-4 ml-1" /></Button>
              </div>
            ) : (
              events.map((event: any, idx: number) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={event.id}
                  className="group"
                >
                  <Card className="bg-white border-zinc-100 p-8 flex flex-col hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-500 rounded-[3.5rem] shadow-xl shadow-zinc-100 relative overflow-hidden h-full group">
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${event.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
                          <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{event.status === 'Active' ? t.events.status_active : t.events.status_finished}</span>
                        </div>
                        <h3 className="text-2xl font-black text-zinc-900 group-hover:text-purple-600 transition-colors italic leading-tight tracking-tighter">{event.name}</h3>
                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">{new Date(event.event_date).toLocaleDateString(t.language === 'en' ? 'en-US' : 'es-MX', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 group-hover:bg-purple-50 group-hover:border-purple-100 transition-colors">
                        <QrCode className="w-6 h-6 text-zinc-300 group-hover:text-purple-600 transition-colors" />
                      </div>
                    </div>

                    <div className="flex-1 space-y-6 mb-8 relative z-10">
                      <div className="bg-white p-6 rounded-[3.5rem] flex flex-col items-center justify-center border-2 border-zinc-50 group-hover:border-purple-100 transition-all shadow-sm relative group/qr">
                        <QRCodeSVG
                          value={
                            window.location.hostname === 'localhost' && localConfig?.frontendUrl
                              ? `${localConfig.frontendUrl}/event/${event.slug}`
                              : `${getBaseUrl()}/event/${event.slug}`
                          }
                          size={180}
                          level="H"
                        />
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm opacity-0 group-hover/qr:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Slug Único</p>
                          <span className="text-sm font-black text-purple-600 bg-purple-50 px-4 py-2 rounded-full border border-purple-100">/{event.slug}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => window.location.href = `${getApiUrl()}/media/${event.slug}/download`}
                        className="w-full h-14 bg-white border border-dashed border-purple-200 text-purple-600 hover:bg-purple-50 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 group/zip transition-all hover:scale-[1.02] mt-4"
                      >
                        <Download className="w-4 h-4 transition-transform group-hover/zip:-translate-y-1" />
                        {t.events.bulk_download_btn}
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 relative z-10">
                      <Link href={`/event/${event.slug}/slideshow`} target="_blank" className="col-span-2">
                        <Button
                          disabled={event.status !== 'Active'}
                          className="w-full h-16 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-30 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-zinc-200 transition-all hover:scale-[1.02]"
                        >
                          <Activity className="w-4 h-4" /> {t.events.presentation}
                        </Button>
                      </Link>

                      <Button
                        onClick={() => handleShare(event)}
                        className="bg-purple-600 text-white hover:bg-purple-700 rounded-2xl font-black uppercase tracking-widest text-[10px] h-16 gap-2 transition-all shadow-lg shadow-purple-600/10"
                      >
                        <Share2 className="w-4 h-4" /> {t.events.share}
                      </Button>

                      <Link href={`/event/${event.slug}/card`} target="_blank">
                        <Button className="w-full bg-white hover:bg-zinc-50 text-zinc-600 border border-zinc-100 rounded-2xl text-[10px] h-16 font-black uppercase transition-all">
                          <Printer className="w-4 h-4 mr-2" /> {t.events.print}
                        </Button>
                      </Link>

                      <Button
                        onClick={() => setFinishingEvent({ ...event, isReactivating: event.status !== 'Active' })}
                        className={`col-span-1 rounded-2xl text-[10px] h-16 font-black uppercase border transition-all ${event.status === 'Active' ? 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100' : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'}`}
                      >
                        {event.status === 'Active' ? <Power className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        {event.status === 'Active' ? t.events.finalize : t.events.activate}
                      </Button>

                      <Link href={`/dashboard/events/${event.slug}/config`}>
                        <Button className="w-full bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 rounded-2xl text-[10px] h-16 font-black uppercase transition-all">
                          <Settings className="w-4 h-4 mr-2" /> {t.events.settings}
                        </Button>
                      </Link>

                      <Button onClick={() => handleDelete(event.id)} className="col-span-2 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-2xl text-[10px] h-16 font-black uppercase transition-all opacity-40 hover:opacity-100">
                        <Trash2 className="w-4 h-4 mr-2" /> {t.events.delete}
                      </Button>
                    </div>

                    {/* Gradient hint */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </AnimatePresence>

      <Dialog open={!!finishingEvent} onOpenChange={(val) => { if (!val) setFinishingEvent(null); }}>
        <DialogContent className="bg-white border-zinc-100 text-zinc-900 rounded-[3rem] p-10 max-w-sm shadow-3xl">
          <DialogHeader>
            <div className={`w-16 h-16 ${finishingEvent?.isReactivating ? 'bg-green-50' : 'bg-orange-50'} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
              {finishingEvent?.isReactivating ? <CheckCircle className="text-green-600 w-8 h-8" /> : <Power className="text-orange-600 w-8 h-8" />}
            </div>
            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter mb-2 text-center">
              {finishingEvent?.isReactivating ? t.events.activate : t.events.finalize}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 font-medium text-center">
              {t.user_dashboard.finish_modal.subtitle}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitFinish} className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-[10px] uppercase tracking-widest font-black ml-1">{t.user_dashboard.finish_modal.password}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-50 border-zinc-100 text-zinc-900 h-14 rounded-2xl focus:ring-purple-600/20 font-bold"
                required
              />
              {finishError && <p className="text-red-500 text-xs mt-1 font-bold">{finishError}</p>}
            </div>

            {!finishingEvent?.isReactivating && (
              <div className="pt-6 border-t border-zinc-100 space-y-6">
                <div className="text-center">
                  <Label className="text-zinc-900 text-sm font-black">{t.user_dashboard.finish_modal.rating_title}</Label>
                </div>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star className={`w-8 h-8 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-100'}`} />
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t.user_dashboard.finish_modal.comment_placeholder}
                    className="bg-zinc-50 border-zinc-100 text-zinc-900 h-14 rounded-2xl focus:ring-purple-600/20 font-bold"
                  />
                </div>
              </div>
            )}

            <Button disabled={isFinishing} type="submit" className="w-full h-16 bg-purple-600 text-white rounded-full font-black uppercase tracking-widest text-sm shadow-xl shadow-purple-600/20 transition-all mt-4">
              {isFinishing ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : t.user_dashboard.finish_modal.submit}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
