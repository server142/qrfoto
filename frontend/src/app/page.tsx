"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  QrCode,
  Zap,
  Shield,
  Menu,
  X,
  Camera,
  Heart,
  Users,
  Sparkles,
  PlayCircle,
  Star,
  ArrowUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PricingTable } from "@/components/PricingTable";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export default function LandingPage() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const useCases = [
    { title: t.landing.categories.weddings, desc: t.landing.categories.weddings_desc, icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
    { title: t.landing.categories.birthdays, desc: t.landing.categories.birthdays_desc, icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50" },
    { title: t.landing.categories.nightlife, desc: t.landing.categories.nightlife_desc, icon: Camera, color: "text-blue-500", bg: "bg-blue-50" },
    { title: t.landing.categories.corporate, desc: t.landing.categories.corporate_desc, icon: Users, color: "text-zinc-700", bg: "bg-zinc-100" }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 selection:bg-purple-100 selection:text-purple-900 font-sans">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl border-b border-zinc-100 py-4 shadow-sm" : "bg-transparent py-6"}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="md" />
          </div>

          <div className="hidden md:flex items-center gap-12 text-xs font-black uppercase tracking-widest text-zinc-500">
            <a href="#como-funciona" className="hover:text-purple-600 transition-colors uppercase">{t.nav.features}</a>
            <a href="#beneficios" className="hover:text-purple-600 transition-colors uppercase">{t.landing.benefits.control}</a>
            <a href="#precios" className="hover:text-purple-600 transition-colors uppercase">{t.nav.pricing}</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login" className="text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-900 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-white border-2 border-zinc-100 hover:border-purple-600 hover:text-purple-600 transition-all shadow-lg hover:shadow-purple-600/10 active:scale-95">
              {t.login.cta}
            </Link>

            <div className="scale-90 sm:scale-100">
              <LanguageSwitcher />
            </div>

            <Link href="/register" className="hidden lg:block">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 h-12 text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-600/20 active:scale-95 transition-all">
                {t.hero.cta}
              </Button>
            </Link>
            <button
              className="lg:hidden p-3 hover:bg-zinc-100 rounded-2xl transition-colors relative z-50 text-purple-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-0 bg-white z-40 lg:hidden flex flex-col p-8 pt-24"
              >
                <div className="space-y-8 flex-1">
                  {[
                    { href: "#como-funciona", label: t.nav.features },
                    { href: "#beneficios", label: t.landing.benefits.control },
                    { href: "#precios", label: t.nav.pricing }
                  ].map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-4xl font-black uppercase italic tracking-tighter text-zinc-900 border-b border-zinc-100 pb-4"
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="pt-8">
                    <LanguageSwitcher />
                  </div>
                </div>

                <div className="space-y-4">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full h-16 rounded-3xl font-black uppercase tracking-widest text-zinc-400 text-xs">
                      {t.login.cta}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full h-20 rounded-[2.5rem] bg-purple-600 hover:bg-purple-700 text-white text-lg font-black uppercase tracking-tighter shadow-2xl shadow-purple-600/30">
                      {t.hero.cta}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-56 md:pb-32 overflow-hidden bg-white">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-50 rounded-full blur-[120px] opacity-60 -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[150px] opacity-40 -z-10" />

        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-[0.2em] mb-12 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" /> {t.landing.promo_badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl min-[400px]:text-5xl md:text-8xl lg:text-[7.5rem] leading-[0.95] font-black tracking-tighter mb-12 uppercase italic text-zinc-900 break-words"
          >
            {t.landing.hero_title} <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-300% animate-gradient pb-2 sm:pb-4 inline-block">
              {t.landing.hero_viral}
            </span>
            <span className="inline-block ml-2 sm:ml-4 text-purple-600">
              <Camera className="w-10 h-10 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 inline align-middle animate-bounce" />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-zinc-500 font-medium max-w-3xl mx-auto mb-16 leading-tight"
          >
            {t.landing.hero_desc1} <br />
            <b>{t.landing.hero_desc2}</b> {t.landing.hero_desc3}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/register">
              <Button size="lg" className="h-20 px-8 sm:px-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-lg sm:text-xl font-black uppercase tracking-tighter shadow-2xl shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 group">
                {t.hero.cta} <ArrowRight className="ml-2 w-6 h-6 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button size="lg" variant="ghost" className="h-16 sm:h-20 px-10 text-zinc-400 hover:text-zinc-900 font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center gap-3 active:scale-95 transition-all">
              <PlayCircle className="w-5 h-5 text-purple-600" /> {t.landing.how_it_works_btn}
            </Button>
          </motion.div>

          <div className="absolute top-1/4 left-10 hidden xl:block">
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-purple-600/10 -rotate-12 border border-zinc-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                <Heart className="w-6 h-6 text-purple-600 fill-current" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t.landing.categories.weddings}</p>
                <p className="text-sm font-black italic uppercase tracking-tighter">100% Emotivo</p>
              </div>
            </motion.div>
          </div>

          <div className="absolute top-1/3 right-10 hidden xl:block">
            <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-indigo-600/10 rotate-12 border border-zinc-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-indigo-600 fill-current" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t.landing.categories.nightlife}</p>
                <p className="text-sm font-black italic uppercase tracking-tighter">Viralidad Pura</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative w-full max-w-6xl mx-auto rounded-[3rem] overflow-hidden mt-16 shadow-[0_50px_100px_rgba(0,0,0,0.1)] group"
          >
            <img
              src="/qrfoto_final_hero_mockup_1775351002426.png"
              alt="QRFoto Mockup Dashboard y App"
              className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[3rem]" />
          </motion.div>
        </div>
      </section>

      {/* Categories / Use Cases */}
      <section className="py-32 bg-[#FDFDFD]">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            {useCases.map((useCase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-default"
              >
                <div className={`${useCase.bg} w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transform transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                  <useCase.icon className={`w-10 h-10 ${useCase.color}`} />
                </div>
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter italic">{useCase.title}</h3>
                <p className="text-zinc-500 font-medium leading-snug">{useCase.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution / Steps */}
      <section id="como-funciona" className="py-24 md:py-32 bg-[#F8F9FA]">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter uppercase italic">{t.landing.how_it_works.title}</h2>
            <p className="text-2xl text-zinc-500 font-medium">{t.landing.how_it_works.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: t.landing.how_it_works.step1_title, desc: t.landing.how_it_works.step1_desc, icon: QrCode },
              { step: "02", title: t.landing.how_it_works.step2_title, desc: t.landing.how_it_works.step2_desc, icon: Camera },
              { step: "03", title: t.landing.how_it_works.step3_title, desc: t.landing.how_it_works.step3_desc, icon: Zap }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-12 bg-white rounded-[3rem] shadow-sm border border-zinc-100 group transition-all duration-300 text-left relative overflow-hidden"
              >
                <div className="text-[10rem] font-black text-zinc-50 absolute -right-10 -bottom-10 leading-none group-hover:text-purple-50 transition-colors pointer-events-none">
                  {item.step}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-10 text-purple-600 relative z-10 group-hover:scale-110 transition-transform">
                  <item.icon className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black mb-6 relative z-10 uppercase tracking-tight italic">{item.title}</h3>
                <p className="text-zinc-500 leading-snug font-medium text-lg relative z-10">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-10">
            <h2 className="text-5xl md:text-7xl font-black max-w-3xl leading-[0.9] italic tracking-tighter uppercase">
              {t.landing.benefits.title} <br /> <span className="text-purple-600">{t.landing.benefits.subtitle}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {[
              { title: t.landing.benefits.control, desc: t.landing.benefits.control_desc, icon: Shield },
              { title: t.landing.benefits.download, desc: t.landing.benefits.download_desc, icon: Zap },
              { title: t.landing.benefits.custom, desc: t.landing.benefits.custom_desc, icon: Sparkles },
              { title: t.landing.benefits.privacy, desc: t.landing.benefits.privacy_desc, icon: Users }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8 p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] bg-[#F8F9FA] border border-zinc-50 hover:bg-white hover:shadow-2xl transition-all duration-500 text-center sm:text-left"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] sm:rounded-[2rem] bg-white shadow-xl flex items-center justify-center shrink-0">
                  <benefit.icon className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic mb-2 sm:mb-4">{benefit.title}</h4>
                  <p className="text-zinc-500 font-medium text-base sm:text-lg leading-tight">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter">{t.landing.reviews_title}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { name: "Laura", event: "Boda", text: "Increíble, conseguí 300 fotos que mis fotógrafos no captaron. Fue el alma de la boda." },
              { name: "Marcos", event: "Cumpleaños", text: "A todos les encantó ver las fotos proyectadas en vivo. Súper fácil de usar." },
              { name: "Andrea", event: "Evento Corp.", text: "La mejor forma de que todos compartan el contenido. Profesional y fluido." }
            ].map((testi, i) => (
              <div key={i} className="bg-white p-12 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-zinc-50 flex flex-col items-center text-center">
                <div className="flex gap-1 mb-8">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-xl font-medium text-zinc-900 mb-10 leading-snug italic">"{testi.text}"</p>
                <div className="flex items-center flex-col gap-4">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center font-black text-purple-600 text-2xl uppercase">
                    {testi.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-black text-lg uppercase tracking-tight leading-none">{testi.name}</h5>
                    <p className="text-xs text-purple-400 uppercase font-black tracking-widest mt-1">{testi.event}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section id="precios" className="py-24 md:py-40 bg-[#FDFDFD] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-100/50 blur-[150px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-50/50 blur-[150px] -z-10" />

        <div className="container mx-auto px-6">
          <div className="text-center mb-24 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-zinc-100 shadow-sm text-purple-600 text-xs font-black uppercase tracking-[0.2em]"
            >
              <Sparkles className="w-4 h-4" /> {t.nav.pricing}
            </motion.div>

            <h2 className="text-5xl md:text-[6rem] leading-[0.9] font-black tracking-tighter uppercase italic text-zinc-900">
              {t.landing.pricing_title} <br /> <span className="text-purple-600">{t.landing.pricing_success}</span>
            </h2>
            <p className="text-zinc-500 text-xl font-medium max-w-2xl mx-auto">
              {t.landing.pricing_desc}
            </p>
          </div>

          <PricingTable />

          <div className="mt-32">
            <div className="bg-zinc-900 rounded-[5rem] p-16 md:p-32 text-white relative overflow-hidden text-center shadow-3xl shadow-purple-900/10">
              <div className="absolute top-12 right-12 rotate-12 hidden md:block">
                <div className="bg-yellow-400 text-black px-10 py-3 font-black uppercase text-sm rounded-full shadow-2xl animate-pulse">
                  {t.landing.cta_banner.badge}
                </div>
              </div>

              <h2 className="text-5xl md:text-[7rem] leading-none font-black mb-12 tracking-tighter uppercase italic">{t.landing.cta_banner.title}</h2>
              <p className="text-white/80 text-2xl font-medium mb-16 max-w-3xl mx-auto leading-tight">
                {t.landing.cta_banner.desc1} <br /><b>{t.landing.cta_banner.desc2}</b>
              </p>

              <Link href="/register">
                <Button size="lg" className="h-24 px-10 sm:px-20 bg-white text-black hover:bg-zinc-100 rounded-full text-lg sm:text-3xl font-black uppercase tracking-tighter shadow-2xl transition-all hover:scale-105 active:scale-95 border-none">
                  {t.landing.cta_banner.button}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-white border-t border-zinc-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-16">
            <div className="space-y-6 text-center md:text-left">
              <Logo size="lg" />
              <p className="text-zinc-500 font-medium max-w-md text-xl leading-snug">{t.landing.footer_desc}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-16 text-xs font-black uppercase tracking-widest text-zinc-400">
              <a href="#" className="hover:text-purple-600 transition-colors">Términos</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-purple-600 transition-colors">Cookies</a>
            </div>
          </div>
          <div className="mt-24 pt-12 border-t border-zinc-50 text-center">
            <p className="text-zinc-200 text-[10px] font-black uppercase tracking-[0.4em]">
              © 2026 QRFoto International Group. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Floating Button */}
      <AnimatePresence>
        {scrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-10 right-10 z-50 p-4 bg-purple-600 text-white rounded-2xl shadow-2xl shadow-purple-600/40 hover:bg-purple-700 hover:scale-110 active:scale-95 transition-all"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
