import React from "react";
import AppShell from "../../components/layout/AppShell";
import { getSupabaseServerClient } from "../../lib/supabaseServer";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PersonRecord = {
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
};

const quickHelpLinks = [
  {
    label: "Product documentation",
    description: "In-depth guides and release notes for every STU module.",
    href: "https://support.stu.build/docs",
  },
  {
    label: "Platform status",
    description: "Live uptime metrics and incident history.",
    href: "https://status.stu.build",
  },
  {
    label: "Community forum",
    description: "Swap tips with other operators and share best practice.",
    href: "#",
  },
];

const knowledgeCollections = [
  {
    title: "Getting started",
    blurb: "Step-by-step walkthroughs and checklists for onboarding new teams.",
    href: "https://support.stu.build/docs/getting-started",
  },
  {
    title: "Tender management",
    blurb: "Best practice for logging tenders, collaborating across teams, and tracking progress.",
    href: "https://support.stu.build/docs/tenders",
  },
  {
    title: "Operations toolkit",
    blurb: "Operational standards covering projects, H&S, and equipment compliance.",
    href: "https://support.stu.build/docs/operations",
  },
];

const faqItems = [
  {
    question: "How do I invite a colleague?",
    answer:
      "Head to Tenders and use the “Assign” dropdown to add any teammate that has an account in your organisation.",
  },
  {
    question: "Where can I download reports?",
    answer: "Reports can be found in your Dashboard under “Insights”. You can export to CSV or PDF.",
  },
  {
    question: "Need more help?",
    answer:
      "Email support@stu.build or call +44 (0)20 1234 5678 and we’ll get you back on track.",
  },
];

