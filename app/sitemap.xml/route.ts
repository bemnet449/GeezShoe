// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseServer"; // server-side admin client

const BASE_URL = "https://www.geezshoes.com";

type SitemapEntry = {
  loc: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
};

// Escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlToXml(entry: SitemapEntry): string {
  return [
    "  <url>",
    `    <loc>${escapeXml(entry.loc)}</loc>`,
    `    <lastmod>${entry.lastmod}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority.toFixed(1)}</priority>`,
    "  </url>",
  ].join("\n");
}

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  // Static pages
  const entries: SitemapEntry[] = [
    { loc: `${BASE_URL}/`, lastmod: today, changefreq: "weekly", priority: 1.0 },
    { loc: `${BASE_URL}/about`, lastmod: today, changefreq: "monthly", priority: 0.8 },
    { loc: `${BASE_URL}/products`, lastmod: today, changefreq: "weekly", priority: 0.9 },
    { loc: `${BASE_URL}/clients/shop`, lastmod: today, changefreq: "daily", priority: 0.9 },
  ];

  // Dynamic product pages
  try {
    const supabase = createSupabaseAdmin(); // server-side service role key
    const { data: products } = await supabase
      .from("products")
      .select("id, created_at")
      .eq("is_active", true);

    if (products?.length) {
      for (const p of products) {
        const lastmod = p.created_at
          ? new Date(p.created_at).toISOString().slice(0, 10)
          : today;
        entries.push({
          loc: `${BASE_URL}/clients/product/${p.id}`,
          lastmod,
          changefreq: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch {
    // fallback: serve static pages only if supabase fails
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(urlToXml).join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
