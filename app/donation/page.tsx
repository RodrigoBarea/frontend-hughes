// app/support/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  GraduationCap,
  Music,
  MicVocal,
  Sparkles,
  Landmark,
  School2,
  Users,
  Trophy,
  ArrowRight,
  Receipt,
  Building2,
  HandHeart,
} from "lucide-react";

const BG = "/38.jpg"; // replace with your image

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <WhyGive />
      </section>

      <section className="bg-[#f7f9fd]">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <WhereItGoes />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <ImpactBand />
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <DonationWidget />
        </div>
      </section>


    </main>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src={BG}
          alt="Students at Hughes Schools"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,18,41,0.70),rgba(11,18,41,0.55))]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 text-white">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: "var(--hs-yellow)" }}
            />
            <span className="text-xs tracking-[0.2em] font-semibold">
              SUPPORT HUGHES SCHOOLS
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Fuel Excellence. Empower Every Student.
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/90">
            Your generosity sustains rigorous academics, world-class performing
            arts, and life-changing opportunities for students from Pre-K to Grade 12.
          </p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            <Chip icon={<GraduationCap className="h-4 w-4" />}>
              100% college matriculation
            </Chip>
            <Chip icon={<Trophy className="h-4 w-4" />}>
              200+ academic awards
            </Chip>
            <Chip icon={<Music className="h-4 w-4" />}>230+ performances</Chip>
            <Chip icon={<Sparkles className="h-4 w-4" />}>$3.1M+ scholarships</Chip>
          </div>
        </div>
      </div>
    </section>
  );
}

function Chip({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-hughes-blue shadow-sm ring-1 ring-black/5">
      {icon}
      {children}
    </span>
  );
}

function WhyGive() {
  return (
    <div className="grid lg:grid-cols-2 gap-10 items-start">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-hughes-blue">
          Why your gift matters
        </h2>
        <p className="mt-3 text-hughes-blue/80">
          Hughes Schools is a bilingual, independent PK–12 institution in
          Cochabamba, Bolivia, delivering rigorous academics and a robust
          Performing Arts program. Your support expands access to excellence,
          funds specialized faculty development, enhances labs and studios, and
          sustains performances and competitions that shape confident,
          high-achieving graduates.
        </p>

        <ul className="mt-6 space-y-3 text-sm text-hughes-blue/90">
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-4 w-4 text-[var(--hs-yellow)]" />
            80% of instruction is in English, from Pre-K to Grade 12.
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-4 w-4 text-[var(--hs-yellow)]" />
            Science every year includes lab components and hands-on research.
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-4 w-4 text-[var(--hs-yellow)]" />
            Honors pathway (up to 16 courses) in English, Physics, Chemistry, and Math.
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-4 w-4 text-[var(--hs-yellow)]" />
            Performing Arts with choir, classical & folk music, and dance—over 230
            national & international presentations.
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
        <Stat value="715" label="Students enrolled" />
        <Stat value="100%" label="College placement" />
        <Stat value="54" label="State science awards" />
        <Stat value="11" label="National physics awards" />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f9fd] p-5 ring-1 ring-black/5">
      <div className="text-3xl font-extrabold text-hughes-blue">{value}</div>
      <div className="mt-1 text-sm text-hughes-blue/70">{label}</div>
    </div>
  );
}

