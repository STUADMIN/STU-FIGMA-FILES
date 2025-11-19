"use client";

import React, { useEffect, useMemo, useState } from "react";

export type EvaluationSplit = {
	id: string;
	description: string;
	percentage: number;
};

export type FeedbackScoresFormData = {
	fullName: string;
	phoneNumber: string;
	emailAddress: string;
	comments: string;
	participantsCount: number | null;
	evaluationBreakdown: "percentage" | "points" | "other";
	splits: EvaluationSplit[];
	attachments: File[];
};

type FeedbackScoresModalProps = {
	open: boolean;
	onClose: () => void;
	onComplete: (data: FeedbackScoresFormData) => void;
};

export default function FeedbackScoresModal({ open, onClose, onComplete }: FeedbackScoresModalProps) {
	const [fullName, setFullName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [emailAddress, setEmailAddress] = useState("");
	const [comments, setComments] = useState("");
	const [participantsCount, setParticipantsCount] = useState<number | null>(null);
	const [evaluationBreakdown, setEvaluationBreakdown] = useState<"percentage" | "points" | "other">("percentage");
	const [splits, setSplits] = useState<EvaluationSplit[]>([{ id: "split-1", description: "", percentage: 100 }]);
	const [attachments, setAttachments] = useState<File[]>([]);

	useEffect(() => {
		if (!open) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [open, onClose]);

	const totalPercentage = useMemo(
		() =>
			splits.reduce(
				(sum, split) => sum + (Number.isFinite(split.percentage) ? split.percentage : 0),
				0,
			),
		[splits],
	);

	const isTotalValid = totalPercentage === 100;

	function handleAddSplit() {
		setSplits((prev) => [
			...prev,
			{
				id: `split-${prev.length + 1}`,
				description: "",
				percentage: 0,
			},
		]);
	}

	function handleSplitChange(id: string, field: "description" | "percentage", value: string) {
		setSplits((prev) =>
			prev.map((split) =>
				split.id === id
					? {
							...split,
							[field]: field === "percentage" ? Number(value.replace(/[^\d.]/g, "")) || 0 : value,
					  }
					: split,
			),
		);
	}

	function handleRemoveSplit(id: string) {
		setSplits((prev) => {
			if (prev.length === 1) return prev;
			return prev.filter((s) => s.id !== id);
		});
	}

	function handleFilesSelected(files: FileList | null) {
		if (!files) return;
		setAttachments(Array.from(files));
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const payload: FeedbackScoresFormData = {
			fullName,
			phoneNumber,
			emailAddress,
			comments,
			participantsCount,
			evaluationBreakdown,
			splits,
			attachments,
		};
		onComplete(payload);
	}

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40" aria-modal="true" role="dialog">
			<div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
			<div className="relative z-10 mt-6 w-full max-w-3xl rounded-2xl bg-white p-8 shadow-xl">
				<div className="mb-6 flex items-start justify-between gap-4">
					<h2 className="text-2xl font-semibold tracking-tight">Feedback scores</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
						aria-label="Close"
					>
						<span className="text-xl leading-none">&times;</span>
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<section>
						<p className="mb-2 text-sm font-semibold text-gray-700">Tender contact details</p>
						<div className="space-y-3">
							<input
								type="text"
								placeholder="Full name"
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								className="w-full rounded-md border border-[#B8E1E7] bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#1c9bd8] focus:outline-none focus:ring-2 focus:ring-[#1c9bd8]/40"
							/>
							<input
								type="tel"
								placeholder="Phone number"
								value={phoneNumber}
								onChange={(e) => setPhoneNumber(e.target.value)}
								className="w-full rounded-md border border-[#B8E1E7] bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#1c9bd8] focus:outline-none focus:ring-2 focus:ring-[#1c9bd8]/40"
							/>
							<input
								type="email"
								placeholder="Email address"
								value={emailAddress}
								onChange={(e) => setEmailAddress(e.target.value)}
								className="w-full rounded-md border border-[#B8E1E7] bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#1c9bd8] focus:outline-none focus:ring-2 focus:ring-[#1c9bd8]/40"
							/>
						</div>
					</section>

					<section>
						<p className="mb-2 text-sm font-semibold text-gray-700">Comments</p>
						<textarea
							rows={5}
							placeholder=""
							value={comments}
							onChange={(e) => setComments(e.target.value)}
							className="w-full resize-none rounded-md border border-[#B8E1E7] bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#1c9bd8] focus:outline-none focus:ring-2 focus:ring-[#1c9bd8]/40"
						/>
					</section>

					<section>
						<p className="mb-2 text-sm font-semibold text-gray-700">Attachments</p>
						<div className="rounded-md border border-dashed border-[#B8E1E7] bg-[#f7fcfd] px-6 py-8 text-center text-sm text-gray-500">
							<p className="mb-3">Drag and drop files to upload or</p>
							<label className="inline-flex cursor-pointer items-center rounded-md border border-[#B8E1E7] bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
								Browse computer
								<input type="file" multiple className="hidden" onChange={(e) => handleFilesSelected(e.target.files)} />
							</label>
							{attachments.length > 0 && (
								<ul className="mt-4 list-disc space-y-1 text-left text-xs text-gray-600">
									{attachments.map((file) => (
										<li key={file.name}>{file.name}</li>
									))}
								</ul>
							)}
						</div>
					</section>

					<section>
						<p className="mb-2 text-sm font-semibold text-gray-700">Number of submission participants</p>
						<select
							value={participantsCount ?? ""}
							onChange={(e) => setParticipantsCount(e.target.value ? Number(e.target.value) : null)}
							className="w-full rounded-md border border-[#B8E1E7] bg-white px-4 py-3 text-sm text-gray-900 focus:border-[#1c9bd8] focus:outline-none focus:ring-2 focus:ring-[#1c9bd8]/40"
						>
							<option value="">Select number</option>
							{[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
								<option key={n} value={n}>
									{n}
								</option>
							))}
						</select>
					</section>

					<section>
						<p className="mb-2 text-sm font-semibold text-gray-700">Evaluation breakdown</p>
						<select
							value={evaluationBreakdown}
							onChange={(e) => setEvaluationBreakdown(e.target.value as "percentage" | "points" | "other")}
							className="w-full rounded-md border border-[#B8E1E7] bg-white px-4 py-3 text-sm text-gray-900 focus:border-[#1c9bd8] focus:outline-none focus:ring-2 focus:ring-[#1c9bd8]/40"
						>
							<option value="percentage">Percentage (%)</option>
							<option value="points">Points (e.g. 1–10)</option>
							<option value="other">Other</option>
						</select>
					</section>

					<section>
						<p className="mb-2 text-sm font-semibold text-gray-700">Evaluation weighting</p>
						<div className="space-y-2">
							{splits.map((split) => (
								<div key={split.id} className="grid grid-cols-[minmax(0,1fr)_120px_32px] items-center gap-2">
									<input
										type="text"
										placeholder="Description"
										value={split.description}
										onChange={(e) => handleSplitChange(split.id, "description", e.target.value)}
										className="w-full rounded-md border border-[#B8E1E7] bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#1c9bd8] focus:outline-none focus:ring-2 focus:ring-[#1c9bd8]/40"
									/>
									<div className="flex items-center">
										<input
											type="text"
											inputMode="decimal"
											pattern="[0-9]*"
											placeholder="0"
											value={String(split.percentage)}
											onChange={(e) => handleSplitChange(split.id, "percentage", e.target.value)}
											className="w-full rounded-md border border-[#B8E1E7] bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-[#1c9bd8] focus:outline-none focus:ring-2 focus:ring-[#1c9bd8]/40"
										/>
										<span className="ml-2 text-sm text-gray-700">%</span>
									</div>
									<button
										type="button"
										onClick={() => handleRemoveSplit(split.id)}
										className="inline-flex h-[36px] w-[32px] items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
										aria-label="Remove split"
									>
										&times;
									</button>
								</div>
							))}
						</div>

						<div className="mt-2 flex items-center justify-between">
							<div className={`text-sm ${isTotalValid ? "text-emerald-600" : "text-rose-600"}`}>
								Total: {totalPercentage}%
								{!isTotalValid ? " (should equal 100%)" : ""}
							</div>
							<button type="button" onClick={handleAddSplit} className="text-sm font-medium text-[#1890FF] hover:underline">
								Add a split
							</button>
						</div>
					</section>

					<div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white pt-4">
						<button
							type="button"
							onClick={onClose}
							className="rounded-md border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-md bg-[#1890FF] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1474CC]"
						>
							Complete
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}


