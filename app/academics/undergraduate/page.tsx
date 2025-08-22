// app/why-choose-hughes-schools/page.tsx
"use client";

import { type ReactNode, type ReactElement } from "react";
import { GraduationCap, Rocket, ShieldCheck, Sparkles } from "lucide-react";

/**
 * Diseño inspirado en https://enrollbasis.com/enrollment-guide/
 * - Hero centrado con acentos gráficos
 * - Grid de 4 tarjetas con iconos (sin fotos)
 * - CTA final único: Apply Now
 * - Colores del proyecto (var(--hs-yellow), text-hughes-blue)
 */

type Pillar = {
  id: string;
  title: string;
  description: ReactNode;   // ✅ en vez de string | JSX.Element
  icon: ReactElement;       // ✅ en vez de JSX.Element
};

const pillars: Pillar[] = [
  {
    id: "faculty",
    title: "Expert Faculty",
    description:
      "Educators stay up to date with the latest educational practices through ongoing training and professional development, ensuring high‑quality learning experiences for our students.",
    icon: <GraduationCap className="h-14 w-14 text-hughes-blue" strokeWidth={1.75} />,
  },
  {
    id: "curriculum",
    title: "Innovative Curriculum",
    description:
      "A rigorous, modern program that blends inquiry, technology, and global awareness to build strong thinking and problem‑solving skills.",
    icon: <Rocket className="h-14 w-14 text-hughes-blue" strokeWidth={1.75} />,
  },
  {
    id: "environment",
    title: "Safe, Nurturing Environment",
    description:
      "A supportive space where students feel valued, respected, and empowered to grow — academically, socially, and emotionally.",
    icon: <ShieldCheck className="h-14 w-14 text-hughes-blue" strokeWidth={1.75} />,
  },
  {
    id: "integral",
    title: "Integral Education",
    description:
      "Technology, science, and performance arts come together to foster creativity, critical thinking, and well‑rounded development.",
    icon: <Sparkles className="h-14 w-14 text-hughes-blue" strokeWidth={1.75} />,
  },
];

export default function WhyChooseHughesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* HERO */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-12 md:py-16 text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
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
            Why choose Hughes Schools?
          </h1>

          <p className="mt-5 mx-auto max-w-3xl text-lg md:text-xl text-hughes-blue/80">
            A community built on expert teaching, innovation, safety, and whole‑child
            development — so every student can learn with confidence and purpose.
          </p>
        </div>
      </section>

      {/* GRID DE PILARES (estilo tarjetas) */}
      <section className="bg-[#f5f6fb]">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {pillars.map((p) => (
              <article
                key={p.id}
                className="rounded-3xl bg-white p-7 md:p-8 border shadow-sm transition hover:shadow-md"
                style={{ borderColor: "#e9eaf2" }}
              >
                <div className="flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f5f6fb]">
                    {p.icon}
                  </div>
                </div>

                <h2 className="mt-6 text-center text-2xl font-bold text-hughes-blue">
                  {p.title}
                </h2>

                <p className="mt-3 text-center text-[15px] leading-relaxed text-hughes-blue/85">
                  {p.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
