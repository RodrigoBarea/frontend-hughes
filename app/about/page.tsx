// app/about/page.tsx
"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2,
  Globe2,
  Users,
  Landmark,
  Trophy,
  Sparkles,
  Music,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

/**
 * About — streamlined
 * - Hero
 * - Vision / Mission
 * - Who We Are
 * - By the Numbers
 * - Academics table
 * - Performing Arts
 * - Results & Awards
 * - Graduate Profile + Student Life (merged & styled)
 */

const META = {
  ceeb: "905040",
  address: "Km. 6 a Sacaba, Avenida Octava, Cochabamba, Bolivia",
  phone: "(591) 4-471-6262",
  founded: 1998,
  enrollment: 715,
  englishPct: 80,
  performances6y: 230,
  honorsMax: 16,
  scholarships5y: "$3.1M+",
};

const VISION = `Hughes Schools is a national leader in education, recognized for the quality and excellence of its academic and artistic services. Our graduates pair high achievement with strong values and social commitment, serving their communities and society at large.`;

const MISSION = `We form and empower people of integrity and success through academic and artistic excellence in an environment of safety and well-being. Our specialized team continuously updates teaching methods to meet the needs of students, society, and the state—maintaining excellent communication with families and the global community based on respect and mutual understanding.`;

const GRADUATE_PROFILE = `An ordinary person who does extraordinary things. Hughes graduates are thoughtful, active, and productive leaders who apply positive values and knowledge to grow personally and improve the world. With strong logical, critical, and creative thinking, they set ambitious goals and achieve them—benefitting family, friends, community, and country.`;

const CORE_CREDITS = [
  { area: "English", list: ["English I", "English II", "English III", "English IV"] },
  { area: "Mathematics", list: ["Algebra II", "Geometry", "Pre-calculus", "Calculus"] },
  { area: "Science", list: ["Biology I–IV", "Chemistry I–IV", "Physics I–IV (with labs)"] },
  { area: "Social Science", list: ["American History", "U.S. Government", "World History", "Economics"] },
  { area: "Foreign Language", list: ["Spanish I–IV"] },
  { area: "Moral Education", list: ["I–IV"] },
  { area: "Art", list: ["I–IV"] },
  { area: "Music Appreciation", list: ["I–IV"] },
  { area: "Foundations", list: ["Philosophy I", "Psychology I", "Computer Science I", "Geography I"] },
  { area: "Physical Education", list: ["I–IV"] },
];

const HONORS = `High-achieving students may take Honors in English, Physics, Chemistry, and Mathematics across all four years (up to 16 honors courses available).`;

const ARTS = {
  level1: {
    grades: "Grades 1–4",
    hours: 10,
    courses: ["Classical Ballet", "Jazz Dance", "Bolivian Folk Dance", "Choir", "Music Theory"],
    note: "Instrument classes encouraged (optional)",
  },
  level2: {
    grades: "Grades 5–12",
    tracks: [
      { name: "Dance", hours: 12, courses: ["Classical Ballet", "Jazz", "Contemporary", "Bolivian Folk"] },
      {
        name: "Music",
        hours: 7,
        courses: ["Choir", "Music Theory", "Bolivian Folk Music"],
        instruments:
          "Principal instrument: piano, voice, strings, brass, woodwinds (voice students also study piano)",
      },
    ],
    double: "Double-specialty program (by invitation): Dance + Music, 19 hrs/week",
  },
  footprint: "230+ performances in the last 6 years, including Chile, Italy, and the U.S.",
};

const RESULTS = {
  placement: "100% matriculated to 4-year colleges and/or universities",
  scholarships: "$3,100,000+ in academic and artistic scholarships from U.S. universities in the last 5 years",
};

const AWARDS: string[] = [
  "11 National Youth Science Foundation Scholars",
  "10 United Space School (NASA) awardees",
  "COMTECO Short Story Gold Medal (Writing)",
  "C-tech2 scholarship winner at Virginia Tech University",
  "11 National Physics Olympiad winners",
  "9 National Mathematics Olympiad winners",
  "1 National Geography Olympiad winner",
  "20 State Physics Olympiad winners",
  "11 State Mathematics Olympiad winners",
  "2 Ibero-American Physics Olympiad (OIbF) winners",
  "1 World Science Scholar",
  "1 International Olympiad in Astronomy and Astrophysics (IOAA) winner",
  "4 International Mathematical Olympiad (IMO) winners",
  "2 Latin American Astronomy and Astronautics Olympiad (OLAA) winners",
  "1 European Physics Olympiad (EuPhO) winner",
  "1 State Geography Olympiad winner",
  "8 State Olympics Champions in Chess",
  "7 National Olympics Champions in Chess",
  "54 State Science Fair Award winners",
  "110 District Science Olympics Award winners",
  "International folk & vocal distinctions in Bolivia, Chile, Italy, and the USA",
];

