"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/api";
import { useTranslation } from "@/lib/LanguageContext";
import { PricingTable } from "@/components/PricingTable";

export default function PricingPage() {
  const { t } = useTranslation();

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

        <PricingTable />

        <div className="text-center">
          <p className="text-white/40 text-xs italic">
            {t.pricing.secure_payments}
          </p>
        </div>
      </div>
    </div>
  );
}
