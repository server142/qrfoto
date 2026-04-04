"use client";

import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Home, Calendar, Settings, LogOut, Menu, X, Image as ImageIcon, ArrowRight } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";

import { useTranslation } from "@/lib/LanguageContext";

export default function UserLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: t.dashboard.title, icon: Home, href: "/dashboard" },
    { label: t.dashboard.events, icon: Calendar, href: "/dashboard/events" },
    { label: t.dashboard.my_plan, icon: Settings, href: "/dashboard/plan" },
  ];

  const fetchUser = async () => {
    try {
      const token = document.cookie.split("; ").find(row => row.startsWith("token="))?.split("=")[1];
      if (!token) return;

      const res = await fetch(`${getApiUrl()}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-zinc-950 p-6 md:flex flex-col hidden fixed h-full">
        <div className="mb-10">
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 uppercase italic tracking-tighter">
            QRFoto
          </h2>
          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1 italic">{t.dashboard.portal_client}</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-white/50 hover:bg-white/5 hover:text-white rounded-xl transition-all font-black uppercase text-[10px] tracking-widest"
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          ))}

          {user?.role === 'SuperAdmin' && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/10 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest"
            >
              <Settings className="w-4 h-4" /> {t.dashboard.admin_panel || "Admin Panel"}
            </Link>
          )}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <Link href="/login" className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest">
            <LogOut className="w-4 h-4" /> {t.dashboard.logout}
          </Link>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 overflow-y-auto min-h-screen">
        <header className="h-20 border-b border-white/10 bg-zinc-950/50 backdrop-blur-xl flex items-center px-8 sticky top-0 z-50 justify-between">
          <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white/30 italic">{t.dashboard.control_panel}</h1>

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

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-purple-600/20 mr-2">
              {user?.role === 'SuperAdmin' ? 'A' : (user?.first_name?.[0] || 'U')}
            </div>
            <div className="hidden sm:block text-left">
               <p className="text-[10px] font-black uppercase tracking-tighter leading-none">{user?.first_name || 'Usuario'}</p>
               <p className="text-[8px] text-white/40 uppercase font-bold tracking-widest mt-1">{user?.role || 'Guest'}</p>
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
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between text-2xl font-black italic text-white/90 hover:text-purple-400 transition-all border-b border-white/5 pb-4 group"
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

