import AppShell from "@/components/layout/AppShell";
import { StuIcon, type StuIconName } from "@/components/icons/StuIcon";
import EditableTextSection from "@/components/tenders/EditableTextSection";
import { DocumentDropzone } from "@/components/tenders/DocumentDropzone";
import ActivityLogSection from "@/components/tenders/ActivityLogSection";
import type { ActivityEvent } from "@/components/tenders/ActivityLogSection";
import SubmittedDocumentsTab, { SubmittedDocument } from "@/components/tenders/SubmittedDocumentsTab";
import { TenderTabs } from "@/components/tenders/TenderTabs";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const parts = name.trim().split(/\s+/).filter(Boolean);
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
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "tender-documents";
 
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
        const { data, error } = await storageClient
          .storage
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

  const diffDays = Math.round((comparison.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Due today";
  if (diffDays > 0) return `Due in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"}`;
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
}: {
  params: Promise<{ tenderId: string }> | { tenderId: string };
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
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sanitizedId);
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
            "id, tender_id, title, status, assigned_to_name, submission_due_date, due_date, response_date, start_date, tender_value, tender_url, private_client, authority_client, client_display, reference_number, notes, background, description, attachments_meta, created_at",
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

  let changeLogs: {
    id: string;
    field: "background" | "description";
    previousValue: string | null;
    newValue: string | null;
    changedBy: string | null;
    changedById: string | null;
    changedAt: string;
  }[] = [];

  if (tender) {
    const { data: logData, error: logsError } = await supabase
      .from("tender_change_logs")
      .select("id, field, previous_value, new_value, changed_by, changed_by_id, changed_at")
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
        .select("id, created_at, note, status_snapshot, type, author_name, author_initials")
        .eq("tender_id", tenderActivityRef)
        .order("created_at", { ascending: false });

      if (activityError) {
        console.error("Tender activity fetch error", activityError.message);
      } else if (activityData) {
        activityEvents = activityData.map((row) => {
          const actorName = (row.author_name ?? "Team member").trim() || "Team member";
          const initials = (row.author_initials ?? computeInitials(actorName)).trim() || computeInitials(actorName);
          return {
            id: row.id,
            at: row.created_at ?? new Date().toISOString(),
            actor: {
              name: actorName,
              initials,
            },
            type: (row.type ?? "note") as ActivityEvent["type"],
            summary: (row.note ?? "").trim() || "Activity recorded",
            meta: row.status_snapshot ? `Status recorded: ${row.status_snapshot}` : undefined,
          } satisfies ActivityEvent;
        });
      }
    } catch (error) {
      console.error("Tender activity fetch threw", error);
    }
  }
  const attachments = activeTender.attachments_meta ?? [];
  const submittedDocuments: SubmittedDocument[] = attachments.map((file, index) => {
    const sizeLabel = formatFileSize(file.size) ?? "-";
    const uploadedAt = activeTender.created_at ?? new Date().toISOString();
    const uploadedBy = activeTender.assigned_to_name || fullName || "Team member";

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
  });

  const documentsWithSignedUrls = await enrichWithSignedUrls(submittedDocuments);
  const detailsContent = (
    <div className="space-y-8">
      {usingFallback || fetchError ? <InlineFallbackAlert reason={fetchError} /> : null}

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

  return (
    <AppShell userDisplayName={fullName} fullWidth>
      <div className="flex w-full min-h-[calc(100vh-5rem)] justify-center bg-[#ECECEC]">
        <div className="flex w-full flex-col">
          <TopBanner
            title={activeTender.title || "Untitled tender"}
            status={displayStatus}
            client={clientLabel}
            statusVariant={statusVariant}
            tenderId={activeTender.tender_id || "Not set"}
            reference={activeTender.reference_number || "—"}
            createdAt={formatDate(activeTender.created_at)}
            assignedTo={activeTender.assigned_to_name || "Unassigned"}
            dueDate={formatDate(activeTender.submission_due_date)}
            dueMeta={dueMeta}
          />

          <main className="mx-auto my-6 w-full max-w-6xl px-6">
            <TenderTabs details={detailsContent} documents={documentsContent} activity={activityContent} />
          </main>
        </div>
      </div>
    </AppShell>
  );
}

