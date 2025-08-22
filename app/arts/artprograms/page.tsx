// app/art-programs/page.tsx
"use client";

import { type ReactNode } from "react";   // ✅ importar ReactNode
import { Music, Music2 } from "lucide-react";

type Tier = {
  id: string;
  title: string;
  subtitle?: string;
  body: ReactNode;      // ✅ en vez de string | JSX.Element
  image: string;        // one image per section (replace with your assets)
  flipped?: boolean;
};

const heroImage = "/31.JPG"; // ← replace with your image

const tiers: Tier[] = [
  {
    id: "initiation-level",
    title: "Initiation Level (Grades 1–4)",
    subtitle: "Musical exploration, language, and choir practice",
    body: (
      <>
        <p>
          At this stage, students discover music through play, active listening, and choir practice.
          They are introduced to the <strong>musical language</strong> in a hands-on way that
          develops auditory skills, rhythm, pitch, and vocal projection.
        </p>
        <ul className="mt-3 list-disc pl-5">
          <li>
            <strong>Required subjects:</strong> Choir and Musical Training
            (exploring instruments).
          </li>
          <li>
            <strong>Instruments by grade:</strong> recorder (1st–2nd), violin and guitar
            (3rd–4th).
          </li>
          <li>
            <strong>Optional individual lessons:</strong> piano, violin, guitar, or voice,
            adapted to each student’s pace of learning.
          </li>
        </ul>
      </>
    ),
    image: "/32.JPG",
  },
  {
    id: "specialization-level",
    title: "Specialization Level (Grade 5 – Grade 12)",
    subtitle: "Technical, theoretical, and artistic development",
    body: (
      <>
        <p>
          Students deepen their knowledge of theory, solfège, ear training, and harmony, while
          choosing an <strong>instrument of specialization</strong> for individual study. Choir
          practice continues as a cornerstone of vocal and ensemble training.
        </p>
        <ul className="mt-3 list-disc pl-5">
          <li>
            <strong>Instrument of specialization:</strong> piano, voice, classical guitar,
            electric guitar, or violin (individual lessons).
          </li>
          <li>
            <strong>Choir:</strong> diverse repertoires with internal and external performances.
          </li>
          <li>
            <strong>Children’s Choir:</strong> 4th–6th grade.{" "}
            <strong>Youth Choir:</strong> 7th–12th grade.
          </li>
        </ul>
        <p className="mt-3">
          Upon completing the program, students receive the{" "}
          <strong>High School Diploma in Arts with a specialization in Music</strong>, recognizing
          their dedication and the skills they have acquired.
        </p>
      </>
    ),
    image: "/33.JPG",
    flipped: true,
  },
  {
    id: "bolivian-folkloric-music",
    title: "Bolivian Folkloric Music",
    subtitle: "Identity, tradition, and performance",
    body: (
      <>
        <p>
          Group lessons in <strong>charango</strong>, <strong>guitar</strong>, native wind
          instruments, and voice. Students form the music group <strong>“Kusirima”</strong>, which
          participates in festivals and contests, and also provides the live music for the school’s
          Dance Ensemble.
        </p>
        <p className="mt-3">
          The department’s philosophy is to <em>instill love and pride for Bolivia’s cultural
          richness</em>, preserving and transmitting traditions through education. Students develop
          cultural identity and belonging through music learning and performance.
        </p>
        <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: "var(--hs-yellow)" }}>
          <h4 className="font-semibold text-hughes-blue">Levels of practice – learning</h4>
          <ul className="mt-2 list-disc pl-5 space-y-2">
            <li>
              <strong>Workshop 1:</strong> introductory level, focusing on each student’s chosen
              instrument and abilities. Includes a <em>brief history of Bolivian folk music</em>,
              origins of instruments, classification (strings, wind, percussion), and their role in
              culture and community.
            </li>
            <li>
              <strong>Workshop 2:</strong> continuation of Workshop 1 with deeper instrument
              practice, enriched repertoire, and <em>group performance</em>, highlighting the value
              of community in our traditions.
            </li>
            <li>
              <strong>Workshop A:</strong> final evaluation of progress in execution, repertoire,
              and theory. This is the <strong>gateway to the Kusirima ensemble</strong>, where
              students must demonstrate mastery of what they have learned.
            </li>
          </ul>
        </div>
      </>
    ),
    image: "/34.JPG",
  },
];

export default function ArtProgramsPage() {
  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Text */}
          <div className="md:col-span-6">
            <div className="mb-6 flex items-end gap-2 leading-none">
              <Music className="h-8 w-8 text-[var(--hs-yellow)]" strokeWidth={2.6} />
              <Music2 className="h-9 w-9 text-hughes-blue -mb-0.5" strokeWidth={2.6} />
              <Music className="h-6 w-6 text-[var(--hs-yellow)] translate-y-0.5" strokeWidth={2.6} />
            </div>

            <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight text-hughes-blue">
              Art Programs — Music
            </h1>

            <p className="mt-5 max-w-2xl text-lg md:text-xl text-hughes-blue/80">
              A complete journey from early musical exploration to specialization, with choir
              training, individual lessons, and a strong program in Bolivian Folk Music that
              celebrates identity and tradition.
            </p>
          </div>

          {/* Image */}
          <div className="md:col-span-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt="Hughes Schools Performing Arts"
              className="w-full rounded-[24px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-2">
          <div
            className="rounded-3xl border bg-[#f9fafc] p-6 md:p-8 text-hughes-blue leading-relaxed"
            style={{ borderColor: "var(--hs-yellow)" }}
          >
            <div className="prose prose-slate max-w-none">
              <p>
                Hughes Schools’ Art Programs accompany students from their first steps in music to
                advanced artistic goals. The program integrates choir, theory, and individual
                instrumental practice, alongside a strong component of{" "}
                <strong>Bolivian Folk Music</strong> that fosters cultural identity and belonging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 pb-24 md:pb-36 space-y-16 md:space-y-24">
          {tiers.map((tier) => (
            <article
              id={tier.id}
              key={tier.id}
              className="grid grid-cols-1 md:grid-cols-12 items-center gap-10 scroll-mt-24"
            >
              {/* Image */}
              <div className={tier.flipped ? "md:col-span-6 md:order-2" : "md:col-span-6 md:order-1"}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tier.image}
                  alt={tier.title}
                  className="w-full rounded-[24px] object-cover"
                />
              </div>

              {/* Text */}
              <div className={tier.flipped ? "md:col-span-6 md:order-1" : "md:col-span-6 md:order-2"}>
                <div className="mb-2 inline-flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: "var(--hs-yellow)" }}
                  />
                  <span className="text-[12px] tracking-[0.18em] font-semibold text-hughes-blue">
                    PROGRAM TIER
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-hughes-blue">{tier.title}</h2>
                {tier.subtitle && (
                  <p className="mt-1 text-hughes-blue/70">{tier.subtitle}</p>
                )}

                <div className="prose prose-slate mt-4 max-w-none text-hughes-blue">
                  {tier.body}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
