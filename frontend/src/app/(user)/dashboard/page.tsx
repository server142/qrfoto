"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Plus, Calendar, Image as ImageIcon, MousePointer2, Loader2, QrCode, Zap, HardDrive, ArrowUpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/LanguageContext";
import { fetchApi, getApiUrl } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";

export default function UserDashboard() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>({ totalEvents: 0, totalPhotos: 0, interactions: 0, totalStorageMb: 0 });
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [modalStep, setModalStep] = useState<1|2|3>(1);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<'oxxo'|'transfer'|null>(null);
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const getToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = getToken();
        // Fetch Me (limits and extra storage)
        const meRes = await fetch(`${getApiUrl()}/users/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (meRes.ok) {
          const uData = await meRes.json();
          setUserData(uData);
        }

        // Fetch Plans for the Quick Upgrade
        const plansRes = await fetch(`${getApiUrl()}/plans`);
        if (plansRes.ok) {
          const pData = await plansRes.json();
          setPlans(pData);
        }

        // Fetch Events
        const res = await fetch(`${getApiUrl()}/events`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }

        // Fetch Real Stats (now includes totalStorageMb)
        const statsRes = await fetch(`${getApiUrl()}/events/dashboard/stats`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setStatsData(stats);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const openModal = () => {
    setModalStep(1);
    setSelectedPlan(null);
    setSelectedMethod(null);
    setPaymentRef('');
    setIsUpgradeModalOpen(true);
  };

  const handleSelectPlan = async (plan: any) => {
    setSelectedPlan(plan);
    // Fetch payment methods
    const res = await fetch(`${getApiUrl()}/payments/methods`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (res.ok) setPaymentMethods(await res.json());
    setModalStep(2);
  };

  const handleCreateRequest = async () => {
    if (!selectedPlan || !selectedMethod) return;
    setPaymentLoading(true);
    try {
      const formData = new FormData();
      formData.append('planId', selectedPlan.id);
      formData.append('method', selectedMethod);
      const res = await fetch(`${getApiUrl()}/payments/manual-request`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setPaymentRef(data.reference);
        setModalStep(3);
      }
    } catch(e) { console.error(e); }
    finally { setPaymentLoading(false); }
  };

  const storageUsed = statsData.totalStorageMb || 0;
  const storageLimit = userData?.limits?.storageLimitMb || 0;
  const storagePercent = storageLimit > 0 ? Math.min(100, (storageUsed / storageLimit) * 100) : 0;

  const stats = [
    { title: t.user_dashboard.stats.active_events, value: statsData.totalEvents.toString(), icon: Calendar, color: "text-blue-400" },
    { title: t.user_dashboard.stats.total_photos, value: statsData.totalPhotos.toString(), icon: ImageIcon, color: "text-purple-400" },
    { title: "Almacenamiento (MB)", value: `${storageUsed} / ${storageLimit} MB`, icon: Zap, color: storagePercent > 90 ? "text-red-400" : (storagePercent > 70 ? "text-amber-500" : "text-amber-400") },
  ];

  // Filtrar planes para el modal de rescate
  const quickAddons = plans.filter(p => p.type === 'Storage-addon');
  const quickUpgrades = plans.filter(p => p.type !== 'Storage-addon' && p.price > 0 && p.storage_limit_mb > storageLimit).slice(0, 1);

  const recentEvents = [...events].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
      <p className="text-white/30 uppercase text-xs font-black tracking-widest">{t.events.syncing}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* QUICK UPGRADE MODAL */}
      <AnimatePresence>
        {isUpgradeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUpgradeModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-3xl" />
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="relative bg-zinc-950 border border-white/10 rounded-[3rem] p-8 sm:p-12 max-w-2xl w-full shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="relative z-10">

                {/* STEP 1: Elegir plan */}
                {modalStep === 1 && (
                  <>
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h2 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none mb-2 text-white">¡Rescate de Gigas!</h2>
                        <p className="text-white/40 uppercase text-[10px] font-bold tracking-widest italic">Salva tu evento ahora mismo</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setIsUpgradeModalOpen(false)} className="rounded-2xl border border-white/5 hover:bg-white/5 h-12 w-12">
                        <Plus className="w-6 h-6 rotate-45" />
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {quickAddons.length > 0 ? quickAddons.map(p => (
                        <div key={p.id} className="bg-amber-500/10 border border-amber-500/30 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-amber-400 transition-all cursor-pointer" onClick={() => handleSelectPlan(p)}>
                          <div>
                            <div className="w-12 h-12 rounded-[1.2rem] bg-amber-500/20 flex items-center justify-center mb-6"><Zap className="w-6 h-6 text-amber-400" /></div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-1 text-white">{p.name}</h3>
                            <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest mb-6">+{p.storage_limit_mb} MB permanentes</p>
                          </div>
                          <Button onClick={() => handleSelectPlan(p)} className="w-full h-14 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-[10px] rounded-2xl active:scale-95 transition-all">
                            Comprar por ${p.price} MXN
                          </Button>
                        </div>
                      )) : (
                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex items-center justify-center text-center opacity-40">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white">Sin recargas disponibles</p>
                        </div>
                      )}
                      {quickUpgrades.length > 0 ? quickUpgrades.map(p => (
                        <div key={p.id} className="bg-purple-600/10 border border-purple-600/30 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-purple-400 transition-all cursor-pointer" onClick={() => handleSelectPlan(p)}>
                          <div>
                            <div className="w-12 h-12 rounded-[1.2rem] bg-purple-600/20 flex items-center justify-center mb-6"><ArrowUpCircle className="w-6 h-6 text-purple-400" /></div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-1 text-white">Plan {p.name}</h3>
                            <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-6">Capacidad {p.storage_limit_mb} MB Pro</p>
                          </div>
                          <Button onClick={() => handleSelectPlan(p)} className="w-full h-14 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl active:scale-95 transition-all">
                            Upgrade por ${p.price} MXN
                          </Button>
                        </div>
                      )) : (
                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex items-center justify-center text-center opacity-40">
                          <p className="text-[10px] font-black uppercase tracking-widest text-white">Ya tienes el plan máximo</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* STEP 2: Elegir método de pago */}
                {modalStep === 2 && selectedPlan && (
                  <>
                    <div className="flex justify-between items-center mb-8">
                      <button onClick={() => setModalStep(1)} className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors">
                        ← Volver
                      </button>
                      <Button variant="ghost" size="icon" onClick={() => setIsUpgradeModalOpen(false)} className="rounded-2xl border border-white/5 hover:bg-white/5 h-10 w-10">
                        <Plus className="w-5 h-5 rotate-45" />
                      </Button>
                    </div>
                    <div className="mb-8">
                      <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-1">{selectedPlan.name}</h2>
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic">Total a pagar: <span className="text-white">${selectedPlan.price} MXN</span></p>
                    </div>
                    <p className="text-white/50 uppercase text-[9px] font-black tracking-widest mb-4">Elige tu método de pago:</p>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <button onClick={() => setSelectedMethod('oxxo')} className={`p-6 rounded-[2rem] border-2 text-center transition-all active:scale-95 ${selectedMethod === 'oxxo' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                        <p className="text-xl font-black text-white mb-1">OXXO</p>
                        <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Pago en tienda</p>
                      </button>
                      <button onClick={() => setSelectedMethod('transfer')} className={`p-6 rounded-[2rem] border-2 text-center transition-all active:scale-95 ${selectedMethod === 'transfer' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                        <p className="text-xl font-black text-white mb-1">Transferencia</p>
                        <p className="text-[9px] text-white/40 uppercase font-bold tracking-widest">SPEI / Banco</p>
                      </button>
                    </div>
                    <Button onClick={handleCreateRequest} disabled={!selectedMethod || paymentLoading} className="w-full h-14 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl active:scale-95 transition-all disabled:opacity-30">
                      {paymentLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Ver datos de pago →'}
                    </Button>
                  </>
                )}

                {/* STEP 3: Datos de pago y referencia */}
                {modalStep === 3 && (
                  <>
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">✓</span>
                      </div>
                      <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-1">¡Pedido Generado!</h2>
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Realiza el pago y envía el comprobante</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 mb-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Plan</span>
                        <span className="text-sm font-black text-white">{selectedPlan?.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Total</span>
                        <span className="text-sm font-black text-white">${selectedPlan?.price} MXN</span>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Referencia</span>
                        <span className="text-sm font-black text-amber-400 tracking-widest">{paymentRef}</span>
                      </div>
                      {selectedMethod === 'oxxo' && paymentMethods?.oxxo && (
                        <>
                          <div className="h-px bg-white/5" />
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Tarjeta OXXO</span>
                            <span className="text-sm font-black text-white">{paymentMethods.oxxo.card_number}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">A nombre de</span>
                            <span className="text-sm font-black text-white">{paymentMethods.oxxo.account_holder}</span>
                          </div>
                        </>
                      )}
                      {selectedMethod === 'transfer' && paymentMethods?.ventanilla && (
                        <>
                          <div className="h-px bg-white/5" />
                          <p className="text-[10px] text-white/60 font-bold leading-relaxed">{paymentMethods.ventanilla.details}</p>
                        </>
                      )}
                    </div>
                    <p className="text-center text-[9px] text-white/30 uppercase font-bold tracking-widest mb-6">Incluye tu referencia <span className="text-amber-400">{paymentRef}</span> al enviar tu comprobante</p>
                    <Button onClick={() => setIsUpgradeModalOpen(false)} className="w-full h-12 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all">
                      Entendido, iré a pagar
                    </Button>
                  </>
                )}
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-950/50 p-6 sm:p-8 rounded-[2rem] border border-white/5 gap-6 sm:gap-4 overflow-hidden relative">
        <div className="relative z-10 w-full sm:w-auto">
          <h2 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter text-white leading-none mb-2">{t.user_dashboard.title}</h2>
          <p className="text-white/40 uppercase text-[10px] font-bold tracking-widest">{t.user_dashboard.subtitle}</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto relative z-10">
          {storagePercent > 70 && (
            <Button variant="outline" className="h-14 px-6 border-amber-500/50 text-amber-500 hover:bg-amber-500/10 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-amber-500/5 transition-all animate-pulse">
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Expandir Espacio
            </Button>
          )}
          <Link href="/dashboard/events" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-xl shadow-purple-600/10 transition-all active:scale-95">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-3" />
              {t.user_dashboard.new_event}
            </Button>
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* STORAGE PROGRESS BAR CARD */}
      <Card className="bg-zinc-950 border-white/10 p-8 rounded-[2rem] relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${storagePercent > 90 ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
              <HardDrive className={`w-8 h-8 ${storagePercent > 90 ? 'text-red-400' : 'text-amber-400'}`} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Uso de Almacenamiento</h3>
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest italic">Capacidad total: {storageLimit} MB (Plan + Extra)</p>
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80 italic">{storagePercent < 100 ? `${storageUsed} MB Usados` : '¡Límite Alcanzado!'}</span>
              <span className={`text-lg font-black italic ${storagePercent > 90 ? 'text-red-500' : 'text-amber-500'}`}>{Math.round(storagePercent)}%</span>
            </div>
            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px] ${storagePercent > 90 ? 'bg-red-500 shadow-red-500/40' : 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-amber-500/40'}`}
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          </div>

          <Button variant="outline" onClick={openModal} className="h-12 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95">
            Gestionar Almacenamiento
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.03] blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
      </Card>

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
