"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo } from "react";

type SuppliedDocument = {
	id?: string;
	fileName?: string;
	url?: string;
};

type EvaluationRow = {
	label: string;
	weighting?: string;
	a?: string;
	b?: string;
	c?: string;
	d?: string;
	e?: string;
	totalAwarded?: string;
	ranking?: string;
};

type FeedbackPreviewData = {
	clientContactName?: string;
	clientContactPhone?: string;
	clientContactEmail?: string;
	comments?: string;
	suppliedDocuments?: SuppliedDocument[];
	evaluations?: EvaluationRow[];
	overallRanking?: string;
};

function tryDecodeData(raw: string | null): FeedbackPreviewData | null {
	if (!raw) return null;

	// 1) Try base64 -> JSON
	try {
		// atob is available in the browser
		const json = atob(raw);
		return JSON.parse(json);
	} catch {
		// ignore and fall through
	}

	// 2) Try URI-encoded JSON
	try {
		const json = decodeURIComponent(raw);
		return JSON.parse(json);
	} catch {
		// ignore and fall through
	}

	return null;
}

export default function FeedbackPreviewPage() {
	const params = useParams<{ tenderId: string }>();
	const searchParams = useSearchParams();

	const { feedback, hasData } = useMemo(() => {
		const raw = searchParams.get("data");
		const decoded = tryDecodeData(raw);
		return { feedback: decoded, hasData: !!decoded };
	}, [searchParams]);

	const tenderId = params?.tenderId ?? "";

	if (!hasData || !feedback) {
		return (
			<main className="min-h-dvh bg-[#f5f5f5]">
				<div className="mx-auto max-w-4xl px-4 py-12">
					<div className="rounded-2xl bg-white p-8 shadow-sm">
						<div className="mb-4 flex items-center justify-between gap-4">
							<h1 className="text-xl font-semibold">
								Feedback scores – Preview
							</h1>
							<Link
								href={`/tenders/${tenderId}`}
								className="text-sm font-medium text-[#0D2352]"
							>
								Back to tender
							</Link>
						</div>

						<div className="rounded-md border border-[#facc6b] bg-[#fff7e6] px-4 py-3 text-sm text-[#7c5300]">
							No data provided. Submit the form from the feedback modal to view
							a preview.
						</div>
					</div>
				</div>
			</main>
		);
	}

	const suppliedDocs = feedback.suppliedDocuments ?? [];
	const evaluations = feedback.evaluations ?? [];

	return (
		<main className="min-h-dvh bg-[#f5f5f5]">
			<div className="mx-auto max-w-4xl px-4 py-12">
				<div className="rounded-2xl bg-white p-8 shadow-sm">
					<div className="mb-6 flex items-center justify-between gap-4">
						<h1 className="text-xl font-semibold">
							Feedback scores – Preview
						</h1>
						<Link
							href={`/tenders/${tenderId}`}
							className="text-sm font-medium text-[#0D2352]"
						>
							Back to tender
						</Link>
					</div>

					{/* Client contact details */}
					<section className="mb-6">
						<h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7c7c7c]">
							Client Contact Details
						</h2>
						<p className="text-sm font-medium">
							{feedback.clientContactName || "—"}
						</p>
						<p className="text-sm">
							{feedback.clientContactPhone || ""}
							{feedback.clientContactPhone && feedback.clientContactEmail
								? " · "
								: ""}
							{feedback.clientContactEmail || ""}
						</p>
					</section>

					{/* Comments */}
					<section className="mb-6">
						<h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7c7c7c]">
							Comments
						</h2>
						<p className="text-sm leading-relaxed">
							{feedback.comments || "No comments provided."}
						</p>
					</section>

					{/* Supplied documents */}
					<section className="mb-8">
						<h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7c7c7c]">
							Supplied documents
						</h2>
						{suppliedDocs.length === 0 ? (
							<p className="text-sm">No documents attached.</p>
						) : (
							<ul className="space-y-2 text-sm">
								{suppliedDocs.map((doc, idx) => (
									<li
										key={doc.id ?? idx}
										className="flex items-center justify-between rounded-lg border border-[#e5e5e5] px-3 py-2"
									>
										<span>{doc.fileName || "Document"}</span>
										{doc.url && (
											<a
												href={doc.url}
												target="_blank"
												rel="noreferrer"
												className="text-xs font-medium text-[#0D2352]"
											>
												View
											</a>
										)}
									</li>
								))}
							</ul>
						)}
					</section>

					{/* Evaluation table */}
					<section>
						<h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#7c7c7c]">
							Evaluation
						</h2>
						{evaluations.length === 0 ? (
							<p className="text-sm">No evaluation scores captured.</p>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full border-t text-sm">
									<thead>
										<tr className="border-b bg-[#fafafa] text-left text-xs font-semibold text-[#5a5a5a]">
											<th className="px-3 py-2">Evaluation</th>
											<th className="px-3 py-2">Weighting</th>
											<th className="px-3 py-2">A</th>
											<th className="px-3 py-2">B</th>
											<th className="px-3 py-2">C</th>
											<th className="px-3 py-2">D</th>
											<th className="px-3 py-2">E</th>
											<th className="px-3 py-2">Total awarded</th>
											<th className="px-3 py-2">Ranking</th>
										</tr>
									</thead>
									<tbody>
										{evaluations.map((row, idx) => (
											<tr key={idx} className="border-b last:border-0">
												<td className="px-3 py-2">{row.label}</td>
												<td className="px-3 py-2">{row.weighting || "—"}</td>
												<td className="px-3 py-2">{row.a || "0%"}</td>
												<td className="px-3 py-2">{row.b || "0%"}</td>
												<td className="px-3 py-2">{row.c || "0%"}</td>
												<td className="px-3 py-2">{row.d || "0%"}</td>
												<td className="px-3 py-2">{row.e || "0%"}</td>
												<td className="px-3 py-2">
													{row.totalAwarded || "0%"}
												</td>
												<td className="px-3 py-2">{row.ranking || "-"}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</section>

					{feedback.overallRanking && (
						<section className="mt-6">
							<p className="text-sm">
								<span className="font-semibold">Overall ranking: </span>
								{feedback.overallRanking}
							</p>
						</section>
					)}
				</div>
			</div>
		</main>
	);
}
import Link from "next/link";
import { Buffer } from "buffer";

type SuppliedDocument = {
	id?: string;
	fileName?: string;
	url?: string;
};

type EvaluationRow = {
	label: string;
	weighting?: string;
	a?: string;
	b?: string;
	c?: string;
	d?: string;
	e?: string;
	totalAwarded?: string;
	ranking?: string;
};

type FeedbackPreviewData = {
	clientContactName?: string;
	clientContactPhone?: string;
	clientContactEmail?: string;
	comments?: string;
	suppliedDocuments?: SuppliedDocument[];
	evaluations?: EvaluationRow[];
	overallRanking?: string;
};

type PageProps = {
	params: { tenderId: string };
	searchParams?: { [key: string]: string | string[] | undefined };
};

function decodeBase64ToJson(encoded: string): FeedbackPreviewData | null {
	try {
		const json = Buffer.from(encoded, "base64").toString("utf8");
		return JSON.parse(json);
	} catch (err) {
		console.error("Failed to decode feedback preview data", err);
		return null;
	}
}

export default function FeedbackPreviewPage({
	params,
	searchParams = {},
}: PageProps) {
	const encoded =
		Array.isArray(searchParams.data) ? searchParams.data[0] : searchParams.data;

	const feedback: FeedbackPreviewData | null = encoded
		? decodeBase64ToJson(encoded)
		: null;

	const hasData = !!feedback;

	if (!hasData) {
		return (
			<main className="min-h-dvh bg-[#f5f5f5]">
				<div className="mx-auto max-w-4xl px-4 py-12">
					<div className="rounded-2xl bg-white p-8 shadow-sm">
						<div className="mb-4 flex items-center justify-between gap-4">
							<h1 className="text-xl font-semibold">
								Feedback scores – Preview
							</h1>
							<Link
								href={`/tenders/${params.tenderId}`}
								className="text-sm font-medium text-[#0D2352]"
							>
								Back to tender
							</Link>
						</div>

						<div className="rounded-md border border-[#facc6b] bg-[#fff7e6] px-4 py-3 text-sm text-[#7c5300]">
							No data provided. Submit the form from the feedback modal to view
							a preview.
						</div>
					</div>
				</div>
			</main>
		);
	}

	const suppliedDocs = feedback.suppliedDocuments ?? [];
	const evaluations = feedback.evaluations ?? [];

	return (
		<main className="min-h-dvh bg-[#f5f5f5]">
			<div className="mx-auto max-w-4xl px-4 py-12">
				<div className="rounded-2xl bg-white p-8 shadow-sm">
					<div className="mb-6 flex items-center justify-between gap-4">
						<h1 className="text-xl font-semibold">
							Feedback scores – Preview
						</h1>
						<Link
							href={`/tenders/${params.tenderId}`}
							className="text-sm font-medium text-[#0D2352]"
						>
							Back to tender
						</Link>
					</div>

					{/* Client contact details */}
					<section className="mb-6">
						<h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7c7c7c]">
							Client Contact Details
						</h2>
						<p className="text-sm font-medium">
							{feedback.clientContactName || "—"}
						</p>
						<p className="text-sm">
							{feedback.clientContactPhone || ""}
							{feedback.clientContactPhone && feedback.clientContactEmail
								? " · "
								: ""}
							{feedback.clientContactEmail || ""}
						</p>
					</section>

					{/* Comments */}
					<section className="mb-6">
						<h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7c7c7c]">
							Comments
						</h2>
						<p className="text-sm leading-relaxed">
							{feedback.comments || "No comments provided."}
						</p>
					</section>

					{/* Supplied documents */}
					<section className="mb-8">
						<h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7c7c7c]">
							Supplied documents
						</h2>
						{suppliedDocs.length === 0 ? (
							<p className="text-sm">No documents attached.</p>
						) : (
							<ul className="space-y-2 text-sm">
								{suppliedDocs.map((doc, idx) => (
									<li
										key={doc.id ?? idx}
										className="flex items-center justify-between rounded-lg border border-[#e5e5e5] px-3 py-2"
									>
										<span>{doc.fileName || "Document"}</span>
										{doc.url && (
											<a
												href={doc.url}
												target="_blank"
												rel="noreferrer"
												className="text-xs font-medium text-[#0D2352]"
											>
												View
											</a>
										)}
									</li>
								))}
							</ul>
						)}
					</section>

					{/* Evaluation table */}
					<section>
						<h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#7c7c7c]">
							Evaluation
						</h2>
						{evaluations.length === 0 ? (
							<p className="text-sm">No evaluation scores captured.</p>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full border-t text-sm">
									<thead>
										<tr className="border-b bg-[#fafafa] text-left text-xs font-semibold text-[#5a5a5a]">
											<th className="px-3 py-2">Evaluation</th>
											<th className="px-3 py-2">Weighting</th>
											<th className="px-3 py-2">A</th>
											<th className="px-3 py-2">B</th>
											<th className="px-3 py-2">C</th>
											<th className="px-3 py-2">D</th>
											<th className="px-3 py-2">E</th>
											<th className="px-3 py-2">Total awarded</th>
											<th className="px-3 py-2">Ranking</th>
										</tr>
									</thead>
									<tbody>
										{evaluations.map((row, idx) => (
											<tr key={idx} className="border-b last:border-0">
												<td className="px-3 py-2">{row.label}</td>
												<td className="px-3 py-2">{row.weighting || "—"}</td>
												<td className="px-3 py-2">{row.a || "0%"}</td>
												<td className="px-3 py-2">{row.b || "0%"}</td>
												<td className="px-3 py-2">{row.c || "0%"}</td>
												<td className="px-3 py-2">{row.d || "0%"}</td>
												<td className="px-3 py-2">{row.e || "0%"}</td>
												<td className="px-3 py-2">
													{row.totalAwarded || "0%"}
												</td>
												<td className="px-3 py-2">{row.ranking || "-"}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</section>

					{feedback.overallRanking && (
						<section className="mt-6">
							<p className="text-sm">
								<span className="font-semibold">Overall ranking: </span>
								{feedback.overallRanking}
							</p>
						</section>
					)}
				</div>
			</div>
		</main>
	);
}

"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";

type ScoreColumns = {
	A?: string;
	B?: string;
	C?: string;
	D?: string;
	E?: string;
};

type EvaluationRow = {
	id: string;
	label: string;
	weighting?: string;
	scores: ScoreColumns;
	variant?: "normal" | "total" | "ranking";
};

type FeedbackPreviewData = {
	clientName: string;
	clientPhone?: string;
	clientEmail?: string;
	comments?: string;
	suppliedDocuments: {
		id: string;
		fileName: string;
		url?: string;
	}[];
	evaluations: EvaluationRow[];
};

/**
 * Try to turn the ?data=... value into JSON.
 * Supports:
 *  - encodeURIComponent(JSON.stringify(obj))
 *  - btoa(JSON.stringify(obj))  (Base64)
 */
function parseFeedbackData(raw: string | null): FeedbackPreviewData | null {
	if (!raw) return null;
	const candidates: string[] = [];
	// As-is
	candidates.push(raw);
	// URI decoded
	try {
		const decoded = decodeURIComponent(raw);
		candidates.push(decoded);
	} catch {
		// ignore
	}
	// Base64 decoded
	try {
		const base64Decoded = atob(raw);
		candidates.push(base64Decoded);
	} catch {
		// ignore
	}
	for (const candidate of candidates) {
		try {
			const parsed = JSON.parse(candidate);
			return parsed as FeedbackPreviewData;
		} catch {
			// try next
		}
	}
	return null;
}

export default function FeedbackPreviewPage() {
	const params = useParams<{ tenderId: string }>();
	const searchParams = useSearchParams();

	const tenderId = params?.tenderId;
	const backHref = tenderId ? `/tenders/${tenderId}` : "/tenders";

	const feedback = useMemo(
		() => parseFeedbackData(searchParams.get("data")),
		[searchParams]
	);

	return (
		<main className="min-h-dvh bg-slate-100">
			<div className="mx-auto flex min-h-dvh max-w-4xl items-start justify-center px-4 py-10">
				<div className="w-full rounded-2xl bg-white p-8 shadow-sm">
					<div className="mb-6 flex items-center justify-between">
						<h1 className="text-xl font-semibold text-slate-900">
							Feedback scores – Preview
						</h1>
						<Link
							href={backHref}
							className="text-sm font-medium text-slate-700 hover:underline"
						>
							Back to tender
						</Link>
					</div>

					{!feedback ? (
						<div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
							No data provided. Submit the form from the feedback modal to view
							a preview.
						</div>
					) : (
						<FeedbackPreviewCard feedback={feedback} />
					)}
				</div>
			</div>
		</main>
	);
}

function FeedbackPreviewCard({ feedback }: { feedback: FeedbackPreviewData }) {
	return (
		<section className="space-y-6 text-sm text-slate-700">
			{/* Top details */}
			<div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
				<dl className="grid gap-y-4 text-xs sm:grid-cols-[180px,1fr]">
					<div className="sm:contents">
						<dt className="font-semibold text-slate-500">
							Client Contact Details
						</dt>
						<dd className="sm:col-start-2">
							<div className="space-y-0.5 text-slate-800">
								<div className="font-medium">{feedback.clientName}</div>
								{feedback.clientPhone && <div>{feedback.clientPhone}</div>}
								{feedback.clientEmail && (
									<div className="text-slate-700">
										{feedback.clientEmail}
									</div>
								)}
							</div>
						</dd>
					</div>

					<div className="sm:contents">
						<dt className="font-semibold text-slate-500">Comments</dt>
						<dd className="sm:col-start-2">
							<p className="max-w-3xl leading-relaxed">
								{feedback.comments || "No comments were provided."}
							</p>
						</dd>
					</div>

					<div className="sm:contents">
						<dt className="font-semibold text-slate-500">
							Supplied documents
						</dt>
						<dd className="sm:col-start-2">
							{feedback.suppliedDocuments.length === 0 ? (
								<p>No documents were uploaded with this feedback.</p>
							) : (
								<ul className="space-y-2">
									{feedback.suppliedDocuments.map((doc) => (
										<li
											key={doc.id}
											className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
										>
											<div className="flex items-center gap-2">
												<span className="inline-flex items-center justify-center rounded bg-rose-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-700">
													PDF
												</span>
												<span className="truncate text-xs font-medium text-slate-800">
													{doc.fileName}
												</span>
											</div>
										</li>
									))}
								</ul>
							)}
						</dd>
					</div>
				</dl>
			</div>

			{/* Table of scores */}
			<div className="overflow-x-auto rounded-lg border border-slate-200">
				<table className="min-w-full border-collapse text-xs">
					<thead className="bg-slate-50 text-left font-semibold text-slate-600">
						<tr>
							<th className="px-4 py-3">Evaluation</th>
							<th className="px-4 py-3">Weighting</th>
							<th className="px-4 py-3">A (G&amp;S)</th>
							<th className="px-4 py-3">B</th>
							<th className="px-4 py-3">C</th>
							<th className="px-4 py-3">D</th>
							<th className="px-4 py-3">E</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200">
						{feedback.evaluations.map((row) => {
							const isTotal = row.variant === "total";
							const isRanking = row.variant === "ranking";
							const rowClass = isRanking ? "bg-slate-50 text-slate-500" : "";
							const strong = isTotal ? "font-semibold" : "";
							return (
								<tr key={row.id} className={rowClass}>
									<td className={`px-4 py-3 ${strong}`}>{row.label}</td>
									<td className={`px-4 py-3 ${strong}`}>
										{row.weighting ?? (isRanking ? "-" : "")}
									</td>
									<td className={`px-4 py-3 ${strong}`}>
										{row.scores.A ?? (isRanking ? "-" : "0%")}
									</td>
									<td className={`px-4 py-3 ${strong}`}>
										{row.scores.B ?? (isRanking ? "-" : "0%")}
									</td>
									<td className={`px-4 py-3 ${strong}`}>
										{row.scores.C ?? (isRanking ? "-" : "0%")}
									</td>
									<td className={`px-4 py-3 ${strong}`}>
										{row.scores.D ?? (isRanking ? "-" : "0%")}
									</td>
									<td className={`px-4 py-3 ${strong}`}>
										{row.scores.E ?? (isRanking ? "-" : "0%")}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</section>
	);
}


