"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

type AttachmentMeta = {
  name: string;
  size: number;
  type: string;
};

export type CreateTenderPayload = {
  tenderId: string;
  tenderName: string;
  privateClient: string;
  authorityClient: string;
  referenceNumber: string;
  tenderValue: string;
  tenderUrl: string;
  startDate: string;
  submissionDueDate: string;
  responseDate: string;
  status: string;
  assign: string;
  assignName?: string;
  notes: string;
  background: string;
  description: string;
  attachments: AttachmentMeta[];
};

function normalizeDate(value: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeNumber(value: string) {
  if (!value) return null;
  const numeric = Number(value.replace(/,/g, ""));
  return Number.isNaN(numeric) ? null : numeric;
}

export async function createTender(payload: CreateTenderPayload) {
  const supabase = await getSupabaseServerClient();

  if (!payload.tenderId?.trim()) {
    return { error: "Missing tender ID." };
  }

  if (!payload.tenderName?.trim()) {
    return { error: "Please provide a tender name." };
  }

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id ?? null;
  let organizationId: string | null = null;

  if (payload.tenderId) {
    const { data: existingTender } = await supabase
      .from("tenders")
      .select("id")
      .eq("tender_id", payload.tenderId)
      .limit(1)
      .maybeSingle();
    if (existingTender) {
      return { error: "Tender ID already exists. Please regenerate a new ID." };
    }
  }

  if (userId) {
    try {
      const { data: person } = await supabase
        .from("people")
        .select("organization_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
      organizationId = person?.organization_id ?? null;
    } catch (error) {
      console.error("Failed to resolve organization for tender", error);
    }
  }

  const dueDate = normalizeDate(payload.submissionDueDate);
  const responseDate = normalizeDate(payload.responseDate);
  const startDate = normalizeDate(payload.startDate);
  const tenderValue = normalizeNumber(payload.tenderValue);

  const clientDisplay = payload.privateClient || payload.authorityClient || null;

  const insertPayload: Record<string, unknown> = {
    tender_id: payload.tenderId,
    title: payload.tenderName || null,
    status: payload.status || null,
    assigned_to: payload.assign || null,
    assigned_to_name: payload.assignName || null,
    submission_due_date: dueDate,
    due_date: dueDate,
    response_date: responseDate,
    start_date: startDate,
    tender_url: payload.tenderUrl || null,
    reference_number: payload.referenceNumber || null,
    tender_value: tenderValue,
    private_client: payload.privateClient || null,
    authority_client: payload.authorityClient || null,
    client_display: clientDisplay,
    notes: payload.notes || null,
    background: payload.background || null,
    description: payload.description || null,
    attachments_meta: payload.attachments.length ? payload.attachments : null,
    created_by: userId,
    organization_id: organizationId,
  };

  const { data, error } = await supabase
    .from("tenders")
    .insert(insertPayload)
    .select("id, tender_id")
    .single();

  if (error) {
    console.error("Failed to create tender", error);
    return { error: error.message };
  }

  revalidatePath("/tenders");

  return { data };
}

