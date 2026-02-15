import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import { ToastContainer } from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.geezshoes.com");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Geez Shoes – Quality Shoes Online",
    template: "%s | Geez Shoes",
  },
  description:
    "Shop the best shoes online at Geez Shoes. Free shipping and easy returns.",
  keywords: [
    "shoes",
    "leather shoes",
    "ethiopian craftsmanship",
    "handcrafted footwear",
    "luxury shoes",
  ],
  icons: {
    icon: "/favicon.ico", // recommended for browser tabs
    shortcut: "/favicon.ico",
    apple: "/Logofavicon.PNG",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Geez Shoes",
    title: "Geez Shoes – Quality Shoes Online",
    description:
      "Shop the best shoes online at Geez Shoes. Free shipping and easy returns.",
    url: siteUrl,
    images: [
      {
        url: "/Logofavicon.PNG",
        width: 512,
        height: 512,
        alt: "Geez Shoes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Geez Shoes – Quality Shoes Online",
    description:
      "Shop the best shoes online at Geez Shoes. Free shipping and easy returns.",
    images: ["/Logofavicon.PNG"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Explicit favicons for maximum browser support */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/Logofavicon.PNG" />
        <link rel="icon" type="image/png" sizes="32x32" href="/Logofavicon.PNG" />
        <link rel="icon" type="image/png" sizes="16x16" href="/Logofavicon.PNG" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} antialiased selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden`}
      >
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  );
}
