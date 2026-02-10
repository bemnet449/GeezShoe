/* eslint-disable react/no-unescaped-entities */
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0; // always fetch fresh data on every request

const COMPANY_INFO_ID = 1;

function normalizePhoneForWhatsApp(phone: string | null | undefined): string {
  if (!phone?.trim()) return "251911000000";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("251")) return digits;
  if (digits.startsWith("0")) return "251" + digits.slice(1);
  return "251" + digits;
}

export default async function Home() {
  let company: { email?: string; phone_number?: string; instagram?: string; whatsapp?: string; telegram?: string } | null = null;

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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* Hero Section - Full Page Background */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image Container */}
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

        {/* Main Brand Content - Centered */}
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center -mt-24 sm:-mt-12 md:-mt-24">
          {/* Phase 1: Logo Reveal (Starts 0s, ends 2.5s) */}
          <div className="opacity-0 animate-dramatic-reveal mb-8 md:mb-12 flex flex-col items-center w-full px-1 md:px-4">
            <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 md:gap-8 mb-4">
              <h1 className="text-[12vw] sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-bold  text-[#8E4330] tracking-normal drop-shadow-2xl leading-none whitespace-nowrap py-2">
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
            <div className="relative -mt-4 md:-mt-8 z-10">
              <div className="absolute inset-0 bg-black/5 blur-xl rounded-full"></div>
              <p className="relative text-[10px] sm:text-xs md:text-sm font-black tracking-[0.3em] md:tracking-[0.8em] text-stone-200/90 uppercase text-center drop-shadow-md">
                Ethiopian Artisanal Excellence
              </p>
            </div>
          </div>

          {/* Phase 2: Button Reveal (Starts strictly after Logo animation finishes) */}
          <div className="opacity-0 animate-dramatic-reveal [animation-delay:2500ms] mb-8 md:mb-0 mt-4 md:mt-6 scale-90 md:scale-100 origin-top">
            <Link
              href="/clients/shop"
              className="group relative inline-flex items-center justify-center px-10 py-4 md:px-12 md:py-5 overflow-hidden font-bold text-white transition-all duration-300 bg-[#A8513B] backdrop-blur-sm rounded-full hover:bg-[#EF6C00] shadow-2xl shadow-orange-900/40 border border-white/10"
            >
              <span className="relative flex items-center space-x-3 uppercase tracking-[0.2em] text-sm">
                <span>Enter Collection</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </Link>
          </div>
        </div>

        {/* Highly Visible Scroll Indicator */}
        <div className="absolute bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
          <div className="flex flex-col items-center animate-bounce space-y-3">
            <span className="text-[10px] text-white font-black uppercase tracking-[0.5em] drop-shadow-md">Scroll</span>
            <div className="w-[3px] h-14 bg-gradient-to-b from-amber-600 via-white to-transparent rounded-full border border-white/10 shadow-lg shadow-black/80"></div>
          </div>
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
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-50 rounded-full -z-0"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-stone-100 rounded-full -z-0"></div>
              <div className="absolute bottom-6 md:bottom-12 -right-4 md:-right-8 z-20 bg-white px-6 md:px-10 py-3 md:py-6 rounded-2xl shadow-xl transform rotate-3 block md:block">
                <div className="relative w-24 h-8 md:w-44 md:h-16">
                  <Image
                    src="/LogoBrown.PNG"
                    alt="Geez Shoe Logo"
                    fill
                    sizes="(max-width: 768px) 100px, 176px"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <h2 className="text-[10px] md:text-sm uppercase font-bold tracking-[0.4em] text-amber-600 mb-4 md:mb-6 font-geist-sans">Our Story</h2>
              <h3 className="text-4xl md:text-6xl font-black text-stone-900 mb-6 md:mb-10 tracking-tight leading-tight">
                CRAFTED WITH <br className="hidden md:block" /> PASSION
              </h3>
              <div className="space-y-6 text-base md:text-lg text-stone-600 leading-relaxed mb-8 md:mb-12">
                <p>
                  Founded in Addis Ababa, Ge’ez Shoes is a handmade leather footwear brand rooted in Ethiopian craftsmanship and pride.
                </p>
                <p>
                  For nearly five years, we have been creating high-quality leather shoes that balance timeless style, comfort, and durability. Each pair is carefully handcrafted by skilled local artisans using genuine leather and modern techniques.
                </p>
                <p>
                  From sourcing materials to final sale, we manage every step to ensure consistent quality and authentic design. What started as a small workshop has grown into a trusted local brand with loyal customers across Addis Ababa.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-left mb-8 md:mb-12">
                <div>
                  <h4 className="text-2xl md:text-3xl font-black text-stone-900 mb-2">Heritage</h4>
                  <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Timeless Design</p>
                </div>
                <div>
                  <h4 className="text-2xl md:text-3xl font-black text-stone-900 mb-2">Quality</h4>
                  <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Premium Leather</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <h4 className="text-2xl md:text-3xl font-black text-stone-900 mb-2">Impact</h4>
                  <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Artisan Made</p>
                </div>
              </div>

              <div className="pt-6 md:pt-8 border-t border-stone-100 italic text-stone-500 font-medium">
                "Ge’ez Shoes — Handmade with purpose. Worn with pride."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section — matches About typography & theme */}
      <section id="contact" className="py-32 bg-stone-900 border-t border-stone-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left: same hierarchy as About "Our Story" */}
            <div>
              <h2 className="text-[10px] md:text-sm uppercase font-bold tracking-[0.4em] text-amber-600 mb-4 md:mb-6">Get in touch</h2>
              <h3 className="text-4xl md:text-6xl font-black text-white mb-6 md:mb-10 tracking-tight leading-tight">
                LET&apos;S STEP <br className="hidden md:block" /> INTO THE <span className="text-amber-500/90 italic">EXCLUSIVE</span>
              </h3>
              <p className="text-stone-400 text-base md:text-lg leading-relaxed max-w-md italic font-medium">
                Direct paths to our artisans. Whether by message or call, we are here to guide your choice.
              </p>
              <div className="mt-8 pt-8 border-t border-stone-800">
                <p className="text-stone-500 text-sm italic font-medium">Ge&apos;ez Shoes — Handmade with purpose. Worn with pride.</p>
              </div>
            </div>

            {/* Right: contact cards — stone/amber, rounded-[2rem] like About */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* WhatsApp — primary CTA, brand orange hover */}
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
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-stone-900/80 group-hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:rotate-6">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-amber-500 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.412.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
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
                <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </div>
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
                <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14.144.118.177.3.175.428-.003.075-.033.256-.063.422l-.803 4.273c-.221 1.173-.442 2.345-.663 3.518-.035.18-.112.434-.306.522-.191.087-.455.028-.534-.015-.203-.109-.34-.234-.477-.329a17.203 17.203 0 01-1.432-1.076l-1.09-1.054a.652.652 0 01-.115-.811c.211-.318.841-1.284 1.256-1.688.423-.414.858-.844 1.285-1.266l.044-.044c.16-.16.326-.328.326-.452 0-.203-.234-.144-.336-.109-.156.05-.62.355-1.127.684l-2.031 1.332a.415.415 0 01-.295.059l-2.03-.637c-.389-.122-.7-.184-.509-.434.025-.033.052-.064.085-.094.214-.199.789-.43 1.579-.76l4.634-1.921c1-.415 1.55-.65 2.153-.65z" /></svg>
                </div>
                <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-1">Channel</p>
                <p className="text-white font-black group-hover:text-amber-500 transition-colors">Telegram</p>
              </a>

              {/* Email */}
              <a
                href={`mailto:${email}`}
                className="group bg-stone-800/50 p-6 md:p-8 rounded-[2rem] border border-stone-700/50 hover:border-amber-500/40 hover:bg-stone-800 transition-all duration-300 md:col-span-2 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-stone-900 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-0.5">Direct email</p>
                    <p className="text-lg md:text-xl font-black text-white truncate group-hover:text-amber-500 transition-colors">{email}</p>
                  </div>
                </div>
                <div className="w-10 h-10 shrink-0 rounded-full border border-stone-600 flex items-center justify-center text-stone-500 group-hover:border-amber-500 group-hover:text-amber-500 transition-all group-hover:rotate-45">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </a>

              {/* Phone */}
              <div className="md:col-span-2 flex flex-wrap items-center gap-4 pt-2">
                <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Voice call</span>
                <a href={`tel:${phoneDigits}`} className="text-xl md:text-2xl font-black text-white hover:text-amber-500 transition-colors tracking-tight">
                  {phone}
                </a>
                <div className="h-px flex-1 min-w-[4rem] bg-stone-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
