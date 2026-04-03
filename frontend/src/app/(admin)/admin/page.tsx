"use client";

import { Card } from "@/components/ui/card";
import { Users, Activity, CreditCard, Image as ImageIcon } from "lucide-react";
import { useTranslation } from "@/lib/LanguageContext";

export default function AdminDashboard() {
  const { t } = useTranslation();
  
  const kpis = [
    { title: t.admin.active_users, value: "1,248", icon: Users, color: "text-blue-400" },
    { title: t.admin.pro_subs, value: "385", icon: CreditCard, color: "text-purple-400" },
    { title: t.admin.events_created, value: "4,092", icon: Activity, color: "text-green-400" },
    { title: t.admin.files_uploaded, value: "85.2K", icon: ImageIcon, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t.admin.metrics}</h2>
        <p className="text-white/50 mt-1">{t.admin.metrics_subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <Card key={i} className="bg-zinc-950 border-white/10 p-6 flex flex-col justify-between hover:bg-white/[0.02] transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-white/50">{kpi.title}</h3>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-3xl font-black text-white">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-zinc-950 border-white/10 p-6">
          <h3 className="text-lg font-semibold mb-4">{t.admin.recent_payments}</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">U</div>
                  <div>
                    <p className="text-sm font-medium text-white">agencia_demo{item}@gmail.com</p>
                    <p className="text-xs text-white/50">Plan Anual VIP</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-400">+$299.00 USD</p>
                  <p className="text-xs text-white/50">Hace {item * 12} min</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-zinc-950 border-white/10 p-6 flex flex-col items-center justify-center text-center">
          <Activity className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/80">{t.admin.income_charts}</h3>
          <p className="text-sm text-white/40 mt-2 max-w-xs mx-auto">
            {t.language === 'es' 
              ? 'Próximamente conectaremos Recharts al endpoint de ganancias del backend.' 
              : 'Soon we will connect Recharts to the backend earnings endpoint.'}
          </p>
        </Card>
      </div>
    </div>
  );
}
