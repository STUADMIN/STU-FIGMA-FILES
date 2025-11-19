"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import FeedbackScoresModal, { type FeedbackScoresFormData } from "@/components/tenders/FeedbackScoresModal";

export default function FeedbackButton({ tenderSlug }: { tenderSlug?: string }) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	function handleComplete(data: FeedbackScoresFormData) {
		const serializable = {
			...data,
			attachments: Array.isArray(data.attachments) ? data.attachments.map((f) => f.name) : [],
		};
		const json = JSON.stringify(serializable);
		const encoded = typeof window !== "undefined" ? window.btoa(unescape(encodeURIComponent(json))) : Buffer.from(json, "utf-8").toString("base64");
		const basePath = tenderSlug ? `/tenders/${encodeURIComponent(tenderSlug)}/feedback/preview` : `/tenders/feedback/preview`;
		router.push(`${basePath}?data=${encoded}`);
		setOpen(false);
	}

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="inline-flex h-[44px] w-[144px] items-center justify-center gap-1 rounded border border-[#D0D0D0] px-4 py-2 text-sm font-medium text-gray-800"
			>
				Add feedback
			</button>

			<FeedbackScoresModal open={open} onClose={() => setOpen(false)} onComplete={handleComplete} />
		</>
	);
}


