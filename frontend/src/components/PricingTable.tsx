"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles, Zap, ShieldCheck, X } from "lucide-react";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/api";
import { useTranslation } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";
import { ManualPaymentModal } from "./ManualPaymentModal";

export function PricingTable({
    onSubscribe
}: {
    onSubscribe?: (planId: string) => void;
}) {
    const { t, language } = useTranslation();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [activePlanId, setActivePlanId] = useState<string | null>(null);
    const [manualPlan, setManualPlan] = useState<any>(null);
    const [promoCode, setPromoCode] = useState("");
    const [promoData, setPromoData] = useState<any>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const token = typeof document !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;

        Promise.all([
            fetch(`${getApiUrl()}/plans`).then(res => res.json()),
            token ? fetch(`${getApiUrl()}/users/me`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.ok ? res.json() : null).catch(() => null) : Promise.resolve(null)
        ])
            .then(([plansData, userData]) => {
                if (Array.isArray(plansData)) {
                    setPlans(plansData as any);
                }
                if (userData && userData.activePlan) {
                    setActivePlanId(userData.activePlan.id);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSubscribe = async (planId: string) => {
        if (onSubscribe) {
            onSubscribe(planId);
            return;
        }

        setPurchasing(planId);
        let token = '';
        if (typeof document !== 'undefined') {
            token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || '';
        }

        if (!token) {
            router.push("/register?plan=" + planId);
            return;
        }

        try {
            const bodyData: any = { planId, userId: "", currency: language === 'en' ? 'usd' : 'mxn' };
            if (promoData) {
                bodyData.promocode = promoData.code;
            }

            const res = await fetch(`${getApiUrl()}/payments/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(bodyData),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else if (data.mode === 'manual') {
                // Stripe not configured → show manual payment modal
                setManualPlan(data.plan);
            }
        } catch (err) {
            console.error("Error redirecting to checkout:", err);
            alert(language === 'es' ? "Error al procesar el pago. Intenta de nuevo." : "Error processing payment. Try again.");
        } finally {
            setPurchasing(null);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center text-zinc-900 py-24">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-6" />
            <p className="opacity-40 uppercase tracking-[0.3em] font-black text-xs">{t.pricing.loading}</p>
        </div>
    );

    const handleValidatePromo = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        setPromoError("");
        try {
            const res = await fetch(`${getApiUrl()}/promocodes/validate/${promoCode.trim()}`);
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Código inválido");
            }
            const data = await res.json();
            setPromoData(data);
        } catch(err: any) {
            setPromoError(err.message || "Código no válido");
            setPromoData(null);
        } finally {
            setPromoLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20">
            {/* PROMO CODE SECTION */}
            <div className="flex flex-col items-center justify-center mb-16">
                <div className="bg-white border border-zinc-200 p-2 rounded-full w-full max-w-sm flex shadow-sm focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all">
                    <input 
                        type="text" 
                        placeholder={language === 'en' ? "PROMO CODE" : "CÓDIGO PROMOCIONAL"} 
                        className="flex-1 bg-transparent px-4 py-2 outline-none uppercase font-black tracking-widest text-sm text-zinc-800 placeholder:text-zinc-300"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleValidatePromo()}
                        disabled={promoData !== null}
                    />
                    {promoData ? (
                        <Button onClick={() => { setPromoData(null); setPromoCode(""); }} variant="outline" className="rounded-full text-red-500 border-red-200 bg-red-50 px-6 font-black uppercase text-xs">
                            QUITAR
                        </Button>
                    ) : (
                        <Button onClick={handleValidatePromo} disabled={promoLoading || !promoCode} className="rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-6 font-black uppercase text-xs text-white">
                            {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : language === 'en' ? "APPLY" : "APLICAR"}
                        </Button>
                    )}
                </div>
                {promoError && <p className="text-red-500 text-xs font-bold tracking-widest uppercase mt-3">{promoError}</p>}
                {promoData && <p className="text-green-600 text-xs font-bold tracking-widest uppercase mt-3 flex items-center gap-1"><Check className="w-3 h-3" /> ¡DESCUENTO DE {promoData.discount_percentage}% APLICADO!</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {plans.map((plan: any, i) => {
                const exchangeRate = language === 'en' ? 20 : 1;
                let displayPrice = parseInt(plan.price) === 0 ? 0 : Math.round(plan.price / exchangeRate);
                let originalDisplayPrice = displayPrice;
                
                if (promoData && displayPrice > 0) {
                    displayPrice = Math.round(displayPrice - (displayPrice * (promoData.discount_percentage / 100)));
                }

                const currency = language === 'en' ? 'USD' : 'MXN';
                const symbol = '$';

                const isActive = activePlanId === plan.id;
                const isPremium = plan.type === 'Annual' || plan.price > 0;

                const features = [
                    {
                        label: `${plan.max_events === 0 ? t.pricing.unlimited : plan.max_events} ${t.pricing.simultaneous}`,
                        enabled: true
                    },
                    {
                        label: `${plan.storage_limit_mb >= 1000 ? `${plan.storage_limit_mb / 1000}GB` : `${plan.storage_limit_mb}MB`} ${t.pricing.storage}`,
                        enabled: true
                    },
                    {
                        label: `${plan.event_duration_days} ${t.pricing.duration}`,
                        enabled: true
                    },
                    {
                        label: t.pricing.custom_qr,
                        enabled: plan.has_custom_qr ?? true
                    },
                    {
                        label: t.pricing.bulk_download,
                        enabled: plan.has_bulk_download ?? true
                    },
                    {
                        label: t.pricing.branding,
                        enabled: plan.has_custom_branding ?? true
                    }
                ];

                return (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="relative group h-full"
                    >
                        <Card className={`relative h-full bg-white border-zinc-100 p-6 sm:p-8 flex flex-col transition-all duration-500 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:-translate-y-1 group-hover:border-purple-200 overflow-hidden ${isActive ? 'ring-4 ring-green-500/10 border-green-500 scale-[1.01] z-10' : ''}`}>
                            {isActive ? (
                                <div className="absolute top-0 right-0 p-6">
                                    <ShieldCheck className="w-6 h-6 text-green-500" />
                                </div>
                            ) : null}

                            {!isActive && (plan.type === 'Annual' || plan.price > 50) ? (
                                <div className="absolute top-0 right-0 p-6">
                                    <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                                </div>
                            ) : null}

                            <div className="mb-6 text-left">
                                <h3 className="text-sm font-black tracking-widest text-zinc-300 mb-1 italic uppercase">{plan.name}</h3>
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    {promoData && originalDisplayPrice > 0 && (
                                        <span className="text-xl font-black text-zinc-300 tracking-tighter line-through">{symbol}{originalDisplayPrice}</span>
                                    )}
                                    <span className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tighter leading-none">{symbol}{displayPrice}</span>
                                    <span className="text-zinc-400 uppercase text-[9px] font-black tracking-widest">{currency} / {language === 'en' ? 'mo' : 'mes'}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {features.map((feat, j) => (
                                    <li key={j} className={`flex items-center gap-3 font-bold text-xs sm:text-sm group/item ${feat.enabled ? 'text-zinc-600' : 'text-zinc-300 line-through decoration-zinc-200 opacity-60'}`}>
                                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${!feat.enabled ? 'bg-zinc-50 text-zinc-300' : isActive ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'}`}>
                                            {feat.enabled ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                        </div>
                                        <span className={feat.enabled ? "group-hover/item:text-zinc-900 transition-colors" : ""}>{feat.label}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={purchasing !== null || isActive}
                                className={`w-full h-14 rounded-full font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-xl active:scale-95 text-center px-2 ${isActive ? 'bg-green-50 text-green-600 hover:bg-green-50 cursor-default shadow-none border-2 border-green-500' :
                                    plan.type === 'Annual' || plan.price > 50 ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30' :
                                        'bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-900/20'
                                    }`}
                            >
                                {purchasing === plan.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : isActive ? (
                                    ((t.pricing as any).current_plan || 'Plan Actual')
                                ) : (
                                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                                        {t.pricing.subscribe}
                                        <Zap className="w-3.5 h-3.5 fill-current" />
                                    </div>
                                )}
                            </Button>
                        </Card>
                    </motion.div>
                )
            })}
            {plans.length === 0 && (
                <div className="col-span-full text-center py-20 bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-200">
                    <Zap className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No hay planes disponibles en este momento</p>
                </div>
            )}

            {manualPlan && (
                <ManualPaymentModal
                    plan={manualPlan}
                    promoData={promoData}
                    onClose={() => setManualPlan(null)}
                />
            )}
            </div>
        </div>
    );
}
