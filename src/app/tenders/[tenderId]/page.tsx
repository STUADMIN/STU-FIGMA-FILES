"use client";
import React from "react";
import { useState } from "react";

interface TenderDetailPageProps {
  params: { tenderId: string };
}

export default function TenderDetailPage({ params }: TenderDetailPageProps) {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Tender {params.tenderId}</h1>
          <button
            type="button"
            onClick={() => setIsFeedbackModalOpen(true)}
            className="inline-flex h-[44px] w-[144px] items-center justify-center gap-1 rounded border border-[#D0D0D0] px-4 py-2 text-sm font-medium text-gray-800"
          >
            Add feedback
          </button>
        </div>
        <p className="text-gray-600">Details will appear here.</p>
      </div>

      {isFeedbackModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Feedback scores"
          onClick={() => setIsFeedbackModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-md bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Feedback scores</h2>
              <button
                type="button"
                className="inline-flex h-8 items-center justify-center rounded px-3 text-sm text-gray-600 hover:text-gray-900"
                onClick={() => setIsFeedbackModalOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <p>Placeholder for feedback scoring UI.</p>
              <p className="text-gray-500">
                You can add fields, sliders, and save actions here.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsFeedbackModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                onClick={() => setIsFeedbackModalOpen(false)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
