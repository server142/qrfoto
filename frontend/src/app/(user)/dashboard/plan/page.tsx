"use client";

import { useTranslation } from "@/lib/LanguageContext";
import { PricingTable } from "@/components/PricingTable";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function MyPlanPage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-12 pb-16">
            <div className="flex justify-between items-center bg-zinc-950/50 p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] -z-10" />

                <div className="flex flex-col gap-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-pink-400 text-xs font-bold uppercase tracking-widest w-max mb-2"
                    >
                        <Sparkles className="w-3.5 h-3.5" /> QRFoto SaaS
                    </motion.div>

                    <h2 className="text-4xl font-black tracking-tight uppercase italic text-white flex items-center gap-4">
                        {t.dashboard.my_plan}
                    </h2>
                    <p className="text-white/40 mt-1 uppercase text-xs font-bold tracking-widest">{t.pricing.subtitle}</p>
                </div>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <PricingTable />
            </motion.div>
        </div>
    );
}
