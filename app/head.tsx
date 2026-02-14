// app/head.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Geez Shoes – Premium Handcrafted Ethiopian Footwear",
  description:
    "Discover the finest handcrafted leather shoes from Ethiopia. Timeless craftsmanship meets modern style at Geez Shoes.",
  applicationName: "Geez Shoes",
  viewport: "width=device-width, initial-scale=1",
  keywords: ["Ethiopian shoes", "handcrafted shoes", "leather shoes", "Geez Shoes", "premium footwear"],
  authors: [{ name: "Geez Shoes", url: "https://www.geezshoes.com" }],
  creator: "Geez Shoes",
  robots: "index, follow",
  openGraph: {
    title: "Geez Shoes – Premium Handcrafted Ethiopian Footwear",
    description:
      "Discover the finest handcrafted leather shoes from Ethiopia. Timeless craftsmanship meets modern style at Geez Shoes.",
    url: "https://www.geezshoes.com",
    siteName: "Geez Shoes",
    images: [
      {
        url: "https://www.geezshoes.com/Logofavicon.PNG",
        width: 512,
        height: 512,
        alt: "Geez Shoes Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Geez Shoes – Premium Handcrafted Ethiopian Footwear",
    description:
      "Discover the finest handcrafted leather shoes from Ethiopia. Timeless craftsmanship meets modern style at Geez Shoes.",
    images: ["https://www.geezshoes.com/Logofavicon.PNG"],
    creator: "@geez_shoe",
  },
  icons: {
    icon: "/Logofavicon.PNG", // favicon for browser tab
    shortcut: "/Logofavicon.PNG",
    apple: "/Logofavicon.PNG",
  },
};

export default function Head() {
  return (
    <>
      {/* Additional global head tags */}
      <meta charSet="UTF-8" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="theme-color" content="#A8513B" />
    </>
  );
}
