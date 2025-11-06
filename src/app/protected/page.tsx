import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-6">
      <h1 className="mb-2 text-2xl font-semibold">Protected</h1>
      <p className="mb-4 text-gray-700">Signed in as {user.email}</p>
      <Link className="text-blue-600 underline" href="/">Go home</Link>
    </div>
  );
}
