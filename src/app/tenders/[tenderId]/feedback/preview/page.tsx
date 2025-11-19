import Link from "next/link";
import { Buffer } from "buffer";

type SplitRow = {
	id: string;
	description: string;
	percentage: number;
};

type Attachment = {
	id?: string;
	fileName?: string;
	url?: string;
};

type FeedbackPreviewData = {
	fullName?: string;
	phoneNumber?: string;
	emailAddress?: string;
	comments?: string;
	participantsCount?: number;
	evaluationBreakdown?: string;
	splits?: SplitRow[];
	attachments?: Attachment[];
};

type PageProps = {
	params: { tenderId: string };
	searchParams?: { [key: string]: string | string[] | undefined };
};

function decodeBase64Json(encoded: string | undefined): FeedbackPreviewData | null {
	if (!encoded) return null;
	try {
		const normalized = Array.isArray(encoded) ? encoded[0] : encoded;
		const jsonStr = Buffer.from(normalized, "base64").toString("utf8");
		return JSON.parse(jsonStr) as FeedbackPreviewData;
	} catch (err) {
		console.error("Failed to decode feedback preview data", err);
		return null;
	}
}

export default function FeedbackPreviewPage({
	params,
	searchParams = {},
}: PageProps) {
	const tenderId = params.tenderId;

	const raw =
		typeof searchParams.data === "string"
			? searchParams.data
			: Array.isArray(searchParams.data)
			? searchParams.data[0]
			: undefined;

	const feedback = decodeBase64Json(raw);
	const hasData = !!feedback;

	// If we have data, redirect to the tender page with it as a query to show the Feedback tab
	if (hasData && raw) {
		// Use a client-side redirect fallback (no next/navigation in this file)
		if (typeof window !== "undefined") {
			window.location.replace(`/tenders/${params.tenderId}?feedback=${encodeURIComponent(raw)}`);
		}
		// Server render a minimal message (briefly) while client replaces location
		return (
			<main className="min-h-dvh bg-[#f5f5f5]">
				<div className="mx-auto max-w-4xl px-4 py-12">
					<div className="rounded-2xl bg-white p-8 shadow-sm text-sm text-slate-700">
						Redirecting to feedback tab...
					</div>
				</div>
			</main>
		);
	}

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
								className="text-sm font-medium text-[#0D2352] hover:underline"
							>
								Back to tender
							</Link>
						</div>

						<div className="rounded-md border border-[#facc6b] bg-[#fff7e6] px-4 py-3 text-sm text-[#7c5300]">
							No data provided. Submit the form from the feedback modal to view a
							preview.
						</div>
					</div>
				</div>
			</main>
		);
	}

	const splits = feedback.splits ?? [];
	const attachments = feedback.attachments ?? [];

	return (
		<main className="min-h-dvh bg-[#f5f5f5]">
			<div className="mx-auto max-w-4xl px-4 py-12">
				<div className="rounded-2xl bg-white p-8 shadow-sm">
					{/* Header */}
					<div className="mb-6 flex items-center justify-between gap-4">
						<h1 className="text-xl font-semibold">Feedback scores – Preview</h1>
						<Link
							href={`/tenders/${tenderId}`}
							className="text-sm font-medium text-[#0D2352] hover:underline"
						>
							Back to tender
						</Link>
					</div>

					{/* Top details block */}
					<section className="mb-8 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-5">
						<dl className="grid gap-y-4 text-xs sm:grid-cols-[170px,1fr]">
							<div className="sm:contents">
								<dt className="font-semibold text-[#808080]">
									Client Contact Details
								</dt>
								<dd className="sm:col-start-2">
									<div className="space-y-0.5 text-sm text-[#222222]">
										<div className="font-medium">
											{feedback.fullName || "—"}
										</div>
										{feedback.phoneNumber && (
											<div>{feedback.phoneNumber}</div>
										)}
										{feedback.emailAddress && (
											<div className="text-[#555555]">
												{feedback.emailAddress}
											</div>
										)}
									</div>
								</dd>
							</div>

							<div className="sm:contents">
								<dt className="font-semibold text-[#808080]">Comments</dt>
								<dd className="sm:col-start-2">
									<p className="max-w-3xl text-sm leading-relaxed text-[#222222]">
										{feedback.comments || "No comments were provided."}
									</p>
								</dd>
							</div>

							<div className="sm:contents">
								<dt className="font-semibold text-[#808080]">
									Supplied documents
								</dt>
								<dd className="sm:col-start-2">
									{attachments.length === 0 ? (
										<p className="text-sm text-[#222222]">
											No documents were uploaded with this feedback.
										</p>
									) : (
										<ul className="space-y-2 text-sm">
											{attachments.map((doc, idx) => (
												<li
													key={doc.id ?? idx}
													className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-white px-3 py-2"
												>
													<div className="flex items-center gap-2">
														<span className="inline-flex items-center justify-center rounded bg-[#ffe4ec] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#c61b4e]">
															PDF
														</span>
														<span className="truncate font-medium">
															{doc.fileName || "Document"}
														</span>
													</div>
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
								</dd>
							</div>
						</dl>
					</section>

					{/* Splits table (basic evaluation) */}
					<section>
						<h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#7c7c7c]">
							Evaluation
						</h2>

						{splits.length === 0 ? (
							<p className="text-sm text-[#222222]">
								No evaluation scores captured.
							</p>
						) : (
							<div className="overflow-x-auto rounded-lg border border-[#e5e5e5]">
								<table className="min-w-full border-collapse text-xs">
									<thead className="bg-[#fafafa] text-left font-semibold text-[#555555]">
										<tr>
											<th className="px-4 py-3">Evaluation</th>
											<th className="px-4 py-3">Percentage</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-[#e5e5e5]">
										{splits.map((row) => (
											<tr key={row.id}>
												<td className="px-4 py-3 text-sm">{row.description}</td>
												<td className="px-4 py-3 text-sm">
													{row.percentage}%
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</section>
				</div>
			</div>
		</main>
	);
}

