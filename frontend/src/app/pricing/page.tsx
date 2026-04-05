"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/api";
import { useTranslation } from "@/lib/LanguageContext";
import { PricingTable } from "@/components/PricingTable";
import Link from "next/link";

export default function PricingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 p-6 md:p-24 relative overflow-hidden font-sans">
      {/* Bg Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-100/50 blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-50/50 blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto space-y-20 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          <Link href="/" className="mb-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-purple-600 text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                <ArrowLeft className="w-3 h-3" /> Volver al Inicio
             </div>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white border border-zinc-100 shadow-sm text-purple-600 text-xs font-black uppercase tracking-[0.2em]"
          >
            <Sparkles className="w-4 h-4" /> {t.pricing.badge}
          </motion.div>

          <h1 className="text-5xl md:text-[6rem] font-black tracking-tighter italic text-zinc-900 leading-[0.95] uppercase">
            Impulsa tus <br /> <span className="text-purple-600 underline">eventos hoy</span>
          </h1>
          
          <p className="text-zinc-500 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
            {t.pricing.subtitle}
          </p>
        </div>

        <PricingTable />

        <div className="text-center pt-20 border-t border-zinc-100">
          <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">
            {t.pricing.secure_payments}
          </p>
          <div className="mt-8 flex justify-center gap-8 opacity-30 grayscale pointer-events-none">
             {/* Simulating payment methods icons */}
             <div className="text-2xl font-black italic">VISA</div>
             <div className="text-2xl font-black italic">Mastercard</div>
             <div className="text-2xl font-black italic">STRIPE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
