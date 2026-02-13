import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseServer";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    const requesterId = searchParams.get("requesterId");
    const trimmedId = id?.trim() ?? "";
    const trimmedRequesterId = requesterId?.trim() ?? "";

    if (!trimmedId || !trimmedRequesterId) {
      return NextResponse.json(
        { error: "Missing required query params: id, requesterId" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    const { data: requester, error: reqError } = await supabase
      .from("Admin")
      .select("role")
      .eq("id", trimmedRequesterId)
      .single();

    if (reqError || !requester || requester.role !== "main") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: target } = await supabase
      .from("Admin")
      .select("id, role")
      .eq("id", trimmedId)
      .single();

    if (!target || target.role !== "normal") {
      return NextResponse.json(
        { error: "Admin not found or cannot be deleted" },
        { status: 404 }
      );
    }

    const { error: deleteAdminError } = await supabase.from("Admin").delete().eq("id", trimmedId);

    if (deleteAdminError) {
      return NextResponse.json({ error: deleteAdminError.message }, { status: 400 });
    }

    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(trimmedId);

    if (deleteAuthError) {
      console.warn("Auth user delete failed, admin record removed:", deleteAuthError.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin delete error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
