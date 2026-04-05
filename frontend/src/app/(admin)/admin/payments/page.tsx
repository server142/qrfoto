"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    CheckCircle, XCircle, Clock, Eye, Loader2,
    FileText, User, CreditCard, Building2, ShoppingBag, RefreshCw
} from "lucide-react";
import { getApiUrl, getAuthHeaders } from "@/lib/api";

const statusColors: Record<string, string> = {
    pending: "text-amber-600 bg-amber-50 border-amber-100",
    approved: "text-green-600 bg-green-50 border-green-100",
    rejected: "text-red-500 bg-red-50 border-red-100",
};

const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    approved: "Aprobado",
    rejected: "Rechazado",
};

export default function PaymentRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any>(null);
    const [notes, setNotes] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${getApiUrl()}/payments/admin/requests`, { headers: getAuthHeaders() as any });
            const data = await res.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch { } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleAction = async (action: "approve" | "reject") => {
        if (!selected) return;
        setActionLoading(true);
        try {
            const res = await fetch(`${getApiUrl()}/payments/admin/requests/${selected.id}/${action}`, {
                method: "PUT",
                headers: getAuthHeaders() as any,
                body: JSON.stringify({ notes }),
            });
            if (res.ok) {
                setSelected(null);
                setNotes("");
                await fetchRequests();
            } else {
                alert("Error al procesar la acción");
            }
        } catch { alert("Error de conexión"); } finally {
            setActionLoading(false);
        }
    };

    const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter italic text-zinc-900 leading-none">
                        Solicitudes de <span className="text-purple-600">Pago</span>
                    </h2>
                    <p className="text-zinc-400 font-bold text-sm mt-2 uppercase tracking-widest">Revisa y aprueba los comprobantes de pago manual</p>
                </div>
                <Button onClick={fetchRequests} className="h-12 px-6 rounded-full bg-zinc-900 text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-zinc-800">
                    <RefreshCw className="w-4 h-4" /> Actualizar
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {(["all", "pending", "approved", "rejected"] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-100 text-zinc-400 hover:text-zinc-700'}`}
                    >
                        {f === "all" ? "Todas" : statusLabels[f]}
                        {f !== "all" && (
                            <span className="ml-2 opacity-60">{requests.filter(r => r.status === f).length}</span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-32 flex flex-col items-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
                    <p className="text-zinc-400 text-xs font-black uppercase tracking-widest">Cargando solicitudes...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-32 text-center border-4 border-dashed border-zinc-100 rounded-[3rem]">
                    <FileText className="w-16 h-16 text-zinc-100 mx-auto mb-6" />
                    <p className="text-zinc-300 font-black uppercase tracking-widest text-sm">No hay solicitudes {filter !== "all" ? `"${statusLabels[filter]}"` : ""}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((req, i) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="bg-white border-zinc-100 p-7 rounded-[2.5rem] shadow-xl shadow-zinc-100/50 space-y-5 hover:shadow-2xl transition-all">
                                {/* Status + Method */}
                                <div className="flex items-center justify-between">
                                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[req.status]}`}>
                                        {statusLabels[req.status]}
                                    </span>
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        {req.method === 'oxxo' ? <ShoppingBag className="w-4 h-4 text-orange-400" /> : <Building2 className="w-4 h-4 text-indigo-400" />}
                                        <span className="text-[10px] font-black uppercase">{req.method === 'oxxo' ? 'OXXO' : 'Transferencia'}</span>
                                    </div>
                                </div>

                                {/* User & Plan */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center">
                                            <User className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-black text-zinc-900 text-sm">{req.user?.email || req.user_id.slice(0, 8) + "..."}</p>
                                            <p className="text-[10px] text-zinc-400 font-bold">Cliente</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-50 rounded-2xl flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-zinc-400" />
                                        </div>
                                        <div>
                                            <p className="font-black text-zinc-900 text-sm">{req.plan?.name || "Plan"} — ${req.amount} {req.plan?.currency || 'MXN'}</p>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Ref: {req.reference}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Date */}
                                <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">
                                    {new Date(req.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    {req.proof_url && (
                                        <Button onClick={() => window.open(req.proof_url, '_blank')} className="flex-1 h-11 rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-600 hover:bg-zinc-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Eye className="w-4 h-4" /> Ver comprobante
                                        </Button>
                                    )}
                                    {req.status === 'pending' && (
                                        <Button onClick={() => { setSelected(req); setNotes(""); }} className="flex-1 h-11 rounded-2xl bg-purple-600 text-white hover:bg-purple-700 text-[10px] font-black uppercase tracking-widest">
                                            Revisar
                                        </Button>
                                    )}
                                </div>

                                {req.admin_notes && (
                                    <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Nota Admin</p>
                                        <p className="text-xs text-zinc-600 font-bold">{req.admin_notes}</p>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6"
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl space-y-8"
                            onClick={e => e.stopPropagation()}
                        >
                            <div>
                                <h3 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tighter">Revisar Solicitud</h3>
                                <p className="text-zinc-400 font-bold text-sm mt-1">Ref: {selected.reference}</p>
                            </div>

                            <div className="bg-zinc-50 rounded-2xl p-5 space-y-2 border border-zinc-100">
                                <p className="text-sm font-bold text-zinc-700"><span className="text-zinc-400 font-black uppercase text-[10px] tracking-widest block">Cliente</span>{selected.user?.email}</p>
                                <p className="text-sm font-bold text-zinc-700"><span className="text-zinc-400 font-black uppercase text-[10px] tracking-widest block mt-2">Plan seleccionado</span>{selected.plan?.name} — ${selected.amount}</p>
                                <p className="text-sm font-bold text-zinc-700"><span className="text-zinc-400 font-black uppercase text-[10px] tracking-widest block mt-2">Método</span>{selected.method === 'oxxo' ? 'OXXO Pay' : 'Transferencia bancaria'}</p>
                                {selected.proof_url && (
                                    <a href={selected.proof_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-purple-600 text-xs font-black uppercase tracking-widest mt-3 hover:underline">
                                        <Eye className="w-4 h-4" /> Ver comprobante
                                    </a>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nota (opcional)</label>
                                <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej. Pago verificado el 01 de Abril..." className="h-14 rounded-2xl bg-zinc-50 border-zinc-100 font-bold" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    onClick={() => handleAction("reject")}
                                    disabled={actionLoading}
                                    className="h-14 rounded-2xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Rechazar
                                </Button>
                                <Button
                                    onClick={() => handleAction("approve")}
                                    disabled={actionLoading}
                                    className="h-14 rounded-2xl bg-green-600 text-white hover:bg-green-700 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg shadow-green-600/20"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Aprobar
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
