import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const requesterId = req.nextUrl.searchParams.get("requesterId");

    if (!requesterId || typeof requesterId !== "string" || !requesterId.trim()) {
      return NextResponse.json(
        { error: "Missing required query param: requesterId" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    const { data: requester, error: reqError } = await supabase
      .from("Admin")
      .select("role")
      .eq("id", requesterId.trim())
      .single();

    if (reqError || !requester || requester.role !== "main") {
      return NextResponse.json(
        { error: "Only main admins can list admins" },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("Admin")
      .select("id, name, email, role")
      .eq("role", "normal")
      .order("name", { ascending: true });

    if (error) {
      console.error("Admin list DB error:", error);
      return NextResponse.json(
        { error: "Failed to fetch admins" },
        { status: 500 }
      );
    }

    return NextResponse.json({ admins: data || [] });
  } catch (err) {
    console.error("Admin list error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
