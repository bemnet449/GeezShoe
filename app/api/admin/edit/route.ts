import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseServer";

export async function PUT(req: Request) {
  try {
    let body: { id?: string; name?: string; email?: string; requesterId?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const { id, name, email, requesterId } = body;

    if (!id || !requesterId) {
      return NextResponse.json(
        { error: "Missing required fields: id, requesterId" },
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

    const updates: { name?: string; email?: string } = {};
    if (name !== undefined && typeof name === "string") updates.name = name.trim();
    if (email !== undefined && typeof email === "string") updates.email = email.trim();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Admin")
      .update(updates)
      .eq("id", id)
      .eq("role", "normal")
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: "Admin not found or cannot be edited" }, { status: 404 });
    }

    if (updates.email) {
      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(id, {
        email: updates.email,
      });
      if (updateAuthError) {
        await supabase.from("Admin").update({ email: data.email }).eq("id", id);
        return NextResponse.json(
          { error: "Failed to update auth email: " + updateAuthError.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: true, admin: data });
  } catch (err) {
    console.error("Admin edit error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