// Small UI pill
const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-hughes-blue shadow-sm ring-1 ring-black/5">
    {children}
  </span>
);

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image src="/35.JPG" alt="Hughes students" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        </div>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 text-white">
          <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="text-4xl md:text-6xl font-extrabold tracking-tight">
            About Hughes Schools
          </motion.h1>
          <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.6, delay:0.1}} className="mt-4 max-w-2xl text-base md:text-lg text-white/90">
            A bilingual, independent PK–12 institution delivering rigorous academics, a robust Performing Arts program, and a culture of character, leadership, and community.
          </motion.p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Chip><Users className="h-3.5 w-3.5"/> {META.enrollment} Students</Chip>
            <Chip><Globe2 className="h-3.5 w-3.5"/> ~{META.englishPct}% Instruction in English</Chip>
            <Chip><Landmark className="h-3.5 w-3.5"/> Founded {META.founded}</Chip>
            <Chip><Trophy className="h-3.5 w-3.5"/> 100% College Matriculation</Chip>
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-10 px-6 py-14 md:py-20 items-center">
          <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden shadow-sm ring-1 ring-black/5">
            <Image src="/37.JPG" alt="Vision" fill className="object-cover" />
          </div>
          <div>
            <div className="text-[var(--hs-yellow)] font-semibold tracking-wide uppercase">Our Vision</div>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-hughes-blue">Excellence with Purpose</h2>
            <p className="mt-3 text-muted-foreground">{VISION}</p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Badge variant="secondary" className="rounded-full">Quality</Badge>
              <Badge variant="secondary" className="rounded-full">Values</Badge>
              <Badge variant="secondary" className="rounded-full">Social Commitment</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="bg-[#f7f9fd]">
        <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-10 px-6 py-14 md:py-20 items-center">
          <div>
            <div className="text-[var(--hs-yellow)] font-semibold tracking-wide uppercase">Our Mission</div>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-hughes-blue">Integrity, Safety, Well-being</h2>
            <p className="mt-3 text-muted-foreground">{MISSION}</p>
            <ul className="mt-4 grid sm:grid-cols-2 gap-3 text-sm text-hughes-blue/80">
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--hs-yellow)]"/> Bilingual PK–12</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--hs-yellow)]"/> Mastery-based advancement</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--hs-yellow)]"/> Continuous teacher development</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--hs-yellow)]"/> Family & community partnership</li>
            </ul>
          </div>
          <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden shadow-sm ring-1 ring-black/5">
            <Image src="/36 (2).JPG" alt="Mission" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-[var(--hs-yellow)] font-semibold uppercase tracking-wide">Who We Are</div>
              <h3 className="mt-2 text-2xl font-bold text-hughes-blue">Cochabamba • PK–12 • Accredited</h3>
              <p className="mt-3 text-muted-foreground">
                Hughes Schools is accredited by the Bolivian Ministry of Education and the Cochabamba District Department of Education.
                The school year runs February–November, with summer break in December–January and winter break the first two weeks of July.
                ~{META.englishPct}% of instruction is in English.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="text-sm font-semibold text-hughes-blue mb-2">Community</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Located in Cochabamba, Bolivia (population ~1.9M). Student body: 95% Bolivian, 5% international (North America & Europe).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BY THE NUMBERS */}
      <section className="relative isolate bg-[var(--hs-yellow)]/10">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-hughes-blue">By the Numbers</h2>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <Stat value={`${META.enrollment}`} label="Students (PK–12)" />
            <Stat value={`${META.englishPct}%`} label="Instruction in English" />
            <Stat value={`100%`} label="4-year college matriculation" />
            <Stat value={`${META.scholarships5y}`} label="Scholarships (last 5 yrs)" />
          </div>
        </div>
      </section>

      {/* ACADEMICS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20 grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <div className="text-[var(--hs-yellow)] font-semibold uppercase tracking-wide">Academics (PK–12)</div>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-hughes-blue">Rigorous. Structured. Mastery-Based.</h2>
            <p className="mt-3 text-muted-foreground">Daily schedule of six 45-minute classes. Science includes labs each year. AP is not currently offered. Advancement requires mastery.</p>
            <div className="mt-6 rounded-2xl bg-[#0b1229] text-white p-5">
              <div className="text-sm/6 text-white/80">Honors Pathway</div>
              <div className="mt-1 text-lg font-semibold">{HONORS}</div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border">
              <table className="w-full text-sm">
                <thead className="bg-[#f7f9fd] text-hughes-blue/80">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3 w-[180px]">Area</th>
                    <th className="text-left font-semibold px-4 py-3">Courses</th>
                  </tr>
                </thead>
                <tbody>
                  {CORE_CREDITS.map((row) => (
                    <tr key={row.area} className="border-t" style={{borderColor:'#ececf4'}}>
                      <td className="px-4 py-3 font-medium text-hughes-blue">{row.area}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.list.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* PERFORMING ARTS */}
      <section className="bg-[#f7f9fd]">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-[var(--hs-yellow)]"/>
            <h2 className="text-2xl md:text-3xl font-bold text-hughes-blue">Performing Arts</h2>
          </div>
          <p className="mt-3 text-muted-foreground max-w-3xl">
            All students (1–12) participate across two levels. {ARTS.footprint}
          </p>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border p-5">
              <div className="text-sm font-semibold text-hughes-blue">Level One (Grades 1–4)</div>
              <div className="mt-1 text-sm text-muted-foreground">{ARTS.level1.hours} hrs/week · {ARTS.level1.courses.join(", ")}</div>
              <div className="text-xs text-muted-foreground mt-1">{ARTS.level1.note}</div>
            </div>
            <div className="rounded-2xl border p-5">
              <div className="text-sm font-semibold text-hughes-blue">Level Two (Grades 5–12)</div>
              {ARTS.level2.tracks.map((t) => (
                <div key={t.name} className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-hughes-blue">{t.name}:</span> {t.hours} hrs/week · {t.courses.join(", ")}</div>
              ))}
              <div className="text-xs text-muted-foreground mt-2">{ARTS.level2.double}</div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {["/38.JPG","/39.JPG","/40.JPG","/42.jpg"].map((src) => (
              <div key={src} className="relative h-28 md:h-40 rounded-xl overflow-hidden ring-1 ring-black/5">
                <Image src={src} alt="Performing arts" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS & AWARDS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-1">
              <div className="text-[var(--hs-yellow)] font-semibold uppercase tracking-wide">Outcomes</div>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-hughes-blue">Results & Placement</h2>
              <p className="mt-3 text-muted-foreground"><strong>Placement:</strong> {RESULTS.placement}</p>
              <p className="mt-1 text-muted-foreground"><strong>Scholarships:</strong> {RESULTS.scholarships}</p>
            </div>
            <div className="lg:col-span-2">
              <Accordion type="single" collapsible>
                <AccordionItem value="awards">
                  <AccordionTrigger className="text-left">Major Awards & Distinctions (2006–2024)</AccordionTrigger>
                  <AccordionContent>
                    <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {AWARDS.map((a, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[var(--hs-yellow)]" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* GRADUATE PROFILE + STUDENT LIFE (merged, styled) */}
      <section className="bg-[#f7f9fd]">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Graduate Profile */}
            <div className="rounded-3xl bg-white ring-1 ring-black/5 p-6 md:p-8">
              <div className="flex items-center gap-2 text-[var(--hs-yellow)] font-semibold uppercase tracking-wide">
                <GraduationCap className="h-5 w-5" /> Graduate Profile
              </div>
              <h2 className="mt-2 text-2xl md:text-3xl font-bold text-hughes-blue">
                An ordinary person who does extraordinary things.
              </h2>
              <p className="mt-3 text-muted-foreground">{GRADUATE_PROFILE}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs rounded-full bg-[var(--hs-yellow)]/10 text-hughes-blue px-3 py-1 ring-1 ring-[var(--hs-yellow)]/30">Leadership</span>
                <span className="text-xs rounded-full bg-[var(--hs-yellow)]/10 text-hughes-blue px-3 py-1 ring-1 ring-[var(--hs-yellow)]/30">Critical Thinking</span>
                <span className="text-xs rounded-full bg-[var(--hs-yellow)]/10 text-hughes-blue px-3 py-1 ring-1 ring-[var(--hs-yellow)]/30">Creativity</span>
                <span className="text-xs rounded-full bg-[var(--hs-yellow)]/10 text-hughes-blue px-3 py-1 ring-1 ring-[var(--hs-yellow)]/30">Service</span>
              </div>
            </div>

            {/* Student Life / Extracurriculars */}
            <div className="rounded-3xl bg-white ring-1 ring-black/5 p-6 md:p-8">
              <div className="flex items-center gap-2 text-[var(--hs-yellow)] font-semibold uppercase tracking-wide">
                <Sparkles className="h-5 w-5" /> Student Life & Extracurriculars
              </div>
              <h3 className="mt-2 text-xl md:text-2xl font-bold text-hughes-blue">Beyond the classroom</h3>
              <p className="mt-3 text-muted-foreground">
                Rich academic & service-oriented activities: math, acting, science, volunteering; science & math fairs;
                academic olympiads; extensive performance opportunities in dance and music; and independent academic
                and artistic projects with faculty mentorship.
              </p>
              <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm text-hughes-blue/80">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--hs-yellow)]" /> Science & Math Fairs</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--hs-yellow)]" /> Academic Olympiads</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--hs-yellow)]" /> Dance & Music Performances</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--hs-yellow)]" /> Clubs: Math, Acting, Science, Volunteering</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--hs-yellow)]" /> Independent Projects (Mentored)</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--hs-yellow)]" /> Local, National & International Showcases</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Stat
function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 p-5">
      <div className="text-3xl md:text-4xl font-extrabold text-hughes-blue">{value}</div>
      <div className="mt-1 text-sm text-hughes-blue/70">{label}</div>
    </div>
  );
}
