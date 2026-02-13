import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseServer";

export async function PUT(req: Request) {
  try {
    let body: { id?: string; newPassword?: string; requesterId?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const { id, newPassword, requesterId } = body;

    if (!id || !newPassword || !requesterId) {
      return NextResponse.json(
        { error: "Missing required fields: id, newPassword, requesterId" },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    const { data: requester, error: reqError } = await supabase
      .from("Admin")
      .select("role")
      .eq("id", requesterId)
      .single();

    if (reqError || !requester || requester.role !== "main") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { error } = await supabase.auth.admin.updateUserById(id, {
      password: newPassword,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin reset-password error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
