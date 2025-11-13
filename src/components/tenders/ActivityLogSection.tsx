'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type ActivityEvent = {
  id: string;
  at: string; // ISO date
  actor: { name: string; initials?: string };
  type: "upload" | "comment" | "status" | "assign" | "edit" | "note";
  summary: string;
  meta?: string;
};

const TYPE_STYLES: Record<ActivityEvent["type"], { label: string; bg: string; text: string }> = {
  upload: { label: "Upload", bg: "#E9F9FE", text: "#1C4987" },
  comment: { label: "Comment", bg: "#EDE9FE", text: "#581C87" },
  status: { label: "Status", bg: "#FFF6E6", text: "#8C5E0A" },
  assign: { label: "Assignment", bg: "#E9F9FE", text: "#1C4987" },
  edit: { label: "Edit", bg: "#E9FFE9", text: "#0F7D56" },
  note: { label: "Note", bg: "#E0ECFF", text: "#0D2352" },
};

const AVATAR_STYLES: Record<ActivityEvent["type"], { bg: string; text: string }> = {
  upload: { bg: "#118AB2", text: "#FFFFFF" },
  comment: { bg: "#FECA00", text: "#000000" },
  status: { bg: "#6B4EFF", text: "#FFFFFF" },
  assign: { bg: "#118AB2", text: "#FFFFFF" },
  edit: { bg: "#0F7D56", text: "#FFFFFF" },
  note: { bg: "#0D2352", text: "#FFFFFF" },
};

type ActivityLogSectionProps = {
  events?: ActivityEvent[];
  currentStatus?: string;
  currentUserName?: string;
  tenderId: string;
};

