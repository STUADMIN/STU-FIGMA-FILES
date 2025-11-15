import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function getSupabaseServerClient() {
	const cookieStore = await cookies();
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
	const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
	return createServerClient(url, anon, {
		cookies: {
			get(name: string) {
				return cookieStore.get(name)?.value;
			},
			set(name: string, value: string, options: any) {
				cookieStore.set({ name, value, ...options });
			},
			remove(name: string, options: any) {
				cookieStore.set({ name, value: "", expires: new Date(0), ...options });
			},
		},
	});
}

export function getSupabaseServiceRoleClient() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!url) {
		throw new Error("Missing Supabase URL configuration");
	}

	if (!serviceRoleKey) {
		throw new Error("Missing Supabase service role key configuration");
	}

	return createClient(url, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}
