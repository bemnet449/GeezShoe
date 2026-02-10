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

export const metadata: Metadata = {
  title: "GeezShoe | Premium Ethiopian Handcrafted Footwear",
  description: "Discover the finest handcrafted leather shoes from Ethiopia. Timeless craftsmanship meets modern style at GeezShoe.",
  keywords: ["shoes", "leather shoes", "ethiopian craftsmanship", "handcrafted footwear", "luxury shoes"],
  icons: {
    icon: "/Logofavicon.PNG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} antialiased selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden`}
      >
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  );
}
