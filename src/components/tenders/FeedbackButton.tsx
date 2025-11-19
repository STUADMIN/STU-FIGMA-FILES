"use client";

import React, { useState } from "react";
import TendersPageSvg from "@/components/design/TendersPageSvg";

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

			{open && (
				<div
					className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
					role="dialog"
					aria-modal="true"
					aria-label="Feedback Scores"
					onClick={() => setOpen(false)}
				>
					<div
						className="w-full max-w-5xl md:max-w-6xl rounded-lg bg-white shadow-xl"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
							<h2 className="text-lg font-semibold text-gray-900">Feedback Scores</h2>
							<button
								type="button"
								className="inline-flex h-8 items-center justify-center rounded px-3 text-sm text-gray-600 hover:text-gray-900"
								onClick={() => setOpen(false)}
							>
								Close
							</button>
						</div>

						<div className="max-h-[75vh] overflow-auto px-6 py-5">
							<div className="space-y-4">
								<p className="text-sm text-gray-700">
									Reference view for scoring and feedback. This SVG is provided for visual guidance.
								</p>
								<div className="rounded-md border border-slate-200 bg-[#F1F0EE]">
									<TendersPageSvg className="w-full h-auto" alt="Feedback reference visual" />
								</div>
							</div>
						</div>

						<div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
							<button
								type="button"
								className="inline-flex items-center justify-center rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
								onClick={() => setOpen(false)}
							>
								Cancel
							</button>
							<button
								type="button"
								className="inline-flex items-center justify-center rounded bg-[#0D2352] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
								onClick={() => setOpen(false)}
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}


