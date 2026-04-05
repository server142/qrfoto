import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QRFoto - Convierte tu evento en una máquina viral",
  description: "Comparte fotos en tiempo real en tus eventos de forma inteligente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <LanguageProvider>
          <div className="fixed top-4 right-4 z-[100] md:hidden">
            <LanguageSwitcher />
          </div>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
