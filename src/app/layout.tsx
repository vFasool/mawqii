import type { Metadata } from "next";
import { El_Messiri, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const elMessiri = El_Messiri({
  subsets: ["arabic", "latin"],
  variable: "--font-el-messiri",
  weight: ["500", "600", "700"],
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-plex-arabic",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "موقعي — أنشئ موقع نشاطك التجاري خلال دقائق",
    template: "%s | موقعي",
  },
  description:
    "منصة عربية تتيح لأصحاب الأنشطة التجارية (مطاعم، كافيهات، صالونات حلاقة، مغاسل سيارات، خدمات منزلية) إنشاء موقع احترافي جاهز للنشر خلال دقائق.",
  openGraph: {
    title: "موقعي — أنشئ موقع نشاطك التجاري خلال دقائق",
    description:
      "منصة عربية لإنشاء مواقع احترافية لأصحاب الأنشطة التجارية بدون خبرة تقنية.",
    locale: "ar_SA",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${elMessiri.variable} ${plexArabic.variable}`}>
      <body className="min-h-screen bg-paper font-body text-ink-800 antialiased">
        {children}
      </body>
    </html>
  );
}
