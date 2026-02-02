import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";


export default function Home() {
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
            className="object-cover brightness-50 animate-ken-burns blur-[5px]"
            priority
          />
        </div>

        {/* Big Background Company Name - Watermark style */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full flex justify-center z-5 opacity-0 animate-dramatic-reveal pointer-events-none">
          <div className="relative w-[98vw] h-[25vw] opacity-5 grayscale invert brightness-200">
            <Image
              src="/LogoBrown.PNG"
              alt="Geez Shoe Watermark"
              fill
              sizes="95vw"
              className="object-contain"
            />
          </div>
        </div>

        {/* Main Brand Content - Centered */}
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center -mt-12 md:-mt-24">
          {/* Phase 1: Logo Reveal (Starts 0s, ends 2.5s) */}
          <div className="opacity-0 animate-dramatic-reveal mb-4 md:mb-2 flex flex-col items-center w-full px-1 md:px-4">
            <div className="relative w-full max-w-[550px] h-[180px] sm:max-w-[900px] sm:h-[280px] md:max-w-[1200px] md:h-[380px] lg:max-w-[1500px] lg:h-[480px] mb-0 transition-all duration-500">
              <Image
                src="/LogoBrown.PNG"
                alt="Geez Shoe Logo"
                fill
                sizes="(max-width: 640px) 530px, (max-width: 768px) 850px, 1500px"
                className="object-contain"
                priority
              />
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
              <p className="text-base md:text-xl text-stone-600 leading-relaxed mb-8 md:mb-12">
                At Geez Shoe, we believe that footwear is an expression of heritage and quality. Every pair of our shoes is handcrafted by master artisans in the heart of Addis Ababa, using only the finest Ethiopian leather that has been prized globally for centuries.
              </p>

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

              <div className="pt-6 md:pt-8 border-t border-stone-100">
                <div className="flex items-center space-x-2">
                  <div className="relative w-20 h-6 md:w-24 md:h-8 opacity-50">
                    <Image
                      src="/LogoBrown.PNG"
                      alt="Geez Shoe"
                      fill
                      sizes="(max-width: 768px) 80px, 96px"
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[10px] md:text-base text-stone-400 font-bold ml-2">— Signature Collection</span>
                </div>
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