export default async function HelpSupportPage() {
  const supabase = await getSupabaseServerClient();
  let fullName = "";

  try {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id ?? null;
    if (userId) {
      const { data } = await supabase
        .from("people")
        .select("display_name, first_name, last_name")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle<PersonRecord>();

      if (data) {
        const display = (data.display_name ?? "").trim();
        const first = (data.first_name ?? "").trim();
        const last = (data.last_name ?? "").trim();
        fullName = display || [first, last].filter(Boolean).join(" ");
      }
    }
  } catch {
    // fail silently – we can still render the page with default copy
  }

  return (
    <AppShell userDisplayName={fullName} fullWidth>
      <div className="flex w-full min-h-[calc(100vh-5rem)] flex-col bg-[#0D2352] px-0 py-8 text-white">
        <div className="flex w-full max-w-7xl flex-col gap-10 px-7 pb-20">
          <header className="flex flex-col gap-8 rounded-[32px] border border-white/10 bg-white/5 p-10 text-white shadow-[0_30px_70px_rgba(13,35,82,0.35)] backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#C5D6FF]">Help &amp; Support</p>
              <h1 className="text-[38px] font-semibold leading-tight">How can we help today?</h1>
              <p className="text-base text-white/80">
                Explore curated resources, browse common questions, or reach out to the support desk. We&apos;re here to
                keep your team moving.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="mailto:support@stu.build"
                  className="inline-flex items-center gap-2 rounded-full bg-[#4C7CF0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3B6BE0]"
                >
                  Email support
                </Link>
                <Link
                  href="#support-request"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Raise a ticket
                </Link>
              </div>
            </div>

            <div className="flex w-full max-w-md flex-col gap-4 rounded-[28px] border border-white/10 bg-white/10 p-6 shadow-[0_24px_48px_rgba(13,35,82,0.2)]">
              <span className="text-sm font-semibold uppercase tracking-[0.12em] text-white/70">Quick access</span>
              <ul className="flex flex-col gap-4">
                {quickHelpLinks.map((item) => (
                  <li key={item.label} className="flex flex-col gap-1">
                    <Link
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-[15px] font-semibold text-white transition hover:text-[#C5D6FF]"
                    >
                      {item.label}
                    </Link>
                    <p className="text-sm text-white/70">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="rounded-[28px] border border-white/10 bg-white p-8 text-[#0D2352] shadow-[0_24px_50px_rgba(13,35,82,0.25)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Knowledge base</h2>
                  <p className="mt-2 text-sm text-[#5D5D5C]">
                    Curated guides to help your organisation configure, adopt, and scale STU.
                  </p>
                </div>
                <Link
                  href="https://support.stu.build/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden rounded-full border border-[#4C7CF0] px-4 py-2 text-sm font-semibold text-[#4C7CF0] transition hover:bg-[#EFF3FF] lg:inline-flex"
                >
                  Browse library
                </Link>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {knowledgeCollections.map((collection) => (
                  <div
                    key={collection.title}
                    className="flex flex-col gap-3 rounded-[18px] border border-[#EAECF0] bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <h3 className="text-lg font-semibold text-[#0D2352]">{collection.title}</h3>
                    <p className="text-sm text-[#5D5D5C]">{collection.blurb}</p>
                    <Link
                      href={collection.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#4C7CF0] transition hover:underline"
                    >
                      Read more
                    </Link>
                  </div>
                ))}
              </div>
              <Link
                href="https://support.stu.build/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex rounded-full border border-[#4C7CF0] px-4 py-2 text-sm font-semibold text-[#4C7CF0] transition hover:bg-[#EFF3FF] lg:hidden"
              >
                Browse library
              </Link>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-[24px] border border-white/15 bg-white p-6 text-[#0D2352] shadow-[0_20px_45px_rgba(13,35,82,0.2)]">
                <h2 className="text-xl font-semibold">Contact support</h2>
                <p className="mt-2 text-sm text-[#5D5D5C]">
                  Email the support desk or raise a ticket. Our team aims to respond within one business day.
                </p>
                <div className="mt-4 space-y-2 text-sm text-[#0D2352]">
                  <p>
                    Email:{" "}
                    <a className="font-semibold text-[#4C7CF0] hover:underline" href="mailto:support@stu.build">
                      support@stu.build
                    </a>
                  </p>
                  <p>Phone: +44 (0)20 1234 5678</p>
                  <p className="text-xs text-[#5D5D5C]">Support hours: Monday–Friday, 8am–6pm (BST)</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/15 bg-white/10 p-6 text-white shadow-[0_20px_45px_rgba(13,35,82,0.2)]">
                <h2 className="text-xl font-semibold">System status</h2>
                <p className="mt-2 text-sm text-white/80">
                  Check uptime, planned maintenance, and incident history across STU services.
                </p>
                <Link
                  href="https://status.stu.build"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#C5D6FF] transition hover:text-white"
                >
                  View live status
                </Link>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="rounded-[28px] border border-white/10 bg-white p-8 text-[#0D2352] shadow-[0_24px_50px_rgba(13,35,82,0.25)]">
              <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
              <p className="mt-2 text-sm text-[#5D5D5C]">
                Quick answers to the most common questions from teams using STU every day.
              </p>
              <ul className="mt-6 space-y-5 text-sm text-[#0D2352]">
                {faqItems.map((faq) => (
                  <li key={faq.question} className="rounded-[18px] border border-[#EAECF0] bg-white/70 p-5">
                    <strong className="block text-base font-semibold text-[#0D2352]">{faq.question}</strong>
                    <p className="mt-2 text-sm text-[#5D5D5C]">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div
              id="support-request"
              className="flex flex-col gap-5 rounded-[28px] border border-white/10 bg-white p-8 text-[#0D2352] shadow-[0_24px_50px_rgba(13,35,82,0.25)]"
            >
              <h2 className="text-2xl font-semibold">Raise a support request</h2>
              <p className="text-sm text-[#5D5D5C]">
                Can&apos;t find what you need? Tell us a little more and we&apos;ll be in touch within one business day.
              </p>
              <form className="flex flex-col gap-4">
                <label className="text-sm font-semibold text-[#0D2352]">
                  Subject
                  <input
                    type="text"
                    placeholder="Short summary"
                    className="mt-1 h-11 w-full rounded-[12px] border border-[#D0D0D0] bg-white px-3 text-sm text-[#0D2352] outline-none focus:border-[#4C7CF0] focus:ring-2 focus:ring-[#4C7CF0]"
                  />
                </label>
                <label className="text-sm font-semibold text-[#0D2352]">
                  Details
                  <textarea
                    placeholder="Let us know what you were trying to do..."
                    className="mt-1 min-h-[120px] w-full rounded-[12px] border border-[#D0D0D0] bg-white px-3 py-2 text-sm text-[#0D2352] outline-none focus:border-[#4C7CF0] focus:ring-2 focus:ring-[#4C7CF0]"
                  />
                </label>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center justify-center rounded-[12px] bg-[#4C7CF0] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#3B6BE0]"
                >
                  Submit request
                </button>
                <p className="text-xs text-[#5D5D5C]">
                  Submitting this form sends an email to the STU support desk. We&apos;ll respond within one business day.
                </p>
              </form>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-white shadow-[0_24px_50px_rgba(13,35,82,0.3)] backdrop-blur-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <h2 className="text-2xl font-semibold leading-tight">Prefer to speak with someone?</h2>
                <p className="text-sm text-white/80">
                  Book time with a customer success specialist to review your workflow, plan onboarding, or troubleshoot an
                  issue live.
                </p>
              </div>
              <Link
                href="#"
                className="inline-flex items-center gap-2 rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Schedule a call
              </Link>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

