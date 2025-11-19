'use client';
import React from "react";

type TenderRow = {
  id: string;
  name: string;
  organisation: string;
  statusLabel: string;
  statusClasses: string;
  assignedInitials: string;
  assignedName: string;
  dueDate: string;
  dueMeta?: string;
  responseDate?: string;
};

const INITIAL_ROWS: TenderRow[] = [
  {
    id: "t1",
    name: "Community Hub at Gamlingay",
    organisation: "South Cambridgeshire District Council",
    statusLabel: "In progress",
    statusClasses:
      "inline-flex items-center rounded-full bg-[#EAE2FF] px-2 py-1 text-[12px] font-medium text-[#6B4EFF]",
    assignedInitials: "AC",
    assignedName: "Alex Conner",
    dueDate: "15/11/24",
    dueMeta: "Due in 21 days",
    responseDate: "Not set",
  },
  {
    id: "t2",
    name: "Biggleswade Library Refurbishment",
    organisation: "Central Bedfordshire Council",
    statusLabel: "Submitted",
    statusClasses:
      "inline-flex items-center rounded-full bg-[#E5F0FF] px-2 py-1 text-[12px] font-medium text-[#1273EB]",
    assignedInitials: "AC",
    assignedName: "Alex Conner",
    dueDate: "30/10/24",
    responseDate: "06/11/24",
  },
  {
    id: "t3",
    name: "Ashwell Gateway",
    organisation: "Central Bedfordshire Council",
    statusLabel: "Successful",
    statusClasses:
      "inline-flex items-center rounded-full bg-[#DFF5EA] px-2 py-1 text-[12px] font-medium text-[#1DAB87]",
    assignedInitials: "AC",
    assignedName: "Alex Conner",
    dueDate: "02/08/24",
    responseDate: "04/09/24",
  },
  {
    id: "t4",
    name: "DDA Works",
    organisation: "Central Bedfordshire Council",
    statusLabel: "Unsuccessful",
    statusClasses:
      "inline-flex items-center rounded-full bg-[#FFE2E2] px-2 py-1 text-[12px] font-medium text-[#E53935]",
    assignedInitials: "AC",
    assignedName: "Alex Conner",
    dueDate: "01/07/24",
    responseDate: "21/07/24",
  },
];

export default function TendersContent() {
  const [query, setQuery] = React.useState<string>("");

  const filteredRows = React.useMemo(() => {
    if (!query.trim()) {
      return INITIAL_ROWS;
    }
    const q = query.trim().toLowerCase();
    return INITIAL_ROWS.filter((row) => {
      return (
        row.name.toLowerCase().includes(q) ||
        row.organisation.toLowerCase().includes(q) ||
        row.assignedName.toLowerCase().includes(q) ||
        row.statusLabel.toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <div className="mx-auto flex h-[748px] w-[1144px] flex-col items-start rounded-[16px] border border-[#D0D0D0] bg-white">
      {/* In-frame search and filter */}
      <div className="mb-4 flex w-full items-center justify-between gap-3 p-4 md:p-6">
        <div className="relative w-full max-w-sm">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search live tenders"
            aria-label="Search tenders"
            className="w-full rounded-md border border-[var(--Platinum-4,#D0D0D0)] bg-white pl-10 pr-3 py-2 text-sm text-[#0D2352] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[--brand-accent,#FECA00]"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-md border border-[var(--Platinum-4,#D0D0D0)] bg-white px-3 py-2 text-sm text-[#0D2352] hover:bg-gray-50">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 5H21M6 12H18M10 19H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="mx-4 mb-4 overflow-hidden rounded-md border border-[var(--Platinum-4,#D0D0D0)] md:mx-6">
        <div className="grid grid-cols-[1.4fr,0.8fr,1fr,1fr,1fr,40px] items-center gap-3 border-b border-[var(--Platinum-4,#D0D0D0)] bg-[#F8FAFC] px-4 py-3 text-[13px] font-medium text-[#5D5D5C]">
          <div>Tender name</div>
          <div>Status</div>
          <div>Assigned to</div>
          <div>Submission due date</div>
          <div>Response date</div>
          <div />
        </div>

        {filteredRows.length === 0 ? (
          <div className="px-4 py-8 text-sm text-[#5D5D5C]">No tenders match “{query}”.</div>
        ) : (
          filteredRows.map((row, idx) => (
            <div
              key={row.id}
              className={[
                "grid grid-cols-[1.4fr,0.8fr,1fr,1fr,1fr,40px] items-center gap-3 px-4 py-4 text-sm text-[#0D2352]",
                idx > 0 ? "border-t border-[var(--Platinum-4,#D0D0D0)]" : "",
              ].join(" ")}
            >
              <div>
                <div className="font-medium">{row.name}</div>
                <div className="text-xs text-[#5D5D5C]">{row.organisation}</div>
              </div>
              <div>
                <span className={row.statusClasses}>{row.statusLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#E5E7EB] text-xs font-bold text-[#0D2352]">
                  {row.assignedInitials}
                </span>
                <span>{row.assignedName}</span>
              </div>
              <div>
                <div>{row.dueDate}</div>
                {row.dueMeta ? <div className="text-xs text-[#1DAB87]">{row.dueMeta}</div> : null}
              </div>
              <div className="text-[#5D5D5C]">{row.responseDate ?? "Not set"}</div>
              <div className="grid place-items-center text-[#5D5D5C]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-sm text-[#5D5D5C]">
        <div>
          {filteredRows.length > 0 ? `Showing ${filteredRows.length} tender${filteredRows.length > 1 ? "s" : ""}` : "No results"}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--Platinum-4,#D0D0D0)] bg-white text-[#0D2352] disabled:opacity-40"
            disabled
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--Platinum-4,#D0D0D0)] bg-white text-[#0D2352]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}



