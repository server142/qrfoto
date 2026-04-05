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
  Share2, 
  Camera, 
  Heart, 
  Users, 
  CheckCircle2, 
  Sparkles,
  PlayCircle,
  Star,
  Image as ImageIcon,
  ArrowUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import { useTranslation } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PricingTable } from "@/components/PricingTable";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export default function LandingPage() {
  const { t, language } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const useCases = [
    { title: "Bodas", desc: "Captura cada lágrima y risa sin perseguir a los invitados.", icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
    { title: "Cumpleaños", desc: "El centro de atención con una galería en vivo dinámica.", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50" },
    { title: "Antros / Bares", desc: "Contenido viral instantáneo para tus redes sociales.", icon: Camera, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Eventos Corporativos", desc: "Networking visual y branding impecable.", icon: Users, color: "text-zinc-700", bg: "bg-zinc-100" }
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
            <a href="#como-funciona" className="hover:text-purple-600 transition-colors uppercase">Cómo funciona</a>
            <a href="#beneficios" className="hover:text-purple-600 transition-colors uppercase">Beneficios</a>
            <a href="#precios" className="hover:text-purple-600 transition-colors uppercase">Precios</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden lg:block">
                <LanguageSwitcher />
            </div>
            <Link href="/login" className="text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-900 px-8 py-3.5 rounded-full bg-white border-2 border-zinc-100 hover:border-purple-600 hover:text-purple-600 transition-all shadow-lg hover:shadow-purple-600/10 active:scale-95">
                Entrar
            </Link>
            <Link href="/register" className="hidden lg:block">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 h-12 text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-600/20 active:scale-95 transition-all">
                    Crear Evento Gratis
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
                        { href: "#como-funciona", label: "Cómo funciona" },
                        { href: "#beneficios", label: "Beneficios" },
                        { href: "#precios", label: "Precios" }
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
                            Ya tengo cuenta - Entrar
                        </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full h-20 rounded-[2.5rem] bg-purple-600 hover:bg-purple-700 text-white text-lg font-black uppercase tracking-tighter shadow-2xl shadow-purple-600/30">
                            CREAR MI EVENTO GRATIS
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
        {/* Decoraciones sutiles */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-50 rounded-full blur-[120px] opacity-60 -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[150px] opacity-40 -z-10" />

        <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-[0.2em] mb-12 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> ACCESO GRATUITO POR TIEMPO LIMITADO
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl min-[400px]:text-5xl md:text-8xl lg:text-[7.5rem] leading-[0.95] font-black tracking-tighter mb-12 uppercase italic text-zinc-900 break-words"
            >
              Convierte tu evento en <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-300% animate-gradient pb-2 sm:pb-4 inline-block">
                una máquina viral
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
              Tus invitados suben fotos en tiempo real. Tú obtienes recuerdos y <br />
              <b>contenido sin esfuerzo</b> para que nadie se pierda los mejores momentos.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link href="/register">
                <Button size="lg" className="h-20 px-8 sm:px-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-lg sm:text-xl font-black uppercase tracking-tighter shadow-2xl shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 group">
                  CREAR MI EVENTO GRATIS <ArrowRight className="ml-2 w-6 h-6 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button size="lg" variant="ghost" className="h-16 sm:h-20 px-10 text-zinc-400 hover:text-zinc-900 font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center gap-3 active:scale-95 transition-all">
                <PlayCircle className="w-5 h-5 text-purple-600" /> VER CÓMO FUNCIONA
              </Button>
            </motion.div>

            {/* Floating Elements for "Hook" */}
            <div className="absolute top-1/4 left-10 hidden xl:block">
                <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-purple-600/10 -rotate-12 border border-zinc-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-purple-600 fill-current" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Bodas</p>
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
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Antros</p>
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
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter uppercase italic">Experiencia sin fricción</h2>
            <p className="text-2xl text-zinc-500 font-medium">Diseñado para que hasta tu tía abuela pueda participar. <br /><b>Sin apps, sin descargas, sin líos.</b></p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Escanean el QR", desc: "Coloca el código QR personalizado en mesas, pantallas o la entrada.", icon: QrCode },
              { step: "02", title: "Suben sus fotos", desc: "Los invitados seleccionan o toman fotos desde su propio móvil al instante.", icon: Camera },
              { step: "03", title: "¡Magia en Vivo!", desc: "Todo aparece al instante en la galería privada y en tu pantalla central.", icon: Zap }
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
              No es solo una galería, <br /> <span className="text-purple-600">es el alma de tu fiesta.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {[
              { title: "Control Total", desc: "Modera qué fotos aparecen en pantalla en tiempo real desde tu propio panel móvil.", icon: Shield },
              { title: "Descarga Masiva", desc: "Al terminar el evento, descarga todas las fotos en alta resolución con un solo clic.", icon: Zap },
              { title: "Personalización", desc: "Configura colores, logotipos y mensajes de bienvenida para que coincidan con tu estilo.", icon: Sparkles },
              { title: "Privacidad", desc: "Tú decides quién puede ver o subir fotos. Galerías protegidas y seguras.", icon: Users }
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
            <h2 className="text-5xl font-black italic uppercase tracking-tighter">Experiencias Reales</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { name: "Laura", event: "Boda", text: "Increíble, conseguí 300 fotos que mis fotógrafos no captaron. Fue el alma de la boda." },
              { name: "Marcos", event: "Cumpleaños", text: "A todos les encantó ver las fotos proyectadas en vivo. Súper fácil de usar." },
              { name: "Andrea", event: "Evento Corp.", text: "La mejor forma de que todos compartan el contenido. Profesional y fluido." }
            ].map((testi, i) => (
              <div key={i} className="bg-white p-12 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-zinc-50 flex flex-col items-center text-center">
                <div className="flex gap-1 mb-8">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
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
        {/* Decoración de fondo */}
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
              <Sparkles className="w-4 h-4" /> PRECIOS TRANSPARENTES
            </motion.div>
            
            <h2 className="text-5xl md:text-[6rem] leading-[0.9] font-black tracking-tighter uppercase italic text-zinc-900">
              Escoge el plan <br /> <span className="text-purple-600">para tu éxito.</span>
            </h2>
            <p className="text-zinc-500 text-xl font-medium max-w-2xl mx-auto">
              Invierte en experiencias virales. Sin costos ocultos, sin comisiones sorpresa.
            </p>
          </div>

          <PricingTable />

          <div className="mt-32">
            <div className="bg-zinc-900 rounded-[5rem] p-16 md:p-32 text-white relative overflow-hidden text-center shadow-3xl shadow-purple-900/10">
                <div className="absolute top-12 right-12 rotate-12 hidden md:block">
                    <div className="bg-yellow-400 text-black px-10 py-3 font-black uppercase text-sm rounded-full shadow-2xl animate-pulse">
                        Acceso Instantáneo
                    </div>
                </div>

                <h2 className="text-5xl md:text-[7rem] leading-none font-black mb-12 tracking-tighter uppercase italic">¿Listo para empezar?</h2>
                <p className="text-white/80 text-2xl font-medium mb-16 max-w-3xl mx-auto leading-tight">
                Empieza hoy mismo y configura tu evento en menos de <br /><b>30 segundos.</b>
                </p>
                
                <Link href="/register">
                <Button size="lg" className="h-24 px-10 sm:px-20 bg-white text-black hover:bg-zinc-100 rounded-full text-lg sm:text-3xl font-black uppercase tracking-tighter shadow-2xl transition-all hover:scale-105 active:scale-95 border-none">
                    REGISTRARME GRATIS
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
                <p className="text-zinc-500 font-medium max-w-md text-xl leading-snug">La plataforma definitiva para convertir tus eventos <br /> en experiencias digitales masivas.</p>
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
