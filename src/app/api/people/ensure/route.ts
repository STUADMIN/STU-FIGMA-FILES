import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "../../../../lib/supabaseServer";

export const runtime = "nodejs";

export async function POST() {
	try {
		const supabase = await getSupabaseServerClient();
		const { data, error: authError } = await supabase.auth.getUser();
		if (authError) {
			return NextResponse.json({ error: authError.message }, { status: 401 });
		}
		const user = data?.user;
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Create or update this user's people row
		const meta = user.user_metadata ?? {};
		const first =
			meta.first_name ?? meta.FirstName ?? meta.firstName ?? meta.firstname ?? meta.first ?? "";
		const last =
			meta.last_name ?? meta.LastName ?? meta.lastName ?? meta.lastname ?? meta.surname ?? meta.last ?? "";

		const payload = {
			user_id: user.id,
			first_name: String(first || "").trim(),
			last_name: String(last || "").trim(),
			email: user.email ?? null,
		};

		const { error } = await supabase.from("people").upsert([payload], {
			onConflict: "user_id",
			ignoreDuplicates: false,
		});
		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}
		return NextResponse.json({ ok: true });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "Internal Server Error" }, { status: 500 });
	}
}


