import React from "react";
import type { Metadata } from "next";
import AppShell from "../../../components/layout/AppShell";
import { getSupabaseServerClient } from "../../../lib/supabaseServer";
import NewTenderForm from "./NewTenderForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "New tender",
};

type PersonRow = {
  id: string;
  user_id: string | null;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  organization_id: string | null;
};

type AssigneeOption = {
  id: string;
  name: string;
  isCurrentUser: boolean;
};

export default async function NewTenderPage() {
  const supabase = await getSupabaseServerClient();
  let fullName = "";
  let authorities: string[] = [];
  let assignees: AssigneeOption[] = [];
  let currentUserId: string | null = null;
  let organizationId: string | null = null;

  const buildName = (record: { display_name?: string | null; first_name?: string | null; last_name?: string | null }) => {
    const display = String(record.display_name ?? "").trim();
    const first = String(record.first_name ?? "").trim();
    const last = String(record.last_name ?? "").trim();
    const combined = [first, last].filter(Boolean).join(" ").trim();
    return display || combined || "Team member";
  };

  try {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id ?? null;
    currentUserId = userId;
    if (userId) {
      const { data } = await supabase
        .from("people")
        .select("id, user_id, display_name, first_name, last_name, organization_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle<PersonRow>();
      const display = String(data?.display_name ?? "").trim();
      const first = String(data?.first_name ?? "").trim();
      const last = String(data?.last_name ?? "").trim();
      fullName = (display || [first, last].filter(Boolean).join(" ")).trim();
      organizationId = data?.organization_id ?? null;
    }
  } catch {
    // ignore user name errors and fall back to default
  }

  try {
    const { data: authorityRows } = await supabase.from("district_councils").select("name").order("name", { ascending: true });
    authorities =
      authorityRows
        ?.map((row: { name: string | null }) => (row.name ?? "").trim())
        .filter((name): name is string => name.length > 0) ?? [];
  } catch {
    authorities = [];
  }

  if (organizationId) {
    try {
      const { data: colleagueRows } = await supabase
        .from("people")
        .select("id, user_id, display_name, first_name, last_name, organization_id")
        .eq("organization_id", organizationId)
        .order("display_name", { ascending: true });

      assignees =
        colleagueRows
          ?.map((person: PersonRow) => {
            const id = person.user_id ?? person.id;
            if (!id) return null;
            return {
              id,
              name: buildName(person),
              isCurrentUser: currentUserId === id,
            };
          })
          .filter((option): option is AssigneeOption => Boolean(option && option.id && option.name)) ?? [];
    } catch {
      assignees = [];
    }
  }

  if (!assignees.length && currentUserId) {
    assignees = [
      {
        id: currentUserId,
        name: fullName || "You",
        isCurrentUser: true,
      },
    ];
  } else if (assignees.length && currentUserId && !assignees.some((option) => option.id === currentUserId)) {
    assignees.unshift({
      id: currentUserId,
      name: fullName || "You",
      isCurrentUser: true,
    });
  }

  if (assignees.length > 1) {
    assignees = assignees
      .reduce<AssigneeOption[]>((acc, option) => {
        if (!acc.some((existing) => existing.id === option.id)) {
          acc.push(option);
        }
        return acc;
      }, [])
      .sort((a, b) => {
        if (a.isCurrentUser && !b.isCurrentUser) return -1;
        if (!a.isCurrentUser && b.isCurrentUser) return 1;
        return a.name.localeCompare(b.name);
      });
  }

  return (
    <AppShell userDisplayName={fullName} fullWidth>
      <div className="flex w-full min-h-[calc(100vh-5rem)] flex-col bg-[#ECECEC] px-7 py-8">
        <NewTenderForm authorities={authorities} assignees={assignees} currentUserId={currentUserId ?? undefined} />
      </div>
    </AppShell>
  );
}