function WhereItGoes() {
  const items = [
    {
      icon: <School2 className="h-5 w-5" />,
      title: "Academic Excellence",
      desc: "Curriculum innovation, science labs, bilingual resources, and honors coursework across high school.",
    },
    {
      icon: <MicVocal className="h-5 w-5" />,
      title: "Performing Arts",
      desc: "Choir, classical training, and Bolivian Folk Music—individual lessons, instruments, costumes, productions.",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Access & Scholarships",
      desc: "Need-based support ensures talented students thrive regardless of financial background.",
    },
    {
      icon: <Landmark className="h-5 w-5" />,
      title: "Faculty & Facilities",
      desc: "Professional development, classroom upgrades, and safe spaces where learning and creativity flourish.",
    },
  ];
  return (
    <>
      <h3 className="text-2xl md:text-3xl font-bold text-hughes-blue">
        Where your gift goes
      </h3>
      <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl bg-white p-5 ring-1 ring-black/5 hover:shadow-sm transition"
          >
            <div className="flex items-center gap-2 text-hughes-blue">
              <span className="text-[var(--hs-yellow)]">{item.icon}</span>
              <div className="font-semibold">{item.title}</div>
            </div>
            <p className="mt-2 text-sm text-hughes-blue/80">{item.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function ImpactBand() {
  const items = [
    {
      quote:
        "Hughes challenged me to think critically and lead with purpose. The arts program helped me find my voice.",
      name: "Class of 2023 Graduate",
    },
    {
      quote:
        "Our child discovered a passion for science thanks to labs and fairs—your support makes this possible.",
      name: "Hughes Parent",
    },
    {
      quote:
        "Through Bolivian Folk Music, we celebrate identity while performing nationwide. It changes lives.",
      name: "Folk Ensemble Student",
    },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {items.map((t, i) => (
        <figure
          key={i}
          className="rounded-2xl bg-[#f7f9fd] p-5 ring-1 ring-black/5"
        >
          <blockquote className="text-hughes-blue/90">{t.quote}</blockquote>
          <figcaption className="mt-3 text-sm font-medium text-hughes-blue">
            — {t.name}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* ---------------- Donation widget ---------------- */

function DonationWidget() {
  const [amount, setAmount] = useState<string>("50");
  const [freq, setFreq] = useState<"once" | "monthly">("once");

  const presets = ["25", "50", "100", "250"];

  function formatAmount(v: string) {
    const digits = v.replace(/[^\d]/g, "");
    return digits.replace(/^0+/, "") || "0";
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
        <h3 className="text-2xl md:text-3xl font-bold text-hughes-blue">
          Start your donation
        </h3>
        <p className="mt-2 text-hughes-blue/80">
          Make a one-time or recurring gift to expand access, fund excellence,
          and power the Performing Arts at Hughes Schools.
        </p>

        <div className="mt-6 rounded-2xl border p-5 ring-1 ring-black/5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFreq("once")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition
                ${
                  freq === "once"
                    ? "bg-[var(--hs-yellow)] text-hughes-blue"
                    : "bg-[#f2f4fb] text-hughes-blue/80 hover:bg-[#e9ecf7]"
                }`}
            >
              One-time
            </button>
            <button
              onClick={() => setFreq("monthly")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition
                ${
                  freq === "monthly"
                    ? "bg-[var(--hs-yellow)] text-hughes-blue"
                    : "bg-[#f2f4fb] text-hughes-blue/80 hover:bg-[#e9ecf7]"
                }`}
            >
              Monthly
            </button>
          </div>

          <div className="mt-5 grid sm:grid-cols-5 gap-3">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p)}
                className="rounded-xl bg-[#f7f9fd] px-4 py-3 text-sm font-semibold text-hughes-blue ring-1 ring-black/5 hover:bg-white"
              >
                ${p}
              </button>
            ))}

            <div className="sm:col-span-2 flex items-center gap-2 rounded-xl bg-white px-4 py-3 ring-1 ring-black/10">
              <span className="text-hughes-blue/70 font-semibold">$</span>
              <input
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(formatAmount(e.target.value))}
                className="w-full bg-transparent outline-none text-hughes-blue font-semibold"
                aria-label="Donation amount"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              className="inline-flex items-center justify-center rounded-full bg-[var(--hs-yellow)] px-6 py-3 font-semibold text-hughes-blue hover:opacity-90 transition"
              onClick={() => {
                alert(
                  `Thank you! Processing a ${freq} donation of $${Number(
                    amount || "0"
                  ).toLocaleString()}`
                );
              }}
            >
              Donate
            </button>
            <p className="text-xs text-hughes-blue/60">
              Secure form. You’ll receive a confirmation email and receipt.
            </p>
          </div>
        </div>
      </div>

      <aside className="rounded-2xl bg-[#f7f9fd] p-6 ring-1 ring-black/5">
        <h4 className="text-lg font-bold text-hughes-blue">Your impact</h4>
        <ul className="mt-3 space-y-3 text-sm text-hughes-blue/85">
          <li className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 text-[var(--hs-yellow)]" />
            Funds instruments, rehearsal space, and festival travel.
          </li>
        </ul>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniStat value="80%" label="Instruction in English" />
          <MiniStat value="230+" label="Performances" />
          <MiniStat value="100%" label="University matriculation" />
          <MiniStat value="$3.1M+" label="Scholarships (5 yrs)" />
        </div>
      </aside>
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-black/5">
      <div className="text-xl font-extrabold text-hughes-blue">{value}</div>
      <div className="text-xs text-hughes-blue/70">{label}</div>
    </div>
  );
}

function OtherWays() {
  const items = [
    {
      icon: <Receipt className="h-5 w-5" />,
      title: "Wire / Bank Transfer",
      desc: "Prefer to give by bank transfer? Contact our office for account details and a receipt.",
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      title: "Corporate Matching",
      desc: "Multiply your gift. Ask your employer if they offer a matching-gift program.",
    },
    {
      icon: <HandHeart className="h-5 w-5" />,
      title: "Legacy & Planned Gifts",
      desc: "Create lasting impact with bequests and planned giving. We can help you get started.",
    },
  ];


}
