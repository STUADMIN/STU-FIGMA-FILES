"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseClient";

function toDisplayName(meta: any): { name: string; initial: string } {
	// Support a variety of common metadata keys
	const first =
		meta?.first_name ??
		meta?.given_name ??
		meta?.firstName ??
		meta?.firstname ??
		meta?.first ??
		"";
	const last =
		meta?.last_name ??
		meta?.family_name ??
		meta?.lastName ??
		meta?.lastname ??
		meta?.surname ??
		meta?.last ??
		"";
	let name = "";
	if (first || last) {
		name = [first, last].filter(Boolean).join(" ").trim();
	} else if (meta?.full_name || meta?.name) {
		name = String(meta.full_name ?? meta.name);
	}
	name = name || "User"; // Do NOT use email as a fallback for display to avoid showing emails
	const initial = (name[0] || "U").toUpperCase();
	return { name, initial };
}

export function UserPill() {
	const [name, setName] = useState<string>("");
	const [initial, setInitial] = useState<string>("");
	const [open, setOpen] = useState<boolean>(false);
	const router = useRouter();

async function fetchFirstLastFromDb(
	supabase: ReturnType<typeof getSupabaseBrowserClient>,
	authUserId: string,
	email?: string
) {
		// Best practice: link by immutable auth user id via people.user_id
		const attempts: Array<{
			table: string;
			filterCol: string;
			cols: string;
		}> = [
			{ table: "people", filterCol: "user_id", cols: "display_name,first_name,last_name" },
		];
		for (const a of attempts) {
			try {
				// eslint-disable-next-line no-await-in-loop
				const { data, error } = await supabase
					.from(a.table)
					.select(a.cols)
					.eq(a.filterCol, authUserId)
					.limit(1)
					.maybeSingle();
				if (!error && data) {
					const row: any = data;
					const disp = String(row.display_name ?? "").trim();
					if (disp) return { first: disp, last: "" };
					const first = String(row.first_name ?? "").trim();
					const last = String(row.last_name ?? "").trim();
					if (first || last) return { first, last };
				}
			} catch {
				// swallow and try next shape
			}
		}
		return null;
	}

	async function ensurePersonRow(
		supabase: ReturnType<typeof getSupabaseBrowserClient>,
		user: { id: string; email?: string; user_metadata?: any }
	) {
		try {
			// Check if exists
			const { data: existing } = await supabase
				.from("people")
				.select("user_id")
				.eq("user_id", user.id)
				.limit(1)
				.maybeSingle();
			if (existing) return;
			// Seed names from metadata if available (only for creation convenience)
			const meta = user.user_metadata ?? {};
			const first =
				meta.first_name ?? meta.FirstName ?? meta.firstName ?? meta.firstname ?? meta.first ?? "";
			const last =
				meta.last_name ?? meta.LastName ?? meta.lastName ?? meta.lastname ?? meta.surname ?? meta.last ?? "";
			await supabase.from("people").upsert(
				[
					{
						user_id: user.id,
						first_name: String(first).trim(),
						last_name: String(last).trim(),
						email: user.email ?? null,
					},
				],
				{ onConflict: "user_id", ignoreDuplicates: true }
			);
		} catch {
			// ignore; RLS or schema may block; display fallback handles absence
		}
	}

	useEffect(() => {
		let mounted = true;
		const supabase = getSupabaseBrowserClient();
		async function load(u: any) {
			if (!u?.id) return;
			// Try DB first
			let db = await fetchFirstLastFromDb(supabase, u.id, u.email);
			// If missing, attempt to ensure then re-read (one-shot)
			if (!db) {
				try {
					await fetch("/api/people/ensure", { method: "POST", credentials: "include" });
				} catch {
					// ignore network error; we'll still try to read
				}
				db = await fetchFirstLastFromDb(supabase, u.id, u.email);
			}
			if (db) {
				const composed = [db.first, db.last].filter(Boolean).join(" ").trim();
				if (composed && mounted) {
					setName(composed);
					setInitial((composed[0] || "U").toUpperCase());
					return;
				}
			}
			// No DB row found: keep default "User" without falling back to auth metadata
		}
		(async () => {
			try {
				const { data } = await supabase.auth.getUser();
				const user = data?.user;
				await load(user);
			} catch {
				// non-fatal; keep defaults
			}
		})();
		// Keep in sync after login/refresh
		const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
			load(session?.user);
		});
		return () => {
			mounted = false;
			sub?.subscription?.unsubscribe();
		};
	}, []);

	useEffect(() => {
		if (!open) return;
		function onDocClick(e: MouseEvent) {
			const t = e.target as HTMLElement;
			if (!t.closest?.("#user-pill-menu")) {
				setOpen(false);
			}
		}
		document.addEventListener("click", onDocClick);
		return () => document.removeEventListener("click", onDocClick);
	}, [open]);

	async function handleLogout() {
		const supabase = getSupabaseBrowserClient();
		try {
			await supabase.auth.signOut();
		} finally {
			router.replace("/login");
		}
	}

	return (
		<div id="user-pill-menu" className="relative">
			<button
				type="button"
				className="flex h-10 min-w-0 max-w-[200px] items-center gap-2 rounded-[30px] border border-[#D0D0D0] px-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BBC9CE]"
				onClick={() => setOpen((v) => !v)}
				aria-haspopup="menu"
				aria-expanded={open}
			>
				<div className="grid h-6 w-6 place-items-center rounded-full bg-[#FF7677]">
					<span className="text-[16px] leading-[24px] font-bold uppercase text-black">{initial}</span>
				</div>
				<span className="truncate text-sm text-[#5D5D5C]">{name}</span>
			</button>
			{open && (
				<div
					role="menu"
					aria-label="User menu"
					className="absolute right-0 z-50 mt-2 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
				>
					<button
						type="button"
						onClick={handleLogout}
						className="w-full px-3 py-2 text-left text-sm text-[#5D5D5C] hover:bg-gray-50"
						role="menuitem"
					>
						Log out
					</button>
				</div>
			)}
		</div>
	);
}


