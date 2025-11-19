import AppShell from "@/components/layout/AppShell";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { StuIcon } from "@/components/icons/StuIcon";
import TendersTable, { TenderRow } from "./TendersTable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const columnWidths = {
  tenderId: 200,
  name: 360,
  status: 160,
  assigned: 190,
  due: 200,
  response: 160,
  actions: 60,
};

export type DbTenderRow = {
  id: string;
  tender_id: string | null;
  title?: string | null;
  status?: string | null;
  assigned_to?: string | null;
  assigned_to_name?: string | null;
  submission_due_date?: string | null;
  due_date?: string | null;
  response_date?: string | null;
  private_client?: string | null;
  authority_client?: string | null;
  client_display?: string | null;
  created_at?: string | null;
};

function parseDateInput(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  const slashParts = trimmed.split("/");
  if (slashParts.length === 3) {
    const [day, month, yearPart] = slashParts;
    const year = yearPart.length === 2 ? Number(`20${yearPart}`) : Number(yearPart);
    const date = new Date(year, Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function formatDisplayDate(value?: string | null) {
  const date = parseDateInput(value);
  if (!date) return "Not set";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function buildDueMeta(value?: string | null) {
  const date = parseDateInput(value);
  if (!date) return undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const comparison = new Date(date);
  comparison.setHours(0, 0, 0, 0);

  const diffDays = Math.round((comparison.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Due today";
  if (diffDays > 0) return `Due in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"}`;
}

export default async function TendersPage() {
  const supabase = await getSupabaseServerClient();
  let firstName = "";
  let fullName = "";
  let tableRows: TenderRow[] = [];

  try {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id ?? null;
    if (userId) {
      const { data } = await supabase
        .from("people")
        .select("display_name, first_name, last_name")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
      const display = String(data?.display_name ?? "").trim();
      const first = String(data?.first_name ?? "").trim();
      const last = String((data as any)?.last_name ?? "").trim();
      firstName = (display.split(" ")[0] || first || "").trim();
      fullName = (display || [first, last].filter(Boolean).join(" ")).trim();
    }
  } catch {
    // ignore; fall back to defaults
  }

  try {
    const { data: tendersData, error } = await supabase
      .from("tenders")
      .select(
        "id, tender_id, title, status, assigned_to, assigned_to_name, submission_due_date, due_date, response_date, private_client, authority_client, client_display, created_at",
      )
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(tendersData)) {
      tableRows = tendersData.map((row: DbTenderRow) => {
        const tenderId = (row.tender_id ?? "").trim() || row.id;
        const slug = tenderId || row.id;
        const clientName = (row.client_display ?? row.authority_client ?? row.private_client)?.trim() || "—";
        const dueRaw = row.submission_due_date ?? row.due_date ?? null;
        const responseRaw = row.response_date ?? null;
        const assigneeName = (row.assigned_to_name ?? row.assigned_to)?.trim() || "Unassigned";

        return {
          id: row.id,
          slug,
          tenderId,
          title: row.title?.trim() || "Untitled tender",
          ref: clientName,
          status: row.status?.trim() || "Draft",
          assignee: assigneeName,
          due: formatDisplayDate(dueRaw),
          dueMeta: buildDueMeta(dueRaw),
          response: formatDisplayDate(responseRaw),
        };
      });
    }
  } catch (error) {
    console.error("Failed to load tenders", error);
  }

  const pillName = fullName || firstName || "";

  return (
    <AppShell userDisplayName={pillName} fullWidth>
      <div className="bg-[#ECECEC] px-5 py-5">
        <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-5">
          <header className="flex w-full items-start justify-between">
            <div className="flex items-center gap-4">
              <StuIcon name="tenders" size={40} className="text-brand-tenders md:hidden" aria-label="Tenders" />
              <StuIcon name="tenders" size={48} className="text-brand-tenders hidden md:block" aria-label="Tenders" />
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-[#0D2352]">Tenders</h1>
                <p className="text-sm text-[#5D5D5C]">Live tender activity across the business</p>
              </div>
            </div>
            <Link
              href="/tenders/new"
              className="rounded-[12px] bg-[#4C7CF0] px-4 py-2 text-sm md:text-base font-normal leading-[24px] md:leading-[28px] text-white shadow transition hover:bg-[#3B6BE0]"
              style={{ fontFamily: "Montserrat, sans-serif", textAlign: "center" }}
            >
              Create new tender
            </Link>
          </header>

          <nav className="flex w-full gap-8 border-b border-[#D0D0D0] pb-2 text-base font-semibold text-[#0D2352]">
            <button type="button" className="cursor-default flex flex-col items-start gap-1 text-[#0D2352]" aria-selected>
              <span>Live tenders</span>
              <span className="h-1 w-full rounded-full bg-[#1890FF]" />
            </button>
            <button type="button" className="flex flex-col items-start gap-1 text-[#0D2352] opacity-70 transition hover:opacity-100">
              <span className="transition-colors group-hover:text-[#1890FF]">Archived</span>
              <span className="h-1 w-full rounded-full bg-transparent" />
            </button>
          </nav>

          <TendersTable rows={tableRows} columnWidths={columnWidths} />
        </div>
      </div>
    </AppShell>
  );
}