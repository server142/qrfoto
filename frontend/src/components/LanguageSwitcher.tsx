"use client";

import { useTranslation } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-10 px-4 gap-2 text-white/60 hover:text-white hover:bg-white/5 border border-white/5 rounded-2xl transition-all">
            <Globe className="w-4 h-4 opacity-70 text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">{language}</span>
          </Button>
        }
      />
      <DropdownMenuContent className="bg-zinc-950 border-white/10 text-white min-w-[140px] rounded-2xl shadow-2xl p-2 mt-2">
        <DropdownMenuItem
          onClick={() => setLanguage("es")}
          className={`flex items-center justify-between gap-4 h-11 px-4 focus:bg-white/5 cursor-pointer rounded-xl transition-colors ${language === 'es' ? 'bg-white/10 text-purple-400 font-bold' : ''}`}
        >
          <span className="text-xs uppercase font-black tracking-widest">Español</span>
          <span className="text-lg">🇪🇸</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className={`flex items-center justify-between gap-4 h-11 px-4 focus:bg-white/5 cursor-pointer rounded-xl transition-colors ${language === 'en' ? 'bg-white/10 text-purple-400 font-bold' : ''}`}
        >
          <span className="text-xs uppercase font-black tracking-widest">English</span>
          <span className="text-lg">🇺🇸</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
