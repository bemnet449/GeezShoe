/* eslint-disable react/no-unescaped-entities */
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { Metadata } from "next";

// Always fetch fresh data
export const revalidate = 0;

// SEO, Open Graph, Twitter, JSON-LD
export const metadata: Metadata = {
  title: "Geez Shoes – Premium Ethiopian Handcrafted Footwear",
  description:
    "Discover premium handcrafted leather shoes from Ethiopia. Timeless craftsmanship, modern style, free shipping & easy returns.",
  keywords: [
    "Geez Shoes",
    "Ethiopian shoes",
    "handcrafted leather shoes",
    "premium footwear",
    "online shoe store",
  ],
  alternates: {
    canonical: "https://www.geezshoes.com/",
  },
  openGraph: {
    title: "Geez Shoes – Premium Ethiopian Handcrafted Footwear",
    description:
      "Discover premium handcrafted leather shoes from Ethiopia. Timeless craftsmanship, modern style, free shipping & easy returns.",
    url: "https://www.geezshoes.com/",
    type: "website",
    images: [
      {
        url: "https://www.geezshoes.com/Logofavicon.PNG",
        width: 512,
        height: 512,
        alt: "Geez Shoes Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Geez Shoes – Premium Ethiopian Handcrafted Footwear",
    description:
      "Discover premium handcrafted leather shoes from Ethiopia. Timeless craftsmanship, modern style, free shipping & easy returns.",
    images: ["https://www.geezshoes.com/Logofavicon.PNG"],
  },
};

const COMPANY_INFO_ID = 1;

// Helper to normalize phone number for WhatsApp
function normalizePhoneForWhatsApp(phone: string | null | undefined): string {
  if (!phone?.trim()) return "251911000000";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("251")) return digits;
  if (digits.startsWith("0")) return "251" + digits.slice(1);
  return "251" + digits;
}

export default async function Home() {
  let company: {
    email?: string;
    phone_number?: string;
    instagram?: string;
    whatsapp?: string;
    telegram?: string;
  } | null = null;

  try {
    const { data } = await supabase
      .from("company_info")
      .select("email, phone_number, instagram, whatsapp, telegram")
      .eq("id", COMPANY_INFO_ID)
      .maybeSingle();
    company = data;
  } catch (err) {
    console.error("Failed to fetch company info:", err);
  }

  const email = company?.email?.trim() || "hello@geezshoe.com";
  const phone = company?.phone_number?.trim() || "+251 911 00 00 00";
  const phoneDigits = normalizePhoneForWhatsApp(company?.phone_number || company?.whatsapp);
  const whatsappHref = `https://wa.me/${phoneDigits}`;
  const instagramHref = company?.instagram?.trim() || "https://instagram.com/geez_shoe";
  const telegramHref = company?.telegram?.trim() || "https://t.me/geezshoe";

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Geez Shoes",
    url: "https://www.geezshoes.com",
    logo: "https://www.geezshoes.com/Logofavicon.PNG",
    sameAs: [instagramHref, telegramHref, whatsappHref],
    contactPoint: [
      {
        "@type": "ContactPoint",
        email,
        contactType: "customer support",
        telephone: phone,
        areaServed: "ET",
        availableLanguage: ["English"],
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/geez_shoe_hero_1769329293170.png"
            alt="Premium Geez Shoes"
            fill
            sizes="100vw"
            className="object-cover brightness-50 animate-ken-burns blur-[2px] sm:blur-[5px]"
            priority
          />
        </div>
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center -mt-24 sm:-mt-12 md:-mt-24">
          <div className="opacity-0 animate-dramatic-reveal mb-8 md:mb-12 flex flex-col items-center w-full px-1 md:px-4">
            <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 md:gap-8 mb-4">
              <h1 className="text-[12vw] sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-bold text-[#8E4330] tracking-normal drop-shadow-2xl leading-none whitespace-nowrap py-2">
                GE'EZ SHOES
              </h1>
              <div className="relative w-[14vw] h-[14vw] sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 shrink-0">
                <Image
                  src="/Logofavicon.PNG"
                  alt="Geez Shoe Icon"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
            <p className="relative text-[10px] sm:text-xs md:text-sm font-black tracking-[0.8em] text-stone-200/90 uppercase text-center drop-shadow-md">
              Ethiopian Artisanal Excellence
            </p>
          </div>
          <Link
            href="/clients/shop"
            className="group relative inline-flex items-center justify-center px-10 py-4 md:px-12 md:py-5 overflow-hidden font-bold text-white transition-all duration-300 bg-[#A8513B] backdrop-blur-sm rounded-full hover:bg-[#EF6C00] shadow-2xl shadow-orange-900/40 border border-white/10"
          >
            <span className="relative flex items-center space-x-3 uppercase tracking-[0.2em] text-sm">
              <span>Enter Collection/ይግቡ</span>
            </span>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden relative z-10 shadow-2xl">
                <Image
                  src="/geez_shoe_hero_1769329293170.png"
                  alt="Geez Shoe Craftsmanship"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-[10px] md:text-sm uppercase font-bold tracking-[0.4em] text-amber-600 mb-4">Our Story</h2>
              <h3 className="text-4xl md:text-6xl font-black text-stone-900 mb-6 md:mb-10 tracking-tight leading-tight">
                CRAFTED WITH PASSION
              </h3>
              <p className="text-base md:text-lg text-stone-600 leading-relaxed mb-6">
                Founded in Addis Ababa, Ge’ez Shoes is a handmade leather footwear brand rooted in Ethiopian craftsmanship and pride.
              </p>
              <p className="text-base md:text-lg text-stone-600 leading-relaxed">
                Since 2019, we have been creating high-quality leather shoes that balance timeless style, comfort, and durability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-stone-900 border-t border-stone-800">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-black text-white text-center mb-8">Contact Us</h2>
          <div className="flex justify-center gap-6 flex-wrap">
            <a href={whatsappHref} className="text-white bg-green-600 px-6 py-3 rounded-lg font-bold">WhatsApp</a>
            <a href={`mailto:${email}`} className="text-white bg-blue-600 px-6 py-3 rounded-lg font-bold">Email</a>
            <a href={instagramHref} className="text-white bg-pink-600 px-6 py-3 rounded-lg font-bold">Instagram</a>
            <a href={telegramHref} className="text-white bg-cyan-600 px-6 py-3 rounded-lg font-bold">Telegram</a>
          </div>
        </div>
      </section>
    </div>
  );
}
