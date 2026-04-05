"use client"

import React from 'react'
import { Printer, Download, MapPin, Clock, ShieldCheck, Building2 } from 'lucide-react'

interface OxxoVoucherProps {
    amount: number
    reference: string
    clientName?: string
    expiresAt?: string
    cardNumber?: string
}

export const OxxoVoucher = ({
    amount,
    reference,
    clientName = "CLIENTE VALIOSO",
    expiresAt = "2026-12-31",
    cardNumber = "1234 5678 9012 3456"
}: OxxoVoucherProps) => {

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="bg-white text-black p-0 md:p-10 font-sans print:p-0 min-h-screen flex flex-col items-center">

            {/* TOOLBAR (Hidden on print) */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-8 bg-zinc-100 p-4 rounded-2xl print:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Orden de Pago OXXO</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">
                        <Printer className="w-4 h-4" /> Imprimir
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2 border border-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all">
                        <Download className="w-4 h-4" /> PDF
                    </button>
                </div>
            </div>

            {/* VOUCHER CONTAINER (A4/Letter Aspect) */}
            <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] border border-zinc-200 p-[20mm] flex flex-col print:shadow-none print:border-none print:m-0">

                {/* HEADER */}
                <div className="flex justify-between items-start mb-16 border-b-4 border-orange-600 pb-8">
                    <div className="space-y-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Oxxo_Logo.svg/1200px-Oxxo_Logo.svg.png" alt="OXXO" className="h-12 object-contain" />
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Voucher de<br /><span className="text-orange-600">Depósito Directo</span></h1>
                    </div>
                    <div className="text-right">
                        <div className="bg-zinc-950 text-white px-6 py-2 rounded-lg inline-block mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Fecha de Emisión</span>
                            <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">ID Orden: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                    </div>
                </div>

                {/* MAIN BODY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-tighter text-zinc-400 mb-1">Instrucciones de Pago</h3>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black">1</div>
                                    <p className="text-xs leading-relaxed text-zinc-600 font-medium">Acude a cualquier tienda <span className="font-bold text-black text-[13px]">OXXO</span> del país.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black">2</div>
                                    <p className="text-xs leading-relaxed text-zinc-600 font-medium">Indica al cajero que deseas realizar un <span className="font-bold text-black text-[13px]">DEPÓSITO A TARJETA</span>.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black">3</div>
                                    <p className="text-xs leading-relaxed text-zinc-600 font-medium">Proporciona el número de tarjeta que aparece en este voucher.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black">4</div>
                                    <p className="text-xs leading-relaxed text-zinc-600 font-medium">Realiza el pago en <span className="font-bold text-black text-[13px]">EFECTIVO</span> por el monto exacto.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="w-4 h-4 text-orange-600" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Resumen de Cuenta</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs font-medium">
                                    <span className="text-zinc-400">Titular</span>
                                    <span className="font-bold text-black uppercase">VELTRIX EVENTS SA DE CV</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-medium">
                                    <span className="text-zinc-400">Banco</span>
                                    <span className="font-bold text-black italic italic">SANTANDER / OXXO</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-medium">
                                    <span className="text-zinc-400">Referencia</span>
                                    <span className="font-bold text-black font-mono tracking-wider">{reference}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* AMOUNT BOX */}
                        <div className="bg-orange-600 text-white p-10 rounded-[2.5rem] shadow-xl shadow-orange-600/20 text-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Total a Pagar</span>
                            <div className="flex justify-center items-baseline gap-2 my-2">
                                <span className="text-2xl font-bold">$</span>
                                <span className="text-6xl font-black italic tracking-tighter">{amount.toLocaleString()}</span>
                                <span className="text-sm font-bold">MXN</span>
                            </div>
                            <p className="text-[9px] font-medium opacity-60 uppercase tracking-widest mt-2 border-t border-white/10 pt-4">+ Comisión OXXO (aprox $15.00)</p>
                        </div>

                        {/* CARD NUMBER BOX */}
                        <div className="bg-zinc-950 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-4 right-6 opacity-20">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Card" className="h-4 object-contain" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-4 italic">Número de Tarjeta de Recepción</span>
                            <div className="text-2xl font-black font-mono tracking-[0.2em] mb-4">
                                {cardNumber}
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 italic">Vencimiento</span>
                                    <p className="text-xs font-bold">{expiresAt}</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BARCODE SECTION */}
                <div className="mt-auto border-t border-zinc-100 pt-16 text-center">
                    <div className="inline-block p-8 border border-zinc-200 rounded-3xl bg-white mb-8">
                        {/* SVG Barcode Mockup */}
                        <svg className="w-full max-w-sm h-16" viewBox="0 0 100 20">
                            <rect x="0" y="0" width="1" height="20" fill="black" />
                            <rect x="2" y="0" width="2" height="20" fill="black" />
                            <rect x="5" y="0" width="1" height="20" fill="black" />
                            <rect x="7" y="0" width="3" height="20" fill="black" />
                            <rect x="11" y="0" width="1" height="20" fill="black" />
                            <rect x="13" y="0" width="2" height="20" fill="black" />
                            <rect x="17" y="0" width="1" height="20" fill="black" />
                            <rect x="19" y="0" width="3" height="20" fill="black" />
                            <rect x="23" y="0" width="1" height="20" fill="black" />
                            <rect x="26" y="0" width="2" height="20" fill="black" />
                            <rect x="30" y="0" width="1" height="20" fill="black" />
                            <rect x="33" y="0" width="3" height="20" fill="black" />
                            <rect x="38" y="0" width="1" height="20" fill="black" />
                            <rect x="41" y="0" width="2" height="20" fill="black" />
                            <rect x="45" y="0" width="1" height="20" fill="black" />
                            <rect x="48" y="0" width="3" height="20" fill="black" />
                            <rect x="53" y="0" width="1" height="20" fill="black" />
                            <rect x="56" y="0" width="2" height="20" fill="black" />
                            <rect x="60" y="0" width="1" height="20" fill="black" />
                            <rect x="63" y="0" width="3" height="20" fill="black" />
                            <rect x="68" y="0" width="1" height="20" fill="black" />
                            <rect x="71" y="0" width="2" height="20" fill="black" />
                            <rect x="75" y="0" width="1" height="20" fill="black" />
                            <rect x="78" y="0" width="3" height="20" fill="black" />
                            <rect x="83" y="0" width="1" height="20" fill="black" />
                            <rect x="86" y="0" width="2" height="20" fill="black" />
                            <rect x="90" y="0" width="1" height="20" fill="black" />
                            <rect x="93" y="0" width="5" height="20" fill="black" />
                        </svg>
                        <div className="mt-4 font-mono text-sm tracking-[0.5em] font-bold text-zinc-400">
                            {reference.replace(/(.{4})/g, '$1 ')}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-12 border-t border-zinc-50 pt-12">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-zinc-300" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 text-left">Paga en efectivo en tiendas<br /><span className="text-black">OXXO, 7-Eleven, Farmacias del Ahorro</span></p>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-zinc-300" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 text-left">Tu pago se acredita en menos<br /><span className="text-black">de 60 minutos (OXXO PAY)</span></p>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <footer className="mt-16 text-center">
                    <p className="text-[8px] font-medium text-zinc-300 uppercase tracking-widest">Este documento es una orden de pago mercantil. Veltrix Events no se hace responsable por depósitos realizados a números de tarjeta distintos a los indicados. Conserve su ticket de pago.</p>
                    <div className="flex justify-center gap-4 mt-6 opacity-30 grayscale">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/OXXO_Pay_Logo.svg/1024px-OXXO_Pay_Logo.svg.png" className="h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/PCI_DSS_Logo.svg/1200px-PCI_DSS_Logo.svg.png" className="h-4" />
                    </div>
                </footer>

            </div>

            <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          @page { size: letter; margin: 0; }
        }
      `}</style>
        </div>
    )
}
