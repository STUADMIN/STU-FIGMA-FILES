"use client";

import React, { useMemo, useState } from "react";

export type SubmittedDocument = {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  summary?: string;
  tags?: string[];
  content?: string;
};

type SubmittedDocumentsTabProps = {
  documents: SubmittedDocument[];
};

export default function SubmittedDocumentsTab({ documents }: SubmittedDocumentsTabProps) {
  const [query, setQuery] = useState("");
  const [searchContents, setSearchContents] = useState(true);
  const [sortKey, setSortKey] = useState<"uploadedAt" | "title">("uploadedAt");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredDocuments = useMemo(() => {
    const sorted = [...documents].sort((a, b) => {
      if (sortKey === "title") {
        return a.title.localeCompare(b.title);
      }

      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

    if (!normalizedQuery) {
      return sorted;
    }

    return sorted.filter((doc) => {
      const matchesTitle = doc.title.toLowerCase().includes(normalizedQuery);
      const matchesFileName = doc.fileName.toLowerCase().includes(normalizedQuery);

      if (!searchContents) {
        return matchesTitle || matchesFileName;
      }

      const contentFields = [
        doc.summary,
        doc.content,
        ...(doc.tags ?? []).map((tag) => `#${tag}`),
      ]
        .join(" ")
        .toLowerCase();

      return matchesTitle || matchesFileName || contentFields.includes(normalizedQuery);
    });
  }, [documents, normalizedQuery, searchContents, sortKey]);

  const resultLabel =
    filteredDocuments.length === documents.length && !normalizedQuery
      ? `${documents.length} ${documents.length === 1 ? "document" : "documents"}`
      : `${filteredDocuments.length} result${filteredDocuments.length === 1 ? "" : "s"}`;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-brand-navy">Submitted documents</h2>
          <p className="text-sm text-gray-600">
            Search across every supporting document attached to this tender. Include content search to match OCR extracts where available.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-brand-navy md:w-72">
            <SearchIcon />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder="Search by title or keyword"
              className="w-full border-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
          </label>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                checked={searchContents}
                onChange={(event) => setSearchContents(event.target.checked)}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
              />
              <span>Search document contents</span>
            </label>

            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as typeof sortKey)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-navy focus:outline-none"
            >
              <option value="uploadedAt">Newest first</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
        <span>{resultLabel}</span>
        {normalizedQuery ? (
          <button type="button" onClick={() => setQuery("")} className="font-semibold text-brand-navy hover:underline">
            Clear search
          </button>
        ) : null}
      </div>

      {filteredDocuments.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <li
              key={doc.id}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-gray-900">{highlightText(doc.title, normalizedQuery)}</p>
                  <p className="text-xs text-gray-500">
                    {doc.fileName} • {doc.fileSize}
                  </p>
                </div>
                <span className="rounded-full bg-brand-navy/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-navy">
                  {new Date(doc.uploadedAt).toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm text-gray-600">
                {doc.summary ? <p>{highlightText(doc.summary, normalizedQuery)}</p> : null}
                {searchContents && doc.content ? <ExpandablePreview text={doc.content} query={normalizedQuery} /> : null}
              </div>

              <footer className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="rounded-full bg-gray-100 px-2.5 py-1">Uploaded by {doc.uploadedBy}</span>
                {doc.tags?.map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-1 text-brand-navy">
                    #{tag}
                  </span>
                ))}
              </footer>

              <div className="mt-4 flex items-center gap-2 text-sm">
                <button
                  type="button"
                  className="rounded-lg border border-brand-navy bg-white px-3 py-1.5 font-medium text-brand-navy transition hover:bg-brand-navy hover:text-white"
                >
                  Preview
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-transparent bg-brand-navy px-3 py-1.5 font-medium text-white transition hover:bg-brand-navy/80"
                >
                  Download
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-sm text-gray-500">
          <p className="font-medium text-gray-700">No documents match “{query}”.</p>
          <p className="mt-2">Try searching for another keyword or disable content search to broaden the results.</p>
        </div>
      )}
    </section>
  );
}

function highlightText(text: string, normalizedQuery: string) {
  if (!normalizedQuery) return text;

  const regex = new RegExp(`(${escapeRegExp(normalizedQuery)})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === normalizedQuery.toLowerCase() ? (
      <mark key={index} className="rounded bg-brand-navy/15 px-0.5 text-brand-navy">
        {part}
      </mark>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    ),
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type ExpandablePreviewProps = {
  text: string;
  query: string;
};

function ExpandablePreview({ text, query }: ExpandablePreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const limit = 200;
  const normalized = text.trim();
  const shouldTruncate = normalized.length > limit;
  const displayed = expanded || !shouldTruncate ? normalized : `${normalized.slice(0, limit)}…`;

  return (
    <div className="rounded-xl bg-gray-100 px-3 py-2 text-xs text-gray-600">
      <div className="mb-2 font-semibold text-gray-500">Content match</div>
      <p>{highlightText(displayed, query)}</p>
      {shouldTruncate ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 font-medium text-brand-navy hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-gray-500"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="20" y1="20" x2="16.65" y2="16.65" />
    </svg>
  );
}
