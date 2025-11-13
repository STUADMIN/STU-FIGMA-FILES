"use client";

import type { CSSProperties } from "react";
import { useMemo, useState, useTransition } from "react";

const BODY_STYLE: CSSProperties = {
  width: "760px",
  color: "#0F172A",
  fontFamily: "Montserrat, sans-serif",
  fontSize: "16px",
  lineHeight: "28px",
  fontWeight: 400,
};

type EditableField = "background" | "description";

type ChangeLogEntry = {
  id: string;
  field: EditableField;
  previousValue: string | null;
  newValue: string | null;
  changedBy: string | null;
  changedById: string | null;
  changedAt: string;
};

type EditableTextSectionProps = {
  title: string;
  field: EditableField;
  tenderRecordId: string;
  tenderSlug: string;
  initialValue: string | null;
  userName: string;
  userId?: string | null;
  initialLogs?: ChangeLogEntry[];
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function EditableTextSection({
  title,
  field,
  tenderRecordId,
  tenderSlug,
  initialValue,
  userName,
  userId,
  initialLogs = [],
}: EditableTextSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [value, setValue] = useState(initialValue ?? "");
  const [draft, setDraft] = useState(initialValue ?? "");
  const [logs, setLogs] = useState<ChangeLogEntry[]>(initialLogs);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canEdit = Boolean(userName);
  const emptyMessage = `No ${title.toLowerCase()} provided yet.`;

  const orderedLogs = useMemo(
    () => [...logs].sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()),
    [logs],
  );

  const openModal = () => {
    setDraft(value);
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isPending) {
      setIsModalOpen(false);
    }
  };

  const handleSave = () => {
    const trimmed = draft.trimEnd();
    if (!trimmed.length) {
      setError("Please provide some content before saving.");
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        const response = await fetch(`/api/tenders/${encodeURIComponent(tenderSlug)}/field`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenderRecordId,
            field,
            value: trimmed,
            changedBy: userName,
            changedById: userId ?? null,
            previousValue: value,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save changes. Please try again.");
        }

        const payload = (await response.json()) as {
          value: string;
          log: ChangeLogEntry;
        };

        setValue(payload.value);
        setDraft(payload.value);
        setLogs((previous) => [payload.log, ...previous]);
        setIsModalOpen(false);
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "An unknown error occurred.";
        setError(message);
      }
    });
  };

  return (
    <section className="px-1 py-1">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[#0D2352]">{title}</h2>
        <button
          type="button"
          onClick={openModal}
          disabled={!canEdit}
          className="flex w-[79px] items-center justify-center gap-2 rounded-[6px] border border-[#999998] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] transition hover:bg-[#F4F2EC] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Edit
        </button>
      </div>

      {value.trim() ? <div style={BODY_STYLE}>{value}</div> : <p className="text-sm text-slate-600">{emptyMessage}</p>}

      {orderedLogs.length ? (
        <div className="mt-6 rounded-[12px] border border-[#E7E5DF] bg-[#F9F9F7] p-4 text-xs text-[#1F2933]">
          <div className="mb-3 text-sm font-semibold text-[#2F6F7C]">Change history</div>
          <ul className="space-y-3">
            {orderedLogs.map((log) => (
              <li key={log.id} className="rounded-[10px] border border-[#E7E5DF] bg-white p-3 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-[#2F6F7C]">
                  <span>{log.changedBy ?? "Unknown user"}</span>
                  <span>{formatDate(log.changedAt)}</span>
                </div>
                <div className="mt-2 text-[11px] text-[#0F172A]"><span className="font-semibold text-[#2F6F7C]">Previous:</span> {log.previousValue?.trim() ? log.previousValue : "—"}</div>
                <div className="mt-1 text-[11px] text-[#0F172A]"><span className="font-semibold text-[#2F6F7C]">Updated:</span> {log.newValue?.trim() ? log.newValue : "—"}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-10">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <header className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[#0D2352]">Edit {title}</h3>
                <p className="text-sm text-[#5D5D5C]">Updated by {userName || "Unknown user"}</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-[#D0D0D0] px-3 py-1 text-sm font-medium text-[#0D2352] hover:bg-slate-100"
              >
                Close
              </button>
            </header>

            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="mt-6 h-48 w-full rounded-[12px] border border-[#D0D0D0] bg-white p-3 text-sm text-[#0F172A] shadow-inner focus:border-[#0D2352] focus:outline-none focus:ring-2 focus:ring-[#0D2352]"
            />

            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

            <footer className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-[12px] border border-[#D0D0D0] px-4 py-2 text-sm font-semibold text-[#0D2352] transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="rounded-[12px] bg-[#0D2352] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#142a65] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? "Saving…" : "Save changes"}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </section>
  );
}
