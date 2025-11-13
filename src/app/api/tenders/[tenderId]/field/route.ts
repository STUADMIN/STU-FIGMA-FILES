import { NextRequest, NextResponse } from "next/server";

import { getSupabaseServiceRoleClient } from "@/lib/supabaseServer";

const ALLOWED_FIELDS = new Set(["background", "description"]);

type FieldName = "background" | "description";

type BodyPayload = {
  tenderRecordId?: string;
  field?: string;
  value?: string;
  previousValue?: string;
  changedBy?: string;
  changedById?: string | null;
};

export async function POST(request: NextRequest, context: { params: Promise<{ tenderId: string }> }) {
  await context.params;
  const body = (await request.json()) as BodyPayload;
  const tenderRecordId = body.tenderRecordId?.trim();
  const rawField = body.field?.trim().toLowerCase();
  const value = body.value ?? "";
  const previousValue = body.previousValue ?? null;
  const changedBy = body.changedBy?.trim() || "Unknown user";
  const changedById = body.changedById ?? null;

  if (!tenderRecordId) {
    return NextResponse.json({ message: "Missing tender record identifier." }, { status: 400 });
  }

  if (!rawField || !ALLOWED_FIELDS.has(rawField)) {
    return NextResponse.json({ message: "Unsupported field update requested." }, { status: 400 });
  }

  const field = rawField as FieldName;

  const supabase = getSupabaseServiceRoleClient();

  const { error: updateError } = await supabase
    .from("tenders")
    .update({ [field]: value })
    .eq("id", tenderRecordId);

  if (updateError) {
    console.error("Tender field update failed", updateError.message);
    return NextResponse.json({ message: "Unable to update tender." }, { status: 500 });
  }

  const { data: logData, error: logError } = await supabase
    .from("tender_change_logs")
    .insert({
      tender_id: tenderRecordId,
      field,
      previous_value: previousValue,
      new_value: value,
      changed_by: changedBy,
      changed_by_id: changedById,
    })
    .select("id, field, previous_value, new_value, changed_by, changed_by_id, changed_at")
    .maybeSingle();

  if (logError || !logData) {
    console.error("Failed to record tender change log", logError?.message);
    return NextResponse.json({ message: "Tender updated but history entry failed." }, { status: 500 });
  }

  const log = {
    id: logData.id,
    field: logData.field as FieldName,
    previousValue: logData.previous_value,
    newValue: logData.new_value,
    changedBy: logData.changed_by,
    changedById: logData.changed_by_id,
    changedAt: logData.changed_at,
  };

  return NextResponse.json({ value, log });
}
