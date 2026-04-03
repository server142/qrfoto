"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Settings, CreditCard, Trash2, Loader2, X, CheckSquare, Edit3 } from "lucide-react";
import { getApiUrl, getAuthHeaders } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/LanguageContext";

export default function PlansManagementPage() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New/Edit Plan State
  const [planForm, setPlanForm] = useState({
    name: "",
    price: 0,
    type: "Monthly",
    max_events: 5,
    storage_limit_mb: 500,
    event_duration_days: 30
  });

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/plans`);
      const data = await res.json();
      setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setPlanForm({
        name: "",
        price: 0,
        type: "Monthly",
        max_events: 5,
        storage_limit_mb: 500,
        event_duration_days: 30
    });
    setShowModal(true);
  };

  const handleOpenEdit = (plan: any) => {
    setEditingId(plan.id);
    setPlanForm({
        name: plan.name,
        price: parseFloat(plan.price),
        type: plan.type,
        max_events: plan.max_events,
        storage_limit_mb: plan.storage_limit_mb,
        event_duration_days: plan.event_duration_days
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `${getApiUrl()}/plans/${editingId}` : `${getApiUrl()}/plans`;
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(planForm)
      });
      if (res.ok) {
        setShowModal(false);
        fetchPlans();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
      if (!confirm(t.language === 'es' ? '¿Estás seguro de eliminar este plan?' : 'Are you sure you want to delete this plan?')) return;
      
      try {
          const res = await fetch(`${getApiUrl()}/plans/${id}`, {
              method: "DELETE",
              headers: getAuthHeaders()
          });
          if (res.ok) {
              fetchPlans();
          }
      } catch (err) {
          console.error(err);
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">{t.admin.plans_title}</h2>
          <p className="text-white/50 mt-1 font-medium italic">{t.admin.plans_subtitle}</p>
        </div>
        <Button 
            onClick={handleOpenCreate}
            className="h-14 px-8 bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-xl shadow-purple-500/20 font-black uppercase tracking-widest text-xs transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 mr-3" />
          {t.admin.create_plan}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-20">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="uppercase tracking-[0.3em] text-xs font-black italic">Sincronizando planes...</p>
            </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-zinc-950/20 backdrop-blur-3xl">
            <CreditCard className="w-16 h-16 text-white/10 mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase italic text-white/40 mb-2">Sin actividad financiera</h3>
            <p className="text-sm text-white/20 mb-8 max-w-sm mx-auto">Comienza definiendo tu primer plan para que las agencias puedan suscribirse a Veltrix.</p>
          </div>
        ) : (
          plans.map((plan: any) => (
            <Card key={plan.id} className="bg-zinc-950/50 border-white/10 p-8 flex flex-col relative overflow-hidden group hover:border-purple-500/50 transition-all rounded-[2.5rem] shadow-2xl hover:shadow-purple-500/5">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 blur-[50px] rounded-full group-hover:bg-purple-500/20 transition-all pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">{plan.name}</h3>
                    <p className="text-xs font-black uppercase tracking-widest text-purple-400 mt-1">{plan.type}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white/40" />
                  </div>
              </div>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black text-white italic tracking-tighter">${plan.price}</span>
                <span className="text-sm font-bold text-white/40 uppercase tracking-widest">USD / Mes</span>
              </div>
              
              <div className="space-y-4 mb-10 flex-1">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-white/50 border-b border-white/5 pb-3">
                   <span>{t.admin.max_events}</span>
                   <span className="text-white">{plan.max_events}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-white/50 border-b border-white/5 pb-3">
                   <span>{t.admin.storage}</span>
                   <span className="text-white">{plan.storage_limit_mb} MB</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-white/50 border-b border-white/5 pb-3">
                   <span>{t.admin.duration}</span>
                   <span className="text-white">{plan.event_duration_days} Días</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                    onClick={() => handleOpenEdit(plan)}
                    variant="outline" className="w-full h-12 border-white/5 bg-white/5 hover:bg-white/10 rounded-xl text-white font-black uppercase tracking-widest text-[10px] transition-all"
                >
                  <Edit3 className="w-3 h-3 mr-2" />
                  {t.admin.edit}
                </Button>
                <Button 
                    onClick={() => handleDelete(plan.id)}
                    variant="ghost" className="w-14 h-12 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* CREATE/EDIT MODAL */}
      <AnimatePresence>
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowModal(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[3rem] p-10 shadow-[0_0_100px_rgba(168,85,247,0.15)] overflow-hidden"
                >
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                    
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                                {editingId ? t.admin.edit_plan_title : t.admin.new_plan_title}
                            </h3>
                            <p className="text-white/40 text-xs font-medium italic mt-1 font-sans">
                                {editingId ? (t.language === 'es' ? 'Actualiza los términos de este plan' : 'Update the terms of this plan') : t.admin.new_plan_subtitle}
                            </p>
                        </div>
                        <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">{t.admin.plan_name}</label>
                             <Input 
                                placeholder="Ej. Plan Diamante VIP"
                                value={planForm.name}
                                onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                                required
                                className="bg-black border-white/5 h-14 rounded-2xl italic px-5 placeholder:text-white/10"
                             />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">{t.admin.price}</label>
                                <Input 
                                    type="number"
                                    value={planForm.price}
                                    onChange={(e) => setPlanForm({...planForm, price: parseFloat(e.target.value)})}
                                    required
                                    className="bg-black border-white/5 h-14 rounded-2xl italic px-5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">{t.admin.max_events}</label>
                                <Input 
                                    type="number"
                                    value={planForm.max_events}
                                    onChange={(e) => setPlanForm({...planForm, max_events: parseInt(e.target.value)})}
                                    required
                                    className="bg-black border-white/5 h-14 rounded-2xl italic px-5"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px) font-black uppercase tracking-widest text-white/30 ml-2">{t.admin.storage}</label>
                                <Input 
                                    type="number"
                                    value={planForm.storage_limit_mb}
                                    onChange={(e) => setPlanForm({...planForm, storage_limit_mb: parseInt(e.target.value)})}
                                    required
                                    className="bg-black border-white/5 h-14 rounded-2xl italic px-5"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">{t.admin.duration}</label>
                                <Input 
                                    type="number"
                                    value={planForm.event_duration_days}
                                    onChange={(e) => setPlanForm({...planForm, event_duration_days: parseInt(e.target.value)})}
                                    required
                                    className="bg-black border-white/5 h-14 rounded-2xl italic px-5"
                                />
                            </div>
                        </div>

                        <Button 
                            disabled={saving}
                            type="submit"
                            className="w-full h-16 bg-white text-black hover:bg-zinc-200 rounded-3xl font-black uppercase tracking-[0.2em] text-sm mt-4 shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckSquare className="w-5 h-5" /> {t.admin.submit_plan}</>}
                        </Button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
