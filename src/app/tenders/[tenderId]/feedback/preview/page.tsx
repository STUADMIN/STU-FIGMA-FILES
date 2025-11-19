import Link from "next/link";

type PageProps = {
	params: { tenderId: string };
	searchParams: { data?: string };
};

function decodePayload(encoded?: string) {
	if (!encoded) return null;
	try {
		const json =
			typeof atob === "function"
				? decodeURIComponent(escape(atob(encoded)))
				: Buffer.from(encoded, "base64").toString("utf-8");
		return JSON.parse(json) as {
			fullName: string;
			phoneNumber: string;
			emailAddress: string;
			comments: string;
			participantsCount: number | null;
			evaluationBreakdown: "percentage" | "points" | "other";
			splits: { id: string; description: string; percentage: number }[];
			attachments: string[]; // file names
		};
	} catch {
		return null;
	}
}

export default function FeedbackPreviewPage({ params, searchParams }: PageProps) {
	const payload = decodePayload(searchParams.data);

	return (
		<div className="min-h-screen bg-[#F5F7FA] py-8">
			<div className="mx-auto w-full max-w-3xl rounded-xl bg-white p-6 shadow-sm">
				<div className="mb-6 flex items-center justify-between">
					<h1 className="text-xl font-semibold text-slate-900">Feedback scores – Preview</h1>
					<Link
						href={`/tenders/${encodeURIComponent(params.tenderId)}`}
						className="text-sm font-medium text-[#0D2352] hover:underline"
					>
						Back to tender
					</Link>
				</div>

				{!payload ? (
					<div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
						No data provided. Submit the form from the feedback modal to view a preview.
					</div>
				) : (
					<div className="space-y-6">
						<section>
							<h2 className="mb-2 text-sm font-semibold text-slate-700">Contact details</h2>
							<div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
								<div>
									<div className="text-slate-500">Full name</div>
									<div className="font-medium text-slate-900">{payload.fullName || "—"}</div>
								</div>
								<div>
									<div className="text-slate-500">Phone number</div>
									<div className="font-medium text-slate-900">{payload.phoneNumber || "—"}</div>
								</div>
								<div>
									<div className="text-slate-500">Email address</div>
									<div className="font-medium text-slate-900">{payload.emailAddress || "—"}</div>
								</div>
								<div>
									<div className="text-slate-500">Participants</div>
									<div className="font-medium text-slate-900">
										{payload.participantsCount ?? "—"}
									</div>
								</div>
							</div>
						</section>

						<section>
							<h2 className="mb-2 text-sm font-semibold text-slate-700">Comments</h2>
							<div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
								{payload.comments || "—"}
							</div>
						</section>

						<section>
							<h2 className="mb-2 text-sm font-semibold text-slate-700">Evaluation breakdown</h2>
							<div className="text-sm text-slate-900">
								Method: <span className="font-medium">{payload.evaluationBreakdown}</span>
							</div>
							<div className="mt-2 overflow-hidden rounded-md border border-slate-200">
								<table className="w-full table-fixed text-sm">
									<thead className="bg-slate-50 text-slate-600">
										<tr>
											<th className="px-3 py-2 text-left font-medium">Description</th>
											<th className="w-28 px-3 py-2 text-left font-medium">Percentage</th>
										</tr>
									</thead>
									<tbody>
										{payload.splits.map((s) => (
											<tr key={s.id} className="border-t border-slate-200">
												<td className="truncate px-3 py-2">{s.description || "—"}</td>
												<td className="px-3 py-2">{s.percentage}%</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<div className="mt-2 text-sm text-slate-700">
								Total:{" "}
								<span className="font-semibold">
									{payload.splits.reduce((sum, s) => sum + (Number.isFinite(s.percentage) ? s.percentage : 0), 0)}%
								</span>
							</div>
						</section>

						<section>
							<h2 className="mb-2 text-sm font-semibold text-slate-700">Attachments</h2>
							{payload.attachments?.length ? (
								<ul className="list-disc pl-5 text-sm text-slate-800">
									{payload.attachments.map((name, idx) => (
										<li key={`${idx}-${name}`}>{name}</li>
									))}
								</ul>
							) : (
								<div className="text-sm text-slate-500">No files attached</div>
							)}
						</section>
					</div>
				)}
			</div>
		</div>
	);
}


