"use client";

import React from "react";

export type ScoreColumns = {
	A?: string;
	B?: string;
	C?: string;
	D?: string;
	E?: string;
};

export type EvaluationRow = {
	id: string;
	label: string;
	weighting?: string;
	scores: ScoreColumns;
	variant?: "normal" | "total" | "ranking";
};

export type FeedbackScores = {
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

export function FeedbackScoresTab({ feedback }: { feedback: FeedbackScores | null }) {
	if (!feedback) {
		return (
			<div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
				<div className="font-medium text-slate-900">Feedback scores</div>
				<p className="mt-2">
					No feedback has been recorded for this tender yet. Add feedback from the “Add feedback” button to see it here.
				</p>
			</div>
		);
	}

	return (
		<section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
			<header className="mb-4 flex items-center justify-between gap-4">
				<h2 className="text-base font-semibold text-slate-900">Feedback scores</h2>
				<button
					type="button"
					className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
				>
					Edit feedback
				</button>
			</header>

			<div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
				<dl className="grid gap-y-4 text-xs text-slate-600 sm:grid-cols-[180px,1fr]">
					<div className="sm:contents">
						<dt className="font-semibold text-slate-500">Client Contact Details</dt>
						<dd className="sm:col-start-2 sm:ml-0">
							<div className="space-y-0.5 text-slate-800">
								<div className="font-medium">{feedback.clientName}</div>
								{feedback.clientPhone && <div>{feedback.clientPhone}</div>}
								{feedback.clientEmail && <div className="text-slate-700">{feedback.clientEmail}</div>}
							</div>
						</dd>
					</div>

					<div className="sm:contents">
						<dt className="font-semibold text-slate-500">Comments</dt>
						<dd className="sm:col-start-2 sm:ml-0">
							<p className="max-w-3xl leading-relaxed text-slate-700">
								{feedback.comments || "No comments were provided."}
							</p>
						</dd>
					</div>

					<div className="sm:contents">
						<dt className="font-semibold text-slate-500">Supplied documents</dt>
						<dd className="sm:col-start-2 sm:ml-0">
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
												<span className="truncate text-xs font-medium text-slate-800">{doc.fileName}</span>
											</div>
											<div className="flex items-center gap-3 text-xs text-slate-500">
												<button type="button" className="hover:text-slate-800" title="View document">
													View
												</button>
												{doc.url && (
													<a
														href={doc.url}
														target="_blank"
														rel="noreferrer"
														className="hover:text-slate-800"
														title="Download"
													>
														Download
													</a>
												)}
											</div>
										</li>
									))}
								</ul>
							)}
						</dd>
					</div>
				</dl>
			</div>

			<div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
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
					<tbody className="divide-y divide-slate-200 text-slate-700">
						{feedback.evaluations.map((row) => {
							const isTotal = row.variant === "total";
							const isRanking = row.variant === "ranking";
							const baseRowClass = isRanking ? "bg-slate-50 text-slate-500" : "";
							const strongClass = isTotal ? "font-semibold" : "";
							return (
								<tr key={row.id} className={baseRowClass}>
									<td className={`px-4 py-3 align-top ${strongClass}`}>{row.label}</td>
									<td className={`px-4 py-3 align-top ${strongClass}`}>{row.weighting ?? "-"}</td>
									<td className={`px-4 py-3 align-top ${strongClass}`}>{row.scores.A ?? (isRanking ? "-" : "0%")}</td>
									<td className={`px-4 py-3 align-top ${strongClass}`}>{row.scores.B ?? (isRanking ? "-" : "0%")}</td>
									<td className={`px-4 py-3 align-top ${strongClass}`}>{row.scores.C ?? (isRanking ? "-" : "0%")}</td>
									<td className={`px-4 py-3 align-top ${strongClass}`}>{row.scores.D ?? (isRanking ? "-" : "0%")}</td>
									<td className={`px-4 py-3 align-top ${strongClass}`}>{row.scores.E ?? (isRanking ? "-" : "0%")}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</section>
	);
}


