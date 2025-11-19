"use client";

import React, { useEffect, useMemo, useState } from "react";

export type EvaluationSplit = {
  id: string;
  description: string;
  percentage: number;
};

export type FeedbackScoresFormData = {
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  comments: string;
  participantsCount: number | null;
  evaluationBreakdown: "percentage" | "points" | "gbp" | "other";
  splits: EvaluationSplit[];
  attachments: File[];
};

type FeedbackScoresModalProps = {
  open: boolean;
  onClose: () => void;
  onComplete: (data: FeedbackScoresFormData) => void;
};

export default function FeedbackScoresModal({
  open,
  onClose,
  onComplete,
}: FeedbackScoresModalProps) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [comments, setComments] = useState("");
  const [participantsCount, setParticipantsCount] =
    useState<number | null>(null);
  const [evaluationBreakdown, setEvaluationBreakdown] = useState<
    "percentage" | "points" | "gbp" | "other"
  >("percentage");
  const [splits, setSplits] = useState<EvaluationSplit[]>([
    { id: "split-1", description: "", percentage: 100 },
  ]);
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const totalValue = useMemo(
    () =>
      splits.reduce(
        (sum, split) =>
          sum + (Number.isFinite(split.percentage) ? split.percentage : 0),
        0
      ),
    [splits]
  );

  // Only enforce 100 when using Percentage breakdown
  const isTotalValid =
    evaluationBreakdown === "percentage" ? totalValue === 100 : true;

  // Symbol to display after each value
  const unitSymbol =
    evaluationBreakdown === "percentage"
      ? "%"
      : evaluationBreakdown === "gbp"
      ? "£"
      : "";

  function handleAddSplit() {
    setSplits((prev) => [
      ...prev,
      {
        id: `split-${prev.length + 1}`,
        description: "",
        percentage: 0,
      },
    ]);
  }

  function handleSplitChange(
    id: string,
    field: "description" | "percentage",
    value: string
  ) {
    setSplits((prev) =>
      prev.map((split) =>
        split.id === id
          ? {
              ...split,
              [field]:
                field === "percentage"
                  ? Number(value.replace(/[^\d.]/g, "")) || 0
                  : value,
            }
          : split
      )
    );
  }

  function handleRemoveSplit(id: string) {
    setSplits((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((s) => s.id !== id);
    });
  }

  function handleFilesSelected(files: FileList | null) {
    if (!files) return;
    setAttachments(Array.from(files));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: FeedbackScoresFormData = {
      fullName,
      phoneNumber,
      emailAddress,
      comments,
      participantsCount,
      evaluationBreakdown,
      splits,
      attachments,
    };
    onComplete(payload);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 mt-6 w-full max-w-3xl rounded-2xl bg-white p-8 shadow-xl max-h-[calc(100vh-3rem)] overflow-y-auto">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Feedback scores
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section>
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Tender contact details
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border border-[#B8E1E7] bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#1c9bd8] focus:outline-none focus:ring-2 focus:ring-[#1c9bd8]/40"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-md border border-[#B8E1E7] bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#1c9bd8] focus:outline-none focus:ring-2 focus:ring-[#1c9bd8]/40"
              />
              <input
                type="email"
                placeholder="Email address"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full rounded-md border border-[#B8E1E7] bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#1c9bd8] focus:outline-none focus:ring-2 focus:ring-[#1c9bd8]/40"
              />
            </div>
          </section>

          <section>
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Comments
            </p>
            <textarea
              rows={5}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full resize-none rounded-md border border-[#B8E1E7] bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#1c9bd8] focus:outline-none focus:ring-2 focus:ring-[#1c9bd8]/40"
            />
          </section>

          <section>
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Attachments
            </p>
            <div className="rounded-md border border-dashed border-[#B8E1E7] bg-[#f7fcfd] px-6 py-8 text-center text-sm text-gray-500">
              <p className="mb-3">Drag and drop files to upload or</p>
              <label className="inline-flex cursor-pointer items-center rounded-md border border-[#B8E1E7] bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Browse computer
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
              </label>
              {attachments.length > 0 && (
                <ul className="mt-4 list-disc space-y-1 text-left text-xs text-gray-600">
                  {attachments.map((file) => (
                    <li key={file.name}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section>
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Number of submission participants
            </p>
            <select
              value={participantsCount ?? ""}
              onChange={(e) =>
                setParticipantsCount(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full rounded-md border border-[#B8E1E7] bg-white px-4 py-3 text-sm text-gray-900 focus:border-[#1c9bd8] focus:outline-none focus:ring-2 focus:ring-[#1c9bd8]/40"
            >
              <option value="">Select number</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </section>

          <section>
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Evaluation breakdown
            </p>
            <select
              value={evaluationBreakdown}
              onChange={(e) =>
                setEvaluationBreakdown(
                  e.target.value as "percentage" | "points" | "gbp" | "other"
                )
              }
              className="w-full rounded-md border border-[#B8E1E7] bg-white px-4 py-3 text-sm text-gray-900 focus:border-[#1c9bd8] focus:outline-none focus:ring-2 focus:ring-[#1c9bd8]/40"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="gbp">GBP (£)</option>
              <option value="points">Points</option>
              <option value="other">Other</option>
            </select>
          </section>

          <section>
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Evaluation weighting
            </p>

            <div className="space-y-3">
              {splits.map((split) => (
                <div key={split.id} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Enter a description"
                    value={split.description}
                    onChange={(e) =>
                      handleSplitChange(split.id, "description", e.target.value)
                    }
                    className="flex-1 rounded-md border border-[#B8E1E7] bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#1c9bd8] focus:outline-none focus:ring-2 focus:ring-[#1c9bd8]/40"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={evaluationBreakdown === "percentage" ? 100 : undefined}
                      value={split.percentage}
                      onChange={(e) =>
                        handleSplitChange(
                          split.id,
                          "percentage",
                          e.target.value
                        )
                      }
                      className="w-24 rounded-md border border-[#B8E1E7] bg-white px-3 py-3 text-right text-sm focus:border-[#1c9bd8] focus:outline-none focus:ring-2 focus:ring-[#1c9bd8]/40"
                    />
                    {unitSymbol && (
                      <span className="text-sm text-gray-600">
                        {unitSymbol}
                      </span>
                    )}
                  </div>
                  {splits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSplit(split.id)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <div className="flex items-center gap-3 border-t border-gray-100 pt-3 text-sm">
                <div className="flex-1 font-medium text-gray-900">
                  Total awarded
                </div>
                <div
                  className={`flex items-center justify-end gap-1 w-24 rounded-md border px-3 py-3 text-right ${
                    isTotalValid
                      ? "border-[#B8E1E7] text-gray-900"
                      : "border-red-400 text-red-600"
                  }`}
                >
                  <span>{totalValue}</span>
                  {unitSymbol && (
                    <span className="text-sm text-gray-600">
                      {unitSymbol}
                    </span>
                  )}
                </div>
              </div>

              {evaluationBreakdown === "percentage" && !isTotalValid && (
                <p className="text-xs text-red-600">
                  The total awarded must equal 100%.
                </p>
              )}

              <button
                type="button"
                onClick={handleAddSplit}
                className="mt-1 text-sm font-medium text-[#1c9bd8] hover:underline"
              >
                Add a split
              </button>
            </div>
          </section>

          {/* Footer buttons */}
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={evaluationBreakdown === "percentage" && !isTotalValid}
              className="rounded-md bg-[#1c9bd8] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1383b6] disabled:cursor-not-allowed disabled:bg-[#9fd2ec]"
            >
              Complete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
