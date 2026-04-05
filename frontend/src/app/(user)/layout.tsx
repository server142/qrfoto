"use client";

import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard,
  Crown,
  ChevronRight,
  Bell,
  Search,
  User
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import { useTranslation } from "@/lib/LanguageContext";
import { Logo } from "@/components/Logo";

export default function UserLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Mis Eventos", icon: Calendar, href: "/dashboard/events" },
    { label: "Mi Suscripción", icon: Crown, href: "/dashboard/plan" },
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
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-72 border-r border-zinc-200 bg-white md:flex flex-col hidden fixed h-full z-50 overflow-hidden shadow-2xl shadow-zinc-100">
        <div className="p-8 mb-4">
          <Link href="/">
             <Logo size="md" />
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest leading-none">Portal de Cliente</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between group px-4 py-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                  ? "bg-purple-600 text-white shadow-xl shadow-purple-600/20" 
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "group-hover:text-purple-600"} transition-colors`} />
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
              </Link>
            );
          })}

          <div className="h-4" />
          <p className="px-4 text-[10px] uppercase font-bold text-zinc-300 tracking-[0.2em] mb-4">Administración</p>

          {user?.role === 'SuperAdmin' && (
            <Link
              href="/admin"
              className="flex items-center gap-4 px-4 py-4 text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-2xl transition-all font-bold text-sm hover:scale-[1.02] active:scale-95"
            >
              <Settings className="w-5 h-5 animate-spin-slow" /> Panel SuperAdmin
            </Link>
          )}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="p-4 mt-auto">
            <div className="bg-zinc-50 rounded-[2rem] p-6 border border-zinc-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                        {user?.first_name?.[0] || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs font-black truncate">{user?.first_name || 'Cargando...'}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{user?.role || 'Plan Free'}</p>
                    </div>
                </div>
                <Link href="/login" className="flex items-center justify-center gap-2 w-full py-3 bg-white text-red-500 hover:bg-red-50 rounded-xl border border-red-100 transition-all font-black uppercase text-[10px] tracking-widest shadow-sm">
                    <LogOut className="w-3 h-3" /> {t.dashboard.logout}
                </Link>
            </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-72 flex flex-col min-h-screen">
        {/* Modern Navbar */}
        <header className="h-16 sm:h-20 bg-white/50 backdrop-blur-xl border-b border-zinc-100 flex items-center px-4 sm:px-8 sticky top-0 z-40 justify-between">
          <div className="flex items-center gap-2 sm:gap-6">
             <div className="md:hidden">
              <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-zinc-600 hover:bg-zinc-100 rounded-xl w-10 h-10"
                >
                    <Menu className="w-5 h-5" />
                </Button>
             </div>
             <div className="hidden lg:flex items-center bg-zinc-100 rounded-full px-4 h-10 border border-zinc-100 group focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-600/10 transition-all">
                <Search className="w-4 h-4 text-zinc-400" />
                <input 
                    type="text" 
                    placeholder="Buscar eventos..." 
                    className="bg-transparent border-none focus:ring-0 text-sm font-medium text-zinc-700 w-64 px-3"
                />
             </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-purple-600 cursor-pointer transition-all relative group">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-purple-600 rounded-full border-2 border-white group-hover:scale-125 transition-transform" />
                </div>
            </div>

            <div className="h-6 sm:h-8 w-px bg-zinc-100" />
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="scale-75 sm:scale-100 transform origin-right">
                <LanguageSwitcher />
              </div>
              <div className="flex items-center gap-2 sm:gap-3 bg-zinc-950 text-white rounded-full pl-2 pr-2 sm:pr-5 h-10 sm:h-12 shadow-xl shadow-zinc-300 border-none group hover:scale-105 transition-all cursor-pointer overflow-hidden min-w-[40px] sm:min-w-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-purple-400 to-pink-500 overflow-hidden border-2 border-white/20 flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center font-black text-[10px]">{user?.first_name?.[0]}</div>
                </div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest hidden min-[400px]:inline">{user?.first_name || 'Admin'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
                />
                <motion.div
                    initial={{ x: -280 }}
                    animate={{ x: 0 }}
                    exit={{ x: -280 }}
                    className="fixed inset-y-0 left-0 w-72 bg-white z-[70] md:hidden shadow-3xl p-8 flex flex-col"
                >
                    <div className="mb-12 flex justify-between items-center">
                        <Logo size="md" />
                        <Button variant="ghost" onClick={() => setIsMenuOpen(false)}>
                            <X className="w-6 h-6" />
                        </Button>
                    </div>

                    <nav className="space-y-4 flex-1">
                        {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-6 text-xl font-bold text-zinc-500 hover:text-purple-600 transition-all border-b border-zinc-50 pb-4"
                        >
                            <item.icon className="w-6 h-6" /> {item.label}
                        </Link>
                        ))}
                    </nav>

                    <div className="mt-auto space-y-6">
                        <LanguageSwitcher />
                        <Link href="/login" className="flex items-center gap-4 text-lg font-black text-red-500">
                            <LogOut className="w-6 h-6" /> Cerrar Sesión
                        </Link>
                    </div>
                </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="p-4 sm:p-6 md:p-10 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
