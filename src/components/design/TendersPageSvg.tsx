import React from "react";

type Props = {
	className?: string;
	alt?: string;
};

export default function TendersPageSvg({ className, alt = "Tenders page reference" }: Props) {
	return <img src="/tenders-page.svg" alt={alt} className={className} />;
}


