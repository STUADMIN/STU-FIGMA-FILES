\"use client\";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabaseClient";

export function WelcomeHeading() {
	const [firstName, setFirstName] = useState<string>("");

	useEffect(() => {
		const supabase = getSupabaseBrowserClient();
		let cancelled = false;

		async function load() {
			const { data: auth } = await supabase.auth.getUser();
			const userId = auth?.user?.id ?? null;
			if (!userId) {
				if (!cancelled) setFirstName("");
				return;
			}
			const { data } = await supabase
				.from("people")
				.select("display_name, first_name")
				.eq("user_id", userId)
				.maybeSingle();
			const display = (data?.display_name ?? "").toString().trim();
			const first = (data?.first_name ?? "").toString().trim();
			const derived = (display.split(" ")[0] || first || "").trim();
			if (!cancelled) setFirstName(derived);
		}

		load();
		const { data: sub } = supabase.auth.onAuthStateChange(() => load());
		return () => {
			cancelled = true;
			sub.subscription.unsubscribe();
		};
	}, []);

	return (
		<h2 className="mb-4 text-[40px] leading-[48px] font-bold text-[#0D2352]">
			{firstName ? `Welcome ${firstName}` : "Welcome"}
		</h2>
	);
}


