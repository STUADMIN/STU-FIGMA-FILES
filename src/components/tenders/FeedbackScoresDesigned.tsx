"use client";

import React from "react";
import FeedbackButton from "./FeedbackButton";

export type FeedbackSplit = { id: string; description: string; percentage: number };

export type FeedbackDesignedProps = {
	fullName?: string;
	phoneNumber?: string;
	emailAddress?: string;
	comments?: string;
	attachments?: string[];
	splits?: FeedbackSplit[];
	tenderSlug?: string;
};

export default function FeedbackScoresDesigned({
	fullName,
	phoneNumber,
	emailAddress,
	comments,
	attachments = [],
	splits = [],
	tenderSlug,
}: FeedbackDesignedProps) {
	const total =
		splits?.reduce((sum, s) => sum + (Number.isFinite(s.percentage) ? Number(s.percentage) : 0), 0) ?? 0;

	return (
		<div className="content-stretch flex flex-col gap-[36px]">
			{/* Top details block */}
			<section className="bg-white box-border content-stretch flex flex-col gap-[28px] items-start px-[28px] py-[24px] relative w-full rounded-[8px]">
				<div className="w-full flex justify-end mb-2">
					<FeedbackButton tenderSlug={tenderSlug} label="Edit feedback" />
				</div>
				<div className="content-stretch flex flex-col gap-[8px] items-start w-full">
					{/* Client contact details */}
					<div className="content-stretch flex gap-[24px] items-start w-full">
						<div className="flex flex-col font-['Montserrat:Bold',sans-serif] font-bold h-[25px] justify-center text-[#2d6a79] text-[12px] opacity-80 w-[280px]">
							<p className="leading-[16px]">Client Contact Details</p>
						</div>
						<div className="content-stretch flex flex-col gap-[12px]">
							<div className="text-[16px] leading-[28px] text-black">
								{fullName || "—"}
							</div>
							{phoneNumber ? <div className="text-[16px] leading-[28px] text-black">{phoneNumber}</div> : null}
							{emailAddress ? (
								<div className="text-[16px] leading-[28px] text-[#222]">{emailAddress}</div>
							) : null}
						</div>
					</div>

					{/* Comments */}
					<div className="box-border content-stretch flex gap-[24px] items-start w-full pt-[8px]">
						<div className="flex flex-col font-['Montserrat:Bold',sans-serif] font-bold h-[23px] justify-center text-[#2d6a79] text-[12px] opacity-80 w-[280px]">
							<p className="leading-[16px]">Comments</p>
						</div>
						<div className="text-[14px] leading-[24px] text-black max-w-[750px]">
							{comments?.trim() || "No comments were provided."}
						</div>
					</div>

					{/* Attachments */}
					<div className="content-stretch flex gap-[24px] items-start w-full">
						<div className="flex flex-col font-['Montserrat:Bold',sans-serif] font-bold h-[23px] justify-center text-[#2d6a79] text-[12px] opacity-80 w-[280px]">
							<p className="leading-[16px]">Supplied documents</p>
						</div>
						<div className="content-stretch flex flex-col gap-[12px] w-full max-w-[760px]">
							{attachments.length === 0 ? (
								<p className="text-[14px] leading-[24px] text-black">No documents were uploaded with this feedback.</p>
							) : (
								<ul className="space-y-[10px]">
									{attachments.map((name, idx) => (
										<li
											key={`${idx}-${name}`}
											className="bg-white relative rounded-[4px] border border-[#d2dbde] px-[12px] py-[10px] text-[16px] leading-[28px] text-black"
										>
											{name}
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Evaluation table */}
			<section className="bg-white box-border content-stretch flex flex-col gap-[12px] items-start px-[28px] py-[16px] relative w-full rounded-[8px]">
				<div className="bg-[#fbfbfb] h-[64px] w-full border-b border-[#b8b8b7] flex items-center">
					<div className="flex w-full justify-between px-[20px]">
						<div className="w-[220px]">
							<p className="text-[12px] font-bold font-['Montserrat:Bold',sans-serif]">Evaluation</p>
						</div>
						<div className="w-[65px]">
							<p className="text-[12px] font-bold font-['Montserrat:Bold',sans-serif]">Percentage</p>
						</div>
						{[..."ABCDE"].map((label) => (
							<div key={label} className="w-[54px]">
								<p className="text-[12px] font-bold font-['Montserrat:Bold',sans-serif]">{label}</p>
							</div>
						))}
					</div>
				</div>

				{/* Rows */}
				<div className="w-full">
					{(splits?.length ? splits : []).map((row) => (
						<div
							key={row.id}
							className="h-[72px] w-full border-b border-[#b8b8b7] flex items-center bg-white"
						>
							<div className="flex w-full justify-between px-[20px]">
								<div className="w-[220px]">
									<p className="text-[16px] leading-[24px]">{row.description || "—"}</p>
								</div>
								<div className="w-[65px]">
									<p className="text-[16px] leading-[24px]">{Number.isFinite(row.percentage) ? `${row.percentage}%` : "0%"}</p>
								</div>
								{[0, 1, 2, 3, 4].map((i) => (
									<div key={i} className="w-[54px]">
										<p className="text-[16px] leading-[24px]">0%</p>
									</div>
								))}
							</div>
						</div>
					))}

					{/* Totals */}
					<div className="h-[72px] w-full border-b border-[#b8b8b7] flex items-center bg-white">
						<div className="flex w-full justify-between px-[20px]">
							<div className="w-[220px]">
								<p className="text-[16px] font-bold leading-[24px]">Total awarded</p>
							</div>
							<div className="w-[65px]">
								<p className="text-[16px] font-bold leading-[24px]">{total}%</p>
							</div>
							{[0, 1, 2, 3, 4].map((i) => (
								<div key={i} className="w-[54px]">
									<p className="text-[16px] leading-[24px]">0%</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}


