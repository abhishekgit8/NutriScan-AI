import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseServiceClient } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();

  // Get or create user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  // Get scan history
  const { data: history } = await supabase
    .from("scan_history")
    .select("*")
    .eq("clerk_user_id", userId)
    .order("scanned_at", { ascending: false })
    .limit(50);

  return NextResponse.json({
    profile: profile || null,
    history: history || [],
  });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  const supabase = getSupabaseServiceClient();

  if (action === "save_scan") {
    const { barcode, productName, healthScore } = body;

    const { error } = await supabase.from("scan_history").insert({
      clerk_user_id: userId,
      barcode,
      product_name: productName,
      health_score: healthScore,
    });

    if (error) {
      console.error("Save scan error:", error);
      return NextResponse.json(
        { error: "Failed to save scan" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  }

  if (action === "update_preferences") {
    const { preferences } = body;

    const { error } = await supabase.from("user_profiles").upsert(
      {
        clerk_user_id: userId,
        email: body.email || "",
        display_name: body.displayName || "",
        preferences: preferences || [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_user_id" }
    );

    if (error) {
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const scanId = searchParams.get("id");

  if (!scanId) {
    return NextResponse.json({ error: "Scan ID required" }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  const { error } = await supabase
    .from("scan_history")
    .delete()
    .eq("id", scanId)
    .eq("clerk_user_id", userId);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete scan" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
