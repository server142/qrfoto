"use client";

import { useTranslation } from "@/lib/LanguageContext";
import { PricingTable } from "@/components/PricingTable";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function MyPlanPage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-12 pb-16">
            <div className="flex justify-between items-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 sm:p-16 rounded-[3rem] border border-white/10 relative overflow-hidden shadow-2xl shadow-purple-600/20">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-[120px] -z-10" />
                <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-black/10 blur-[100px] -z-10 rounded-full" />

                <div className="flex flex-col gap-2 relative z-10">
                    <h2 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
                        {t.dashboard.my_plan}
                    </h2>
                    <p className="text-white/80 mt-4 uppercase text-xs sm:text-sm font-black tracking-[0.2em] max-w-2xl">{t.pricing.subtitle}</p>
                </div>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <PricingTable />
            </motion.div>
        </div>
    );
}
