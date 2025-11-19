import Link from "next/link";
import { StuIcon, type StuIconName } from "@/components/icons/StuIcon";
import FeedbackButton from "./FeedbackButton";
import React from "react";

type BadgeVariant = "danger" | "warning" | "success" | "purple" | "neutral";

function statusToBadge(status: string): { label: string; tone: BadgeVariant } {
	const v = (status || "").toLowerCase();
	if (v.includes("unsuccess")) return { label: "Unsuccessful", tone: "danger" };
	if (v.includes("success")) return { label: "Successful", tone: "success" };
	if (v.includes("set-up") || v.includes("setup")) return { label: "Set‑up", tone: "purple" };
	if (v.includes("progress")) return { label: "In progress", tone: "neutral" };
	if (v.includes("submit")) return { label: "To submit", tone: "warning" };
	return { label: status || "Status", tone: "neutral" };
}

function Chip({ tone, label }: { tone: BadgeVariant; label: string }) {
	const map: Record<BadgeVariant, { bg: string; fg: string }> = {
		danger: { bg: "bg-red-100", fg: "text-red-900" },
		warning: { bg: "bg-amber-100", fg: "text-amber-900" },
		success: { bg: "bg-emerald-100", fg: "text-emerald-900" },
		purple: { bg: "bg-purple-100", fg: "text-purple-900" },
		neutral: { bg: "bg-slate-200", fg: "text-slate-900" },
	};
	const c = map[tone];
	return (
		<span className={`inline-flex items-center rounded-[3px] px-[12px] py-[6px] text-[14px] font-semibold ${c.bg} ${c.fg}`}>
			{label}
		</span>
	);
}

export default function TenderHeaderDesigned(props: {
	title: string;
	status: string;
	client: string;
	tenderId: string;
	reference: string;
	createdAt: string;
	assignedTo: string;
	dueDate: string;
	dueMeta: string;
	tenderSlug: string;
}) {
	const chip = statusToBadge(props.status);
	return (
		<div className="bg-white box-border content-stretch flex flex-col gap-[28px] items-start px-[28px] py-[32px] relative shrink-0 w-[1200px]">
			<div aria-hidden className="absolute border-[#bbc9ce] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />

			{/* Back link */}
			<div className="content-stretch flex flex-col gap-[8px] items-start w-full">
				<Link
					href="/tenders"
					className="flex items-center gap-[4px] text-black"
					aria-label="Back to Tenders"
				>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
						<path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						<path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
					<span className="font-['Montserrat_SemiBold'] text-[14px] leading-[24px]">Back to Tenders</span>
				</Link>

				{/* Title + chip + button */}
				this
				<div className="flex items-center justify-between w-full gap-[12px]">
					<div className="flex items-center gap-[12px]">
						<h1 className="font-bold text-black text-[40px] leading-[48px]">{props.title}</h1>
						<Chip {...chip} />
					</div>
					<FeedbackButton tenderSlug={props.tenderSlug} />
				</div>

				{/* Client line */}
				<p className="mt-1 text-[#61828D] font-[600] text-[20px] leading-[28px]">{props.client}</p>
			</div>

			{/* Meta row */}
			<div className="grid grid-cols-2 gap-6 md:grid-cols-4 w-full">
				<MetaItem label="Tender ID" value={props.tenderId} />
				<MetaItem label="Reference number" value={props.reference} />
				<MetaItem label="Created" value={props.createdAt} />
				<MetaItem label="Assigned to" value={props.assignedTo} />
				<MetaItem label="Submission due date" value={props.dueDate} helper={props.dueMeta} />
			</div>
		</div>
	);
}

function MetaItem({ label, value, helper }: { label: string; value: string; helper?: string }) {
	return (
		<div className="flex flex-col self-stretch">
			<span className="text-[#61828D] font-[700] leading-[16px] text-[12px] font-['Poppins']">{label}</span>
			<div className="mt-1 text-[#0F172A] font-[400] leading-[28px] text-[16px] font-['Poppins']">{value || "—"}</div>
			{helper && helper !== "Date not set" ? <div className="text-xs font-medium text-emerald-600">{helper}</div> : null}
		</div>
	);
}


