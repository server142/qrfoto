import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Users, Activity, CreditCard, Image as ImageIcon, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/LanguageContext";
import { getApiUrl } from "@/lib/api";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = document.cookie.split("; ").find(row => row.startsWith("token="))?.split("=")[1];
        const res = await fetch(`${getApiUrl()}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  const metrics = stats?.metrics || {
    activeUsers: 0,
    proSubs: 0,
    totalEvents: 0,
    filesUploaded: 0
  };

  const kpis = [
    { title: t.admin.active_users, value: metrics.activeUsers.toLocaleString(), icon: Users, color: "text-blue-400" },
    { title: t.admin.pro_subs, value: metrics.proSubs.toLocaleString(), icon: CreditCard, color: "text-purple-400" },
    { title: t.admin.events_created, value: metrics.totalEvents.toLocaleString(), icon: Activity, color: "text-green-400" },
    { title: t.admin.files_uploaded, value: metrics.filesUploaded.toLocaleString(), icon: ImageIcon, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight italic uppercase italic">{t.admin.metrics}</h2>
        <p className="text-white/50 mt-1 uppercase text-[10px] tracking-widest font-black">{t.admin.metrics_subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className="bg-zinc-950 border-white/10 p-6 flex flex-col justify-between hover:bg-white/[0.02] transition-all group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[10px] uppercase font-black tracking-widest text-white/40">{kpi.title}</h3>
              <div className={`p-2 rounded-lg bg-zinc-900 border border-white/5 transition-colors group-hover:border-white/10`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-4xl font-black text-white italic tracking-tighter">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-zinc-950 border-white/10 p-6">
          <h3 className="text-[10px] uppercase font-black tracking-widest text-white/60 mb-6 italic">
            {t.language === 'es' ? 'Eventos Recientes' : 'Recent Events'}
          </h3>
          <div className="space-y-4">
            {(stats?.recentEvents || []).map((event: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.01] px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-black italic">
                    {event.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{event.name}</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{event.userEmail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full inline-block mb-1 ${
                      event.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {event.status}
                  </div>
                  <p className="text-[10px] text-white/30 font-bold">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-zinc-950 border-white/10 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent pointer-events-none" />
          <Activity className="w-16 h-16 text-purple-500/20 mx-auto mb-6 transition-transform group-hover:scale-110" />
          <h3 className="text-lg font-black uppercase italic text-white/80 tracking-tighter">{t.admin.income_charts}</h3>
          <p className="text-[10px] text-white/40 mt-4 max-w-[200px] mx-auto font-bold uppercase tracking-widest leading-relaxed">
            {t.language === 'es' 
              ? 'Conectaremos las gráficas visuales una vez tengamos registros de pagos Stripe.' 
              : 'Stripe visual charts will be connected once payment logs start flowing.'}
          </p>
        </Card>
      </div>
    </div>
  );
}
