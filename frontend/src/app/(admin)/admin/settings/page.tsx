"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Settings,
    Save,
    Loader2,
    CheckCircle2,
    CreditCard,
    ToggleLeft,
    Globe,
    ShieldCheck,
    Zap,
    Building,
    DollarSign
} from "lucide-react";
import { getApiUrl, getAuthHeaders } from "@/lib/api";
import { useTranslation } from "@/lib/LanguageContext";
import { motion } from "framer-motion";

export default function AdminSettingsPage() {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${getApiUrl()}/admin/settings`, {
                headers: getAuthHeaders() as any,
            });
            const data = await res.json();
            setSettings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        try {
            const res = await fetch(`${getApiUrl()}/admin/settings`, {
                method: "POST",
                headers: getAuthHeaders() as any,
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-20">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="uppercase tracking-[0.4em] text-[10px] font-black italic">Configurando sistema...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter italic">
                        Global <span className="text-purple-500">Settings</span>
                    </h2>
                    <p className="text-white/40 mt-1 font-medium italic uppercase tracking-widest text-[10px]">Configuración maestra de la plataforma</p>
                </div>
                <Button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="h-14 px-10 bg-white text-black hover:bg-zinc-200 rounded-2xl shadow-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 gap-3"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (success ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Save className="w-4 h-4" />)}
                    {success ? "Guardado" : "Guardar Cambios"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* CHARACTERISTICS TOGGLES */}
                <Card className="bg-zinc-950/50 border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <Zap className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Características</h3>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Activar/Desactivar módulos</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
                            <div>
                                <p className="text-sm font-black uppercase italic text-white/80">Modulo de Slideshow</p>
                                <p className="text-[10px] font-medium text-white/30 italic">Permitir a los usuarios generar pases de diapositivas automáticos</p>
                            </div>
                            <Switch
                                checked={settings.isSlideshowEnabled}
                                onCheckedChange={(val: boolean) => setSettings({ ...settings, isSlideshowEnabled: val })}
                            />
                        </div>
                        {/* Add extra toggles here as needed */}
                    </div>
                </Card>

                {/* STRIPE CONFIGURATION */}
                <Card className="bg-zinc-950/50 border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <CreditCard className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Stripe Core</h3>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">API Keys de producción</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2 italic text-blue-400/60">Public Key</label>
                            <Input
                                value={settings.stripePublicKey || ""}
                                onChange={(e) => setSettings({ ...settings, stripePublicKey: e.target.value })}
                                placeholder="pk_live_..."
                                className="bg-black border-white/5 h-14 rounded-2xl italic px-5 placeholder:text-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2 italic text-red-400/60">Secret Key</label>
                            <Input
                                type="password"
                                value={settings.stripeSecretKey || ""}
                                onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                                placeholder="sk_live_..."
                                className="bg-black border-white/5 h-14 rounded-2xl italic px-5 placeholder:text-white/10"
                            />
                        </div>
                    </div>
                </Card>

                {/* PAYMENT METHODS */}
                <Card className="bg-zinc-950/50 border-white/10 p-8 rounded-[2.5rem] lg:col-span-2 shadow-2xl">
                    <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-8">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Globe className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Métodos de Pago</h3>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Gestión de pasarelas y depósitos</p>
                        </div>
                        <div className="ml-auto">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] italic">Seguridad Activa</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* PAYPAL */}
                        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all group relative">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-lg font-black uppercase italic text-blue-400">PayPal Express</h4>
                                <Switch
                                    checked={settings.paymentMethods.paypal.enabled}
                                    onCheckedChange={(val: boolean) => setSettings({
                                        ...settings,
                                        paymentMethods: {
                                            ...settings.paymentMethods,
                                            paypal: { ...settings.paymentMethods.paypal, enabled: val }
                                        }
                                    })}
                                />
                            </div>
                            <p className="text-[10px] font-medium text-white/30 mb-6 italic uppercase tracking-widest leading-loose">Configuración de Client ID para pagos internacionales rápidos.</p>
                        </div>

                        {/* OXXO DEPÓSITO */}
                        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:border-orange-500/30 transition-all group relative">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-lg font-black uppercase italic text-orange-400">OXXO Pay / Depósito</h4>
                                <Switch
                                    checked={settings.paymentMethods.oxxo.enabled}
                                    onCheckedChange={(val: boolean) => setSettings({
                                        ...settings,
                                        paymentMethods: {
                                            ...settings.paymentMethods,
                                            oxxo: { ...settings.paymentMethods.oxxo, enabled: val }
                                        }
                                    })}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 italic ml-2">Tarjeta OXXO</label>
                                    <Input
                                        value={settings.paymentMethods.oxxo.card_number}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            paymentMethods: {
                                                ...settings.paymentMethods,
                                                oxxo: { ...settings.paymentMethods.oxxo, card_number: e.target.value }
                                            }
                                        })}
                                        className="bg-black/50 border-white/5 h-12 rounded-xl italic px-4 text-xs font-mono tracking-widest"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 italic ml-2">Titular de la Cuenta</label>
                                    <Input
                                        value={settings.paymentMethods.oxxo.account_holder}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            paymentMethods: {
                                                ...settings.paymentMethods,
                                                oxxo: { ...settings.paymentMethods.oxxo, account_holder: e.target.value }
                                            }
                                        })}
                                        className="bg-black/50 border-white/5 h-12 rounded-xl italic px-4 text-xs uppercase"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-center justify-between">
                                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic">Voucher Generador</span>
                                <Switch
                                    checked={settings.paymentMethods.oxxo.enabled_vouchers}
                                    onCheckedChange={(val: boolean) => setSettings({
                                        ...settings,
                                        paymentMethods: {
                                            ...settings.paymentMethods,
                                            oxxo: { ...settings.paymentMethods.oxxo, enabled_vouchers: val }
                                        }
                                    })}
                                />
                            </div>
                        </div>

                        {/* STRIPE */}
                        <div className="p-8 bg-zinc-900/50 rounded-[2rem] border-2 border-dashed border-white/5">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-lg font-black uppercase italic text-white/60">Stripe Integration</h4>
                                <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40 italic">Main Processor</span>
                                </div>
                            </div>
                            <p className="text-[10px] font-medium text-white/20 mb-6 italic leading-relaxed uppercase tracking-widest">Utiliza las credenciales configuradas arriba para el procesamiento directo de tarjetas de crédito y débito.</p>
                            <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase italic tracking-widest">
                                <ShieldCheck className="w-3 h-3" /> PCI DSS Compliant
                            </div>
                        </div>

                        {/* VENTANILLA BANCARIA */}
                        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all group relative">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-lg font-black uppercase italic text-white/50">Ventanilla Bancaria</h4>
                                <Switch
                                    checked={settings.paymentMethods.ventanilla.enabled}
                                    onCheckedChange={(val: boolean) => setSettings({
                                        ...settings,
                                        paymentMethods: {
                                            ...settings.paymentMethods,
                                            ventanilla: { ...settings.paymentMethods.ventanilla, enabled: val }
                                        }
                                    })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/20 italic ml-2">Detalles del Depósito</label>
                                <textarea
                                    value={settings.paymentMethods.ventanilla.details}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        paymentMethods: {
                                            ...settings.paymentMethods,
                                            ventanilla: { ...settings.paymentMethods.ventanilla, details: e.target.value }
                                        }
                                    })}
                                    className="w-full bg-black/50 border border-white/5 rounded-2xl italic p-5 text-xs text-white/60 min-h-[100px] outline-none focus:border-white/20 transition-all font-mono"
                                />
                            </div>
                        </div>

                    </div>
                </Card>

            </div>
        </div>
    );
}
