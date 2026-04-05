"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    X, CreditCard, Building2, ShoppingBag, CheckCircle2,
    Upload, Loader2, Copy, ChevronRight, ArrowLeft, FileText
} from "lucide-react";
import { getApiUrl, getAuthHeaders } from "@/lib/api";

interface ManualPaymentModalProps {
    plan: { id: string; name: string; price: number; currency: string };
    onClose: () => void;
}

type Step = 'method' | 'instructions' | 'upload' | 'success';
type Method = 'oxxo' | 'transfer' | null;

export function ManualPaymentModal({ plan, onClose }: ManualPaymentModalProps) {
    const [step, setStep] = useState<Step>('method');
    const [method, setMethod] = useState<Method>(null);
    const [methods, setMethods] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [reference, setReference] = useState<string>('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch(`${getApiUrl()}/payments/methods`, { headers: getAuthHeaders() as any })
            .then(r => r.json())
            .then(setMethods)
            .catch(() => { });
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async () => {
        if (!file || !method) return;
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('proof', file);
            formData.append('planId', plan.id);
            formData.append('method', method);

            const token = typeof document !== 'undefined'
                ? document.cookie.split('; ').find(r => r.startsWith('token='))?.split('=')[1]
                : '';

            const res = await fetch(`${getApiUrl()}/payments/manual-request`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                setReference(data.reference);
                setStep('success');
            } else {
                alert(data.message || 'Error enviando solicitud');
            }
        } catch (err) {
            alert('Error de conexión. Intenta de nuevo.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 relative">
                        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                            <X className="w-5 h-5 text-white" />
                        </button>
                        <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-2">Activar Plan</p>
                        <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">{plan.name}</h2>
                        <p className="text-white/80 font-black text-xl mt-1">
                            ${plan.currency === 'USD' ? (plan.price / 20).toFixed(0) : plan.price} {plan.currency}/mes
                        </p>

                        {/* Step indicator */}
                        <div className="flex items-center gap-2 mt-6">
                            {(['method', 'instructions', 'upload'] as Step[]).map((s, i) => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${step === s ? 'bg-white text-purple-600' :
                                            ['method', 'instructions', 'upload', 'success'].indexOf(step) > i ? 'bg-white/40 text-white' : 'bg-white/10 text-white/40'
                                        }`}>
                                        {['method', 'instructions', 'upload', 'success'].indexOf(step) > i ? '✓' : i + 1}
                                    </div>
                                    {i < 2 && <div className={`h-px w-8 transition-all ${['method', 'instructions', 'upload', 'success'].indexOf(step) > i ? 'bg-white/60' : 'bg-white/20'}`} />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <AnimatePresence mode="wait">

                            {/* STEP 1: Choose Method */}
                            {step === 'method' && (
                                <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                    <h3 className="text-xl font-black text-zinc-900 uppercase italic tracking-tighter mb-6">¿Cómo vas a pagar?</h3>

                                    <button
                                        onClick={() => { setMethod('oxxo'); setStep('instructions'); }}
                                        disabled={!methods?.oxxo?.enabled}
                                        className="w-full p-6 rounded-3xl border-2 border-zinc-100 hover:border-orange-300 hover:bg-orange-50 transition-all flex items-center gap-5 group disabled:opacity-40 disabled:cursor-not-allowed text-left"
                                    >
                                        <div className="w-14 h-14 bg-orange-50 group-hover:bg-orange-100 rounded-2xl flex items-center justify-center transition-colors">
                                            <ShoppingBag className="w-7 h-7 text-orange-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-zinc-900 text-lg uppercase tracking-tighter leading-none">OXXO Pay</p>
                                            <p className="text-zinc-400 text-xs font-bold mt-1">Paga en cualquier tienda OXXO</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                                    </button>

                                    <button
                                        onClick={() => { setMethod('transfer'); setStep('instructions'); }}
                                        disabled={!methods?.ventanilla?.enabled}
                                        className="w-full p-6 rounded-3xl border-2 border-zinc-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center gap-5 group disabled:opacity-40 disabled:cursor-not-allowed text-left"
                                    >
                                        <div className="w-14 h-14 bg-indigo-50 group-hover:bg-indigo-100 rounded-2xl flex items-center justify-center transition-colors">
                                            <Building2 className="w-7 h-7 text-indigo-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black text-zinc-900 text-lg uppercase tracking-tighter leading-none">Transferencia Bancaria</p>
                                            <p className="text-zinc-400 text-xs font-bold mt-1">SPEI / depósito en ventanilla</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                    </button>
                                </motion.div>
                            )}

                            {/* STEP 2: Instructions */}
                            {step === 'instructions' && methods && (
                                <motion.div key="instructions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                    <button onClick={() => setStep('method')} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-700 transition-colors text-xs font-black uppercase tracking-widest">
                                        <ArrowLeft className="w-4 h-4" /> Regresar
                                    </button>

                                    {method === 'oxxo' && (
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-black text-zinc-900 uppercase italic tracking-tighter">Instrucciones OXXO</h3>
                                            <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 space-y-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Tarjeta de depósito</p>
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-2xl font-black text-zinc-900 tracking-widest">{methods.oxxo?.card_number}</p>
                                                        <button onClick={() => handleCopy(methods.oxxo?.card_number)} className="text-orange-500 hover:text-orange-700">
                                                            {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">A nombre de</p>
                                                    <p className="font-bold text-zinc-700">{methods.oxxo?.account_holder}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Banco</p>
                                                    <p className="font-bold text-zinc-700">{methods.oxxo?.bank}</p>
                                                </div>
                                                <div className="pt-3 border-t border-orange-100">
                                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Monto a pagar</p>
                                                    <p className="text-3xl font-black text-zinc-900">${plan.currency === 'USD' ? (plan.price / 20).toFixed(0) : plan.price} <span className="text-sm text-zinc-400">{plan.currency}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {method === 'transfer' && (
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-black text-zinc-900 uppercase italic tracking-tighter">Datos de Transferencia</h3>
                                            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 space-y-4">
                                                <p className="font-bold text-zinc-700 whitespace-pre-line text-sm leading-relaxed">{methods.ventanilla?.details}</p>
                                                <button onClick={() => handleCopy(methods.ventanilla?.details)} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-xs font-black uppercase tracking-widest">
                                                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    {copied ? 'Copiado' : 'Copiar datos'}
                                                </button>
                                                <div className="pt-3 border-t border-indigo-100">
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Monto exacto</p>
                                                    <p className="text-3xl font-black text-zinc-900">${plan.currency === 'USD' ? (plan.price / 20).toFixed(0) : plan.price} <span className="text-sm text-zinc-400">{plan.currency}</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <Button onClick={() => setStep('upload')} className="w-full h-14 bg-zinc-900 text-white rounded-full font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2">
                                        Ya realicé el pago <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            )}

                            {/* STEP 3: Upload Proof */}
                            {step === 'upload' && (
                                <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                    <button onClick={() => setStep('instructions')} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-700 transition-colors text-xs font-black uppercase tracking-widest">
                                        <ArrowLeft className="w-4 h-4" /> Regresar
                                    </button>

                                    <h3 className="text-xl font-black text-zinc-900 uppercase italic tracking-tighter">Sube tu comprobante</h3>
                                    <p className="text-zinc-400 text-sm font-bold">Adjunta una foto o PDF de tu comprobante de pago para que podamos verificarlo.</p>

                                    <label className={`w-full border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${file ? 'border-green-300 bg-green-50' : 'border-zinc-200 hover:border-purple-400 hover:bg-purple-50'}`}>
                                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
                                        {file ? (
                                            <>
                                                <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                                                <p className="font-black text-green-700 text-sm">{file.name}</p>
                                                <p className="text-green-500 text-xs mt-1">Toca para cambiar</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
                                                    <Upload className="w-8 h-8 text-zinc-400" />
                                                </div>
                                                <p className="font-black text-zinc-600 text-sm">Arrastra o toca para subir</p>
                                                <p className="text-zinc-400 text-xs mt-1">JPG, PNG, PDF — máx. 10MB</p>
                                            </>
                                        )}
                                    </label>

                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!file || uploading}
                                        className="w-full h-14 bg-purple-600 text-white rounded-full font-black uppercase tracking-widest hover:bg-purple-700 transition-all flex items-center gap-2 shadow-xl shadow-purple-600/20"
                                    >
                                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <><FileText className="w-4 h-4" /> Enviar comprobante</>
                                        )}
                                    </Button>
                                </motion.div>
                            )}

                            {/* STEP 4: Success */}
                            {step === 'success' && (
                                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-4">
                                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-14 h-14 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tighter">¡Solicitud Enviada!</h3>
                                        <p className="text-zinc-400 text-sm font-bold mt-2 max-w-xs mx-auto">Tu comprobante fue recibido. Te activaremos el plan en menos de 24 horas hábiles.</p>
                                    </div>
                                    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Tu referencia</p>
                                        <p className="text-2xl font-black text-purple-600 tracking-widest">{reference}</p>
                                        <p className="text-[10px] text-zinc-400 mt-1">Guárdala por si necesitas soporte</p>
                                    </div>
                                    <Button onClick={onClose} className="w-full h-14 bg-zinc-900 text-white rounded-full font-black uppercase tracking-widest hover:bg-zinc-800">
                                        Entendido, gracias
                                    </Button>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