export default function ActivityLogSection({ events = [], currentStatus, currentUserName, tenderId }: ActivityLogSectionProps) {
  const router = useRouter();
  const [entries, setEntries] = useState<ActivityEvent[]>(() => [...events].sort(sortByDateDesc));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setEntries([...events].sort(sortByDateDesc));
  }, [events]);

  const statusLabel = (currentStatus ?? "Status not available").trim() || "Status not available";
  const actorName = (currentUserName ?? "Unknown user").trim() || "Unknown user";

  async function handleAddActivity(note: string) {
    if (!tenderId) {
      const errorMessage = "Unable to record activity: missing tender reference.";
      setSubmitError(errorMessage);
      throw new Error(errorMessage);
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`/api/tenders/${encodeURIComponent(tenderId)}/activity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note, status: statusLabel, tenderId }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.event) {
        const errorMessage = payload?.error ?? "Failed to record activity.";
        throw new Error(errorMessage);
      }

      const savedEvent = payload.event as ActivityEvent;
      setEntries((previous) => [savedEvent, ...previous].sort(sortByDateDesc));
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to record activity.";
      setSubmitError(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full max-w-[1144px] bg-white px-7 py-7">
      <div className="flex flex-col items-end gap-5">
        <div className="flex w-full justify-end">
          <button
            type="button"
            className="inline-flex h-11 w-[191px] items-center justify-center gap-1 rounded-[4px] bg-[#1890FF] px-4 text-white shadow-sm transition hover:bg-[#1475D1] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ fontFamily: "Poppins, sans-serif", fontSize: "16px", fontWeight: 400, lineHeight: "28px" }}
            onClick={() => {
              setSubmitError(null);
              setIsModalOpen(true);
            }}
            disabled={!tenderId}
          >
            <AddActivityIcon />
            <span className="text-center">Add new activity</span>
          </button>
        </div>

        {entries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="relative flex w-full flex-col gap-6">
            {entries.map((event, index) => (
              <EventRow key={event.id} event={event} index={index} count={entries.length} />
            ))}
          </div>
        )}
      </div>

      {isModalOpen ? (
        <AddActivityModal
          currentStatus={statusLabel}
          currentUserName={actorName}
          onCancel={() => {
            setIsModalOpen(false);
            setSubmitError(null);
          }}
          onSave={handleAddActivity}
          isSaving={isSubmitting}
          serverError={submitError}
        />
      ) : null}
    </section>
  );
}

function EventRow({ event, index, count }: { event: ActivityEvent; index: number; count: number }) {
  const typeStyle = TYPE_STYLES[event.type];
  return (
    <div className="grid grid-cols-[183px_minmax(0,1fr)] gap-9">
      <TimelineMarker iso={event.at} index={index} count={count} />
      <div
        className="flex flex-1 flex-col gap-5 md:flex-row md:items-center"
        style={{
          padding: "20px",
          borderRadius: "4px",
          border: "1px solid #999998",
          background: "#EAEAE9",
          alignItems: "center",
          gap: "36px",
          flex: "1 0 0",
        }}
      >
        <TypeChip label={typeStyle.label} bg={typeStyle.bg} text={typeStyle.text} />
        <div
          className="flex flex-1 flex-col gap-3"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "24px",
            color: "#000000",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          }}
        >
          <p className="font-semibold" style={{ alignSelf: "stretch" }}>
            {event.summary}
          </p>
          {event.meta ? (
            <p style={{ alignSelf: "stretch" }}>{event.meta}</p>
          ) : null}
        </div>
        <ActorBlock name={event.actor.name} initials={event.actor.initials} type={event.type} />
      </div>
    </div>
  );
}

function TimelineMarker({ iso, index, count }: { iso: string; index: number; count: number }) {
  const isFirst = index === 0;
  const isLast = index === count - 1;
  return (
    <div className="relative flex items-center gap-4 py-6">
      <div className="relative flex h-full w-[28px] justify-center">
        <span
          aria-hidden
          className="absolute left-1/2 w-px -translate-x-1/2 bg-[#999998]/50"
          style={{
            top: isFirst ? 14 : -36,
            bottom: isLast ? 14 : -36,
          }}
        />
        <span className="relative flex h-7 w-7 items-center justify-center">
          <span className="absolute h-7 w-7 rounded-full bg-[#E6F7FF]" aria-hidden />
          <span className="absolute h-[18px] w-[18px] rounded-full bg-[#1890FF]" aria-hidden />
        </span>
      </div>
      <div
        className="flex items-center gap-4"
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: "16px",
          fontWeight: 400,
          lineHeight: "28px",
          color: "#000000",
        }}
      >
        <span>{formatDateLabel(iso)}</span>
        <span>{formatTimeLabel(iso)}</span>
      </div>
    </div>
  );
}

function TypeChip({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <span
      className="inline-flex min-w-[96px] items-center justify-center rounded-[3px] px-3 py-1 text-[14px] font-semibold leading-6"
      style={{ backgroundColor: bg, color: text, fontFamily: "Montserrat, sans-serif" }}
    >
      {label}
    </span>
  );
}

function ActorBlock({ name, initials, type }: { name: string; initials?: string; type: ActivityEvent["type"] }) {
  const avatarText = initials ?? getInitials(name);
  const palette = AVATAR_STYLES[type] ?? { bg: "#118AB2", text: "#FFFFFF" };
  return (
    <div className="flex min-w-[155px] items-center gap-3">
      <span
        className="grid h-[34px] w-[34px] place-items-center rounded-full text-[14px] font-bold"
        style={{ backgroundColor: palette.bg, color: palette.text, fontFamily: "Montserrat, sans-serif" }}
        aria-hidden
      >
        {avatarText}
      </span>
      <span
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: "14px",
          fontWeight: 400,
          lineHeight: "24px",
          color: "#000000",
          width: "110px",
        }}
      >
        {name}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-[12px] border border-dashed border-[#D0D0D0] bg-[#F5F5F4] px-8 py-12 text-center">
      <p className="text-sm text-[#5D5D5C]">No activity recorded yet.</p>
    </div>
  );
}

function AddActivityIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.25" stroke="white" />
      <path d="M12 8.75V15.25" stroke="white" />
      <path d="M8.75 12H15.25" stroke="white" />
    </svg>
  );
}

function sortByDateDesc(a: ActivityEvent, b: ActivityEvent) {
  return new Date(b.at).getTime() - new Date(a.at).getTime();
}

function formatDateLabel(iso: string) {
  const date = new Date(iso);
  const formatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" });
  return formatter.format(date);
}

function formatTimeLabel(iso: string) {
  const date = new Date(iso);
  const formatter = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return formatter.format(date);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  const initials = `${first}${second}`.trim();
  return initials ? initials.toUpperCase() : first.toUpperCase();
}

function AddActivityModal({
  onCancel,
  onSave,
  currentStatus,
  currentUserName,
  isSaving,
  serverError,
}: {
  onCancel: () => void;
  onSave: (note: string) => Promise<void>;
  currentStatus: string;
  currentUserName: string;
  isSaving: boolean;
  serverError: string | null;
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) {
      setError("Please enter a note before saving.");
      return;
    }
    try {
      await onSave(trimmed);
      setNote("");
      setError(null);
    } catch {
      // Errors are surfaced via serverError prop; keep note content for retry.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-[#0D2352]">Add new activity</h2>
          <p className="mt-1 text-sm text-[#5D5D5C]">All new actions are captured against the current tender status.</p>
        </div>

        <div className="mb-4 space-y-2">
          <label htmlFor="activity-note" className="text-sm font-semibold text-[#0D2352]">
            Note
          </label>
          <textarea
            id="activity-note"
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              if (error) setError(null);
            }}
            rows={4}
            className="w-full resize-none rounded-lg border border-[#D0D0D0] bg-white px-3 py-2 text-sm text-[#0D2352] focus:border-[#0D2352] focus:outline-none focus:ring-2 focus:ring-[#0D2352]/20"
            placeholder="Type your update"
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {!error && serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg bg-[#F5F5F4] p-4 text-sm text-[#0D2352] md:grid-cols-2">
          <div>
            <p className="font-semibold">Current status</p>
            <p>{currentStatus}</p>
          </div>
          <div>
            <p className="font-semibold">Recording as</p>
            <p>{currentUserName}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 text-sm">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[#999998] px-4 text-[#0D2352] transition hover:bg-[#F4F2EC]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-10 items-center justify-center rounded-[6px] bg-[#1890FF] px-4 font-semibold text-white transition hover:bg-[#1475D1] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save activity"}
          </button>
        </div>
      </form>
    </div>
  );
}

