import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://www.geezshoes.com";

type SitemapEntry = {
  loc: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
};

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
  const entries: SitemapEntry[] = [];
  const now = new Date().toISOString().slice(0, 10);

  const staticPages: SitemapEntry[] = [
    { loc: `${BASE_URL}/`, lastmod: now, changefreq: "weekly", priority: 1.0 },
    { loc: `${BASE_URL}/about`, lastmod: now, changefreq: "monthly", priority: 0.8 },
    { loc: `${BASE_URL}/products`, lastmod: now, changefreq: "weekly", priority: 0.9 },
    { loc: `${BASE_URL}/clients/shop`, lastmod: now, changefreq: "daily", priority: 0.9 },
  ];
  entries.push(...staticPages);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: products, error } = await supabase
        .from("products")
        .select("id, created_at")
        .eq("is_active", true);

      if (!error && Array.isArray(products)) {
        for (const p of products) {
          const lastmod = p.created_at
            ? new Date(p.created_at).toISOString().slice(0, 10)
            : now;
          entries.push({
            loc: `${BASE_URL}/clients/product/${p.id}`,
            lastmod,
            changefreq: "weekly",
            priority: 0.7,
          });
        }
      }
    } catch {
      // Continue with static entries only
    }
  }

  const urlsXml = entries.map(urlToXml).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
