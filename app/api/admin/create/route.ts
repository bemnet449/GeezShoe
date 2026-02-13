import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    let body: { name?: string; email?: string; password?: string; requesterId?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const { name, email, password, requesterId } = body;

    const trimmedRequesterId = typeof requesterId === "string" ? requesterId.trim() : "";
    if (!name?.trim() || !email?.trim() || !password || !trimmedRequesterId) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, password, requesterId" },
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
      return NextResponse.json(
        { error: "Only main admins can create admins" },
        { status: 403 }
      );
    }

    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { full_name: name.trim(), role: "normal" },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (!newUser.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    const { error: insertError } = await supabase.from("Admin").insert({
      id: newUser.user.id,
      name: name.trim(),
      email: email.trim(),
      role: "normal",
    });

    if (insertError) {
      await supabase.auth.admin.deleteUser(newUser.user.id);
      return NextResponse.json(
        { error: insertError.message || "Failed to add admin record" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: newUser.user.id,
        name: name.trim(),
        email: email.trim(),
        role: "normal",
      },
    });
  } catch (err) {
    console.error("Admin create error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
