"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Plus, Calendar, Image as ImageIcon, MousePointer2, Loader2, QrCode } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/LanguageContext";
import { getApiUrl } from "@/lib/api";

export default function UserDashboard() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
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
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute Stats
  const activeEventsCount = events.length;
  // For total photos, we'd need another endpoint, so for now let's mock it but with the idea of connecting it soon.
  const totalPhotos = events.length * 12; // Placeholder while we add media count API
  const totalInteractions = totalPhotos * 3;

  const stats = [
    { title: t.user_dashboard.stats.active_events, value: activeEventsCount.toString(), icon: Calendar, color: "text-blue-400" },
    { title: t.user_dashboard.stats.total_photos, value: totalPhotos.toString(), icon: ImageIcon, color: "text-purple-400" },
    { title: t.user_dashboard.stats.interactions, value: totalInteractions.toString(), icon: MousePointer2, color: "text-green-400" },
  ];

  const recentEvents = [...events].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
      <p className="text-white/30 uppercase text-xs font-black tracking-widest">{t.events.syncing}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-950/50 p-6 sm:p-8 rounded-[2rem] border border-white/5 gap-6 sm:gap-4 overflow-hidden relative">
        <div className="relative z-10 w-full sm:w-auto">
          <h2 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter text-white leading-none mb-2">{t.user_dashboard.title}</h2>
          <p className="text-white/40 uppercase text-[10px] font-bold tracking-widest">{t.user_dashboard.subtitle}</p>
        </div>
        <Link href="/dashboard/events" className="w-full sm:w-auto relative z-10">
          <Button className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl shadow-purple-600/10 transition-all active:scale-95">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-3" />
            {t.user_dashboard.new_event}
          </Button>
        </Link>
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-zinc-950 border-white/10 p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-all rounded-[2rem] shadow-2xl overflow-hidden relative group min-h-[140px] sm:min-h-0">
            <div className="flex justify-between items-start mb-4 sm:mb-6 relative z-10">
              <h3 className="text-[9px] sm:text-[10px] uppercase tracking-widest font-black text-white/40">{stat.title}</h3>
              <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color} group-hover:scale-110 transition-transform`} />
            </div>
            <p className="text-3xl sm:text-4xl font-black text-white relative z-10">{stat.value}</p>
            {/* Decoration */}
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full group-hover:scale-150 transition-transform duration-700`} />
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-zinc-950 border-white/10 p-8 rounded-[2rem] lg:col-span-2 shadow-2xl border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="w-5 h-5 text-purple-500" />
            <h3 className="text-xl font-black uppercase italic tracking-tight">{t.user_dashboard.latest_events}</h3>
          </div>
          <div className="space-y-4">
            {recentEvents.length === 0 ? (
              <div className="py-10 text-center opacity-30 text-xs font-bold uppercase tracking-widest">
                {t.user_dashboard.no_recent_events}
              </div>
            ) : (
              recentEvents.map((event) => (
                <div key={event.id} className="flex justify-between items-center p-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black shadow-lg"
                      style={{ backgroundColor: event.branding_color }}
                    >
                      {event.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-md font-extrabold text-white tracking-tight leading-none mb-1">{event.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/30">
                          {t.user_dashboard.active} • {event.media_count || 0} {t.user_dashboard.photos}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link href="/dashboard/events">
                    <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-transparent font-black uppercase tracking-widest text-[10px]">
                      <QrCode className="w-3.5 h-3.5 mr-1" /> {t.user_dashboard.view_qr}
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="bg-zinc-950 border-white/10 p-8 flex flex-col items-center justify-center text-center rounded-[2rem] shadow-2xl border-dashed border-white/10 relative overflow-hidden group">
          <div className="w-24 h-24 rounded-[2.5rem] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 shadow-2xl group-hover:rotate-12 transition-transform duration-500">
            <Plus className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">{t.user_dashboard.create_new}</h3>
          <p className="text-sm text-white/40 mt-4 max-w-xs mx-auto leading-relaxed font-medium">
            {t.user_dashboard.create_new_desc}
          </p>
          <Link href="/dashboard/events" className="w-full">
            <Button className="mt-8 w-full bg-white text-black hover:bg-zinc-200 h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl">
              {t.user_dashboard.start_btn}
            </Button>
          </Link>

          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full" />
        </Card>
      </div>
    </div>
  );
}
