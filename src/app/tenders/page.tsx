import React from "react";
import Link from "next/link";
import AppShell from "../../components/layout/AppShell";

export default function TendersPage() {
  return (
    <AppShell>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-[32px] font-bold leading-[40px] text-[#0D2352]">Tenders</h1>
        </div>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[640px] rounded-md border border-brand-tenders bg-white p-6 text-[#5D5D5C] shadow-sm">
            No tenders yet.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
