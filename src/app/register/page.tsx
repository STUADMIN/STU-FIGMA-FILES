'use client';
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${origin}/login` },
      });
      if (error) throw error;

      if (data.user && data.session) {
        toast.success("Account created and signed in");
        router.replace("/");
      } else {
        toast.message("Account created", {
          description: "If email confirmation is enabled, confirm your email before logging in.",
        });
        router.replace("/login");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }, [email, password, router]);

  return (
    <div className="min-h-dvh bg-[#0D2352] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl bg-[#0f1838]/60 p-8 shadow-xl border border-white/5">
        <h1 className="mb-2 text-center text-xl font-semibold">Create account</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/90">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-white/5 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white/20"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/90">Password</label>
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
            {loading ? "Creating…" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

