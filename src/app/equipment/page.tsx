'use client';

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";

type Tone = "danger" | "warn" | "ok";

type ExternalRow = {
  id: number;
  item: string;
  qty: number;
  supplier: string;
  location: string;
  assigned: { initials: string; name: string };
  hired: { initials: string; name: string };
  duration: string;
  badge?: { tone: Tone; label: string };
};

type InternalRow = {
  id: number;
  item: string;
  qty: number;
  assetId: string;
  location: string;
  custodian: { initials: string; name: string };
  condition: string;
  nextService: string;
  badge?: { tone: Tone; label: string };
};

// --- Helpers & sample data ---
function Avatar({ initials, color = "#1c9bd8" }: { initials: string; color?: string }) {
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  );
}

function Badge({ tone, label }: { tone: Tone; label: string }) {
  const map: Record<Tone, { bg: string; fg: string }> = {
    danger: { bg: "#FFE3E3", fg: "#B42318" },
    warn: { bg: "#FFF3D6", fg: "#8A5B00" },
    ok: { bg: "#E8F7F0", fg: "#167C3A" },
  };
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: map[tone].bg, color: map[tone].fg }}
    >
      {label}
    </span>
  );
}

const externalRows: ExternalRow[] = [
  {
    id: 1,
    item: "Electric Scissor – 19ft",
    qty: 3,
    supplier: "Speedy Hire",
    location: "Ashwell Gateway",
    assigned: { initials: "T", name: "Tomas" },
    hired: { initials: "M", name: "Mat" },
    duration: "01 Oct - 25 Oct",
    badge: { tone: "danger", label: "+ 4 days" },
  },
  {
    id: 2,
    item: "Porta-loo",
    qty: 3,
    supplier: "Speedy Hire",
    location: "Ashwell Gateway",
    assigned: { initials: "T", name: "Tomas" },
    hired: { initials: "M", name: "Mat" },
    duration: "01 Oct - 01 Nov",
    badge: { tone: "warn", label: "In 3 days" },
  },
  {
    id: 3,
    item: "Electric Scissor – 19ft",
    qty: 1,
    supplier: "Travis Perkins",
    location: "Ashwell Gateway",
    assigned: { initials: "T", name: "Tomas" },
    hired: { initials: "M", name: "Mat" },
    duration: "25 Oct - 14 Nov",
    badge: { tone: "ok", label: "In 2 weeks" },
  },
  {
    id: 4,
    item: "Electric Scissor – 19ft",
    qty: 1,
    supplier: "Travis Perkins",
    location: "Ashwell Gateway",
    assigned: { initials: "T", name: "Tomas" },
    hired: { initials: "M", name: "Mat" },
    duration: "25 Oct - 14 Nov",
    badge: { tone: "ok", label: "In 2 weeks" },
  },
  {
    id: 5,
    item: "Electric Scissor – 19ft",
    qty: 1,
    supplier: "Travis Perkins",
    location: "Ashwell Gateway",
    assigned: { initials: "T", name: "Tomas" },
    hired: { initials: "M", name: "Mat" },
    duration: "25 Oct - 14 Nov",
    badge: { tone: "ok", label: "In 2 weeks" },
  },
  {
    id: 6,
    item: "Electric Scissor – 19ft",
    qty: 1,
    supplier: "Travis Perkins",
    location: "Ashwell Gateway",
    assigned: { initials: "T", name: "Tomas" },
    hired: { initials: "M", name: "Mat" },
    duration: "25 Oct - 14 Nov",
    badge: { tone: "ok", label: "In 2 weeks" },
  },
];

const internalRows: InternalRow[] = [
  {
    id: 1,
    item: "Cordless SDS Drill Kit",
    qty: 6,
    assetId: "INT-204",
    location: "Central Depot",
    custodian: { initials: "AL", name: "Alex Lane" },
    condition: "In service",
    nextService: "14 Nov 2025",
    badge: { tone: "warn", label: "Service soon" },
  },
  {
    id: 2,
    item: "Hilti TE 1000 Breaker",
    qty: 2,
    assetId: "PT-021",
    location: "Ashwell Gateway Store",
    custodian: { initials: "TN", name: "Tariq Noon" },
    condition: "Good",
    nextService: "01 Dec 2025",
  },
  {
    id: 3,
    item: "Genie Lift SLA-15",
    qty: 1,
    assetId: "GL-118",
    location: "Yard A",
    custodian: { initials: "SJ", name: "Sara Jones" },
    condition: "Under maintenance",
    nextService: "05 Nov 2025",
    badge: { tone: "danger", label: "Offline" },
  },
  {
    id: 4,
    item: "Site Lighting Tower",
    qty: 4,
    assetId: "LT-332",
    location: "Tool crib",
    custodian: { initials: "MW", name: "Maya Walsh" },
    condition: "Ready",
    nextService: "20 Jan 2026",
    badge: { tone: "ok", label: "Ready to deploy" },
  },
];

