import { MetadataRoute } from "next";
import { createSupabaseAdmin } from "../lib/supabaseServer";

export const runtime = "nodejs";

const BASE_URL = "https://www.geezshoes.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/clients/shop`,
      lastModified: today,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Dynamic product pages
  try {
    const supabase = createSupabaseAdmin();

    const { data: products, error } = await supabase
      .from("products")
      .select("id, created_at")
      .eq("is_active", true);

    if (error) throw error;

    const productPages: MetadataRoute.Sitemap =
      products?.map((p) => ({
        url: `${BASE_URL}/clients/product/${p.id}`,
        lastModified: p.created_at || today,
        changeFrequency: "weekly",
        priority: 0.7,
      })) || [];

    return [...staticPages, ...productPages];
  } catch (err) {
    console.error("Sitemap Supabase error:", err);
    return staticPages; // fallback
  }
}
