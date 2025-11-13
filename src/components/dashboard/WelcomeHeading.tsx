'use client';

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabaseClient";

export function WelcomeHeading({ initialFirstName = "" }: { initialFirstName?: string }) {
	const [firstName, setFirstName] = useState<string>(initialFirstName);

	useEffect(() => {
		const supabase = getSupabaseBrowserClient();
		let cancelled = false;

		async function load() {
				try {
					const { data: auth } = await supabase.auth.getUser();
					const userId = auth?.user?.id ?? null;
					if (!userId) {
						if (!cancelled) setFirstName("");
						return;
					}
	
					async function readOnce() {
						const { data } = await supabase
							.from("people")
							.select("display_name, first_name")
							.eq("user_id", userId)
							.maybeSingle();
						return data;
					}
	
					let data = await readOnce();
	
					// If no row yet, ask server to ensure/create it and re-read
					if (!data) {
						try {
							await fetch("/api/people/ensure", {
								method: "POST",
								credentials: "include",
							});
						} catch {
							// ignore ensure failures; we'll still fall back gracefully
						}
						data = await readOnce();
					}
	
					const display = (data?.display_name ?? "").toString().trim();
					const first = (data?.first_name ?? "").toString().trim();
					const derived = (display.split(" ")[0] || first || "").trim();
					if (!cancelled) setFirstName(derived);
				} catch {
					if (!cancelled) setFirstName("");
				}
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



