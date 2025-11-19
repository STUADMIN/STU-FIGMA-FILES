"use client";

import React, { useState } from "react";

type FeedbackScoresModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

function FeedbackScoresModal({ isOpen, onClose }: FeedbackScoresModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="relative flex max-h-[90vh] w-full max-w-[860px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
				<div className="flex items-start justify-between px-8 pt-7 pb-5">
					<h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">Feedback scores</h2>
					<button
						type="button"
						aria-label="Close"
						onClick={onClose}
						className="ml-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
					>
						<svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
							<path
								d="M6 6L18 18M6 18L18 6"
								stroke="currentColor"
								strokeWidth="1.7"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</div>

				<div className="flex-1 overflow-y-auto px-8 pb-6">
					<div className="mb-4 text-sm font-medium text-slate-800">Feedback contact details</div>

					<div className="space-y-3">
						<input
							type="text"
							placeholder="Full name"
							className="w-full rounded-md border border-[#CFE9F0] px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#47A8B8] focus:outline-none focus:ring-2 focus:ring-[#47A8B8]/30"
						/>
						<input
							type="tel"
							placeholder="Phone number"
							className="w-full rounded-md border border-[#CFE9F0] px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#47A8B8] focus:outline-none focus:ring-2 focus:ring-[#47A8B8]/30"
						/>
						<input
							type="email"
							placeholder="Email address"
							className="w-full rounded-md border border-[#CFE9F0] px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#47A8B8] focus:outline-none focus:ring-2 focus:ring-[#47A8B8]/30"
						/>
					</div>

					<div className="mt-6">
						<label className="mb-2 block text-sm font-medium text-slate-800">Comments</label>
						<textarea
							rows={5}
							className="w-full resize-none rounded-md border border-[#CFE9F0] px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#47A8B8] focus:outline-none focus:ring-2 focus:ring-[#47A8B8]/30"
							placeholder=""
						/>
					</div>

					<div className="mt-6">
						<div className="mb-2 text-sm font-medium text-slate-800">Attachments</div>

						<label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#CFE9F0] bg-[#F8FCFD] px-4 py-8 text-center">
							<div className="mb-2 text-sm text-slate-700">Drag and drop files to upload or</div>
							<div className="inline-flex rounded-md bg-[#E7F5F8] px-3 py-1.5 text-xs font-medium text-slate-900">
								Browse computer
							</div>
							<input type="file" multiple className="hidden" />
						</label>
					</div>

					<hr className="my-6 border-slate-200" />

					<div className="mt-2">
						<label className="mb-2 block text-sm font-medium text-slate-800">Number of submission participants</label>
						<div className="relative">
							<select
								className="w-full appearance-none rounded-md border border-[#CFE9F0] px-3 py-3 pr-9 text-sm text-slate-900 focus:border-[#47A8B8] focus:outline-none focus:ring-2 focus:ring-[#47A8B8]/30"
								defaultValue=""
							>
								<option value="" disabled>
									Select number
								</option>
								<option value="1">1 participant</option>
								<option value="2">2 participants</option>
								<option value="3">3 participants</option>
								<option value="4+">4 or more</option>
							</select>
							<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">▾</span>
						</div>
					</div>

					<div className="mt-5">
						<label className="mb-2 block text-sm font-medium text-slate-800">Evaluation breakdown</label>
						<div className="relative">
							<select
								className="w-full appearance-none rounded-md border border-[#CFE9F0] px-3 py-3 pr-9 text-sm text-slate-900 focus:border-[#47A8B8] focus:outline-none focus:ring-2 focus:ring-[#47A8B8]/30"
								defaultValue=""
							>
								<option value="" disabled>
									Percentage (%)
								</option>
								<option value="percentage">Percentage (%)</option>
								<option value="score">Score (e.g. 1–10)</option>
							</select>
							<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">▾</span>
						</div>
					</div>

					<div className="mt-5">
						<label className="mb-2 block text-sm font-medium text-slate-800">Evaluation weighting</label>

						<div className="grid grid-cols-[minmax(0,1fr)_100px] gap-2">
							<input
								type="text"
								placeholder="Total awarded"
								className="w-full rounded-md border border-[#CFE9F0] px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#47A8B8] focus:outline-none focus:ring-2 focus:ring-[#47A8B8]/30"
							/>
							<div className="flex items-center justify-center rounded-md border border-[#CFE9F0] bg-[#F8FCFD] text-sm font-semibold text-slate-900">
								100%
							</div>
						</div>

						<button type="button" className="mt-3 text-sm font-medium text-[#1890FF] hover:underline">
							Add a split
						</button>
					</div>
				</div>

				<div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-8 py-4">
					<button
						type="button"
						onClick={onClose}
						className="rounded-md border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
					>
						Cancel
					</button>
					<button
						type="button"
						className="rounded-md bg-[#1890FF] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1474CC]"
					>
						Complete
					</button>
				</div>
			</div>
		</div>
	);
}

export default function FeedbackButton() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="inline-flex h-[44px] w-[144px] items-center justify-center gap-1 rounded border border-[#D0D0D0] px-4 py-2 text-sm font-medium text-gray-800"
			>
				Add feedback
			</button>

			<FeedbackScoresModal isOpen={open} onClose={() => setOpen(false)} />
		</>
	);
}


