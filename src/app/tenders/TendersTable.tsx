'use client';

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export type TenderRow = {
  id: string;
  tenderId: string;
  title: string;
  ref: string;
  status: string;
  assignee: string;
  due: string;
  dueMeta?: string;
  response: string;
};

type ColumnWidths = Record<string, number>;

type SortKey = "tenderId" | "title" | "status" | "assignee" | "due" | "response";

type TendersTableProps = {
  rows: TenderRow[];
  columnWidths: ColumnWidths;
};

export default function TendersTable({ rows, columnWidths }: TendersTableProps) {
  const statusOptions = useMemo(() => {
    const uniqueStatuses = Array.from(new Set(rows.map((row) => row.status)));
    return uniqueStatuses.sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("tenderId");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(statusOptions);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedStatuses((previous) => {
      const sortedPrevious = [...previous].sort();
      if (
        sortedPrevious.length === statusOptions.length &&
        sortedPrevious.every((value, index) => value === statusOptions[index])
      ) {
        return previous;
      }
      return statusOptions;
    });
  }, [statusOptions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!filtersOpen) return;
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFiltersOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [filtersOpen]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(row.status);
      if (!term) return matchesStatus;

      const haystack = [row.tenderId, row.title, row.ref, row.status, row.assignee]
        .join(" ")
        .toLowerCase();
      return matchesStatus && haystack.includes(term);
    });
  }, [rows, searchTerm, selectedStatuses]);

  const sortedRows = useMemo(() => {
    const data = [...filteredRows];

    const getSortValue = (row: TenderRow) => {
      switch (sortKey) {
        case "tenderId":
          return row.tenderId;
        case "title":
          return row.title;
        case "status":
          return row.status;
        case "assignee":
          return row.assignee;
        case "due":
          return parseDateValue(row.due);
        case "response":
          return parseDateValue(row.response);
        default:
          return row.title;
      }
    };

    const compareValues = (a: TenderRow, b: TenderRow) => {
      const aValue = getSortValue(a);
      const bValue = getSortValue(b);

      if (aValue === null || aValue === undefined) return bValue === null || bValue === undefined ? 0 : 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue instanceof Date && bValue instanceof Date) {
        return aValue.getTime() - bValue.getTime();
      }

      return String(aValue).localeCompare(String(bValue), undefined, { sensitivity: "base", numeric: true });
    };

    data.sort((a, b) => {
      const result = compareValues(a, b);
      return sortDirection === "asc" ? result : -result;
    });

    return data;
  }, [filteredRows, sortDirection, sortKey]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((previous) =>
      previous.includes(status)
        ? previous.filter((item) => item !== status)
        : [...previous, status].sort((a, b) => a.localeCompare(b))
    );
  };

  const clearStatuses = () => setSelectedStatuses([]);
  const selectAllStatuses = () => setSelectedStatuses(statusOptions);

  return (
    <div className="flex w-full flex-col gap-6 rounded-[28px] border border-[#EAECF0] bg-white p-7 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3 sm:justify-between">
          <div className="relative w-full max-w-[420px] flex-1">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search live tenders"
              className="h-11 w-full rounded-full border border-gray-200 py-2 pl-12 pr-4 text-sm outline-none transition focus:border-gray-300"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
            >
              <path
                d="M21.5306 20.4696L16.8366 15.7765C18.1971 14.1431 18.8755 12.048 18.7307 9.92715C18.5859 7.80629 17.629 5.82289 16.0591 4.38956C14.4892 2.95623 12.4272 2.18333 10.3019 2.23163C8.17666 2.27993 6.15184 3.14571 4.64867 4.64888C3.1455 6.15205 2.27971 8.17687 2.23141 10.3021C2.18311 12.4274 2.95602 14.4894 4.38935 16.0593C5.82268 17.6293 7.80607 18.5861 9.92694 18.7309C12.0478 18.8757 14.1428 18.1973 15.7762 16.8368L20.4694 21.5308C20.5391 21.6005 20.6218 21.6558 20.7128 21.6935C20.8039 21.7312 20.9015 21.7506 21 21.7506C21.0985 21.7506 21.1961 21.7312 21.2872 21.6935C21.3782 21.6558 21.4609 21.6005 21.5306 21.5308C21.6003 21.4612 21.6556 21.3784 21.6933 21.2874C21.731 21.1963 21.7504 21.0988 21.7504 21.0002C21.7504 20.9017 21.731 20.8041 21.6933 20.713C21.6556 20.622 21.6003 20.5393 21.5306 20.4696ZM3.75 10.5002C3.75 9.16519 4.14588 7.86015 4.88758 6.75011C5.62928 5.64008 6.68349 4.77492 7.91689 4.26403C9.15029 3.75314 10.5075 3.61946 11.8169 3.87991C13.1262 4.14036 14.329 4.78324 15.273 5.72724C16.217 6.67125 16.8599 7.87398 17.1203 9.18335C17.3808 10.4927 17.2471 11.8499 16.7362 13.0833C16.2253 14.3167 15.3601 15.3709 14.2501 16.1126C13.1401 16.8543 11.835 17.2502 10.5 17.2502C8.7104 17.2482 6.99466 16.5364 5.72922 15.271C4.46378 14.0056 3.75199 12.2898 3.75 10.5002Z"
                fill="#0D2352"
              />
            </svg>
          </div>

          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFiltersOpen((previous) => !previous)}
              className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              <span aria-hidden>⏷</span>
              Filter
            </button>

            {filtersOpen && (
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm font-semibold text-[#0D2352]">Status</span>
                  <button
                    type="button"
                    onClick={clearStatuses}
                    className="text-xs text-[#4C7CF0] hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex max-h-44 flex-col gap-2 overflow-auto pr-1">
                  {statusOptions.map((status) => (
                    <label key={status} className="flex items-center gap-2 text-sm text-[#0D2352]">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={() => toggleStatus(status)}
                        className="h-4 w-4 rounded border-gray-300 text-[#4C7CF0] focus:ring-[#4C7CF0]"
                      />
                      <span>{status}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={selectAllStatuses}
                    className="text-xs text-[#4C7CF0] hover:underline"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="rounded-lg bg-[#4C7CF0] px-3 py-1 text-xs font-semibold text-white"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#EAECF0]">
          <div className="flex h-11 items-center bg-[#F7F7F7] px-5 text-sm font-semibold text-[#0D2352]">
            <HeaderButton
              width={columnWidths.tenderId}
              label="Tender ID"
              sortKey="tenderId"
              activeKey={sortKey}
              direction={sortDirection}
              onClick={toggleSort}
            />
            <HeaderButton
              width={columnWidths.name}
              label="Tender name"
              sortKey="title"
              activeKey={sortKey}
              direction={sortDirection}
              onClick={toggleSort}
            />
            <HeaderButton
              width={columnWidths.status}
              label="Status"
              sortKey="status"
              activeKey={sortKey}
              direction={sortDirection}
              onClick={toggleSort}
            />
            <HeaderButton
              width={columnWidths.assigned}
              label="Assigned to"
              sortKey="assignee"
              activeKey={sortKey}
              direction={sortDirection}
              onClick={toggleSort}
            />
            <HeaderButton
              width={columnWidths.due}
              label="Submission due date"
              sortKey="due"
              activeKey={sortKey}
              direction={sortDirection}
              onClick={toggleSort}
            />
            <HeaderButton
              width={columnWidths.response}
              label="Response date"
              sortKey="response"
              activeKey={sortKey}
              direction={sortDirection}
              onClick={toggleSort}
            />
            <div style={{ width: columnWidths.actions }} />
          </div>

          {sortedRows.length === 0 ? (
            <div className="flex h-32 items-center justify-center bg-white text-sm text-[#5D5D5C]">
              No tenders to show yet. Create a new tender to get started.
            </div>
          ) : (
            sortedRows.map((row) => {
              const newRow = {
                id: row.id,
                tenderId: row.tenderId,
                title: row.title,
                ref: row.ref,
                status: row.status,
                assignee: row.assignee,
                due: row.due,
                dueMeta: row.dueMeta,
                response: row.response,
              };

              return (
                <Link
                  href={`/tenders/${encodeURIComponent(row.tenderId)}`}
                  key={row.id}
                  className="group flex items-center border-t border-[#EAECF0] bg-white px-5 transition hover:bg-[#F7F9FF]"
                  style={{ height: 64 }}
                >
                  <div className="text-[#0D2352]" style={{ width: columnWidths.tenderId }}>
                    {row.tenderId}
                  </div>
                  <div className="flex flex-col justify-center gap-1" style={{ width: columnWidths.name }}>
                    <span className="font-semibold text-[#0D2352] group-hover:text-[#0F3FB4]">{row.title}</span>
                    <span className="text-xs text-[#5D5D5C]">{row.ref}</span>
                  </div>
                  <div style={{ width: columnWidths.status }}>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold ${getStatusClass(row.status)}`}>
                      {row.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3" style={{ width: columnWidths.assigned }}>
                    <span className="inline-grid h-8 w-8 place-items-center rounded-full bg-[#F4F5F7] text-[13px] font-semibold text-[#0D2352]">
                      {getInitials(row.assignee)}
                    </span>
                    <span className="text-[#0D2352]">{row.assignee}</span>
                  </div>
                  <div className="flex flex-col justify-center gap-1" style={{ width: columnWidths.due }}>
                    <span className="text-[#0D2352]">{row.due}</span>
                    {row.dueMeta ? <span className="text-xs text-[#0AD6A1]">{row.dueMeta}</span> : null}
                  </div>
                  <div className="text-[#0D2352]" style={{ width: columnWidths.response }}>
                    {row.response}
                  </div>
                  <div className="flex justify-end pl-2" style={{ width: columnWidths.actions }}>
                    {/* action placeholder intentionally left blank */}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-[#5D5D5C] sm:flex-row sm:items-center sm:justify-between">
        <span>Page 1 of 1</span>
        <div className="flex items-center gap-2">
          <button disabled className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500 disabled:opacity-60">
            Prev
          </button>
          <button disabled className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500 disabled:opacity-60">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

type HeaderButtonProps = {
  width: number;
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: "asc" | "desc";
  onClick: (key: SortKey) => void;
};

function HeaderButton({ width, label, sortKey, activeKey, direction, onClick }: HeaderButtonProps) {
  const isActive = activeKey === sortKey;

  return (
    <button
      type="button"
      onClick={() => onClick(sortKey)}
      className="flex items-center gap-2 text-left text-[#0D2352] transition hover:text-[#4C7CF0]"
      style={{ width }}
    >
      <span>{label}</span>
      <SortIcon active={isActive} direction={direction} />
    </button>
  );
}

function SortIcon({ active, direction }: { active: boolean; direction: "asc" | "desc" }) {
  const maskId = useId();
  const color = active ? "#0D2352" : "#A3A3A3";

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <mask id={maskId} fill="white">
        <path d="M11.3538 10.6462C11.4003 10.6926 11.4372 10.7477 11.4623 10.8084C11.4875 10.8691 11.5004 10.9342 11.5004 10.9999C11.5004 11.0656 11.4875 11.1307 11.4623 11.1914C11.4372 11.2521 11.4003 11.3072 11.3538 11.3537L8.35378 14.3537C8.30735 14.4001 8.2522 14.437 8.1915 14.4622C8.13081 14.4873 8.06574 14.5003 8.00003 14.5003C7.93433 14.5003 7.86926 14.4873 7.80856 14.4622C7.74786 14.437 7.69272 14.4001 7.64628 14.3537L4.64628 11.3537C4.55246 11.2598 4.49976 11.1326 4.49976 10.9999C4.49976 10.8672 4.55246 10.74 4.64628 10.6462C4.7401 10.5523 4.86735 10.4996 5.00003 10.4996C5.13272 10.4996 5.25996 10.5523 5.35378 10.6462L8.00003 13.293L10.6463 10.6462C10.6927 10.5997 10.7479 10.5628 10.8086 10.5376C10.8693 10.5125 10.9343 10.4995 11 10.4995C11.0657 10.4995 11.1308 10.5125 11.1915 10.5376C11.2522 10.5628 11.3073 10.5997 11.3538 10.6462ZM5.35378 5.35366L8.00003 2.70678L10.6463 5.35366C10.7401 5.44748 10.8674 5.50018 11 5.50018C11.1327 5.50018 11.26 5.44748 11.3538 5.35366C11.4476 5.25984 11.5003 5.13259 11.5003 4.99991C11.5003 4.86722 11.4476 4.73998 11.3538 4.64615L8.35378 1.64615C8.30735 1.59967 8.2522 1.56279 8.1915 1.53763C8.13081 1.51246 8.06574 1.49951 8.00003 1.49951C7.93433 1.49951 7.86926 1.51246 7.80856 1.53763C7.74786 1.56279 7.69272 1.59967 7.64628 1.64615L4.64628 4.64615C4.55246 4.73998 4.49976 4.86722 4.49976 4.99991C4.49976 5.13259 4.55246 5.25983 4.64628 5.35365C4.7401 5.44748 4.86735 5.50018 5.00003 5.50018C5.13272 5.50018 5.25996 5.44748 5.35378 5.35366Z" />
      </mask>
      <path
        d="M11.3538 10.6462C11.4003 10.6926 11.4372 10.7477 11.4623 10.8084C11.4875 10.8691 11.5004 10.9342 11.5004 10.9999C11.5004 11.0656 11.4875 11.1307 11.4623 11.1914C11.4372 11.2521 11.4003 11.3072 11.3538 11.3537L8.35378 14.3537C8.30735 14.4001 8.2522 14.437 8.1915 14.4622C8.13081 14.4873 8.06574 14.5003 8.00003 14.5003C7.93433 14.5003 7.86926 14.4873 7.80856 14.4622C7.74786 14.437 7.69272 14.4001 7.64628 14.3537L4.64628 11.3537C4.55246 11.2598 4.49976 11.1326 4.49976 10.9999C4.49976 10.8672 4.55246 10.74 4.64628 10.6462C4.7401 10.5523 4.86735 10.4996 5.00003 10.4996C5.13272 10.4996 5.25996 10.5523 5.35378 10.6462L8.00003 13.293L10.6463 10.6462C10.6927 10.5997 10.7479 10.5628 10.8086 10.5376C10.8693 10.5125 10.9343 10.4995 11 10.4995C11.0657 10.4995 11.1308 10.5125 11.1915 10.5376C11.2522 10.5628 11.3073 10.5997 11.3538 10.6462ZM5.35378 5.35366L8.00003 2.70678L10.6463 5.35366C10.7401 5.44748 10.8674 5.50018 11 5.50018C11.1327 5.50018 11.26 5.44748 11.3538 5.35366C11.4476 5.25984 11.5003 5.13259 11.5003 4.99991C11.5003 4.86722 11.4476 4.73998 11.3538 4.64615L8.35378 1.64615C8.30735 1.59967 8.2522 1.56279 8.1915 1.53763C8.13081 1.51246 8.06574 1.49951 8.00003 1.49951C7.93433 1.49951 7.86926 1.51246 7.80856 1.53763C7.74786 1.56279 7.69272 1.59967 7.64628 1.64615L4.64628 4.64615C4.55246 4.73998 4.49976 4.86722 4.49976 4.99991C4.49976 5.13259 4.55246 5.25983 4.64628 5.35365C4.7401 5.44748 4.86735 5.50018 5.00003 5.50018C5.13272 5.50018 5.25996 5.44748 5.35378 5.35366Z"
        fill={color}
      />
      <path
        d="M11.3538 10.6462L10.4128 11.5861L10.4139 11.5871L11.3538 10.6462ZM11.3538 11.3537L10.4139 10.4127L10.4133 10.4132L11.3538 11.3537ZM8.35378 14.3537L7.41333 13.4132L7.41281 13.4137L8.35378 14.3537ZM7.64628 14.3537L8.58726 13.4137L8.58674 13.4132L7.64628 14.3537ZM5.35378 10.6462L6.29435 9.70581L6.29424 9.7057L5.35378 10.6462ZM8.00003 13.293L7.05947 14.2334L8.00003 15.1742L8.9406 14.2334L8.00003 13.293ZM10.6463 10.6462L11.5868 11.5865L11.5873 11.5861L10.6463 10.6462ZM5.35378 5.35366L6.29424 6.29411L6.29435 6.294L5.35378 5.35366ZM8.00003 2.70678L8.9406 1.76644L8.00003 0.825654L7.05947 1.76644L8.00003 2.70678ZM10.6463 5.35366L9.70572 6.294L9.70583 6.29411L10.6463 5.35366ZM11 5.50018V4.17018V5.50018ZM11.3538 4.64615L12.2942 3.7057L11.3538 4.64615ZM8.35378 1.64615L7.41281 2.58608L7.41333 2.58661L8.35378 1.64615ZM7.64628 1.64615L8.58674 2.58661L8.58726 2.58608L7.64628 1.64615ZM4.64628 4.64615L3.70583 3.7057H3.70583L4.64628 4.64615ZM4.49976 4.99991H3.16976H4.49976ZM5.00003 5.50018V4.17018V5.50018Z"
        fill={color}
        mask={`url(#${maskId})`}
        transform={direction === "desc" ? "scale(1, -1) translate(0, -16)" : undefined}
      />
    </svg>
  );
}

function parseDateValue(value: string) {
  if (!value || value.toLowerCase() === "not set") return null;
  const parts = value.split("/");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  const fullYear = year.length === 2 ? `20${year}` : year;
  const parsed = new Date(Number(fullYear), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

function getStatusClass(status?: string | null) {
  const value = (status || "").toLowerCase();
  if (value.includes("progress")) return "bg-[#E6D9FA] text-[#5C3CAF]";
  if (value.includes("submitted")) return "bg-[#E3EEFF] text-[#2266D6]";
  if (value.includes("success")) return "bg-[#DDF7E9] text-[#1F7A43]";
  if (value.includes("unsuccess")) return "bg-[#FFE5E5] text-[#C53D3D]";
  return "bg-[#E6D9FA] text-[#5C3CAF]";
}

