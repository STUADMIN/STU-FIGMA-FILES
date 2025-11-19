import Link from "next/link";
import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import { StuIcon } from "@/components/icons/StuIcon";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { WelcomeHeading } from "@/components/dashboard/WelcomeHeading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Dashboard",
};

type Metric = {
  label: string;
  value: string;
  muted?: boolean;
};

type Accent = {
  border: string;
  icon: string;
  value: string;
  bullet: string;
};

const dashboardCards: Array<{
  title: string;
  icon: Parameters<typeof StuIcon>[0]["name"];
  metrics: Metric[];
  accent: Accent;
  href?: string;
}> = [
  {
    title: "Tenders",
    icon: "tenders",
    href: "/tenders",
    metrics: [
      { label: "In Progress", value: "11" },
      { label: "Submitted", value: "10" },
    ],
    accent: {
      border: "border-brand-tenders",
      icon: "text-brand-tenders",
      value: "text-brand-tenders",
      bullet: "text-brand-tenders",
    },
  },
  {
    title: "Projects",
    icon: "projects",
    metrics: [
      { label: "In Progress", value: "11" },
      { label: "Submitted", value: "10" },
    ],
    accent: {
      border: "border-brand-projects",
      icon: "text-brand-projects",
      value: "text-brand-projects",
      bullet: "text-brand-projects",
    },
  },
  {
    title: "Health & Safety",
    icon: "health-safety",
    metrics: [
      { label: "In Progress", value: "11" },
      { label: "Submitted", value: "10" },
    ],
    accent: {
      border: "border-brand-hns",
      icon: "text-brand-hns",
      value: "text-brand-hns",
      bullet: "text-brand-hns",
    },
  },
  {
    title: "Equipment",
    icon: "equipment",
    href: "/equipment",
    metrics: [
      { label: "In Progress", value: "11" },
      { label: "Submitted", value: "10" },
    ],
    accent: {
      border: "border-brand-equipment",
      icon: "text-brand-equipment",
      value: "text-brand-equipment",
      bullet: "text-brand-equipment",
    },
  },
  {
    title: "Vehicles",
    icon: "vehicles",
    metrics: [
      { label: "In Progress", value: "11" },
      { label: "Submitted", value: "10" },
    ],
    accent: {
      border: "border-brand-vehicles",
      icon: "text-brand-vehicles",
      value: "text-brand-vehicles",
      bullet: "text-brand-vehicles",
    },
  },
  {
    title: "Emissions",
    icon: "emissions",
    metrics: [
      { label: "In Progress", value: "11" },
      { label: "Submitted", value: "10" },
    ],
    accent: {
      border: "border-brand-emissions",
      icon: "text-brand-emissions",
      value: "text-brand-emissions",
      bullet: "text-brand-emissions",
    },
  },
  {
    title: "Accounts",
    icon: "accounts",
    metrics: [
      { label: "In Progress", value: "11" },
      { label: "Submitted", value: "10" },
    ],
    accent: {
      border: "border-brand-accounts",
      icon: "text-brand-accounts",
      value: "text-brand-accounts",
      bullet: "text-brand-accounts",
    },
  },
  {
    title: "HR",
    icon: "hr",
    metrics: [
      { label: "In Progress", value: "11" },
      { label: "Submitted", value: "10" },
    ],
    accent: {
      border: "border-brand-hr",
      icon: "text-brand-hr",
      value: "text-brand-hr",
      bullet: "text-brand-hr",
    },
  },
];

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  let initialFirstName = "";
  let initialFullName = "";

  try {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id ?? null;
    if (userId) {
      const { data } = await supabase
        .from("people")
        .select("display_name, first_name, last_name")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
      const display = String(data?.display_name ?? "").trim();
      const first = String(data?.first_name ?? "").trim();
      const last = String((data as any)?.last_name ?? "").trim();
      initialFirstName = (display.split(" ")[0] || first || "").trim();
      initialFullName = (display || [first, last].filter(Boolean).join(" ")).trim();
    }
  } catch {
    // non-fatal
  }

  const welcomeName = initialFirstName || "there";
  const pillName = initialFullName || initialFirstName || "";

  return (
    <AppShell userDisplayName={pillName}>
      <WelcomeHeading initialFirstName={welcomeName} />
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {dashboardCards.map((card) => (
          <DashboardCard key={card.title} {...card} />
        ))}
      </div>
    </AppShell>
  );
}

type DashboardCardProps = {
  title: string;
  icon: Parameters<typeof StuIcon>[0]["name"];
  metrics: Metric[];
  accent: Accent;
  href?: string;
};

function DashboardCard({ title, icon, metrics, accent, href }: DashboardCardProps) {
  const cardContent = (
    <div
      className={`relative flex h-[216px] w-full flex-col items-start gap-4 rounded-card border-2 bg-white p-card shadow-sm transition-shadow ${accent.border}`}
    >
      <div className="flex flex-col items-start gap-3">
        <div className="grid h-[84px] w-[84px] place-items-center rounded-lg bg-white">
          <StuIcon name={icon} size={84} className={accent.icon} aria-label={title} />
        </div>
        <h3 className="text-lg font-semibold leading-tight text-[#0D2352]">{title}</h3>
        <p className="text-sm text-[#0D2352]">
          {metrics.map((metric, index) => (
            <span key={`${title}-${metric.label}`} className={metric.muted ? "opacity-70" : ""}>
              {metric.label} {" "}
              <span className={`font-semibold ${accent.value}`}>{metric.value}</span>
              {index < metrics.length - 1 && <span className={`mx-2 text-base ${accent.bullet}`}>•</span>}
            </span>
          ))}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <div className="group relative">
        {cardContent}
        <Link
          href={href}
          className="absolute bottom-6 right-6 flex h-8 w-[90px] items-center justify-center gap-1 rounded border border-[#D0D0D0] px-4 py-1 text-sm text-[#5D5D5C] transition group-hover:border-[#BABABA]"
        >
          Manage
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      {cardContent}
      <button
        className="absolute bottom-6 right-6 flex h-8 w-[90px] items-center justify-center gap-1 rounded border border-[#D0D0D0] px-4 py-1 text-sm text-[#5D5D5C] opacity-60"
        disabled
      >
        Manage
      </button>
    </div>
  );
}
