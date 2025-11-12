"use client";

import React, { useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import SubmittedDocumentsTab, { SubmittedDocument } from "@/components/tenders/SubmittedDocumentsTab";

type TenderTab = "details" | "submitted" | "activity";

interface TenderDetailPageProps {
  params: { tenderId: string };
}

const tabs: { id: TenderTab; label: string }[] = [
  { id: "details", label: "Tender details" },
  { id: "submitted", label: "Submitted documents" },
  { id: "activity", label: "Activity log" },
];

const submittedDocs: SubmittedDocument[] = [
  {
    id: "doc-001",
    title: "Contractor H&S Questionnaire.docx",
    fileName: "Contractor H&S Questionnaire.docx",
    fileSize: "1.2 MB",
    uploadedAt: "2024-10-24T09:24:00Z",
    uploadedBy: "Alex Conner",
    summary: "Completed questionnaire covering contractor health and safety compliance.",
    tags: ["safety", "questionnaire"],
    content:
      "Section 1 outlines the contractor's safety policy and references ISO 45001 accreditation. Section 3 details accident reporting processes and training schedules.",
  },
  {
    id: "doc-002",
    title: "Equal Opportunities Policy.pdf",
    fileName: "Equal Opportunities Policy.pdf",
    fileSize: "860 KB",
    uploadedAt: "2024-10-24T09:18:00Z",
    uploadedBy: "Alex Conner",
    summary: "Company-wide policy outlining our Equal Opportunities commitment.",
    tags: ["policy"],
    content:
      "This policy complies with the Equality Act 2010 and describes our approach to recruitment, training, and monitoring to prevent discrimination.",
  },
  {
    id: "doc-003",
    title: "Privacy and Personal Data Protection Policy.pdf",
    fileName: "Privacy and Personal Data Protection Policy.pdf",
    fileSize: "940 KB",
    uploadedAt: "2024-10-24T09:15:00Z",
    uploadedBy: "Alex Conner",
    summary: "GDPR-aligned privacy policy for tender submissions.",
    tags: ["privacy", "gdpr"],
    content:
      "Includes data retention schedules, subject access request handling, and references to ICO guidelines for local government procurement.",
  },
  {
    id: "doc-004",
    title: "Quality Management Arrangements Policy.pdf",
    fileName: "Quality Management Arrangements Policy.pdf",
    fileSize: "1.0 MB",
    uploadedAt: "2024-10-24T09:10:00Z",
    uploadedBy: "Alex Conner",
    summary: "Outlines quality assurance processes for construction works.",
    tags: ["quality"],
    content:
      "The policy references ISO 9001 procedures, site inspection cadence, and stakeholder communication workflows.",
  },
  {
    id: "doc-005",
    title: "Quality Risk Management Policy.pdf",
    fileName: "Quality Risk Management Policy.pdf",
    fileSize: "1.1 MB",
    uploadedAt: "2024-10-24T09:08:00Z",
    uploadedBy: "Alex Conner",
    summary: "Risk management approach for monitoring tender deliverables.",
    tags: ["risk", "quality"],
    content: "Identifies key risks, mitigation plans, and references to the corporate risk register. Includes a RACI ownership chart.",
  },
  {
    id: "doc-006",
    title: "Risk Management Policy.pdf",
    fileName: "Risk Management Policy.pdf",
    fileSize: "1.3 MB",
    uploadedAt: "2024-10-24T09:00:00Z",
    uploadedBy: "Alex Conner",
    summary: "Organisation-wide risk framework aligning with ISO 31000.",
    tags: ["risk"],
    content:
      "Highlights roles of the Risk Committee, scoring methodology, and escalation triggers for high-priority risks.",
  },
  {
    id: "doc-007",
    title: "Certificate_Elite_Club.pdf",
    fileName: "Certificate_Elite_Club.pdf",
    fileSize: "2.5 MB",
    uploadedAt: "2024-10-24T08:52:00Z",
    uploadedBy: "Alex Conner",
    summary: "Certification confirming Elite Club membership for sustainability standards.",
    tags: ["certification"],
    content:
      "Recognises compliance with carbon reduction targets, social value delivery, and sustainable procurement practices.",
  },
];

const tenderMeta = {
  client: "South Cambridgeshire District Council",
  status: "Set-up in progress",
  referenceNumber: "soombu_1234567890ccbcdghj",
  createdBy: "Rob Hutchinson",
  assignedTo: "Alex Conner",
  submissionDueDate: "15/11/24",
  submissionDueMeta: "Due in 3 days",
  tenderValue: "£2.1m (est.)",
};

export default function TenderDetailPage({ params }: TenderDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TenderTab>("submitted");

  const statusAccent = useMemo(() => {
    const normalized = tenderMeta.status.toLowerCase();
    if (normalized.includes("progress") || normalized.includes("setup")) {
      return "bg-amber-100 text-amber-800";
    }

    if (normalized.includes("approved") || normalized.includes("awarded")) {
      return "bg-emerald-100 text-emerald-700";
    }

    return "bg-gray-200 text-gray-700";
  }, []);

  const renderTabContent = () => {
    if (activeTab === "submitted") {
      return <SubmittedDocumentsTab documents={submittedDocs} />;
    }

    if (activeTab === "details") {
      return (
        <div className="space-y-4 text-sm text-gray-700">
          <p>
            This area is reserved for the full tender overview: scope, evaluation criteria, deliverables, and key milestones. Highlight
            blockers or next steps here so the team has a single source of truth.
          </p>
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
            Design for the "Tender details" tab goes here.
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 text-sm text-gray-700">
        <p>Recent activity and change log (placeholder):</p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>- 24/10/24 09:24 - Alex uploaded "Contractor H&S Questionnaire.docx".</li>
          <li>- 24/10/24 09:10 - Alex updated tender status to "Set-up in progress".</li>
          <li>- 23/10/24 16:02 - Rob shared tender brief with Alex.</li>
        </ul>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="bg-gray-50 px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy hover:underline"
            >
              <span aria-hidden="true">←</span> Back to Tenders
            </button>
            <span className="text-sm text-gray-500">Tender ID: {params.tenderId}</span>
          </div>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm shadow-brand-navy/5">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">{tenderMeta.client}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-semibold text-brand-navy">Community Hub at Gamlingay</h1>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusAccent}`}>
                    {tenderMeta.status}
                  </span>
                </div>
              </div>

              <dl className="grid w-full gap-4 text-sm text-gray-700 sm:grid-cols-2 lg:w-auto">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Reference number</dt>
                  <dd className="mt-1 break-all text-gray-800">{tenderMeta.referenceNumber}</dd>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Created by</dt>
                  <dd className="mt-1 text-gray-800">{tenderMeta.createdBy}</dd>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assigned to</dt>
                  <dd className="mt-1 text-gray-800">{tenderMeta.assignedTo}</dd>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Submission due</dt>
                  <dd className="mt-1 text-gray-800">{tenderMeta.submissionDueDate}</dd>
                  <dd className="text-xs text-emerald-600">{tenderMeta.submissionDueMeta}</dd>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 sm:col-span-2 lg:col-span-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tender value</dt>
                  <dd className="mt-1 text-gray-800">{tenderMeta.tenderValue}</dd>
                </div>
              </dl>
            </header>

            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
              <nav className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2 text-sm font-medium">
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`rounded-xl px-4 py-2 transition ${
                        isActive ? "bg-white text-brand-navy shadow-sm" : "text-gray-600 hover:bg-white/70"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              <div className="bg-white p-6">{renderTabContent()}</div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
