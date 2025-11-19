'use client';

import { type ReactNode, useState } from "react";
import TendersFeedbackDashboard, { type TendersFeedbackDashboardProps } from "./TendersFeedbackDashboard";

type TenderTabKey = "details" | "documents" | "feedback" | "activity";

type TenderTabsProps = {
  details: ReactNode;
  documents: ReactNode;
  feedback?: TendersFeedbackDashboardProps;
  activity: ReactNode;
  initialTab?: TenderTabKey;
};

const TABS: { key: TenderTabKey; label: string }[] = [
  { key: "details", label: "Tender details" },
  { key: "documents", label: "Submitted documents" },
  { key: "feedback", label: "Feedback scores" },
  { key: "activity", label: "Activity log" },
];

export function TenderTabs({ details, documents, feedback, activity, initialTab = "details" }: TenderTabsProps) {
  const [activeTab, setActiveTab] = useState<TenderTabKey>(initialTab);

  const tabClasses = (tab: TenderTabKey) =>
    [
      "px-4 py-3 text-sm font-medium border-b-2 cursor-pointer transition-colors",
      activeTab === tab
        ? "border-slate-900 text-slate-900 bg-white"
        : "border-transparent text-slate-600 bg-slate-50 hover:bg-slate-100",
    ].join(" ");

  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex border-b border-slate-200 bg-slate-50 rounded-t-md">
        {TABS.map((tab) => (
          <button key={tab.key} className={tabClasses(tab.key)} onClick={() => setActiveTab(tab.key)} type="button">
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === "details" && details}
        {activeTab === "documents" && documents}
        {activeTab === "feedback" && <TendersFeedbackDashboard {...(feedback ?? {})} />}
        {activeTab === "activity" && activity}
      </div>
    </div>
  );
}


