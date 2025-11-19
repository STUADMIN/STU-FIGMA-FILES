'use client';
import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/update-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Reset link sent (if the email exists)");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <div className="min-h-dvh bg-[#0D2352] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl bg-[#0f1838]/60 p-8 shadow-xl border border-white/5">
        <h1 className="mb-2 text-center text-xl font-semibold">Reset password</h1>
        {!sent ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-white/90">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-white/5 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white/20"
                placeholder="you@example.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#4c7cf0] hover:bg-[#3b6be0] px-4 py-2 font-medium text-white transition disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        ) : (
          <p className="text-center text-sm text-white/80">If an account exists for that email, a reset link has been sent.</p>
        )}
      </div>
    </div>
  );
}

