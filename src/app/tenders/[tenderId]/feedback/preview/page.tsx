
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


