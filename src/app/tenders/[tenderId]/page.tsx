import AppShell from "@/components/layout/AppShell";
import type { Metadata } from "next";
import { StuIcon, type StuIconName } from "@/components/icons/StuIcon";
import EditableTextSection from "@/components/tenders/EditableTextSection";
import { DocumentDropzone } from "@/components/tenders/DocumentDropzone";
import ActivityLogSection from "@/components/tenders/ActivityLogSection";
import type { ActivityEvent } from "@/components/tenders/ActivityLogSection";
import SubmittedDocumentsTab, {
  SubmittedDocument,
} from "@/components/tenders/SubmittedDocumentsTab";
import { TenderTabs } from "@/components/tenders/TenderTabs";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import FeedbackButton from "@/components/tenders/FeedbackButton";
import Link from "next/link";
import type { TendersFeedbackDashboardProps } from "@/components/tenders/TendersFeedbackDashboard";
import TenderHeaderDesigned from "@/components/tenders/TenderHeaderDesigned";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Tender details",
};

type AttachmentMeta = {
  name: string;
  size: number;
  type: string;
};

type TenderRow = {
  id: string;
  tender_id: string | null;
  title: string | null;
  status: string | null;
  assigned_to_name: string | null;
  submission_due_date: string | null;
  due_date: string | null;
  response_date: string | null;
  start_date: string | null;
  tender_value: number | null;
  tender_url: string | null;
  private_client: string | null;
  authority_client: string | null;
  client_display: string | null;
  reference_number: string | null;
  notes: string | null;
  background: string | null;
  description: string | null;
  attachments_meta: AttachmentMeta[] | null;
  created_at: string | null;
};

type BadgeVariant = "blue" | "green" | "amber" | "slate" | "purple";

