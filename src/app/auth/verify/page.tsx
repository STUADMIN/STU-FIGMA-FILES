"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Ensure there is a session; otherwise redirect to login
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
      }
    })();
  }, [router]);

  const doVerify = useCallback(async () => {
    if (code.length < 6 || submitting) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const totp = data?.totp?.[0];
      if (!totp) {
        router.replace("/auth/mfa/enroll");
        return;
      }
      const challenge = await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (challenge.error || !challenge.data) {
        throw challenge.error || new Error("Challenge failed");
      }
      const verify = await supabase.auth.mfa.verify({
        factorId: totp.id,
        challengeId: challenge.data.id,
        code,
      });
      if (verify.error) throw verify.error;
      toast.success("Verified");
      router.replace("/");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Verification failed. Check the 6-digit code and try again.");
    } finally {
      setSubmitting(false);
    }
  }, [code, router, submitting]);

  const handleVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await doVerify();
  }, [doVerify]);

  useEffect(() => {
    // Auto-submit when a 6-digit code is autofilled by Dashlane or pasted
    if (code.length === 6) {
      void doVerify();
    }
  }, [code, doVerify]);

  const cells = new Array(6).fill(null);

  return (
    <div className="min-h-dvh bg-[#0D2352] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl bg-[#0f1838]/60 p-8 shadow-xl border border-white/5">
        <div className="mx-auto mb-8 grid place-items-center rounded-md">
          <svg width="162" height="127" viewBox="0 0 162 127" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="158" height="123" stroke="white" strokeWidth="4" />
            <path d="M85.0747 90.5244C85.3128 90.5244 85.5509 90.206 85.5509 90.0468V86.0669C85.5509 85.8281 85.2334 85.5893 85.0747 85.5893H74.7562V82.9625H86.1065C86.3446 82.9625 86.5828 82.6442 86.5828 82.485V78.107C86.5828 77.8682 86.2653 77.6294 86.1065 77.6294H68.8826C68.6445 77.6294 68.4857 77.8682 68.4857 78.0274V98.2455C68.4857 98.4843 68.7239 98.6435 68.8826 98.6435H86.2652C86.5034 98.6435 86.7415 98.3251 86.7415 98.1659V93.788C86.7415 93.5492 86.424 93.3104 86.2652 93.3104H74.7562V90.5244H85.0747ZM46.2613 91.5592C45.7851 91.5592 45.3882 91.9572 45.3882 92.4348V92.7532C45.3882 96.2555 49.1188 99.0415 55.4686 99.0415C62.4534 99.0415 65.7077 95.5391 65.7077 91.798C65.7077 88.6937 63.8027 86.3057 58.5641 85.8281L53.4049 85.3505C51.9762 85.1913 51.5793 84.7137 51.5793 84.1565C51.5793 83.2013 52.8493 82.4054 55.1511 82.4054C56.9767 82.4054 58.0085 83.1217 58.326 83.8381C58.4848 84.1565 58.7229 84.3157 59.0404 84.3157H63.8027C64.279 84.3157 64.5965 83.9973 64.5965 83.5197C64.5965 80.4154 61.6597 77.3906 55.0717 77.3906C48.8013 77.3906 45.2295 80.6542 45.2295 84.7933C45.2295 88.1365 47.7694 90.0468 52.0556 90.4448L57.2942 90.9224C58.961 91.0816 59.4372 91.7184 59.4372 92.2756C59.4372 93.3104 58.4054 94.1064 55.4686 94.1064C53.2461 94.1064 52.2143 93.5492 51.6587 92.3552C51.5 91.9572 51.2618 91.7184 50.7856 91.7184H46.2613V91.5592Z" fill="#FECA01" />
            <path d="M24.0088 79.5498V88.2158C24.0088 90.326 24.5471 92.2242 25.8086 93.6113C27.0946 95.0253 28.8771 95.6289 30.7715 95.6289C32.6929 95.6288 34.4866 95.0325 35.7715 93.6025C37.0258 92.2065 37.5332 90.3043 37.5332 88.2158V79.5498H39.8037V88.2959C39.8037 91.3116 38.9047 93.403 37.4951 94.75C36.0721 96.1098 33.8661 96.9618 30.7715 96.9619C27.7215 96.9619 25.5104 96.1122 24.0732 94.7461C22.651 93.3941 21.7383 91.3008 21.7383 88.2959V79.5498H24.0088Z" fill="white" stroke="white" strokeWidth="4" />
            <path d="M55.4115 57.8878C58.3483 57.8878 60.8882 60.037 60.8882 63.4597C60.8882 66.8824 58.3483 69.0316 55.4115 69.0316C52.4747 69.0316 49.9348 66.962 49.9348 63.4597C49.8554 60.037 52.4747 57.8878 55.4115 57.8878ZM55.4115 52.5547C49.0617 52.5547 43.585 56.6142 43.585 63.4597C43.585 70.3052 48.9823 74.3647 55.4115 74.3647C61.8407 74.3647 67.2381 70.3052 67.2381 63.4597C67.1587 56.6142 61.7613 52.5547 55.4115 52.5547Z" fill="#FECA01" />
            <path d="M38.8516 54.874V56.207H31.4697V71.8877H29.1992V56.207H21.7383V54.874H38.8516Z" fill="white" stroke="white" strokeWidth="4" />
            <path d="M140.318 41.0942C140.556 41.0942 140.794 40.7758 140.794 40.6166V36.6367C140.794 36.3979 140.477 36.1591 140.318 36.1591H130V33.5323H141.35C141.588 33.5323 141.826 33.2139 141.826 33.0547V28.6768C141.826 28.438 141.509 28.1992 141.35 28.1992H124.126C123.888 28.1992 123.729 28.438 123.729 28.5972V48.8153C123.729 49.0541 123.967 49.2133 124.126 49.2133H141.509C141.747 49.2133 141.985 48.8949 141.985 48.7357V44.3578C141.985 44.119 141.668 43.8802 141.509 43.8802H130V41.0942H140.318ZM111.585 28.5972C111.585 28.3584 111.347 28.1992 111.188 28.1992H105.712C105.473 28.1992 105.315 28.438 105.315 28.5972V48.8153C105.315 49.0541 105.553 49.2133 105.712 49.2133H120.872C121.11 49.2133 121.348 48.8949 121.348 48.7357V44.3578C121.348 44.119 121.031 43.8802 120.872 43.8802H111.585V28.5972ZM93.3294 33.5323C95.3138 33.5323 96.5044 34.7263 96.5044 36.4775C96.5044 38.2287 95.3138 39.343 93.3294 39.343H90.6308V33.5323H93.3294ZM90.2339 49.2929C90.472 49.2929 90.6308 49.0541 90.6308 48.8949V44.3578H93.9644C99.0443 44.3578 102.854 41.4126 102.854 36.3979C102.854 31.5424 99.203 28.2788 93.9644 28.2788H84.7572C84.5191 28.2788 84.3603 28.5176 84.3603 28.6768V48.8949C84.3603 49.1337 84.5984 49.2929 84.7572 49.2929H90.2339ZM75.5499 28.1992C75.3118 28.1992 75.0737 28.2788 74.9149 28.5176L67.9301 38.0695H67.8508L60.866 28.5176C60.7072 28.2788 60.4691 28.1992 60.231 28.1992H55.548C55.3098 28.1992 55.1511 28.438 55.1511 28.5972V48.8153C55.1511 49.0541 55.3892 49.2133 55.548 49.2133H61.0247C61.2628 49.2133 61.4215 48.9745 61.4215 48.8153V38.1491H61.5009C61.5009 38.1491 62.0565 39.2634 62.7709 40.2982L67.8508 47.3029L72.9306 40.2982C73.7243 39.2634 74.2006 38.1491 74.2006 38.1491H74.28V48.8153C74.28 49.0541 74.5181 49.2133 74.6768 49.2133H80.1535C80.3917 49.2133 80.5504 48.9745 80.5504 48.8153V28.5972C80.5504 28.3584 80.3123 28.1992 80.1535 28.1992H75.5499ZM51.4999 28.5972C51.4999 28.3584 51.2618 28.1992 51.1031 28.1992H45.6264C45.3882 28.1992 45.2295 28.438 45.2295 28.5972V48.8153C45.2295 49.0541 45.4676 49.2133 45.6264 49.2133H51.1031C51.3412 49.2133 51.4999 48.9745 51.4999 48.8153V28.5972Z" fill="#FECA01" />
            <path d="M30.4033 30.0391C33.4132 30.0391 35.3367 30.7324 36.4521 31.5518C37.0464 31.9883 37.4332 32.4719 37.6611 32.9639H35.0684C34.1284 31.7089 32.4056 31.0538 30.4834 31.0537C29.1353 31.0537 27.8902 31.2818 26.9033 31.8008C25.9232 32.3164 24.9113 33.3121 24.9111 34.8047C24.9111 35.6497 25.2583 36.5268 26.0859 37.1494C26.7838 37.6743 27.6604 37.891 28.5156 37.9863L28.5527 37.9902L33.7119 38.4678H33.7148C36.0883 38.6842 37.386 39.3089 38.0752 39.9453C38.7134 40.5348 39.04 41.3282 39.04 42.4463C39.04 43.7009 38.5091 44.9383 37.2939 45.9062C36.0532 46.8944 33.9737 47.6894 30.8008 47.6895C27.892 47.6895 25.7875 47.0482 24.4775 46.1875C23.6301 45.6307 23.1346 45.0044 22.8965 44.3672H25.4551C25.9025 45.1022 26.535 45.7146 27.4102 46.1318C28.4023 46.6048 29.5584 46.7549 30.8008 46.7549C32.3893 46.7549 33.7664 46.5496 34.8164 45.998C36.0107 45.3707 36.7695 44.2794 36.7695 42.9238C36.7695 42.0039 36.3443 41.1228 35.5322 40.5059C34.7939 39.945 33.8441 39.6782 32.8164 39.5801L32.8076 39.5791L27.5713 39.1016H27.5723C25.6498 38.923 24.377 38.4234 23.624 37.8154C22.9466 37.2685 22.5615 36.5389 22.5615 35.4414C22.5616 33.9935 23.1672 32.7151 24.376 31.7539C25.6151 30.7686 27.6004 30.0391 30.4033 30.0391Z" fill="white" stroke="white" strokeWidth="4" />
          </svg>
        </div>
        <h1 className="mb-2 text-center text-xl font-semibold">Verification Required</h1>
        <p className="mb-6 text-center text-sm text-white/80">Enter the 6-digit code from your authenticator app</p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            {cells.map((_, idx) => (
              <div key={idx} className="h-12 w-10 rounded-md bg-white/5 ring-1 ring-white/10 grid place-items-center">
                <span className="tabular-nums text-lg">{code[idx] ?? "0"}</span>
              </div>
            ))}
          </div>
          {/* Invisible overlay input for password manager autofill (Dashlane, etc.) */}
          <input
            id="otp"
            name="otp"
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]*"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="absolute inset-0 opacity-0"
          />
          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="w-full rounded-md bg-[#4c7cf0] hover:bg-[#3b6be0] px-4 py-2 font-medium text-white transition disabled:opacity-60"
          >
            {submitting ? "Verifying…" : "Verify"}
          </button>
        </form>

        <button onClick={() => router.back()} className="mt-3 block w-full text-center text-sm text-white/80 hover:text-white">
          ← Back
        </button>
      </div>
    </div>
  );
}
