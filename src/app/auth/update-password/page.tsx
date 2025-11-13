'use client';
import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      router.replace("/login");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  }, [password, router]);

  return (
    <div className="min-h-dvh bg-[#0D2352] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl bg-[#0f1838]/60 p-8 shadow-xl border border-white/5">
        <h1 className="mb-2 text-center text-xl font-semibold">Set a new password</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/90">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-white/5 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white/20"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#4c7cf0] hover:bg-[#3b6be0] px-4 py-2 font-medium text-white transition disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save password"}
          </button>
        </form>
      </div>
    </div>
  );
}

