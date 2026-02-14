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

      {/* JSON-LD for structured data */}
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

      {/* About Us Section */}
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
              <div className="space-y-6 text-base md:text-lg text-stone-600 leading-relaxed mb-8 md:mb-12">
                <p>
                  Founded in Addis Ababa, Ge’ez Shoes is a handmade leather footwear brand rooted in Ethiopian craftsmanship and pride.
                </p>
                <p>
                  Since 2019, we have been creating high-quality leather shoes that balance timeless style, comfort, and durability. Each pair is carefully handcrafted by skilled local artisans using genuine leather and modern techniques.
                </p>
                <p>
                  From sourcing materials to final sale, we manage every step to ensure consistent quality and authentic design. What started as a small workshop has grown into a trusted local brand with loyal customers across Addis Ababa.
                </p>
                <p>
                  Our mission is to showcase Ethiopian craftsmanship to the world while providing footwear that stands out in style, comfort, and durability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-32 bg-stone-900 border-t border-stone-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[10px] md:text-sm uppercase font-bold tracking-[0.4em] text-amber-600 mb-4">Get in touch</h2>
            <h3 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
              CONTACT US
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Map */}
            <div className="w-full">
              <div className="w-full h-[400px] lg:h-[600px] rounded-[2rem] overflow-hidden shadow-2xl border border-stone-700/50">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.491438826744!2d38.8004016!3d9.018854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b852bfffabc33%3A0x2d49dd5bd95bdee4!2zR2UnZXogc2hvZXMg4YyN4YuV4YudIOGMq-GImw!5e0!3m2!1sen!2set!4v1770882512590!5m2!1sen!2set&t=k"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ge'ez Shoes Location"
                />
              </div>
            </div>

            {/* Contact Cards */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* WhatsApp */}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden bg-stone-800/60 p-8 md:p-10 rounded-[2rem] border border-stone-700/50 hover:bg-[#A8513B] hover:border-amber-900/50 transition-all duration-300 md:col-span-2 shadow-xl"
              >
                <div className="flex justify-between items-center relative z-10">
                  <div className="space-y-2">
                    <span className="text-[10px] text-stone-500 group-hover:text-white/80 uppercase font-bold tracking-[0.2em] block">Instant priority</span>
                    <h4 className="text-2xl md:text-3xl font-black text-white tracking-tight">WhatsApp</h4>
                  </div>
                </div>
              </a>

              {/* Instagram */}
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-stone-800/50 p-6 md:p-8 rounded-[2rem] border border-stone-700/50 hover:border-amber-500/40 hover:bg-stone-800 transition-all duration-300"
              >
                <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-1">Visual story</p>
                <p className="text-white font-black group-hover:text-amber-500 transition-colors">Instagram</p>
              </a>

              {/* Telegram */}
              <a
                href={telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-stone-800/50 p-6 md:p-8 rounded-[2rem] border border-stone-700/50 hover:border-amber-500/40 hover:bg-stone-800 transition-all duration-300"
              >
                <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-1">Channel</p>
                <p className="text-white font-black group-hover:text-amber-500 transition-colors">Telegram</p>
              </a>

              {/* Email */}
              <a
                href={`mailto:${email}`}
                className="group bg-stone-800/50 p-6 md:p-8 rounded-[2rem] border border-stone-700/50 hover:border-amber-500/40 hover:bg-stone-800 transition-all duration-300 md:col-span-2 flex items-center justify-between gap-4"
              >
                <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-0.5">Direct email</p>
                <p className="text-white font-black group-hover:text-amber-500 transition-colors">{email}</p>
              </a>

              {/* Phone */}
              <div className="md:col-span-2 flex flex-wrap items-center gap-4 pt-2">
                <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Voice call</span>
                <a href={`tel:${phoneDigits}`} className="text-xl md:text-2xl font-black text-white hover:text-amber-500 transition-colors tracking-tight">
                  {phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
