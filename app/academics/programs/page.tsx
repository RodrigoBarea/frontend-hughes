// app/academic-programs/page.tsx
"use client";

type Tier = {
  id: string;
  title: string;
  subtitle?: string;
  body: string | JSX.Element;
  image: string;   // una sola imagen por sección
  flipped?: boolean;
};

const heroImage = "/images/curriculum-hero.jpg"; // ← reemplaza por tu imagen

const tiers: Tier[] = [
  {
    id: "early-childhood",
    title: "Early Childhood / Preschool Education (Ages 3–5)",
    subtitle: "Creative Curriculum® | Teaching Strategies",
    body: (
      <>
        Our preschool program is grounded in the <em>Creative Curriculum®</em>, developed by
        Teaching Strategies, LLC in 1980. This research‑based approach supports the cognitive,
        social‑emotional, physical, and language development of each child. Teachers serve as
        facilitators, creating meaningful connections between children and their environment.
        Learning is personalized, with activities and projects guided by each child’s interests —
        encouraging autonomy, curiosity, and a lifelong love of learning.
      </>
    ),
    image: "/images/program-early.jpg", // ← reemplaza
  },
  {
    id: "elementary",
    title: "Elementary School (Grades 1–5)",
    body: (
      <>
        Our elementary program is built on key pillars that support each child’s academic and
        personal growth. We emphasize strong routines, team‑building experiences, and a balance
        between structure and independence. Our curriculum fosters curiosity — especially in English,
        math, and science — while promoting core values that encourage students to become
        compassionate, community‑minded individuals. Each child is guided to learn at their own pace,
        developing confidence and a genuine love for learning.
      </>
    ),
    image: "/images/program-elementary.jpg", // ← reemplaza
    flipped: true,
  },
  {
    id: "middle",
    title: "Middle School (Grades 6–8)",
    body: (
      <>
        Our Middle School program fosters well‑rounded growth through dynamic and engaging
        experiences. We encourage teamwork with science and math fairs, while developing public
        speaking, research, and negotiation skills through our Model United Nations (HSMun / MiniMun)
        program. Integration with our arts curriculum nurtures discipline and creativity. Students
        build independence and find their own voice through problem‑solving and negotiation
        activities. Technology plays a key role, featuring robotics labs and lessons on AI ethics.
      </>
    ),
    image: "/images/program-middle.jpg", // ← reemplaza
  },
  {
    id: "high",
    title: "High School (Grades 9–12)",
    body: (
      <>
        Our High School program prepares students for academic success and meaningful community
        impact. We emphasize strong reading and writing skills through essay writing and capstone
        projects that empower graduates to become valuable contributors to their communities.
        Volunteering and learning driven by curiosity and individual interests are key components.
        Students receive personalized one‑on‑one support for college and university planning. We also
        celebrate the journey of our arts program, recognizing its vital role in shaping well‑rounded
        individuals.
      </>
    ),
    image: "/images/program-high.jpg", // ← reemplaza
    flipped: true,
  },
];

export default function AcademicProgramsPage() {
  return (
    <main className="min-h-screen">
      {/* HERO estilo BASIS (texto izq + imagen der) */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Texto */}
          <div className="md:col-span-6">
            {/* acentos gráficos opcionales */}
            <div className="mb-6 flex items-center gap-3">
              <span
                className="inline-block h-6 w-6 rounded-full"
                style={{ background: "var(--hs-yellow)" }}
                aria-hidden
              />
              <span
                className="inline-block h-6 w-6 rounded-br-[14px]"
                style={{ background: "var(--hs-blue)" }}
                aria-hidden
              />
            </div>

            <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight text-hughes-blue">
              Academic Programs
            </h1>

            <p className="mt-5 max-w-2xl text-lg md:text-xl text-hughes-blue/80">
              Hughes Schools offers a continuum of academic programs designed to support growth
              from early childhood through graduation.
            </p>

            <a
              href="/admissions"
              className="mt-8 inline-flex items-center rounded-full bg-[var(--hs-yellow)] px-6 py-3 font-semibold text-hughes-blue hover:opacity-90 transition"
            >
              Apply Now
            </a>
          </div>

          {/* Imagen */}
          <div className="md:col-span-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt="Students learning at Hughes Schools"
              className="w-full rounded-[24px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Intro académico (texto más corto y legible) */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-2">
          <div
            className="rounded-3xl border bg-[#f9fafc] p-6 md:p-8 text-hughes-blue leading-relaxed"
            style={{ borderColor: "var(--hs-yellow)" }}
          >
            <div className="prose prose-slate max-w-none">
              <p>
                At Hughes School, the academic program is rigorous and consistent across all grade
                levels. Students attend <strong>six 45‑minute classes per day</strong>.
              </p>
              <p>
                From high school onward, all students take core courses in{" "}
                <strong>Chemistry, Physics, Biology, English, and Mathematics</strong>. Exceptional
                students may opt for up to <strong>16 honors‑level courses</strong> in these subjects
                during high school. <strong>Science courses include a lab</strong> every year.
              </p>
              <p>
                <strong>80%</strong> of instruction from Pre‑K to 12th grade is in English. Students
                must demonstrate mastery of the curriculum to advance to the next level. Graduation
                requires <strong>48 academic credits</strong>; each year‑long course counts as{" "}
                <strong>1 credit</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Secciones por programa (una imagen por bloque, alternando) */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 pb-24 md:pb-36 space-y-16 md:space-y-24">
          {tiers.map((tier) => (
            <article
              id={tier.id}
              key={tier.id}
              className="grid grid-cols-1 md:grid-cols-12 items-center gap-10 scroll-mt-24"
            >
              {/* Imagen */}
              <div className={tier.flipped ? "md:col-span-6 md:order-2" : "md:col-span-6 md:order-1"}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tier.image}
                  alt={tier.title}
                  className="w-full rounded-[24px] object-cover"
                />
              </div>

              {/* Texto (sin botones internos) */}
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
                  <p>{tier.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      {/* sin CTA final y con padding inferior amplio para separarlo del footer */}
    </main>
  );
}
