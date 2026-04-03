"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Loader2 } from "lucide-react";
import { getApiUrl, getBaseUrl } from "@/lib/api";
import { Sacramento, Inter } from "next/font/google";

import { useTranslation } from "@/lib/LanguageContext";

const sacramento = Sacramento({ weight: "400", subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

export default function EventCardPage() {
    const { t } = useTranslation();
    const { slug } = useParams();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [frontendUrl, setFrontendUrl] = useState<string>("");

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`${getApiUrl()}/events/slug/${slug}`);
                const data = await res.json();
                setEvent(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching event:", err);
            }
        };

        fetchEvent();

        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            const protocol = window.location.protocol;
            const envUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
            if (envUrl) {
                setFrontendUrl(envUrl);
            } else {
                setFrontendUrl(`${protocol}//${hostname}${window.location.port ? `:${window.location.port}` : ''}`);
            }
        }
    }, [slug]);

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
    );

    if (!event) return (
        <div className="h-screen flex items-center justify-center">
            <p>Evento no encontrado</p>
        </div>
    );

    return (
        <div className={`min-h-screen bg-white text-black p-0 m-0 ${inter.className}`}>
            {/* Container with Letter Aspect Ratio (8.5x11) */}
            <div className="w-[8.5in] h-[11in] mx-auto bg-white border border-gray-100 shadow-2xl overflow-hidden flex flex-col items-center justify-between py-16 px-16 print:shadow-none print:border-none print:m-0">

                {/* Decorative Header */}
                <div className="text-center w-full">
                    <p className={`${sacramento.className} text-5xl mb-4 opacity-80 animate-in fade-in duration-1000`}>
                        {t.card.share}
                    </p>
                    <div className="flex items-center gap-6 justify-center mb-8">
                        <div className="h-[2px] w-12 bg-gray-200" />
                        <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none" style={{ color: event.branding_color }}>
                            {event.name}
                        </h1>
                        <div className="h-[2px] w-12 bg-gray-200" />
                    </div>
                </div>

                {/* QR Code Section */}
                <div className="flex flex-col items-center w-full">
                    <div className="p-8 border-[15px] rounded-[4rem] bg-white shadow-2xl mb-8 flex flex-col items-center transition-all duration-500 hover:scale-105" style={{ borderColor: event.branding_color }}>
                        <QRCodeSVG
                            value={`${frontendUrl}/event/${slug}`}
                            size={320}
                            level="H"
                            includeMargin={false}
                        />
                    </div>
                    <div className="bg-black text-white px-8 py-3 rounded-full shadow-lg">
                        <p className="text-xs font-black uppercase tracking-[0.4em]">{t.card.scan_here}</p>
                    </div>
                </div>

                {/* Instructions */}
                <div className="text-center space-y-8 w-full max-w-xl">
                    <div className="space-y-4">
                        <p className="text-4xl font-black uppercase tracking-tight leading-none italic">
                            {t.card.scan}
                        </p>
                        <p className="text-lg font-bold uppercase tracking-[0.15em] text-gray-500 whitespace-pre-line">
                            {t.card.instruction}
                        </p>
                    </div>

                    <div className="pt-10 border-t border-gray-100 w-1/2 mx-auto">
                        <p className={`${sacramento.className} text-3xl`}>
                            {event.name}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mt-2">
                            {t.card.footer}
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating Action Button for Print (Hidden in Print) */}
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 print:hidden z-50">
                <button
                    onClick={() => window.print()}
                    className="bg-black hover:bg-zinc-900 text-white font-black uppercase tracking-widest px-12 py-6 rounded-2xl shadow-2xl transition-all active:scale-95 flex items-center gap-4 border border-white/10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
                    {t.card.print_btn}
                </button>
            </div>

            <style jsx global>{`
        @media print {
          @page {
            size: 8.5in 11in;
            margin: 0;
          }
          body {
            background-color: white !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\:hidden { display: none !important; }
        }
      `}</style>
        </div>
    );
}
