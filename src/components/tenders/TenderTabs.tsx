"use client";

import React, { useMemo, useState } from "react";

type TenderTabKey = "details" | "submitted" | "activity";

type TenderTabsProps = {
  details: React.ReactNode;
  documents: React.ReactNode;
  activity: React.ReactNode;
  initialTab?: TenderTabKey;
};

const TAB_DEFINITIONS: { key: TenderTabKey; label: string }[] = [
  { key: "details", label: "Tender details" },
  { key: "submitted", label: "Submitted documents" },
  { key: "activity", label: "Activity log" },
];

export function TenderTabs({ details, documents, activity, initialTab = "details" }: TenderTabsProps) {
  const [activeTab, setActiveTab] = useState<TenderTabKey>(initialTab);

  const currentContent = useMemo(() => {
    switch (activeTab) {
      case "submitted":
        return documents;
      case "activity":
        return activity;
      case "details":
      default:
        return details;
    }
  }, [activeTab, activity, details, documents]);

  return (
    <div className="rounded-b-[16px] border border-[#D0D0D0] bg-white shadow-sm">
      <nav className="flex items-end gap-2 border-b border-[#D0D0D0] bg-[#ECECEC] pl-6 pr-8 pt-4">
        {TAB_DEFINITIONS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-t-[12px] px-5 py-3 text-center transition ${
                isActive ? "bg-white" : "bg-transparent hover:bg-white/40"
              }`}
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "16px",
                fontWeight: 700,
                lineHeight: "24px",
                color: "#000000",
              }}
              aria-pressed={isActive}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
      <div className="bg-white px-6 py-8">{currentContent}</div>
    </div>
  );
}

