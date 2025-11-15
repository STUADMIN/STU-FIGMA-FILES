import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import type { ActivityEvent } from "@/components/tenders/ActivityLogSection";

function computeInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  const initials = `${first}${second}`.trim();
  const fallback = first || second || "?";
  return (initials || fallback).toUpperCase();
}

type ParamsArg = { params: { tenderId: string } } | { params: Promise<{ tenderId: string }> };

async function resolveParams(arg: ParamsArg) {
  const maybePromise = arg.params as Promise<{ tenderId: string }> | { tenderId: string };
  if (typeof (maybePromise as any)?.then === "function") {
    return (await (maybePromise as Promise<{ tenderId: string }>));
  }
  return maybePromise as { tenderId: string };
}

export async function POST(request: Request, context: ParamsArg) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "You must be signed in to record activity." }, { status: 401 });
  }

  const rawBody = await request.json().catch(() => null);
  const noteInput = typeof rawBody?.note === "string" ? rawBody.note.trim() : "";
  const statusSnapshot = typeof rawBody?.status === "string" ? rawBody.status.trim() : null;
  const tenderIdFromBody = typeof rawBody?.tenderId === "string" ? rawBody.tenderId.trim() : "";

  if (!noteInput) {
    return NextResponse.json({ error: "Activity note cannot be empty." }, { status: 400 });
  }

  const { tenderId } = await resolveParams(context);
  const tenderSlug = decodeURIComponent(tenderId ?? "").trim() || tenderIdFromBody;
  if (!tenderSlug) {
    return NextResponse.json({ error: "Tender reference is required." }, { status: 400 });
  }

  let authorName = (user.user_metadata?.full_name as string | undefined) ?? "";

  try {
    const { data: person } = await supabase
      .from("people")
      .select("display_name, first_name, last_name")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    const display = String(person?.display_name ?? "").trim();
    const first = String(person?.first_name ?? "").trim();
    const last = String(person?.last_name ?? "").trim();
    const combined = (display || [first, last].filter(Boolean).join(" ")).trim();
    if (combined) {
      authorName = combined;
    }
  } catch (error) {
    console.warn("Activity author lookup failed", error);
  }

  if (!authorName) {
    authorName = user.email ?? "Team member";
  }

  const initials = computeInitials(authorName);

  const { data: insertData, error: insertError } = await supabase
    .from("tender_activity_logs")
    .insert({
      tender_id: tenderSlug,
      note: noteInput,
      status_snapshot: statusSnapshot,
      type: "note",
      author_id: user.id,
      author_name: authorName,
      author_initials: initials,
    })
    .select("id, created_at, note, status_snapshot, type, author_name, author_initials")
    .single();

  if (insertError || !insertData) {
    console.error("Activity log insert failed", insertError);
    return NextResponse.json({ error: "Failed to record activity." }, { status: 500 });
  }

  const event: ActivityEvent = {
    id: insertData.id,
    at: insertData.created_at ?? new Date().toISOString(),
    actor: {
      name: insertData.author_name ?? authorName,
      initials: (insertData.author_initials ?? initials).toUpperCase(),
    },
    type: (insertData.type ?? "note") as ActivityEvent["type"],
    summary: insertData.note ?? noteInput,
    meta: insertData.status_snapshot ? `Status recorded: ${insertData.status_snapshot}` : undefined,
  };

  return NextResponse.json({ event }, { status: 201 });
}
