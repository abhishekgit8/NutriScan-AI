import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { Webhook } from "svix";

export async function POST(request: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await request.text();
  const headers = {
    "svix-id": request.headers.get("svix-id") || "",
    "svix-timestamp": request.headers.get("svix-timestamp") || "",
    "svix-signature": request.headers.get("svix-signature") || "",
  };

  let evt;
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(body, headers);
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = evt as { type: string; data: Record<string, unknown> };
  const supabase = getSupabaseServiceClient();

  if (type === "user.created") {
    const id = data.id as string;
    const emailAddresses = data.email_addresses as Array<{ email_address: string }>;
    const firstName = data.first_name as string | null;
    const lastName = data.last_name as string | null;
    const email = emailAddresses?.[0]?.email_address || "";
    const displayName = [firstName, lastName].filter(Boolean).join(" ") || null;

    const { error } = await supabase.from("user_profiles").insert({
      clerk_user_id: id,
      email,
      display_name: displayName,
      preferences: [],
    });

    if (error) {
      console.error("Clerk webhook insert error:", error);
    }
  }

  if (type === "user.updated") {
    const id = data.id as string;
    const emailAddresses = data.email_addresses as Array<{ email_address: string }>;
    const firstName = data.first_name as string | null;
    const lastName = data.last_name as string | null;
    const email = emailAddresses?.[0]?.email_address || "";
    const displayName = [firstName, lastName].filter(Boolean).join(" ") || null;

    const { error } = await supabase.from("user_profiles").upsert(
      {
        clerk_user_id: id,
        email,
        display_name: displayName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_user_id" }
    );

    if (error) {
      console.error("Clerk webhook update error:", error);
    }
  }

  if (type === "user.deleted") {
    const id = data.id as string;

    const { error } = await supabase
      .from("user_profiles")
      .delete()
      .eq("clerk_user_id", id);

    if (error) {
      console.error("Clerk webhook delete error:", error);
    }
  }

  return NextResponse.json({ received: true });
}
