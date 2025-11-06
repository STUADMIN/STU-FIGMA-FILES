import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-dvh p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-semibold">STU</h1>
        <p className="mb-6 text-gray-600">
          {user ? "You are signed in." : "You are not signed in."}
        </p>
        <div className="flex items-center gap-4">
          {!user ? (
            <Link className="rounded-lg bg-gray-900 px-4 py-2.5 text-white" href="/login">
              Sign in
            </Link>
          ) : (
            <form action="/auth/signout" method="post">
              <button className="rounded-lg border border-gray-300 px-4 py-2.5">
                Sign out
              </button>
            </form>
          )}
          <Link className="text-blue-600 underline" href="/protected">
            Protected page
          </Link>
        </div>
      </div>
    </main>
  );
}
