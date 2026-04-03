"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/api";
import { useTranslation } from "@/lib/LanguageContext";

export default function PricingPage() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${getApiUrl()}/plans`)
      .then((res) => res.json())
      .then((data) => {
        setPlans(data);
        setLoading(false);
      });
  }, [getApiUrl()]);

  const handleSubscribe = async (planId: string) => {
    setPurchasing(planId);
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    if (!token) {
        window.location.href = "/login";
        return;
    }

    try {
      const res = await fetch(`${getApiUrl()}/payments/checkout`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ planId, userId: "" }), // ID taken from JWT in backend
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Error redirecting to checkout:", err);
      alert(t.language === 'es' ? "Error al procesar el pago. Intenta de nuevo." : "Error processing payment. Try again.");
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      <p className="mt-4 opacity-50 uppercase tracking-widest text-xs">{t.pricing.loading}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8 md:p-24 relative overflow-hidden">
      {/* Bg Decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-600/10 blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-pink-400 text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-3.5 h-3.5" /> {t.pricing.badge}
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">{t.pricing.title}</h1>
          <p className="text-white/50 text-xl max-w-2xl mx-auto">
            {t.pricing.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan: any, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`relative h-full bg-zinc-950 border-white/10 p-8 flex flex-col hover:border-purple-500/50 transition-all ${plan.type === 'Annual' ? 'border-purple-500 ring-1 ring-purple-500/50' : ''}`}>
                {plan.type === 'Annual' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] font-black px-4 py-1.5 uppercase tracking-widest rounded-full shadow-xl">
                    {t.pricing.popular}
                  </div>
                )}
                
                <div className="mb-10">
                  <h3 className="text-xl font-bold uppercase tracking-widest text-white/60 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">${plan.price}</span>
                    <span className="text-white/40 uppercase text-xs font-bold tracking-widest">{t.pricing.currency}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-12 flex-1">
                  {[
                    `${plan.max_events} ${t.pricing.simultaneous}`,
                    `${plan.storage_limit_mb}MB ${t.pricing.storage}`,
                    `${plan.event_duration_days} ${t.pricing.duration}`,
                    t.pricing.custom_qr,
                    t.pricing.bulk_download,
                    t.pricing.branding
                  ].map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-white/70">
                      <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <Check className="w-3 h-3 text-purple-400" />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={purchasing !== null}
                  className={`w-full h-14 rounded-[1.2rem] font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-black/50 ${plan.type === 'Annual' ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-white text-black hover:bg-white/90'}`}
                >
                  {purchasing === plan.id ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t.pricing.subscribe}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
            <p className="text-white/40 text-xs italic">
                {t.pricing.secure_payments}
            </p>
        </div>
      </div>
    </div>
  );
}