function InlineFallbackAlert({ reason }: { reason?: string | null }) {
  return (
    <div className="rounded-[18px] border border-[#F6D79B] bg-[#FFF8E6] px-5 py-3 text-sm text-[#8C5E0A]">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <StuIcon name={ICONS.alert} size={16} />
          <span>We couldn&apos;t load the live data for this tender. Showing a placeholder view.</span>
        </div>
        {reason ? <span className="pl-7 text-xs text-[#6B4D0A]">Details: {reason}</span> : null}
      </div>
    </div>
  );
}

function TopBanner({
  title,
  status,
  statusVariant,
  client,
  tenderId,
  reference,
  createdAt,
  assignedTo,
  dueDate,
  dueMeta,
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
}) {
  return (
    <div className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-5">
        <Link
          href="/tenders"
          className="mb-4 inline-flex items-center gap-2 text-black transition hover:underline"
          style={{ fontFamily: "Montserrat, sans-serif", fontSize: "14px", fontWeight: 600, lineHeight: "24px" }}
        >
          <span className="inline-flex h-6 w-6 items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 19L5 12L12 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Back to Tenders
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1
            className="font-bold text-black"
            style={{ fontFamily: "Montserrat, sans-serif", fontSize: "40px", lineHeight: "48px" }}
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
        <div
          className="mt-2 self-stretch text-[#61828D]"
          style={{ fontFamily: "Poppins, sans-serif", fontSize: "20px", fontWeight: 600, lineHeight: "28px" }}
        >
          {client}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-5">
          <MetaItem label="Tender ID" value={tenderId} />
          <MetaItem label="Reference number" value={reference} />
          <MetaItem label="Created" value={createdAt} />
          <MetaItem label="Assigned to" value={assignedTo} />
          <MetaItem label="Submission due date" value={dueDate} helper={dueMeta} />
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="flex flex-col self-stretch">
      <span
        className="text-[#61828D]"
        style={{ fontFamily: "Poppins, sans-serif", fontSize: "16px", lineHeight: "16px", fontWeight: 700 }}
      >
        {label}
      </span>
      <div
        className="mt-1 text-[#0F172A]"
        style={{ fontFamily: "Poppins, sans-serif", fontSize: "16px", lineHeight: "28px", fontWeight: 400 }}
      >
        {value || "—"}
      </div>
      {helper && helper !== "Date not set" ? (
        <div className="text-xs font-medium text-emerald-600">{helper}</div>
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
      <Label title="Tender ID" value={<span className="font-semibold text-[#0D2352]">{tenderId}</span>} />
      <Label title="Tender value" value={<span className="block" style={{ width: "121px", height: "24px", color: "#0F172A", fontFamily: "Montserrat, sans-serif", fontSize: "16px", lineHeight: "28px", fontWeight: 400 }}>{tenderValue}</span>} />
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
            <span style={{ color: "#0F172A", fontFamily: "Inter, sans-serif", fontSize: "14px", lineHeight: "24px", fontWeight: 500 }}>
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
      <Label title="Response date" value={<span style={{ color: "#0F172A", fontFamily: "Montserrat, sans-serif", fontSize: "16px", lineHeight: "28px", fontWeight: 400 }}>{responseDate}</span>} />
    </SectionCard>
  );
}

function Files({ attachments }: { attachments: AttachmentMeta[] }) {

  return (

    <SectionCard title="Support documents" action={null}>

      <div className="flex flex-col gap-4 rounded-[16px] border border-[#EAECF0] bg-white p-6 shadow-sm">

        {attachments.length ? (

          <div className="flex flex-col gap-2">

            {attachments.map((file, index) => (

              <FileItem key={`${file.name}-${file.size}-${index}`} file={file} index={index} />

            ))}

          </div>

        ) : (

          <p className="text-sm text-[#6B6B6A]">No supporting documents uploaded yet.</p>

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

          <span className="text-sm font-medium text-[#0D2352]">{file.name}</span>

          {sizeLabel ? <span className="text-xs text-[#6B6B6A]">{sizeLabel}</span> : null}

        </div>

      </div>

      <div className="flex items-center gap-2 text-[#0D2352]">

        <button className="rounded-full p-2 transition hover:bg-[#EEF3FF]" title="Download">

          <StuIcon name={ICONS.download} size={16} />

        </button>

        <button className="rounded-full p-2 transition hover:bg-[#EEF3FF]" title="Open">

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
          background: "linear-gradient(135deg, #D03954 0%, #C02A3C 45%, #FF7981 100%)",
          color: "#FFFFFF",
        }}
        aria-label="PDF document"
      >
        PDF
      </div>
    );
  }

  if (type === "svg") {
    const gradientMain = `doc-svg-gradient-main-${index}`;
    const gradientFold = `doc-svg-gradient-fold-${index}`;
    const filterShadow = `doc-svg-filter-shadow-${index}`;
    return (
      <div className="flex h-[49px] w-[43px] flex-shrink-0 items-center justify-center" aria-label="SVG document">
        <svg xmlns="http://www.w3.org/2000/svg" width="43" height="49" viewBox="0 0 43 49" fill="none" role="img">
          <path d="M39.5221 49H3.47794C1.55713 49 0 47.433 0 45.5V3.5C0 1.567 1.55713 0 3.47794 0H26.875L43 16.2273V45.5C43 47.433 41.4429 49 39.5221 49Z" fill={`url(#${gradientMain})`} />
          <g filter={`url(#${filterShadow})`}>
            <path d="M7.58838 23.7046H35.7281V37.0682H7.58838V23.7046Z" fill="#CC1583" fillOpacity="0.15" style={{ mixBlendMode: "darken" }} />
          </g>
          <path d="M31.0169 34.6485C30.1594 34.6485 29.3975 34.4599 28.7314 34.0829C28.0654 33.6975 27.5492 33.1654 27.1828 32.4867C26.8165 31.7997 26.6333 31.0205 26.6333 30.1491C26.6333 29.2609 26.8248 28.4733 27.2078 27.7862C27.5908 27.0992 28.1112 26.5671 28.7689 26.1901C29.435 25.813 30.1718 25.6245 30.9795 25.6245C31.6289 25.6245 32.1951 25.7041 32.678 25.8633C33.1692 26.0225 33.6396 26.2445 34.0892 26.5294C34.1558 26.5629 34.2141 26.6216 34.2641 26.7054C34.314 26.7892 34.339 26.8813 34.339 26.9819C34.339 27.1243 34.289 27.2458 34.1891 27.3464C34.0975 27.4469 33.9727 27.4972 33.8145 27.4972C33.7229 27.4972 33.6355 27.4762 33.5522 27.4343C33.1609 27.1997 32.7695 27.0238 32.3782 26.9065C31.9869 26.7892 31.5623 26.7305 31.1044 26.7305C30.4716 26.7305 29.9012 26.8646 29.3934 27.1327C28.8855 27.4008 28.4858 27.7946 28.1944 28.3141C27.9113 28.8252 27.7698 29.4369 27.7698 30.1491C27.7698 30.8026 27.903 31.3891 28.1694 31.9086C28.4442 32.4197 28.8355 32.8261 29.3434 33.1277C29.8596 33.421 30.4674 33.5676 31.1668 33.5676C31.9494 33.5676 32.678 33.3833 33.3524 33.0146V30.7398H31.2917C31.1501 30.7398 31.0294 30.6895 30.9295 30.5889C30.8296 30.4884 30.7796 30.3669 30.7796 30.2245C30.7796 30.082 30.8296 29.9605 30.9295 29.86C31.0294 29.7594 31.1501 29.7092 31.2917 29.7092H33.752C33.9185 29.7092 34.0601 29.7678 34.1766 29.8851C34.2932 30.0024 34.3515 30.1449 34.3515 30.3124V33.1654C34.3515 33.3414 34.3057 33.5006 34.2141 33.643C34.1308 33.7771 34.0184 33.8776 33.8769 33.9446C32.9444 34.4139 31.9911 34.6485 31.0169 34.6485Z" fill="white" />
          <path d="M20.7554 34.5858C20.4141 34.5858 20.156 34.3931 19.9811 34.0076L16.8964 26.4793C16.8714 26.4123 16.8589 26.341 16.8589 26.2656C16.8589 26.0897 16.9088 25.9514 17.0088 25.8509C17.1087 25.742 17.246 25.6875 17.4209 25.6875C17.5375 25.6875 17.6415 25.7252 17.7331 25.8006C17.833 25.8676 17.908 25.9598 17.9579 26.0771L20.8928 33.4421L23.8277 26.0771C23.8777 25.9598 23.9485 25.8676 24.04 25.8006C24.14 25.7252 24.2482 25.6875 24.3648 25.6875C24.5396 25.6875 24.677 25.742 24.7769 25.8509C24.8768 25.9514 24.9268 26.0897 24.9268 26.2656C24.9268 26.341 24.9143 26.4123 24.8893 26.4793L21.8045 34.0076C21.6297 34.3931 21.3716 34.5858 21.0302 34.5858H20.7554Z" fill="white" />
          <path d="M12.0213 34.6485C10.9639 34.6485 9.97309 34.4474 9.04891 34.0452C8.949 34.0033 8.86574 33.9363 8.79913 33.8441C8.73252 33.7436 8.69922 33.6388 8.69922 33.5299C8.69922 33.3875 8.74501 33.266 8.8366 33.1654C8.93651 33.0565 9.0614 33.002 9.21127 33.002C9.29453 33.002 9.37362 33.0188 9.44856 33.0523C10.2145 33.3958 11.0347 33.5676 11.9089 33.5676C13.3659 33.5676 14.0945 33.0858 14.0945 32.1223C14.0945 31.8709 13.9987 31.6614 13.8072 31.4939C13.624 31.3263 13.3951 31.1964 13.1203 31.1042C12.8456 31.0037 12.4542 30.8864 11.9464 30.7523C11.2719 30.5764 10.7266 30.4088 10.3103 30.2496C9.894 30.082 9.53598 29.8349 9.23624 29.5081C8.93651 29.1813 8.78664 28.7456 8.78664 28.201C8.78664 27.7234 8.91153 27.2919 9.16131 26.9065C9.41109 26.5127 9.77743 26.2026 10.2603 25.9764C10.7516 25.7418 11.3386 25.6245 12.0213 25.6245C12.9371 25.6245 13.7656 25.7628 14.5066 26.0393C14.7397 26.123 14.8563 26.2906 14.8563 26.542C14.8563 26.676 14.8105 26.7975 14.7189 26.9065C14.6273 27.0154 14.5066 27.0699 14.3567 27.0699C14.3068 27.0699 14.2402 27.0531 14.1569 27.0196C13.5075 26.7934 12.8372 26.6802 12.1462 26.6802C11.4884 26.6802 10.9514 26.8059 10.5351 27.0573C10.1271 27.3086 9.92314 27.6606 9.92314 28.113C9.92314 28.4146 10.0189 28.6618 10.2104 28.8545C10.4102 29.0389 10.6558 29.1855 10.9472 29.2944C11.247 29.395 11.6508 29.5039 12.1587 29.6212C12.8164 29.7804 13.3451 29.9396 13.7448 30.0988C14.1527 30.258 14.4983 30.5052 14.7813 30.8403C15.0728 31.1755 15.2185 31.6279 15.2185 32.1977C15.2185 32.6669 15.0852 33.09 14.8188 33.4671C14.5524 33.8357 14.1777 34.1248 13.6948 34.3343C13.2119 34.5437 12.6541 34.6485 12.0213 34.6485Z" fill="white" />
          <g filter={`url(#${filterShadow})`}>
            <path d="M43 16.2273H30.3529C28.4321 16.2273 26.875 14.6603 26.875 12.7273V0L43 16.2273Z" fill={`url(#${gradientFold})`} />
          </g>
          <defs>
            <filter id={filterShadow} x="3.875" y="-24" width="66.125" height="66.2271" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dx="2" dy="1" />
              <feGaussianBlur stdDeviation="12.5" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.33 0" />
              <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
            </filter>
            <linearGradient id={gradientMain} x1="21.5" y1="0" x2="21.5" y2="49" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF6AC3" />
              <stop offset="1" stopColor="#DD3C9C" />
            </linearGradient>
            <linearGradient id={gradientFold} x1="30.432" y1="-5.09091" x2="34.9923" y2="16.2155" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F171BE" />
              <stop offset="1" stopColor="#D823D1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (type === "jpg") {
    const gradientMain = `doc-jpg-gradient-main-${index}`;
    const gradientFold = `doc-jpg-gradient-fold-${index}`;
    const filterShadow = `doc-jpg-filter-shadow-${index}`;
    return (
      <div className="flex h-[49px] w-[43px] flex-shrink-0 items-center justify-center" aria-label="JPG document">
        <svg xmlns="http://www.w3.org/2000/svg" width="43" height="49" viewBox="0 0 43 49" fill="none" role="img">
          <path d="M39.5221 49H3.47794C1.55713 49 0 47.433 0 45.5V3.5C0 1.567 1.55713 0 3.47794 0H26.875L43 16.2273V45.5C43 47.433 41.4429 49 39.5221 49Z" fill={`url(#${gradientMain})`} />
          <g opacity="0.51" filter={`url(#${filterShadow})`}>
            <path d="M7.58838 23.7046H35.7281V37.0682H7.58838V23.7046Z" fill="#E33CC8" style={{ mixBlendMode: "darken" }} />
          </g>
          <path d="M29.0902 34.6485C28.2326 34.6485 27.4708 34.4599 26.8047 34.0829C26.1386 33.6975 25.6224 33.1654 25.2561 32.4867C24.8897 31.7997 24.7065 31.0205 24.7065 30.1491C24.7065 29.2609 24.898 28.4733 25.281 27.7862C25.664 27.0992 26.1844 26.5671 26.8422 26.1901C27.5082 25.813 28.2451 25.6245 29.0527 25.6245C29.7021 25.6245 30.2683 25.7041 30.7512 25.8633C31.2424 26.0225 31.7129 26.2445 32.1625 26.5294C32.2291 26.5629 32.2873 26.6216 32.3373 26.7054C32.3873 26.7892 32.4122 26.8813 32.4122 26.9819C32.4122 27.1243 32.3623 27.2458 32.2624 27.3464C32.1708 27.4469 32.0459 27.4972 31.8877 27.4972C31.7961 27.4972 31.7087 27.4762 31.6254 27.4343C31.2341 27.1997 30.8428 27.0238 30.4515 26.9065C30.0601 26.7892 29.6355 26.7305 29.1776 26.7305C28.5448 26.7305 27.9745 26.8646 27.4666 27.1327C26.9587 27.4008 26.5591 27.7946 26.2677 28.3141C25.9846 28.8252 25.843 29.4369 25.843 30.1491C25.843 30.8026 25.9763 31.3891 26.2427 31.9086C26.5174 32.4197 26.9088 32.8261 27.4166 33.1277C27.9329 33.421 28.5407 33.5676 29.24 33.5676C30.0227 33.5676 30.7512 33.3833 31.4256 33.0146V30.7398H29.3649C29.2234 30.7398 29.1027 30.6895 29.0027 30.5889C28.9028 30.4884 28.8529 30.3669 28.8529 30.2245C28.8529 30.082 28.9028 29.9605 29.0027 29.86C29.1027 29.7594 29.2234 29.7092 29.3649 29.7092H31.8253C31.9918 29.7092 32.1333 29.7678 32.2499 29.8851C32.3664 30.0024 32.4247 30.1449 32.4247 30.3124V33.1654C32.4247 33.3414 32.3789 33.5006 32.2873 33.643C32.2041 33.7771 32.0917 33.8776 31.9501 33.9446C31.0176 34.4139 30.0643 34.6485 29.0902 34.6485Z" fill="white" />
          <path d="M16.5278 34.5854C16.3696 34.5854 16.2364 34.531 16.1282 34.422C16.0199 34.3131 15.9658 34.1791 15.9658 34.0199V26.3281C15.9658 26.1689 16.0199 26.0349 16.1282 25.926C16.2364 25.8087 16.3696 25.75 16.5278 25.75H19.3753C20.1663 25.75 20.8115 25.8841 21.3111 26.1522C21.8107 26.4203 22.1687 26.7638 22.3852 27.1828C22.6016 27.6017 22.7099 28.0542 22.7099 28.5401C22.7099 29.0261 22.6016 29.4786 22.3852 29.8975C22.1687 30.3164 21.8107 30.66 21.3111 30.9281C20.8115 31.1962 20.1663 31.3303 19.3753 31.3303H17.1023V34.0199C17.1023 34.1791 17.044 34.3131 16.9275 34.422C16.8192 34.531 16.686 34.5854 16.5278 34.5854ZM19.2629 30.2494C20.1122 30.2494 20.7075 30.086 21.0488 29.7592C21.3985 29.4325 21.5734 29.0261 21.5734 28.5401C21.5734 28.0542 21.3985 27.6478 21.0488 27.321C20.7075 26.9942 20.1122 26.8309 19.2629 26.8309H17.1023V30.2494H19.2629Z" fill="white" />
          <path d="M10.1609 34.6486C9.55309 34.6486 8.99941 34.5062 8.49986 34.2213C8.31668 34.1124 8.2251 33.9574 8.2251 33.7563C8.2251 33.6222 8.26673 33.5049 8.34999 33.4044C8.44157 33.2954 8.55814 33.241 8.69968 33.241C8.78294 33.241 8.85787 33.2577 8.92448 33.2913C9.30748 33.4756 9.69463 33.5678 10.086 33.5678C10.5356 33.5678 10.8977 33.4379 11.1725 33.1781C11.4556 32.9184 11.5971 32.4282 11.5971 31.7077V26.2656C11.5971 26.1064 11.6512 25.9724 11.7595 25.8635C11.8677 25.7462 12.0009 25.6875 12.1591 25.6875C12.3173 25.6875 12.4505 25.7462 12.5588 25.8635C12.6753 25.9724 12.7336 26.1064 12.7336 26.2656V31.6322C12.7336 32.7299 12.488 33.5091 11.9968 33.9699C11.5139 34.4224 10.9019 34.6486 10.1609 34.6486Z" fill="white" />
          <g filter={`url(#${filterShadow})`}>
            <path d="M43 16.2273H30.3529C28.4321 16.2273 26.875 14.6603 26.875 12.7273V0L43 16.2273Z" fill={`url(#${gradientFold})`} />
          </g>
          <defs>
            <filter id={filterShadow} x="3.875" y="-24" width="66.125" height="66.2271" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dx="2" dy="1" />
              <feGaussianBlur stdDeviation="12.5" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.33 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
            </filter>
            <linearGradient id={gradientMain} x1="21.5" y1="0" x2="21.5" y2="49" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7371F1" />
              <stop offset="1" stopColor="#504DE8" />
            </linearGradient>
            <linearGradient id={gradientFold} x1="21.5" y1="0" x2="21.5" y2="16.2273" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9391FC" />
              <stop offset="1" stopColor="#5B59EF" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (type === "psd") {
    const gradientMain = `doc-psd-gradient-main-${index}`;
    const gradientFold = `doc-psd-gradient-fold-${index}`;
    const filterShadow = `doc-psd-filter-shadow-${index}`;
    return (
      <div className="flex h-[49px] w-[43px] flex-shrink-0 items-center justify-center" aria-label="PSD document">
        <svg xmlns="http://www.w3.org/2000/svg" width="43" height="49" viewBox="0 0 43 49" fill="none" role="img">
          <path d="M39.5221 49H3.47794C1.55713 49 0 47.433 0 45.5V3.5C0 1.567 1.55713 0 3.47794 0H26.875L43 16.2273V45.5C43 47.433 41.4429 49 39.5221 49Z" fill={`url(#${gradientMain})`} />
          <path d="M29.0902 34.6485C28.2326 34.6485 27.4708 34.4599 26.8047 34.0829C26.1386 33.6975 25.6224 33.1654 25.2561 32.4867C24.8897 31.7997 24.7065 31.0205 24.7065 30.1491C24.7065 29.2609 24.898 28.4733 25.281 27.7862C25.664 27.0992 26.1844 26.5671 26.8422 26.1901C27.5082 25.813 28.2451 25.6245 29.0527 25.6245C29.7021 25.6245 30.2683 25.7041 30.7512 25.8633C31.2424 26.0225 31.7129 26.2445 32.1625 26.5294C32.2291 26.5629 32.2873 26.6216 32.3373 26.7054C32.3873 26.7892 32.4122 26.8813 32.4122 26.9819C32.4122 27.1243 32.3623 27.2458 32.2624 27.3464C32.1708 27.4469 32.0459 27.4972 31.8877 27.4972C31.7961 27.4972 31.7087 27.4762 31.6254 27.4343C31.2341 27.1997 30.8428 27.0238 30.4515 26.9065C30.0601 26.7892 29.6355 26.7305 29.1776 26.7305C28.5448 26.7305 27.9745 26.8646 27.4666 27.1327C26.9587 27.4008 26.5591 27.7946 26.2677 28.3141C25.9846 28.8252 25.843 29.4369 25.843 30.1491C25.843 30.8026 25.9763 31.3891 26.2427 31.9086C26.5174 32.4197 26.9088 32.8261 27.4166 33.1277C27.9329 33.421 28.5407 33.5676 29.24 33.5676C30.0227 33.5676 30.7512 33.3833 31.4256 33.0146V30.7398H29.3649C29.2234 30.7398 29.1027 30.6895 29.0027 30.5889C28.9028 30.4884 28.8529 30.3669 28.8529 30.2245C28.8529 30.082 28.9028 29.9605 29.0027 29.86C29.1027 29.7594 29.2234 29.7092 29.3649 29.7092H31.8253C31.9918 29.7092 32.1333 29.7678 32.2499 29.8851C32.3664 30.0024 32.4247 30.1449 32.4247 30.3124V33.1654C32.4247 33.3414 32.3789 33.5006 32.2873 33.643C32.2041 33.7771 32.0917 33.8776 31.9501 33.9446C31.0176 34.4139 30.0643 34.6485 29.0902 34.6485Z" fill="white" />
          <path d="M16.5278 34.5854C16.3696 34.5854 16.2364 34.531 16.1282 34.422C16.0199 34.3131 15.9658 34.1791 15.9658 34.0199V26.3281C15.9658 26.1689 16.0199 26.0349 16.1282 25.926C16.2364 25.8087 16.3696 25.75 16.5278 25.75H19.3753C20.1663 25.75 20.8115 25.8841 21.3111 26.1522C21.8107 26.4203 22.1687 26.7638 22.3852 27.1828C22.6016 27.6017 22.7099 28.0542 22.7099 28.5401C22.7099 29.0261 22.6016 29.4786 22.3852 29.8975C22.1687 30.3164 21.8107 30.66 21.3111 30.9281C20.8115 31.1962 20.1663 31.3303 19.3753 31.3303H17.1023V34.0199C17.1023 34.1791 17.044 34.3131 16.9275 34.422C16.8192 34.531 16.686 34.5854 16.5278 34.5854ZM19.2629 30.2494C20.1122 30.2494 20.7075 30.086 21.0488 29.7592C21.3985 29.4325 21.5734 29.0261 21.5734 28.5401C21.5734 28.0542 21.3985 27.6478 21.0488 27.321C20.7075 26.9942 20.1122 26.8309 19.2629 26.8309H17.1023V30.2494H19.2629Z" fill="white" />
          <path d="M10.1609 34.6486C9.55309 34.6486 8.99941 34.5062 8.49986 34.2213C8.31668 34.1124 8.2251 33.9574 8.2251 33.7563C8.2251 33.6222 8.26673 33.5049 8.34999 33.4044C8.44157 33.2954 8.55814 33.241 8.69968 33.241C8.78294 33.241 8.85787 33.2577 8.92448 33.2913C9.30748 33.4756 9.69463 33.5678 10.086 33.5678C10.5356 33.5678 10.8977 33.4379 11.1725 33.1781C11.4556 32.9184 11.5971 32.4282 11.5971 31.7077V26.2656C11.5971 26.1064 11.6512 25.9724 11.7595 25.8635C11.8677 25.7462 12.0009 25.6875 12.1591 25.6875C12.3173 25.6875 12.4505 25.7462 12.5588 25.8635C12.6753 25.9724 12.7336 26.1064 12.7336 26.2656V31.6322C12.7336 32.7299 12.488 33.5091 11.9968 33.9699C11.5139 34.4224 10.9019 34.6486 10.1609 34.6486Z" fill="white" />
          <g filter={`url(#${filterShadow})`}>
            <path d="M43 16.2273H30.3529C28.4321 16.2273 26.875 14.6603 26.875 12.7273V0L43 16.2273Z" fill={`url(#${gradientFold})`} />
          </g>
          <defs>
            <filter id={filterShadow} x="3.875" y="-24" width="66.125" height="66.2271" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dx="2" dy="1" />
              <feGaussianBlur stdDeviation="12.5" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.33 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
            </filter>
            <linearGradient id={gradientMain} x1="21.5" y1="0" x2="21.5" y2="49" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7371F1" />
              <stop offset="1" stopColor="#504DE8" />
            </linearGradient>
            <linearGradient id={gradientFold} x1="21.5" y1="0" x2="21.5" y2="16.2273" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9391FC" />
              <stop offset="1" stopColor="#5B59EF" />
            </linearGradient>
          </defs>
        </svg>
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

function Badge({ children, variant = "slate" }: { children: React.ReactNode; variant?: BadgeVariant }) {
  const styles: Record<BadgeVariant, string> = {
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    green: "bg-green-50 text-green-700 ring-green-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    purple: "bg-purple-50 text-purple-700 ring-purple-200",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium ring-1 ${styles[variant]}`}>
      {children}
    </span>
  );
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {

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
    <button
      className="flex w-[79px] items-center justify-center gap-2 rounded-[6px] border border-[#999998] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] transition hover:bg-[#F4F2EC]"
    >
      {label}
    </button>
  );
}

function Label({ title, value, grow }: { title: string; value?: React.ReactNode; grow?: boolean }) {
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




