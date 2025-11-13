"use client";

import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// Submitted Documents table component
export type SubmittedDocument = {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string; // ISO date
  uploadedBy: string;
  summary?: string | null;
  tags?: string[];
  content?: string | null;
  downloadUrl?: string | null;
};

type SubmittedDocumentsTabProps = {
  documents: SubmittedDocument[];
  tenderRecordId?: string | null;
  tenderSlug?: string | null;
  currentUserName?: string | null;
};

type SortKey = "uploadedAt" | "title" | "uploadedBy" | "fileSize";

export default function SubmittedDocumentsTab({ documents, tenderRecordId, tenderSlug, currentUserName }: SubmittedDocumentsTabProps) {
  const router = useRouter();
  const [docs, setDocs] = useState(documents);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const defaultSortDirection: Record<SortKey, "asc" | "desc"> = {
    title: "asc",
    uploadedAt: "desc",
    uploadedBy: "asc",
    fileSize: "asc",
  };

  const [sortKey, setSortKey] = useState<SortKey>("uploadedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection.uploadedAt);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDocs(documents);
    setUploadError(null);
  }, [documents]);

  const normalizedQuery = query.trim().toLowerCase();
  const canUpload = Boolean(tenderRecordId && tenderSlug);

  const handleUpload = async (files: File[]) => {
    if (!files.length || !canUpload || !tenderRecordId) {
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const endpointParam = encodeURIComponent(tenderSlug ?? tenderRecordId);
      const formData = new FormData();
      formData.append("tenderRecordId", tenderRecordId);
      formData.append("tenderSlug", tenderSlug ?? "");
      formData.append("currentUserName", currentUserName ?? "");
      files.forEach((file) => formData.append("files", file));

      const response = await fetch(`/api/tenders/${endpointParam}/documents`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        let message = "We couldn't upload one or more files. Please try again.";
        try {
          const payload = await response.json();
          if (payload?.message) {
            message = String(payload.message);
          }
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(message);
      }

      const payload = (await response.json()) as { documents?: SubmittedDocument[] };
      const uploadedDocuments = Array.isArray(payload?.documents) ? payload.documents : [];
      if (uploadedDocuments.length) {
        setDocs((previous) => [...uploadedDocuments, ...previous]);
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to upload documents", error);
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "We couldn't upload one or more files. Please try again.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };
  const filteredDocuments = useMemo(() => {
    const sorted = [...docs].sort((a, b) => {
      const compareStrings = (first: string | undefined | null, second: string | undefined | null) => {
        return (first ?? "").localeCompare(second ?? "", undefined, { sensitivity: "base", numeric: true });
      };

      const compareNumbers = (first: number, second: number) => first - second;

      let result = 0;

      switch (sortKey) {
        case "title":
          result = compareStrings(a.title, b.title);
          break;
        case "uploadedAt":
          result = compareNumbers(new Date(a.uploadedAt).getTime(), new Date(b.uploadedAt).getTime());
          break;
        case "uploadedBy":
          result = compareStrings(a.uploadedBy, b.uploadedBy);
          break;
        case "fileSize":
          result = compareNumbers(parseFileSize(a.fileSize), parseFileSize(b.fileSize));
          break;
        default:
          result = compareStrings(a.title, b.title);
      }

      return sortDirection === "asc" ? result : -result;
    });

    if (!normalizedQuery) return sorted;

    return sorted.filter((doc) => {
      const haystack = [
        doc.title,
        doc.fileName,
        doc.summary ?? "",
        doc.content ?? "",
        ...(doc.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [docs, normalizedQuery, sortKey, sortDirection]);

  const emptyMessage = documents.length
    ? `No documents match "${query}".`
    : "No documents have been uploaded yet.";

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(defaultSortDirection[key]);
    }
  };

  return (
    <div className="flex max-w-[1144px] flex-col gap-9 rounded-br-[16px] rounded-bl-[16px] border border-[#D0D0D0] border-t-0 bg-white px-0 py-7">
      {/* Controls */}
      <header className="flex flex-col gap-3 px-7 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-sm">
          <label className="flex h-[46px] w-full items-center gap-3 rounded-[12px] border border-[#B8B8B7] bg-[#EAEAE9] px-4">
            <SearchIcon />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              className="w-full border-0 bg-transparent text-[16px] text-[#5A5A59] placeholder:text-[#5A5A59] focus:outline-none"
              placeholder="Search submitted documents"
            />
          </label>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1 rounded-[4px] border border-[#D0D0D0] bg-white px-4 py-2 text-sm font-semibold text-[#0D2352] transition hover:bg-[#F5F5F5]"
          >
            <FilterIcon />
            <span>Filter</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1 rounded-[4px] bg-[#1890FF] px-4 py-2 text-[16px] font-normal leading-[28px] text-white transition hover:bg-[#1475D1] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ fontFamily: "Poppins, sans-serif" }}
            onClick={() => fileInputRef.current?.click()}
            disabled={!canUpload || isUploading}
            aria-busy={isUploading}
          >
            <AddDocumentIcon />
            <span className="text-center">{isUploading ? "Uploading..." : "Add new document"}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              const files = event.target.files ? Array.from(event.target.files) : [];
              if (files.length) {
                void handleUpload(files);
              }
              event.target.value = "";
            }}
          />
        </div>
        {uploadError ? <p className="text-sm text-red-600">{uploadError}</p> : null}
      </header>

      {/* Table */}
      <div className="mx-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Desktop */}
        <div className="hidden min-w-full md:block">
          <div className="flex items-start gap-9 border-y border-[#B8B8B7] bg-[#FBFBFB] px-5 py-3 text-sm font-semibold text-[#1F1F1F]">
            <HeaderCell
              label="Document name"
              widthClass="flex-1 min-w-0"
              active={sortKey === "title"}
              direction={sortKey === "title" ? sortDirection : "none"}
              onClick={() => handleSort("title")}
            />
            <HeaderCell
              label="Date uploaded"
              widthClass="w-[160px] flex-shrink-0"
              active={sortKey === "uploadedAt"}
              direction={sortKey === "uploadedAt" ? sortDirection : "none"}
              onClick={() => handleSort("uploadedAt")}
            />
            <HeaderCell
              label="File size"
              widthClass="w-[150px] flex-shrink-0"
              active={sortKey === "fileSize"}
              direction={sortKey === "fileSize" ? sortDirection : "none"}
              onClick={() => handleSort("fileSize")}
            />
            <HeaderCell
              label="Uploaded by"
              widthClass="w-[200px] flex-shrink-0"
              active={sortKey === "uploadedBy"}
              direction={sortKey === "uploadedBy" ? sortDirection : "none"}
              onClick={() => handleSort("uploadedBy")}
            />
          </div>

          {filteredDocuments.length ? (
            filteredDocuments.map((doc) => {
              const resolvedDownload = resolveDownloadUrl(doc.downloadUrl);
              return (
                <div
                  key={doc.id}
                  className="flex h-[68px] items-center gap-9 border-b border-[#B8B8B7] bg-white px-5 py-3 text-sm text-slate-700 hover:bg-[#F7F9FF]"
                >
                  <div className="flex flex-1 min-w-0 items-center gap-3">
                    <DocumentIcon fileName={doc.fileName} />
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900">{highlightText(doc.title, normalizedQuery)}</div>
                      <div className="text-xs text-slate-500">{doc.fileName}</div>
                    </div>
                  </div>
                  <div className="w-[160px] flex-shrink-0 text-slate-700">{formatDisplayDate(doc.uploadedAt)}</div>
                  <div className="w-[150px] flex-shrink-0 text-slate-700">{doc.fileSize || "-"}</div>
                  <div className="w-[200px] flex-shrink-0 text-slate-700">{doc.uploadedBy || "-"}</div>
                  <button
                    type="button"
                    className="ml-auto text-slate-600 transition hover:text-[#0D2352]"
                    aria-label={`Download ${doc.fileName}`}
                    onClick={() => {
                      if (resolvedDownload) {
                        const link = document.createElement("a");
                        link.href = resolvedDownload;
                        link.download = doc.fileName;
                        link.rel = "noopener noreferrer";
                        link.target = "_blank";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }}
                    disabled={!resolvedDownload}
                  >
                    <DownloadIcon disabled={!resolvedDownload} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-8 text-sm text-slate-500">{emptyMessage}</div>
          )}
        </div>

        {/* Mobile */}
        <div className="divide-y divide-slate-200 md:hidden">
          {filteredDocuments.length ? (
            filteredDocuments.map((doc) => {
              const resolvedDownload = resolveDownloadUrl(doc.downloadUrl);
              return (
                <div key={doc.id} className="space-y-2 px-4 py-4 text-sm text-slate-700">
                  <div className="flex items-start gap-3">
                    <DocumentIcon fileName={doc.fileName} width={30} />
                    <div>
                      <div className="font-medium text-slate-900">{highlightText(doc.title, normalizedQuery)}</div>
                      <div className="text-xs text-slate-500">{doc.fileName}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>{formatDisplayDate(doc.uploadedAt)}</span>
                    <span>{doc.fileSize || "-"}</span>
                    <span>{doc.uploadedBy || "-"}</span>
                  </div>
                  {resolvedDownload ? (
                    <button
                      type="button"
                      className="text-slate-600 transition hover:text-[#0D2352]"
                      aria-label={`Download ${doc.fileName}`}
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = resolvedDownload;
                        link.download = doc.fileName;
                        link.rel = "noopener noreferrer";
                        link.target = "_blank";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <DownloadIcon />
                    </button>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-6 text-sm text-slate-500">{emptyMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Utilities & Seed data
// ---------------------------------------------
function highlightText(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="rounded bg-[#0D2352]/10 px-0.5 text-[#0D2352]">
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatDisplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function parseFileSize(sizeLabel?: string) {
  if (!sizeLabel) return 0;
  const matchNumber = sizeLabel.match(/[\d.]+/);
  if (!matchNumber) return 0;
  const value = parseFloat(matchNumber[0]);
  if (Number.isNaN(value)) return 0;

  const unit = sizeLabel.toLowerCase();
  if (unit.includes("mb")) return value * 1024 * 1024;
  if (unit.includes("kb")) return value * 1024;
  if (unit.includes("gb")) return value * 1024 * 1024 * 1024;
  return value;
}

function formatByteSize(bytes: number) {
  if (!bytes || Number.isNaN(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  let size = bytes;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }

  return `${size % 1 === 0 ? size : size.toFixed(1)} ${units[index]}`;
}

type HeaderCellProps = {
  label: string;
  widthClass: string;
  active: boolean;
  direction: "asc" | "desc" | "none";
  onClick: () => void;
};

function HeaderCell({ label, widthClass, active, direction, onClick }: HeaderCellProps) {
  const textColor = active ? "text-[#0D2352]" : "text-[#5A5A59]";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${widthClass} inline-flex items-center gap-2 text-left ${textColor} transition hover:text-[#0D2352] focus:outline-none`}
    >
      <span>{label}</span>
      <SortIndicator direction={direction} />
    </button>
  );
}

function SortIndicator({ direction }: { direction: "asc" | "desc" | "none" }) {
  const topColor = direction === "asc" ? "#0D2352" : "#B8B8B7";
  const bottomColor = direction === "desc" ? "#0D2352" : "#B8B8B7";

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 5L10 7H6L8 5Z" fill={topColor} />
      <path d="M8 11L6 9H10L8 11Z" fill={bottomColor} />
    </svg>
  );
}

type DocumentIconProps = {
  fileName?: string;
  width?: number;
};

function DocumentIcon({ fileName, width = 36 }: DocumentIconProps) {
  const ext = (fileName ?? "").split(".").pop()?.toLowerCase() ?? "";
  const style = FILE_ICON_STYLES[ext] ?? FILE_ICON_STYLES.default;
  const label = (ext || "file").slice(0, 3).toUpperCase();
  const height = Math.round((width / 36) * 46);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 36 46"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 0H22L34 12V40C34 43.3137 31.3137 46 28 46H6C2.68629 46 0 43.3137 0 40V6C0 2.68629 2.68629 0 6 0Z"
        fill={style.main}
      />
      <path d="M22 0L34 12H24C22.8954 12 22 11.1046 22 10V0Z" fill={style.fold} />
      <text
        x="50%"
        y="32"
        textAnchor="middle"
        fontSize="11"
        fontFamily="'Poppins', 'Montserrat', sans-serif"
        fontWeight="600"
        fill="#FFFFFF"
      >
        {label}
      </text>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#5A5A59"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#5A5A59]"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="20" y1="20" x2="16.65" y2="16.65" />
    </svg>
  );
}

function AddDocumentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 8.75V15.25" />
      <path d="M8.75 12H15.25" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#5A5A59"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <line x1="4" y1="12" x2="12" y2="12" />
      <circle cx="16" cy="6" r="1.75" />
      <circle cx="8" cy="12" r="1.75" />
      <circle cx="12" cy="18" r="1.75" />
    </svg>
  );
}

function DownloadIcon({ disabled }: { disabled?: boolean }) {
  const stroke = disabled ? "#C4C8CC" : "#334155";
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 3V15"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 11L12 15L16 11"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 19H19"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function resolveDownloadUrl(url?: string | null) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;

  const normalisedBase = base.replace(/\/$/, "");
  const normalisedPath = trimmed.replace(/^\//, "");
  return `${normalisedBase}/${normalisedPath}`;
}

const FILE_ICON_STYLES: Record<string, { main: string; fold: string }> = {
  pdf: { main: "#F97373", fold: "#F55555" },
  svg: { main: "#FF6AB0", fold: "#E94A92" },
  jpg: { main: "#D96BFF", fold: "#BF4CEB" },
  jpeg: { main: "#D96BFF", fold: "#BF4CEB" },
  ai: { main: "#FFA143", fold: "#E68521" },
  psd: { main: "#7C78FF", fold: "#615BFF" },
  doc: { main: "#4AA3FF", fold: "#2E82F0" },
  docx: { main: "#4AA3FF", fold: "#2E82F0" },
  xls: { main: "#46C06C", fold: "#2FA356" },
  xlsx: { main: "#46C06C", fold: "#2FA356" },
  ppt: { main: "#FF8B6A", fold: "#F26949" },
  pptx: { main: "#FF8B6A", fold: "#F26949" },
  zip: { main: "#2DB176", fold: "#219360" },
  rar: { main: "#2DB176", fold: "#219360" },
  txt: { main: "#A8ACB3", fold: "#8D9199" },
  avi: { main: "#B65EFF", fold: "#9950E6" },
  mp3: { main: "#4D8BFF", fold: "#3066D6" },
  gif: { main: "#8E6BFF", fold: "#744FDE" },
  mkv: { main: "#B56DFF", fold: "#9B4CE6" },
  png: { main: "#6F9BFF", fold: "#4E7CE0" },
  default: { main: "#CFD6E4", fold: "#B5BDCB" },
};



















