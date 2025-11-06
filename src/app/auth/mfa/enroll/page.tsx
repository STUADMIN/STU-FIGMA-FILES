"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EnrollMfaPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // If already enrolled, go to verify instead
        const factors = await supabase.auth.mfa.listFactors();
        if (factors.data?.totp?.length) {
          router.replace("/auth/verify");
          return;
        }

        const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
        if (error || !data) throw error || new Error("Failed to start enrollment");
        if (cancelled) return;
        setFactorId(data.id);
        setQr(data.totp.qr_code ?? null);
        setSecret(data.totp.secret ?? null);
      } catch (err) {
        console.error(err);
        const message = (err as any)?.message ?? "Unable to start MFA enrollment. Please try again.";
        alert(message + "\nCheck that MFA (TOTP) is enabled in Supabase Auth settings and that you're signed in.");
        router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router, supabase]);

  const onVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || code.length !== 6) return;
    setSubmitting(true);
    try {
      const verify = await supabase.auth.mfa.verify({ factorId, code });
      if (verify.error) throw verify.error;
      alert("Authenticator enabled. You can now sign in with your code.");
      router.replace("/");
    } catch (err) {
      console.error(err);
      alert("Verification failed. Double-check the code and try again.");
    } finally {
      setSubmitting(false);
    }
  }, [code, factorId, router, supabase]);

  return (
    <div className="min-h-dvh bg-[#0D2352] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl bg-[#0f1838]/60 p-8 shadow-xl border border-white/5">
        <h1 className="mb-2 text-center text-xl font-semibold">Set up Authenticator</h1>
        {loading ? (
          <p className="text-center text-white/80">Preparing enrollment…</p>
        ) : (
          <>
            {qr ? (
              <div className="mb-4 grid place-items-center">
                <img src={qr} alt="Authenticator QR" className="rounded-md bg-white p-2" />
              </div>
            ) : null}
            {secret ? (
              <p className="mb-4 text-center text-sm text-white/80">Secret: {secret}</p>
            ) : null}
            <form onSubmit={onVerify} className="space-y-3">
              <input
                id="otp"
                name="otp"
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]*"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full rounded-md bg-white/5 px-3 py-2 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white/20"
              />
              <button
                type="submit"
                disabled={submitting || code.length !== 6}
                className="w-full rounded-md bg-[#4c7cf0] hover:bg-[#3b6be0] px-4 py-2 font-medium text-white transition disabled:opacity-60"
              >
                {submitting ? "Verifying…" : "Verify & Enable"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}


