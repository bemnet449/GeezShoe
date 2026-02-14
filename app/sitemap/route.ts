import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.geezshoes.com";

const STATIC_PAGES: Array<{
  path: string;
  changefreq: "weekly" | "daily" | "monthly";
  priority: number;
}> = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/about", changefreq: "monthly", priority: 0.8 },
  { path: "/products", changefreq: "weekly", priority: 0.9 },
  { path: "/clients/shop", changefreq: "daily", priority: 0.9 },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatLastmod(date: Date): string {
  return date.toISOString().split("T")[0];
}

function urlNode(loc: string, lastmod: string, changefreq: string, priority: number): string {
  return `<url><loc>${escapeXml(loc)}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority.toFixed(1)}</priority></url>`;
}

export async function GET() {
  const today = formatLastmod(new Date());
  const urlParts: string[] = [];

  for (const page of STATIC_PAGES) {
    urlParts.push(
      urlNode(
        `${BASE_URL}${page.path}`,
        today,
        page.changefreq,
        page.priority
      )
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: products, error } = await supabase
        .from("products")
        .select("id, created_at")
        .eq("is_active", true);

      if (!error && products?.length) {
        for (const p of products) {
          const lastmod = p.created_at
            ? formatLastmod(new Date(p.created_at))
            : today;
          urlParts.push(
            urlNode(
              `${BASE_URL}/clients/product/${p.id}`,
              lastmod,
              "weekly",
              0.7
            )
          );
        }
      }
    } catch (err) {
      console.error("Sitemap Supabase error:", err);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlParts.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