// Local fallback type restored from usage context to satisfy TypeScript
// for change log entries fetched from 'tender_change_logs'.
type TenderChangeLog = {
  id: string;
  field: "background" | "description";
  previousValue: string | null;
  newValue: string | null;
  changedBy: string | null;
  changedById: string | null;
  changedAt: string;
};

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatDate(value?: string | null) {
  const date = parseDate(value);
  if (!date) return "Not set";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatFileSize(bytes?: number | null) {
  if (typeof bytes !== "number" || Number.isNaN(bytes) || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function computeInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  const initials = `${first}${second}`.trim();
  const fallback = first || second;
  return (initials || fallback || "?").toUpperCase();
}

function extractAttachmentUrl(file: AttachmentMeta & Record<string, unknown>) {
  const candidates = [
    "downloadUrl",
    "download_url",
    "publicUrl",
    "public_url",
    "url",
    "path",
    "fullPath",
    "storagePath",
    "storage_path",
  ];

  for (const key of candidates) {
    const value = file[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

async function enrichWithSignedUrls(documents: SubmittedDocument[]) {
  if (!documents.length) return documents;

  const storageClient = await getSupabaseServerClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const bucket =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "tender-documents";

  const enriched = await Promise.all(
    documents.map(async (doc) => {
      if (doc.downloadUrl && doc.downloadUrl.startsWith("http")) {
        return doc;
      }

      const path = doc.downloadUrl;
      if (!path) {
        return doc;
      }

      try {
        if (path.startsWith("http")) {
          return doc;
        }

        const normalisedPath = path.replace(/^\//, "");
        const { data, error } = await storageClient.storage
          .from(bucket)
          .createSignedUrl(normalisedPath, 60 * 60); // 1 hour expiry

        if (error || !data?.signedUrl) {
          if (supabaseUrl) {
            return {
              ...doc,
              downloadUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${normalisedPath}`,
            };
          }
          return doc;
        }

        return {
          ...doc,
          downloadUrl: data.signedUrl,
        };
      } catch (error) {
        console.warn("Failed to create signed URL", error);
        if (supabaseUrl && path) {
          const normalisedPath = path.replace(/^\//, "");
          return {
            ...doc,
            downloadUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${normalisedPath}`,
          };
        }
        return doc;
      }
    })
  );

  return enriched;
}

function buildDueMeta(value?: string | null) {
  const date = parseDate(value);
  if (!date) return "Date not set";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const comparison = new Date(date);
  comparison.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (comparison.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Due today";
  if (diffDays > 0) return `Due in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  return `Overdue by ${Math.abs(diffDays)} day${
    Math.abs(diffDays) === 1 ? "" : "s"
  }`;
}

const FALLBACK_TENDER: TenderRow = {
  id: "placeholder",
  tender_id: "TEN-XXXXXXX-PLACEHOLDER",
  title: "Tender details unavailable",
  status: "Draft",
  assigned_to_name: null,
  submission_due_date: null,
  due_date: null,
  response_date: null,
  start_date: null,
  tender_value: null,
  tender_url: null,
  private_client: null,
  authority_client: null,
  client_display: null,
  reference_number: null,
  notes: null,
  background: null,
  description: null,
  attachments_meta: [],
  created_at: null,
};

export default async function TenderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenderId: string }> | { tenderId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await getSupabaseServerClient();

  const resolvedParams = params instanceof Promise ? await params : params;
  const paramTenderId = resolvedParams?.tenderId ?? "";

  let fullName = "";
  let userId: string | null = null;

  try {
    const { data: auth } = await supabase.auth.getUser();
    userId = auth?.user?.id ?? null;
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
      fullName = (display || [first, last].filter(Boolean).join(" ")).trim();
    }
  } catch {
    // ignore user name errors
  }

  let tender: TenderRow | null = null;
  let fetchError: string | null = null;

  try {
    const rawParam = paramTenderId;
    const decodedParam = decodeURIComponent(rawParam);
    const sanitizedId = decodedParam.trim();
    console.log("TenderDetailPage slug", sanitizedId);

    if (sanitizedId) {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          sanitizedId
        );
      const candidateValues = new Set<string>();

      const cleaned = sanitizedId.replace(/[\r\n]+/g, "");
      candidateValues.add(cleaned);
      candidateValues.add(cleaned.toUpperCase());
      candidateValues.add(cleaned.toLowerCase());
      candidateValues.add(cleaned.replace(/\s+/g, ""));

      const orFilters: string[] = [];

      if (isUuid) {
        orFilters.push(`id.eq.${cleaned}`);
      }

      Array.from(candidateValues)
        .filter(Boolean)
        .forEach((value) => {
          const escaped = value.replace(/,/g, "\\,");
          orFilters.push(`tender_id.eq.${escaped}`);
          orFilters.push(`tender_id.ilike.${escaped}`);
        });

      if (orFilters.length) {
        console.log("Tender detail lookup filters", orFilters);
        const { data, error } = await supabase
          .from("tenders")
          .select(
            "id, tender_id, title, status, assigned_to_name, submission_due_date, due_date, response_date, start_date, tender_value, tender_url, private_client, authority_client, client_display, reference_number, notes, background, description, attachments_meta, created_at"
          )
          .or(orFilters.join(","))
          .limit(1)
          .maybeSingle<TenderRow>();

        if (error) {
          console.error("Tender detail fetch error", error.message);
          fetchError = error.message;
        } else if (data) {
          console.log("Tender detail resolved", data.id, data.tender_id);
          tender = data;
          fetchError = null;
        }
      }
    }

    if (!tender && !fetchError) {
      console.warn("Tender detail unable to resolve record for", sanitizedId);
      fetchError = "Tender record was not found.";
    }
  } catch (error) {
    console.error("Tender detail fetch threw", error);
    fetchError = error instanceof Error ? error.message : "Unknown error";
  }

  const activeTender = tender ?? FALLBACK_TENDER;
  const displayStatus = activeTender.status?.trim() || "Draft";
  const statusVariant = mapStatusToBadgeVariant(displayStatus);
  const clientLabel =
    activeTender.client_display ||
    activeTender.authority_client ||
    activeTender.private_client ||
    "—";
  const dueDateRaw = activeTender.submission_due_date ?? activeTender.due_date;
  const dueMeta = buildDueMeta(dueDateRaw);
  const usingFallback = !tender;

  let changeLogs: TenderChangeLog[] = [];

  if (tender) {
    const { data: logData, error: logsError } = await supabase
      .from("tender_change_logs")
      .select(
        "id, field, previous_value, new_value, changed_by, changed_by_id, changed_at"
      )
      .eq("tender_id", tender.id)
      .order("changed_at", { ascending: false });

    if (!logsError && logData) {
      changeLogs = logData.map((entry) => ({
        id: entry.id,
        field: entry.field as "background" | "description",
        previousValue: entry.previous_value,
        newValue: entry.new_value,
        changedBy: entry.changed_by,
        changedById: entry.changed_by_id,
        changedAt: entry.changed_at,
      }));
    }
  }

  const tenderIdentifier = (() => {
    const trimmed = (activeTender.tender_id ?? "").trim();
    if (trimmed) return trimmed;
    return activeTender.id ?? "Not set";
  })();

  const tenderActivityRef = (() => {
    const candidate = (activeTender.tender_id ?? "").trim();
    if (candidate) return candidate;
    if (activeTender.id) return activeTender.id;
    return paramTenderId ?? "";
  })();

  let activityEvents: ActivityEvent[] = [];

  if (tenderActivityRef) {
    try {
      const { data: activityData, error: activityError } = await supabase
        .from("tender_activity_logs")
        .select(
          "id, created_at, note, status_snapshot, type, author_name, author_initials"
        )
        .eq("tender_id", tenderActivityRef)
        .order("created_at", { ascending: false });

      if (activityError) {
        console.error("Tender activity fetch error", activityError.message);
      } else if (activityData) {
        activityEvents = activityData.map((row) => {
          const actorName = (row.author_name ?? "Team member").trim() || "Team member";
          const initials =
            (row.author_initials ?? computeInitials(actorName)).trim() ||
            computeInitials(actorName);
          return {
            id: row.id,
            at: row.created_at ?? new Date().toISOString(),
            actor: {
              name: actorName,
              initials,
            },
            type: (row.type ?? "note") as ActivityEvent["type"],
            summary: (row.note ?? "").trim() || "Activity recorded",
            meta: row.status_snapshot
              ? `Status recorded: ${row.status_snapshot}`
              : undefined,
          } satisfies ActivityEvent;
        });
      }
    } catch (error) {
      console.error("Tender activity fetch threw", error);
    }
  }

  const attachments = activeTender.attachments_meta ?? [];
  const submittedDocuments: SubmittedDocument[] = attachments.map(
    (file, index) => {
      const sizeLabel = formatFileSize(file.size) ?? "-";
      const uploadedAt = activeTender.created_at ?? new Date().toISOString();
      const uploadedBy =
        activeTender.assigned_to_name || fullName || "Team member";

      const cleanedName = (file.name ?? "").trim();
      const title = cleanedName || `Document ${index + 1}`;

      return {
        id: `${activeTender.id ?? "attachment"}-${index}`,
        title,
        fileName: cleanedName || title,
        fileSize: sizeLabel,
        uploadedAt,
        uploadedBy,
        tags: file.type ? [file.type] : undefined,
        summary: null,
        content: null,
        downloadUrl: extractAttachmentUrl(file),
      } satisfies SubmittedDocument;
    }
  );

  const documentsWithSignedUrls = await enrichWithSignedUrls(
    submittedDocuments
  );

  const detailsContent = (
    <div className="space-y-8">
      {usingFallback || fetchError ? (
        <InlineFallbackAlert reason={fetchError} />
      ) : null}

      <TenderMeta
        tenderId={tenderIdentifier}
        tenderValue={formatCurrency(activeTender.tender_value)}
        displayStatus={displayStatus}
        statusVariant={statusVariant}
        tenderUrl={activeTender.tender_url}
        dueDate={formatDate(activeTender.submission_due_date)}
        dueMeta={dueMeta}
        responseDate={formatDate(activeTender.response_date)}
      />

      <EditableTextSection
        title="Background"
        field="background"
        tenderRecordId={activeTender.id}
        tenderSlug={paramTenderId || activeTender.id}
        initialValue={activeTender.background}
        userName={fullName}
        userId={userId}
        initialLogs={changeLogs.filter((log) => log.field === "background")}
      />

      <EditableTextSection
        title="Description"
        field="description"
        tenderRecordId={activeTender.id}
        tenderSlug={paramTenderId || activeTender.id}
        initialValue={activeTender.description}
        userName={fullName}
        userId={userId}
        initialLogs={changeLogs.filter((log) => log.field === "description")}
      />
    </div>
  );

  const documentsContent = (
    <SubmittedDocumentsTab
      documents={documentsWithSignedUrls}
      tenderRecordId={activeTender.id}
      tenderSlug={tenderIdentifier}
      currentUserName={fullName}
    />
  );

  const activityContent = (
    <ActivityLogSection
      tenderId={tenderActivityRef}
      events={activityEvents}
      currentStatus={displayStatus}
      currentUserName={fullName}
    />
  );

  // Decode feedback payload from query param to render as a tab (preview-in-place)
  const feedbackData: TendersFeedbackDashboardProps | null = (() => {
    const raw =
      typeof searchParams?.feedback === "string"
        ? searchParams?.feedback
        : Array.isArray(searchParams?.feedback)
        ? searchParams?.feedback[0]
        : undefined;
    if (!raw) return null;
    try {
      const json = Buffer.from(raw, "base64").toString("utf8");
      const payload = JSON.parse(json) as TendersFeedbackDashboardProps;
      return {
        ...payload,
        attachments: Array.isArray(payload.attachments) ? payload.attachments : [],
        splits: Array.isArray(payload.splits) ? payload.splits : [],
        tenderSlug: tenderIdentifier,
      };
    } catch {
      return null;
    }
  })();

  const feedbackProps: TendersFeedbackDashboardProps = feedbackData ?? { tenderSlug: tenderIdentifier };

  return (
    <AppShell userDisplayName={fullName} fullWidth>
      <main className="min-h-dvh bg-slate-50">
        <div className="mx-auto flex w-full max-w-6xl flex-col px-8 py-8">
          <TenderHeaderDesigned
            title={activeTender.title || "Untitled tender"}
            status={displayStatus}
            client={clientLabel}
            tenderId={activeTender.tender_id || "Not set"}
            reference={activeTender.reference_number || "—"}
            createdAt={formatDate(activeTender.created_at)}
            assignedTo={activeTender.assigned_to_name || "Unassigned"}
            dueDate={formatDate(activeTender.submission_due_date)}
            dueMeta={dueMeta}
            tenderSlug={tenderIdentifier}
          />

          <section className="mt-6">
            <TenderTabs
              details={detailsContent}
              documents={documentsContent}
              feedback={feedbackProps}
              activity={activityContent}
              initialTab={feedbackData ? "feedback" : "details"}
            />
          </section>
        </div>
      </main>
    </AppShell>
  );
}

function InlineFallbackAlert({ reason }: { reason?: string | null }) {
  return (
    <div className="rounded-[18px] border border-[#F6D79B] bg-[#FFF8E6] px-5 py-3 text-sm text-[#8C5E0A]">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <StuIcon name={ICONS.alert} size={16} />
          <span>
            We couldn&apos;t load the live data for this tender. Showing a
            placeholder view.
          </span>
        </div>
        {reason ? (
          <span className="pl-7 text-xs text-[#6B4D0A]">Details: {reason}</span>
        ) : null}
      </div>
    </div>
  );
}

function TopBanner({
  title,
  status,
  statusVariant, // kept in case you want variant-specific styling later
  client,
  tenderId,
  reference,
  createdAt,
  assignedTo,
  dueDate,
  dueMeta,
  tenderSlug,
}: {
  title: string;
  status: string;
  statusVariant: BadgeVariant;
  client: string;
  tenderId: string;
  reference: string;
  createdAt: string;
  assignedTo: string;
  dueDate: string;
  dueMeta: string;
  tenderSlug: string;
}) {
  return (
    <div className="w-full border-b border-[#BBC9CE] bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-[28px] pt-[32px] pb-[28px]">
        {/* Back link row */}
        <Link
          href="/tenders"
          className="mb-4 inline-flex items-center gap-2 text-black transition hover:underline"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: "24px",
          }}
        >
          <span className="inline-flex h-6 w-6 items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 19L5 12L12 5"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Back to Tenders
        </Link>

        {/* Title + status + feedback button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1
              className="font-bold text-black"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "40px",
                lineHeight: "48px",
              }}
            >
              {title}
            </h1>
            <span
              className="flex items-start px-4 py-1 text-sm font-semibold"
              style={{ backgroundColor: "#EDE9FE", color: "#581C87" }}
            >
              {status}
            </span>
          </div>
          <FeedbackButton tenderSlug={tenderSlug} />
        </div>

        {/* Client line */}
        <div
          className="mt-2 self-stretch text-[#61828D]"
          style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "20px",
            fontWeight: 600,
            lineHeight: "28px",
          }}
        >
          {client}
        </div>

        {/* Meta row */}
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          <MetaItem label="Tender ID" value={tenderId} />
          <MetaItem label="Reference number" value={reference} />
          <MetaItem label="Created" value={createdAt} />
          <MetaItem
            label="Assigned to"
            value={assignedTo}
          />
          <MetaItem label="Submission due date" value={dueDate} helper={dueMeta} />
        </div>
      </div>
    </div>
  );
}

function MetaItem({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="flex flex-col self-stretch">
      <span
        className="text-[#61828D]"
        style={{
          fontFamily: "Poppins, sans-serif",
          fontSize: "12px",
          lineHeight: "16px",
          fontWeight: 700,
        }}
      >
        {label}
      </span>
      <div
        className="mt-1 text-[#0F172A]"
        style={{
          fontFamily: "Poppins, sans-serif",
          fontSize: "16px",
          lineHeight: "28px",
          fontWeight: 400,
        }}
      >
        {value || "—"}
      </div>
      {helper && helper !== "Date not set" ? (
        <div className="text-xs font-medium text-[#0AD6A1]">{helper}</div>
      ) : null}
    </div>
  );
}

function TenderMeta({
  tenderId,
  tenderValue,
  displayStatus,
  statusVariant,
  tenderUrl,
  dueDate,
  dueMeta,
  responseDate,
}: {
  tenderId: string;
  tenderValue: string;
  displayStatus: string;
  statusVariant: BadgeVariant;
  tenderUrl: string | null;
  dueDate: string;
  dueMeta: string;
  responseDate: string;
}) {
  return (
    <SectionCard title="Tender details">
      <Label
        title="Tender ID"
        value={<span className="font-semibold text-[#0D2352]">{tenderId}</span>}
      />
      <Label
        title="Tender value"
        value={
          <span
            className="block"
            style={{
              width: "121px",
              height: "24px",
              color: "#0F172A",
              fontFamily: "Montserrat, sans-serif",
              fontSize: "16px",
              lineHeight: "28px",
              fontWeight: 400,
            }}
          >
            {tenderValue}
          </span>
        }
      />
      <Label
        title="Status"
        value={<Badge variant={statusVariant}>{displayStatus}</Badge>}
      />
      <Label
        title="Tender URL"
        grow
        value={
          tenderUrl ? (
            <div className="flex items-center gap-2">
              <StuIcon name={ICONS.link} size={16} className="text-slate-500" />
              <a
                href={tenderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full truncate rounded-md border border-slate-200 px-3 py-1.5 text-left text-sm font-medium text-[#0F172A] hover:bg-slate-50"
                style={{ fontFamily: "Inter, sans-serif", lineHeight: "24px" }}
              >
                {tenderUrl}
              </a>
            </div>
          ) : (
            <span
              style={{
                color: "#0F172A",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                lineHeight: "24px",
                fontWeight: 500,
              }}
            >
              Not provided
            </span>
          )
        }
      />
      <Label
        title="Submission due date"
        value={
          <div className="flex flex-col">
            <span
              style={{
                color: "#0F172A",
                fontFamily: "Montserrat, sans-serif",
                fontSize: "16px",
                lineHeight: "28px",
                fontWeight: 400,
              }}
            >
              {dueDate}
            </span>
            {dueMeta && dueMeta !== "Date not set" ? (
              <span
                style={{
                  color: "#0AD6A1",
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "12px",
                  lineHeight: "16px",
                  fontWeight: 500,
                }}
              >
                {dueMeta}
              </span>
            ) : null}
          </div>
        }
      />
      <Label
        title="Response date"
        value={
          <span
            style={{
              color: "#0F172A",
              fontFamily: "Montserrat, sans-serif",
              fontSize: "16px",
              lineHeight: "28px",
              fontWeight: 400,
            }}
          >
            {responseDate}
          </span>
        }
      />
    </SectionCard>
  );
}

// NOTE: Files + FileItem + DocumentIcon are left as-is;
// if you decide to surface the "Support documents" card again,
// you can plug <Files attachments={attachments} /> into detailsContent.

function Files({ attachments }: { attachments: AttachmentMeta[] }) {
  return (
    <SectionCard title="Support documents" action={null}>
      <div className="flex flex-col gap-4 rounded-[16px] border border-[#EAECF0] bg-white p-6 shadow-sm">
        {attachments.length ? (
          <div className="flex flex-col gap-2">
            {attachments.map((file, index) => (
              <FileItem
                key={`${file.name}-${file.size}-${index}`}
                file={file}
                index={index}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6B6B6A]">
            No supporting documents uploaded yet.
          </p>
        )}

        <DocumentDropzone hint="Upload supporting documents (PDF, DOCX, XLSX up to 20MB)" />
      </div>
    </SectionCard>
  );
}

function FileItem({ file, index }: { file: AttachmentMeta; index: number }) {
  const sizeLabel = formatFileSize(file.size);

  return (
    <div className="flex items-center justify-between gap-4 rounded-[12px] border border-[#EAECF0] bg-white p-4">
      <div className="flex items-center gap-3">
        <DocumentIcon file={file} index={index} />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[#0D2352]">
            {file.name}
          </span>
          {sizeLabel ? (
            <span className="text-xs text-[#6B6B6A]">{sizeLabel}</span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[#0D2352]">
        <button
          className="rounded-full p-2 transition hover:bg-[#EEF3FF]"
          title="Download"
        >
          <StuIcon name={ICONS.download} size={16} />
        </button>
        <button
          className="rounded-full p-2 transition hover:bg-[#EEF3FF]"
          title="Open"
        >
          <StuIcon name={ICONS.external} size={16} />
        </button>
      </div>
    </div>
  );
}

function DocumentIcon({ file, index }: { file: AttachmentMeta; index: number }) {
  const type = getFileType(file);

  if (type === "pdf") {
    return (
      <div
        className="flex h-[49px] w-[44px] flex-shrink-0 items-center justify-center rounded-[10px] text-xs font-semibold uppercase"
        style={{
          background:
            "linear-gradient(135deg, #D03954 0%, #C02A3C 45%, #FF7981 100%)",
          color: "#FFFFFF",
        }}
        aria-label="PDF document"
      >
        PDF
      </div>
    );
  }

  // SVG / JPG / PSD icons omitted for brevity from design – you already had them:
  // keep your existing implementations here if you want all three variants.

  if (type === "svg" || type === "jpg" || type === "psd") {
    // fall back to generic for now, or paste your full SVG variants back in
    return (
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[#EEF4FF]">
        <StuIcon name={ICONS.paperclip} size={16} className="text-[#5D5D5C]" />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[#EEF4FF]">
      <StuIcon name={ICONS.paperclip} size={16} className="text-[#5D5D5C]" />
    </div>
  );
}

function getFileType(file: AttachmentMeta) {
  const type = (file.type ?? "").toLowerCase();
  if (type.includes("pdf")) return "pdf";
  if (type.includes("svg")) return "svg";
  if (type.includes("jpg")) return "jpg";
  if (type.includes("psd")) return "psd";

  const extension = file.name?.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (extension === "svg") return "svg";
  if (extension === "jpg") return "jpg";
  if (extension === "psd") return "psd";

  return "generic";
}

function Badge({
  children,
  variant = "slate",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
}) {
  const styles: Record<BadgeVariant, string> = {
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    green: "bg-green-50 text-green-700 ring-green-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    purple: "bg-purple-50 text-purple-700 ring-purple-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium ring-1 ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const actionNode = action === undefined ? <EditButton /> : action;

  return (
    <section className="px-1 py-1">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[#0D2352]">{title}</h2>
        {actionNode ? actionNode : null}
      </div>
      {children}
    </section>
  );
}

function EditButton({ label = "Edit" }: { label?: string }) {
  return (
    <button className="flex w-[79px] items-center justify-center gap-2 rounded-[6px] border border-[#999998] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] transition hover:bg-[#F4F2EC]">
      {label}
    </button>
  );
}

function Label({
  title,
  value,
  grow,
}: {
  title: string;
  value?: React.ReactNode;
  grow?: boolean;
}) {
  if (grow) {
    return (
      <div className="space-y-2 border-b border-[#E7E5DF] py-4 last:border-0">
        <div className="text-sm font-semibold text-[#2F6F7C]">{title}</div>
        <div className="text-sm text-[#1F2933]">{value ?? "—"}</div>
      </div>
    );
  }

  return (
    <div className="grid items-center gap-3 border-b border-[#E7E5DF] py-4 last:border-0 md:grid-cols-[220px_minmax(0,1fr)]">
      <div className="text-sm font-semibold text-[#2F6F7C]">{title}</div>
      <div className="text-sm text-[#1F2933]">{value ?? "—"}</div>
    </div>
  );
}

function mapStatusToBadgeVariant(status: string): BadgeVariant {
  const value = status.trim().toLowerCase();

  if (value.includes("set-up") || value.includes("setup")) return "purple";
  if (value.includes("progress")) return "blue";
  if (value.includes("submit")) return "blue";
  if (value.includes("unsuccess")) return "amber";
  if (value.includes("success")) return "green";
  return "slate";
}

const ICONS = {
  alert: "alert" as StuIconName,
  link: "link" as StuIconName,
  download: "download" as StuIconName,
  external: "external-link" as StuIconName,
  paperclip: "paperclip" as StuIconName,
};
