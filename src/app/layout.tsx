import type { Metadata } from "next";
import { Caveat, Figtree, Fredoka, Gaegu, Indie_Flower, Kalam, Nunito, Patrick_Hand, Quicksand } from "next/font/google";
import "./globals.css";

// Font bawaan (dipakai default) di-preload; sisanya hanya diunduh saat dipilih/dipakai.
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap", weight: ["400", "500", "600", "700"] });
const kalam = Kalam({ subsets: ["latin"], variable: "--font-kalam", display: "swap", weight: ["400", "700"] });

// next/font membaca opsi secara statis: tulis literal di tiap font, jangan pakai spread atau variabel
const caveat = Caveat({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-caveat", weight: ["400", "700"] });
const patrick = Patrick_Hand({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-patrick", weight: "400" });
const indie = Indie_Flower({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-indie", weight: "400" });
const gaegu = Gaegu({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-gaegu", weight: ["400", "700"] });
const fredoka = Fredoka({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-fredoka" });
const nunito = Nunito({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-nunito" });
const quicksand = Quicksand({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-quicksand" });

export const metadata: Metadata = {
  title: {
    default: "Daily Work Board",
    template: "%s | Daily Work Board",
  },
  description: "Ruang kerja sederhana untuk mencatat, mengatur, dan menyelesaikan task harian.",
  applicationName: "Daily Work Board",
  robots: { index: false, follow: false },
};

const fonts = [figtree, kalam, caveat, patrick, indie, gaegu, fredoka, nunito, quicksand].map((f) => f.variable).join(" ");

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // lang="en" karena teks antarmuka berbahasa Inggris
  return (
    <html lang="en" className={fonts}>
      <body className="min-h-screen bg-desk font-sans text-ink antialiased">{children}</body>
    </html>
  );
}