export default function EquipmentPage() {
  const [activeTab, setActiveTab] = useState<"external" | "internal">("external");

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6">
        {/* Title */}
        <header className="mb-4">
          <h1 className="text-[32px] font-bold leading-[40px] text-[#0D2352]">Equipment</h1>
          <p className="mt-2 text-sm text-[#5D5D5C]">
            Manage plant, tools, and other critical assets from one place.
          </p>
        </header>

        {/* Tabs */}
        <div className="mb-3 flex items-center gap-6 text-[15px]">
          <button
            type="button"
            onClick={() => setActiveTab("external")}
            className={[
              "relative font-semibold transition-colors",
              activeTab === "external" ? "text-[#1F1F1F]" : "text-[#6B6B6B] hover:text-[#1F1F1F]",
            ].join(" ")}
          >
            External hire
            <span
              className={[
                "absolute left-0 -bottom-2 h-[3px] w-full rounded-full transition-opacity",
                activeTab === "external" ? "bg-[#d94b95] opacity-100" : "opacity-0",
              ].join(" ")}
            />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("internal")}
            className={[
              "relative font-semibold transition-colors",
              activeTab === "internal" ? "text-[#1F1F1F]" : "text-[#6B6B6B] hover:text-[#1F1F1F]",
            ].join(" ")}
          >
            Internal equipment
            <span
              className={[
                "absolute left-0 -bottom-2 h-[3px] w-full rounded-full transition-opacity",
                activeTab === "internal" ? "bg-[#d94b95] opacity-100" : "opacity-0",
              ].join(" ")}
            />
          </button>
        </div>

        {activeTab === "external" ? <ExternalHire /> : <InternalEquipment />}
      </div>
    </AppShell>
  );
}

