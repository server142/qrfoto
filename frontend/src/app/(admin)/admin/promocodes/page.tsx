"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";
import { Copy, Plus, Trash2, CheckCircle2, Ticket, Users, FileText, Loader2, Sparkles, AlertCircle, TrendingUp, HandCoins, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/LanguageContext";

export default function AdminPromocodesPage() {
    const [promocodes, setPromocodes] = useState<any[]>([]);
    const [commissions, setCommissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'codes' | 'commissions'>('codes');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const { language } = useTranslation();

    const [form, setForm] = useState({
        code: "",
        promoter_name: "",
        discount_percentage: 20,
        commission_type: "fixed",
        commission_value: 140,
        max_uses: 0,
    });

    const [copied, setCopied] = useState<string | null>(null);

    const fetchAll = async () => {
        let token = "";
        if (typeof document !== 'undefined') {
            token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || '';
        }

        try {
            const [codesRes, commRes] = await Promise.all([
                fetch(`${getApiUrl()}/promocodes`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${getApiUrl()}/promocodes/commissions`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (codesRes.ok) setPromocodes(await codesRes.json());
            if (commRes.ok) setCommissions(await commRes.json());
        } catch (error) {
            console.error("Error loading promo codes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("¿Borrar este código? Las comisiones ligadas no se borrarán pero el código dejará de existir.")) return;

        let token = "";
        if (typeof document !== 'undefined') {
            token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || '';
        }

        await fetch(`${getApiUrl()}/promocodes/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchAll();
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        let token = "";
        if (typeof document !== 'undefined') {
            token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || '';
        }

        const payload = {
            ...form,
            max_uses: form.max_uses > 0 ? form.max_uses : undefined,
        };

        try {
            const res = await fetch(`${getApiUrl()}/promocodes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setShowModal(false);
                setForm({ code: "", promoter_name: "", discount_percentage: 20, commission_type: "fixed", commission_value: 140, max_uses: 0 });
                fetchAll();
            } else {
                const data = await res.json();
                alert(data.message || "Error al crear");
            }
        } catch (err) {
            alert("Network error");
        } finally {
            setSaving(false);
        }
    };

    const generateRandomCode = () => {
        const str = Math.random().toString(36).substring(2, 8).toUpperCase();
        setForm(f => ({ ...f, code: str }));
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-24">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-4" />
            <p className="text-zinc-400 uppercase text-xs tracking-widest font-bold">Cargando Sistema de Afiliados...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-[0_20px_40px_rgba(0,0,0,0.02)]">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900 flex items-center gap-3">
                        <Users className="w-8 h-8 text-purple-600" />
                        Afiliados & Promociones
                    </h1>
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] mt-2">Gestiona embajadores, cupones y comisiones 🤑</p>
                </div>

                <div className="flex bg-zinc-50 p-1.5 rounded-full border border-zinc-100 shadow-inner">
                    <button
                        onClick={() => setActiveTab('codes')}
                        className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'codes' ? 'bg-white shadow-md text-purple-600' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        Códigos
                    </button>
                    <button
                        onClick={() => setActiveTab('commissions')}
                        className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'commissions' ? 'bg-white shadow-md text-emerald-600' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        Comisiones
                    </button>
                </div>
            </div>

            {/* MÈTRICAS (KPIs) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="bg-white p-6 rounded-[2rem] border-zinc-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Cupones Activos</p>
                        <h3 className="text-3xl font-black tracking-tighter text-zinc-900 mt-1">{promocodes.length}</h3>
                    </div>
                </Card>
                <Card className="bg-white p-6 rounded-[2rem] border-zinc-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Total Ventas (Afiliados)</p>
                        <h3 className="text-3xl font-black tracking-tighter text-zinc-900 mt-1">
                            ${commissions.reduce((acc, curr) => acc + Number(curr.amount_paid), 0).toLocaleString('en-US')}
                        </h3>
                    </div>
                </Card>
                <Card className="bg-white p-6 rounded-[2rem] border-zinc-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <HandCoins className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Deuda Comisiones (Por Pagar)</p>
                        <h3 className="text-3xl font-black tracking-tighter text-amber-500 mt-1">
                            ${commissions.filter(c => c.status === 'pending').reduce((acc, curr) => acc + Number(curr.commission_earned), 0).toLocaleString('en-US')}
                        </h3>
                    </div>
                </Card>
            </div>

            {/* TAB: CÓDIGOS */}
            {activeTab === 'codes' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-lg font-black tracking-widest uppercase text-zinc-800">Cupones Activos</h2>
                        <Button onClick={() => setShowModal(true)} className="rounded-full bg-purple-600 hover:bg-purple-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-purple-600/20">
                            <Plus className="w-4 h-4 mr-2" /> Nuevo Código
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {promocodes.map(promo => (
                            <Card key={promo.id} className="p-6 rounded-[2rem] border-zinc-100 shadow-sm relative overflow-hidden group hover:border-purple-200 transition-colors">
                                <div className="absolute top-0 right-0 p-4">
                                    <button onClick={() => handleDelete(promo.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                        <Ticket className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Código</p>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-black tracking-widest uppercase text-white">{promo.code}</h3>
                                            <button onClick={() => copyCode(promo.code)} className="text-purple-600 hover:text-purple-800">
                                                {copied === promo.code ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-zinc-50 border-dashed">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-400 uppercase text-[10px] tracking-widest font-bold">Promotor:</span>
                                        <span className="font-bold text-zinc-700 uppercase tracking-wider">{promo.promoter_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-400 uppercase text-[10px] tracking-widest font-bold">Descuento Cliente:</span>
                                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">-{promo.discount_percentage}%</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-400 uppercase text-[10px] tracking-widest font-bold">Comisión Afiliado:</span>
                                        <span className="font-black text-purple-600">{promo.commission_type === 'fixed' ? `$${promo.commission_value}` : `${promo.commission_value}%`}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-400 uppercase text-[10px] tracking-widest font-bold">Usos / Límite:</span>
                                        <span className={`font-bold text-xs ${promo.max_uses > 0 && promo.used_count >= promo.max_uses ? 'text-red-500' : 'text-zinc-600'}`}>
                                            {promo.used_count} / {promo.max_uses === 0 ? '∞' : promo.max_uses}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {promocodes.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-zinc-200">
                            <Ticket className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                            <p className="text-zinc-400 font-bold tracking-widest text-xs uppercase uppercase">No hay códigos creados aún</p>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: COMISIONES */}
            {activeTab === 'commissions' && (
                <div className="space-y-6">
                    <Card className="rounded-[2rem] border-zinc-100 shadow-sm overflow-hidden bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-50/50 border-b border-zinc-100">
                                    <tr className="text-zinc-400 text-[10px] uppercase font-black tracking-widest">
                                        <th className="p-6 font-black">Fecha</th>
                                        <th className="p-6 font-black">Código & Afiliado</th>
                                        <th className="p-6 font-black">Venta Generada</th>
                                        <th className="p-6 font-black">Comisión Ganada</th>
                                        <th className="p-6 font-black">Estatus</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {commissions.map((c) => (
                                        <tr key={c.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/30 transition-colors">
                                            <td className="p-6 font-bold text-zinc-600 text-xs">
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-purple-600 uppercase tracking-widest text-xs">{c.promocode?.code || 'X'}</span>
                                                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider">{c.promocode?.promoter_name || 'Desconocido'}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-zinc-800">${c.amount_paid} <span className="text-[10px] text-zinc-400 font-bold">(era ${c.original_price})</span></span>
                                                    <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-wider">{c.plan_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="inline-flex items-center gap-1 font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs">
                                                    <Sparkles className="w-3 h-3" /> ${c.commission_earned}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                {c.status === 'pending' ? (
                                                    <span className="text-amber-600 font-black text-[10px] uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full flex items-center gap-1 w-max">
                                                        <AlertCircle className="w-3 h-3" /> Por Pagar
                                                    </span>
                                                ) : (
                                                    <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1 w-max">
                                                        <CheckCircle2 className="w-3 h-3" /> Pagado
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {commissions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">
                                                Sin ventas con código todavía
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* CREAR MODAL */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative w-full max-w-xl z-20"
                        >
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900 mb-6 flex items-center gap-3">
                                <Ticket className="w-6 h-6 text-purple-600" />
                                Alta de Promotor
                            </h2>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-[10px] tracking-widest uppercase font-black text-zinc-400 mb-2 block">Nombre del Creador/Promotor</label>
                                        <input required type="text" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 font-bold text-sm text-zinc-900 outline-none focus:border-purple-500 transition-colors" value={form.promoter_name} onChange={e => setForm({ ...form, promoter_name: e.target.value })} placeholder="Ej. Juan Pérez" />
                                    </div>
                                    <div className="col-span-2 flex items-end gap-3">
                                        <div className="flex-1">
                                            <label className="text-[10px] tracking-widest uppercase font-black text-zinc-400 mb-2 block">Código Alfanumérico</label>
                                            <input required type="text" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 font-black tracking-widest uppercase text-sm text-zinc-900 outline-none focus:border-purple-500 transition-colors" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="XJ9K12" maxLength={8} />
                                        </div>
                                        <Button type="button" variant="outline" onClick={generateRandomCode} className="h-12 border-zinc-200">Generar</Button>
                                    </div>
                                    <div>
                                        <label className="text-[10px] tracking-widest uppercase font-black text-zinc-400 mb-2 block">% Descuento al Cliente</label>
                                        <input required type="number" min="0" max="100" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 font-bold text-sm text-zinc-900 outline-none focus:border-purple-500 transition-colors" value={form.discount_percentage} onChange={e => setForm({ ...form, discount_percentage: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] tracking-widest uppercase font-black text-zinc-400 mb-2 block">Límite de usos (0 = Ilimitado)</label>
                                        <input required type="number" min="0" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 font-bold text-sm text-zinc-900 outline-none focus:border-purple-500 transition-colors" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <div className="col-span-2 mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between text-zinc-500 text-xs">
                                        <p className="font-bold uppercase tracking-widest text-[10px] ml-1">Modalidad de Comisión para el Promotor</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] tracking-widest uppercase font-black text-zinc-400 mb-2 block">Tipo de Comisión</label>
                                        <select className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 font-bold text-sm text-zinc-900 outline-none focus:border-purple-500 transition-colors" value={form.commission_type} onChange={e => setForm({ ...form, commission_type: e.target.value })}>
                                            <option value="fixed">Fijo (Pesos/Dolares)</option>
                                            <option value="percentage">Porcentaje (%)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] tracking-widest uppercase font-black text-zinc-400 mb-2 block">Valor a pagarle</label>
                                        <input required type="number" min="0" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 font-bold text-sm text-zinc-900 outline-none focus:border-purple-500 transition-colors" value={form.commission_value} onChange={e => setForm({ ...form, commission_value: parseInt(e.target.value) || 0 })} />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="outline" className="flex-1 rounded-full h-12 uppercase font-black tracking-widest text-[10px]" onClick={() => setShowModal(false)}>Cancelar</Button>
                                    <Button type="submit" disabled={saving} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full h-12 shadow-xl shadow-purple-600/20 uppercase font-black tracking-widest text-[10px]">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Promotor"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
