"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Home, Users, CreditCard, Settings, Calendar, LogOut, BarChart3 } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/lib/LanguageContext";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      <aside className="w-64 border-r border-white/10 bg-zinc-950 p-6 md:flex flex-col hidden">
        <div className="mb-10">
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 uppercase italic tracking-tighter">
            Veltrix Pro
          </h2>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black mt-1">Super Admin</p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 hover:text-white rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest">
            <Home className="w-4 h-4" /> {t.dashboard.title}
          </Link>
          <Link href="/admin/plans" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 hover:text-white rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest">
            <CreditCard className="w-4 h-4" /> {t.admin.plans_title}
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 hover:text-white rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest">
            <Users className="w-4 h-4" /> {t.admin.users}
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-white/20 cursor-not-allowed rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest">
            <BarChart3 className="w-4 h-4" /> Analytics
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-white/20 cursor-not-allowed rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest">
            <Settings className="w-4 h-4" /> {t.admin.settings}
          </Link>
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <Link href="/login" className="flex items-center gap-3 px-4 py-3 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest">
            <LogOut className="w-4 h-4" /> {t.dashboard.logout}
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-20 border-b border-white/10 bg-zinc-950/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white/60">
            {t.language === 'es' ? 'Panel de Administración Central' : 'Central Administration Panel'}
          </h1>
          <div className="flex items-center gap-4">
             <LanguageSwitcher />
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
