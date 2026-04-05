"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { Home, Users, CreditCard, Settings, Calendar, LogOut, BarChart3, Star, Menu, X, ArrowRight } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/lib/LanguageContext";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: t.dashboard.title, icon: Home, href: "/admin" },
    { label: t.admin.plans_title, icon: CreditCard, href: "/admin/plans" },
    { label: t.admin.users, icon: Users, href: "/admin/users" },
    { label: t.admin.reviews_title || "Reviews", icon: Star, href: "/admin/reviews" },
    { label: t.admin.user_dashboard || "User Dashboard", icon: Calendar, href: "/dashboard", variant: "user" },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      <aside className="w-64 border-r border-white/10 bg-zinc-950 p-6 md:flex flex-col hidden fixed h-full">
        <div className="mb-10">
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 uppercase italic tracking-tighter">
            QRFoto Pro
          </h2>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black mt-1">Super Admin</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest ${item.variant === "user"
                  ? "text-purple-400 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/10 mt-6"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          ))}
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-white/20 cursor-not-allowed rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest">
            <BarChart3 className="w-4 h-4" /> Analytics
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 hover:text-white rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest">
            <Settings className="w-4 h-4" /> {t.admin.settings}
          </Link>
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <Link href="/login" className="flex items-center gap-3 px-4 py-3 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest">
            <LogOut className="w-4 h-4" /> {t.dashboard.logout}
          </Link>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 overflow-y-auto">
        <header className="h-20 border-b border-white/10 bg-zinc-950/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
          <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white/60">
            {t.language === 'es' ? 'Panel Administrativo' : 'Administrative Panel'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:bg-white/10 rounded-xl"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-40 md:hidden bg-zinc-950/95 backdrop-blur-2xl p-8 pt-32"
            >
              <nav className="flex flex-col gap-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-between text-2xl font-black italic text-white/90 hover:text-purple-400 transition-all border-b border-white/5 pb-4 group ${item.variant === "user" ? "text-purple-400" : ""
                      }`}
                  >
                    <div className="flex items-center gap-6">
                      <item.icon className="w-6 h-6 text-purple-600" />
                      <span>{item.label}</span>
                    </div>
                    <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                ))}

                <div className="mt-8 flex flex-col gap-8">
                  <div className="flex items-center justify-between bg-white/5 p-6 rounded-[1.5rem] border border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">{t.nav.change_lang}</span>
                    <LanguageSwitcher />
                  </div>

                  <Link
                    href="/login"
                    className="flex items-center gap-4 text-2xl font-black italic text-red-500/80 hover:text-red-500 transition-all"
                  >
                    <LogOut className="w-6 h-6" /> {t.dashboard.logout}
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
