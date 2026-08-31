import type { Metadata } from "next";
import { ExperienceProvider } from "@/experience/provider";
import { DataStoreProvider } from "@/data/store";
import { InventoryStoreProvider } from "@/data/inventory-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUNAR — Sistema de Gestão de Armazém",
  description: "LUNAR — sistema operacional digital para o armazém.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router root layout; regra é para o Pages Router */}
        <link
          href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@500;600;700&family=Sora:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <ExperienceProvider>
          <DataStoreProvider>
            <InventoryStoreProvider>{children}</InventoryStoreProvider>
          </DataStoreProvider>
        </ExperienceProvider>
      </body>
    </html>
  );
}
