import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Full Page Background */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/geez_shoe_hero_1769329293170.png"
            alt="Premium Geez Shoes"
            fill
            className="object-cover brightness-50 animate-ken-burns"
            priority
          />
        </div>

        {/* Big Background Company Name - Watermark style */}
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full text-center z-5 opacity-0 animate-dramatic-reveal pointer-events-none">
          <h2 className="text-[12vw] font-black tracking-[-0.05em] leading-none text-white/5 uppercase select-none">
            GEEZ SHOE
          </h2>
        </div>

        {/* Main Brand Content - Centered */}
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center">
          {/* Phase 1: Logo Reveal (Starts 0s, ends 2.5s) */}
          <div className="opacity-0 animate-dramatic-reveal mb-12">
            <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter text-white leading-none drop-shadow-2xl">
              GEEZ<span className="text-amber-600">SHOE</span>
            </h1>
            <p className="text-sm font-bold tracking-[1em] text-white/40 uppercase mt-6 ml-2">
              Ethiopian Artisanal Excellence
            </p>
          </div>

          {/* Phase 2: Button Reveal (Starts strictly after Logo animation finishes) */}
          <div className="opacity-0 animate-dramatic-reveal [animation-delay:2500ms]">
            <Link
              href="/clients/shop"
              className="group relative inline-flex items-center justify-center px-12 py-5 overflow-hidden font-bold text-white transition-all duration-300 bg-amber-600 rounded-full hover:bg-amber-500 shadow-2xl shadow-amber-900/40"
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
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
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
                  className="object-cover"
                />
              </div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-50 rounded-full -z-0"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-stone-100 rounded-full -z-0"></div>
              <div className="absolute bottom-12 -right-8 z-20 bg-amber-600 text-white px-8 py-4 rounded-2xl shadow-xl transform rotate-3 hidden md:block">
                <span className="text-2xl font-black italic tracking-tighter">GEEZ<span className="text-stone-900">SHOE</span></span>
              </div>
            </div>

            <div className="flex flex-col">
              <h2 className="text-sm uppercase font-bold tracking-[0.4em] text-amber-600 mb-6 font-geist-sans">Our Story</h2>
              <h3 className="text-5xl md:text-6xl font-black text-stone-900 mb-10 tracking-tight leading-tight">
                CRAFTED WITH <br /> PASSION
              </h3>
              <p className="text-xl text-stone-600 leading-relaxed mb-12">
                At Geez Shoe, we believe that footwear is an expression of heritage and quality. Every pair of our shoes is handcrafted by master artisans in the heart of Addis Ababa, using only the finest Ethiopian leather that has been prized globally for centuries.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-12">
                <div>
                  <h4 className="text-3xl font-black text-stone-900 mb-2">Heritage</h4>
                  <p className="text-xs text-stone-500 uppercase font-bold tracking-widest">Timeless Design</p>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-stone-900 mb-2">Quality</h4>
                  <p className="text-xs text-stone-500 uppercase font-bold tracking-widest">Premium Leather</p>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-stone-900 mb-2">Impact</h4>
                  <p className="text-xs text-stone-500 uppercase font-bold tracking-widest">Artisan Made</p>
                </div>
              </div>

              <div className="pt-8 border-t border-stone-100">
                <p className="text-stone-400 font-black italic text-xl tracking-tighter">
                  GEEZ<span className="text-amber-600">SHOE</span> — Signature Collection
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-stone-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <h2 className="text-sm uppercase font-bold tracking-[0.4em] text-amber-600 mb-6">Get In Touch</h2>
              <h3 className="text-5xl font-black text-stone-900 mb-8 tracking-tight">VISIT OUR STUDIO OR SEND A MESSAGE</h3>
              <p className="text-lg text-stone-600 mb-12 leading-relaxed">
                Whether you're looking for a custom fitting or have questions about our latest collection, we're here to help you find your perfect pair.
              </p>

              <div className="space-y-8">
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-amber-600 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold text-stone-400 tracking-widest mb-1">Location</h4>
                    <p className="text-stone-900 font-bold">Addis Ababa, Ethiopia</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-amber-600 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold text-stone-400 tracking-widest mb-1">Email</h4>
                    <p className="text-stone-900 font-bold">hello@geezshoe.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-xl shadow-stone-200/50">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest ml-4">Name</label>
                    <input type="text" className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500/20 transition-all" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest ml-4">Email</label>
                    <input type="email" className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500/20 transition-all" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest ml-4">Message</label>
                  <textarea rows={4} className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500/20 transition-all resize-none" placeholder="Your message..."></textarea>
                </div>
                <button className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/20">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