function ExternalHire() {
  return (
    <div className="rounded-2xl border border-[#DADADA] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 p-2">
        <div className="relative min-w-[260px] flex-1">
          <input
            placeholder="Search external hire"
            className="h-11 w-full rounded-xl border border-[#E2E2E2] bg-[#F7F7F7] px-10 text-[15px] outline-none focus:border-[#008BD6]"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6B6B6B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <button className="inline-flex items-center gap-2 rounded-xl border border-[#DADADA] bg-white px-4 py-2.5 text-sm font-medium shadow-[0_1px_0_0_rgba(0,0,0,0.04)] hover:bg-[#F8F8F8]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#283583"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 5h18" />
            <path d="M6 12h12" />
            <path d="M10 19h4" />
          </svg>
          Filter
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#1c9bd8] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Add item
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 px-2">
        {[
          "All",
          "Diggers",
          "Scissor Lifts",
          "Cherry Pickers",
          "Breakers",
          "Porta-loo",
          "Welfare Units",
          "Genie Lift",
          "Telehandler",
          "32A Transformer",
        ].map((t, i) => (
          <button
            key={t}
            className={[
              "h-9 rounded-full border px-4 text-sm",
              i === 0
                ? "border-[#1c9bd8] bg-[#E6F5FC] text-[#0B5E7A] font-semibold"
                : "border-[#E2E2E2] bg-white text-[#333] hover:bg-[#F7F7F7]",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#EAEAEA]">
        <div className="grid grid-cols-12 items-center gap-2 bg-[#FAFAFA] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">
          <div className="col-span-3">Item</div>
          <div className="col-span-1 text-center">Qty</div>
          <div className="col-span-2">Supplier</div>
          <div className="col-span-2">Site Location</div>
          <div className="col-span-2">Assigned to</div>
          <div className="col-span-1">Hired by</div>
          <div className="col-span-1">Hire duration</div>
        </div>

        {externalRows.map((row, index) => (
          <div
            key={row.id}
            className={[
              "grid grid-cols-12 items-center gap-2 px-4 py-3",
              index === 0 ? "bg-[#FFF3F3]" : "odd:bg-white even:bg-[#FCFCFC]",
            ].join(" ")}
          >
            <div className="col-span-3 text-[15px] font-medium text-[#1F1F1F]">{row.item}</div>
            <div className="col-span-1 text-center">{row.qty}</div>
            <div className="col-span-2">{row.supplier}</div>
            <div className="col-span-2">{row.location}</div>
            <div className="col-span-2 flex items-center gap-2">
              <Avatar initials={row.assigned.initials} color="#17B26A" />
              <span className="text-sm">{row.assigned.name}</span>
            </div>
            <div className="col-span-1 flex items-center gap-2">
              <Avatar initials={row.hired.initials} color="#FF7A00" />
              <span className="text-sm">{row.hired.name}</span>
            </div>
            <div className="col-span-1">
              <div className="flex items-center justify-between gap-2">
                <span className="whitespace-nowrap text-sm text-[#333]">{row.duration}</span>
              </div>
              {row.badge ? <Badge tone={row.badge.tone} label={row.badge.label} /> : null}
            </div>
            <div className="col-span-12 mt-2 md:mt-0 md:col-span-0 md:ml-auto">
              <button className="rounded-xl border border-[#E2E2E2] bg-white px-3 py-1.5 text-sm font-medium text-[#555] hover:bg-[#F6F6F6]">
                Off hire
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-2 py-4 text-sm text-[#6B6B6B]">
        <div>Page 1 of 8</div>
        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-[#E2E2E2] bg-white px-3 py-1.5 text-sm text-[#AAA]" disabled>
            Prev
          </button>
          <button className="rounded-xl border border-[#E2E2E2] bg-white px-3 py-1.5 text-sm text-[#AAA]" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function InternalEquipment() {
  return (
    <div className="rounded-2xl border border-[#DADADA] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 p-2">
        <div className="relative min-w-[260px] flex-1">
          <input
            placeholder="Search internal equipment"
            className="h-11 w-full rounded-xl border border-[#E2E2E2] bg-[#F7F7F7] px-10 text-[15px] outline-none focus:border-[#008BD6]"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6B6B6B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <button className="inline-flex items-center gap-2 rounded-xl border border-[#DADADA] bg-white px-4 py-2.5 text-sm font-medium shadow-[0_1px_0_0_rgba(0,0,0,0.04)] hover:bg-[#F8F8F8]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#283583"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 5h18" />
            <path d="M6 12h12" />
            <path d="M10 19h4" />
          </svg>
          Filters
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#1c9bd8] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Register asset
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 px-2">
        {[
          "All",
          "Excavators",
          "Mixers",
          "Power tools",
          "Lifting gear",
          "Surveying",
          "Welfare",
          "Vehicles",
        ].map((t, i) => (
          <button
            key={t}
            className={[
              "h-9 rounded-full border px-4 text-sm",
              i === 0
                ? "border-[#1c9bd8] bg-[#E6F5FC] text-[#0B5E7A] font-semibold"
                : "border-[#E2E2E2] bg-white text-[#333] hover:bg-[#F7F7F7]",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#EAEAEA]">
        <div className="grid grid-cols-12 items-center gap-2 bg-[#FAFAFA] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#6B6B6B]">
          <div className="col-span-3">Asset</div>
          <div className="col-span-1 text-center">Qty</div>
          <div className="col-span-2">Asset ID</div>
          <div className="col-span-2">Home location</div>
          <div className="col-span-2">Custodian</div>
          <div className="col-span-1 text-center">Condition</div>
          <div className="col-span-1 text-right">Next service</div>
        </div>

        {internalRows.map((row, index) => (
          <div
            key={row.id}
            className={[
              "grid grid-cols-12 items-center gap-2 px-4 py-3",
              index === 0 ? "bg-[#FFF7EF]" : "odd:bg-white even:bg-[#FCFCFC]",
            ].join(" ")}
          >
            <div className="col-span-3 text-[15px] font-medium text-[#1F1F1F]">{row.item}</div>
            <div className="col-span-1 text-center">{row.qty}</div>
            <div className="col-span-2 text-sm text-[#404040]">{row.assetId}</div>
            <div className="col-span-2 text-sm text-[#404040]">{row.location}</div>
            <div className="col-span-2 flex items-center gap-2">
              <Avatar initials={row.custodian.initials} color="#0BA5EC" />
              <span className="text-sm">{row.custodian.name}</span>
            </div>
            <div className="col-span-1 text-center text-sm font-medium text-[#1F1F1F]">{row.condition}</div>
            <div className="col-span-1 text-right">
              <span className="text-sm text-[#333]">{row.nextService}</span>
              {row.badge ? <div className="mt-1 flex justify-end"><Badge tone={row.badge.tone} label={row.badge.label} /></div> : null}
            </div>
            <div className="col-span-12 mt-2 md:mt-0 md:col-span-0 md:ml-auto">
              <button className="rounded-xl border border-[#E2E2E2] bg-white px-3 py-1.5 text-sm font-medium text-[#555] hover:bg-[#F6F6F6]">
                Book out
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-2 py-4 text-sm text-[#6B6B6B]">
        <div>Showing 1 – {internalRows.length} of {internalRows.length}</div>
        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-[#E2E2E2] bg-white px-3 py-1.5 text-sm text-[#AAA]" disabled>
            Prev
          </button>
          <button className="rounded-xl border border-[#E2E2E2] bg-white px-3 py-1.5 text-sm text-[#AAA]" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
