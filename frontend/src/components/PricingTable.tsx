"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/api";
import { useTranslation } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";

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
    const router = useRouter();

    useEffect(() => {
        const token = typeof document !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] : null;

        Promise.all([
            fetch(`${getApiUrl()}/plans`).then(res => res.json()),
            token ? fetch(`${getApiUrl()}/users/me`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.ok ? res.json() : null).catch(() => null) : Promise.resolve(null)
        ])
            .then(([plansData, userData]) => {
                setPlans(plansData);
                if (userData && userData.activePlan) {
                    setActivePlanId(userData.activePlan.id);
                }
                setLoading(false);
            })
            .catch((err) => console.error(err));
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
            const res = await fetch(`${getApiUrl()}/payments/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ planId, userId: "", currency: language === 'en' ? 'usd' : 'mxn' }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error("Error redirecting to checkout:", err);
            alert(language === 'es' ? "Error al procesar el pago. Intenta de nuevo." : "Error processing payment. Try again.");
        } finally {
            setPurchasing(null);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center text-white py-12">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            <p className="mt-4 opacity-50 uppercase tracking-widest text-xs">{t.pricing.loading}</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan: any, i) => {
                // Exchange Rate logic (approx 20 MXN = 1 USD)
                const exchangeRate = language === 'en' ? 20 : 1;
                const displayPrice = parseInt(plan.price) === 0 ? 0 : Math.round(plan.price / exchangeRate);
                const currency = language === 'en' ? 'USD' : 'MXN';
                const symbol = '$';

                const isActive = activePlanId === plan.id;

                return (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className={`relative h-full bg-zinc-950 border-white/10 p-8 flex flex-col transition-all duration-500 overflow-visible ${isActive ? 'border-green-500 ring-[6px] ring-green-500/10 scale-105 z-10 shadow-2xl shadow-green-500/20' : plan.type === 'Annual' ? 'border-purple-500 ring-1 ring-purple-500/30 hover:border-purple-500' : 'hover:border-purple-500/50'}`}>
                            {isActive ? (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] font-black px-6 py-2 uppercase tracking-[0.2em] rounded-full shadow-xl shadow-green-500/40 z-30 whitespace-nowrap border-4 border-black">
                                    {(t.pricing as any).current_plan || 'Plan Actual'}
                                </div>
                            ) : plan.type === 'Annual' ? (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[9px] font-black px-6 py-2 uppercase tracking-[0.2em] rounded-full shadow-xl shadow-purple-500/40 z-30 whitespace-nowrap border-4 border-black">
                                    {t.pricing.popular}
                                </div>
                            ) : null}

                            <div className="mb-10 text-center md:text-left mt-2">
                                <h3 className="text-xl font-bold tracking-widest text-white/60 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline justify-center md:justify-start gap-1">
                                    <span className="text-5xl font-black text-white">{symbol}{displayPrice}</span>
                                    <span className="text-white/40 uppercase text-xs font-bold tracking-widest">{currency} / {language === 'en' ? 'mo' : 'mes'}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-12 flex-1">
                                {[
                                    `${plan.max_events} ${t.pricing.simultaneous}`,
                                    `${plan.storage_limit_mb >= 1000 ? `${plan.storage_limit_mb / 1000}GB` : `${plan.storage_limit_mb}MB`} ${t.pricing.storage} ${plan.storage_limit_mb <= 50 ? '(~10 uploads)' : ''}`,
                                    `${plan.event_duration_days} ${t.pricing.duration}`,
                                    t.pricing.custom_qr,
                                    t.pricing.bulk_download,
                                    t.pricing.branding
                                ].map((feat, j) => (
                                    <li key={j} className="flex items-center gap-3 text-sm text-white/70">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${isActive ? 'bg-green-500/10 border-green-500/20' : 'bg-purple-500/10 border-purple-500/20'}`}>
                                            <Check className={`w-3 h-3 ${isActive ? 'text-green-400' : 'text-purple-400'}`} />
                                        </div>
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={purchasing !== null || isActive}
                                className={`w-full h-14 rounded-[1.2rem] font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-black/50 ${isActive ? 'bg-green-500/10 text-green-500 hover:bg-green-500/10 cursor-default opacity-100' :
                                        plan.type === 'Annual' ? 'bg-purple-600 hover:bg-purple-500 text-white' :
                                            'bg-white text-black hover:bg-white/90'
                                    }`}
                            >
                                {purchasing === plan.id ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : isActive ? ((t.pricing as any).current_plan || 'Plan Actual') : t.pricing.subscribe}
                            </Button>
                        </Card>
                    </motion.div>
                )
            })}
        </div>
    );
}
