
import type { Metadata } from "next";
import { Figtree, Kalam } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const kalam = Kalam({
  subsets: ["latin"],
  variable: "--font-kalam",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Daily Work Board",
    template: "%s | Daily Work Board",
  },
  description:
    "Ruang kerja sederhana untuk mencatat, mengatur, dan menyelesaikan task harian.",
  applicationName: "Daily Work Board",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${figtree.variable} ${kalam.variable}`}>
      <body className="min-h-screen bg-desk font-sans antialiased text-ink selection:bg-[#ded4bd] selection:text-[#302f29]">
        {children}
      </body>
    </html>
  );
}
