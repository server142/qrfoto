"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, QrCode, MonitorPlay, Zap, Shield, Image as ImageIcon, Menu, X, Globe, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import { useTranslation } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PricingTable } from "@/components/PricingTable";
import Link from "next/link";

export default function LandingPage() {
  const { t, language } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${getApiUrl()}/reviews`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(console.error);
  }, []);

  const featuresList = [
    { icon: QrCode, title: t.features.qr, desc: t.features.qr_desc },
    { icon: Zap, title: t.features.realtime, desc: t.features.realtime_desc },
    { icon: MonitorPlay, title: t.features.slideshow, desc: t.features.slideshow_desc },
    { icon: Shield, title: t.features.secure, desc: t.features.secure_desc },
    { icon: ImageIcon, title: t.features.quality, desc: t.features.quality_desc },
    { icon: ArrowRight, title: t.features.automation, desc: t.features.automation_desc },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 uppercase italic tracking-tighter">
              QRFoto
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-[10px] uppercase font-black tracking-[0.2em] text-white/50">
            <a href="#features" className="hover:text-white transition-colors">{t.nav.features}</a>
            <Link href="/pricing" className="hover:text-white transition-colors">{t.nav.pricing}</Link>
            <a href="#gallery" className="hover:text-white transition-colors">{t.nav.gallery}</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10 uppercase font-black text-xs tracking-widest px-6">
                {t.login.cta}
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-black hover:bg-white/90 rounded-2xl px-6 h-11 font-black uppercase text-xs tracking-widest shadow-xl shadow-white/5">
                {t.hero.cta}
              </Button>
            </Link>
            <div className="ml-2">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-3">
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

        {/* Mobile Menu Content */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-zinc-950 border-b border-white/10 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-6">
                <a
                  href="#features"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-black uppercase italic text-white/40 hover:text-white flex items-center justify-between group transition-colors"
                >
                  <span>{t.nav.features}</span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </a>
                <Link
                  href="/pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-black uppercase italic text-white/40 hover:text-white flex items-center justify-between group transition-colors"
                >
                  <span>{t.nav.pricing}</span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </Link>
                <a
                  href="#gallery"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-black uppercase italic text-white/40 hover:text-white flex items-center justify-between group transition-colors"
                >
                  <span>{t.nav.gallery}</span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </a>

                <div className="h-px bg-white/5 my-2" />

                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-black uppercase italic text-white flex items-center justify-between group"
                >
                  <span>{t.login.cta}</span>
                  <ArrowRight className="w-6 h-6 text-purple-500 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-black uppercase italic text-purple-400 flex items-center justify-between group"
                >
                  <span>{t.hero.cta}</span>
                  <ArrowRight className="w-6 h-6 text-purple-400 group-hover:translate-x-2 transition-transform" />
                </Link>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">{t.nav.change_lang}</span>
                  <LanguageSwitcher />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
              {t.hero.title}
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                {t.hero.galleries}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-lg hover:opacity-90 w-full transition-all shadow-[0_0_40px_rgba(168,85,247,0.4)]">
                  {t.hero.cta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/demo" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg border-white/20 hover:bg-white/5 w-full">
                  {t.hero.demo}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-black relative border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t.features.title}</h2>
            <p className="text-white/60">{t.features.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((Feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                  <Feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{Feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{Feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-black relative border-t border-white/5">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t.pricing.title}</h2>
            <p className="text-white/60">{t.pricing.subtitle}</p>
          </div>
          <PricingTable />
        </div>
      </section>
      {reviews.length > 0 && (
        <section id="reviews" className="py-24 bg-zinc-950 relative border-t border-white/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">{t.reviews.title}</h2>
              <p className="text-white/60">{t.reviews.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05]"
                >
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-5 h-5 ${review.rating >= star ? 'fill-yellow-500 text-yellow-500' : 'text-white/20'}`} />
                    ))}
                  </div>
                  <p className="text-white/80 leading-relaxed mb-6 italic">"{review.comment}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white uppercase">
                      {review.user?.first_name?.charAt(0)}{review.user?.last_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{review.user?.first_name} {review.user?.last_name}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">{review.event?.name || 'QRFoto Event'}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 uppercase italic tracking-tighter">
            QRFoto
          </span>
          <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
            © 2026 QRFoto Events. {language === 'es' ? 'Todos los derechos reservados' : 'All rights reserved'}.
          </p>
        </div>
      </footer>
    </div>
  );
}
