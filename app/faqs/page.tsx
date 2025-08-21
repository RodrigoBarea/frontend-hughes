// app/faqs/page.tsx
"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ShieldCheck,
  Clock,
  UtensilsCrossed,
  Salad,
  Smartphone,
  GraduationCap,
  Bus,
} from "lucide-react";

export default function FAQPage() {
  return (
    <main className="relative">
      {/* HERO — solo azul institucional */}
      <section className="relative overflow-hidden">
        {/* gradiente solo azul */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#142857] via-[#1f2e6c] to-[#142857]" />
        {/* blobs suaves */}
        <div className="pointer-events-none absolute -left-24 -top-16 h-72 w-72 rounded-full bg-[#FFD200]/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#142857]/40 blur-3xl" />

        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Frequently Asked{" "}
            <span className="text-[#FFD200]">Questions</span>
          </h1>
          <p className="mt-3 text-white/85">
            Learn more about Hughes Schools, our policies, and student life.
          </p>
        </div>
      </section>

      {/* CARD con FAQs */}
      <section className="-mt-12 pb-20">
        <div className="mx-auto max-w-5xl px-6">
          <div
            className="rounded-2xl border bg-white/90 p-2 md:p-3 shadow-xl ring-1 ring-black/5"
            style={{ borderColor: "#ececf4" }}
          >
            <div className="border-b px-4 py-5 md:px-6 md:py-6" style={{ borderColor: "#ececf4" }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#142857]">
                General Information
              </h2>
              <p className="mt-1 text-[#142857]/70 text-sm">
                Quick answers to the most common questions from families.
              </p>
            </div>

            <Accordion type="multiple" className="w-full">
              <FAQItem
                value="uniforms"
                icon={<ShieldCheck className="h-4 w-4 text-[#142857]" />}
                question="What uniforms are used?"
              >
                Hughes Schools uses differentiated uniforms by level and
                activity. Students wear a formal daily uniform, a sports uniform
                for PE, and an artistic uniform for performances.
              </FAQItem>

              <Divider />

              <FAQItem
                value="schedule"
                icon={<Clock className="h-4 w-4 text-[#142857]" />}
                question="What are the school hours?"
              >
                The school day runs from <strong>8:00 a.m. to 3:30 p.m.</strong>{" "}
                Monday to Friday. Extended hours are available for artistic
                workshops and extracurricular activities.
              </FAQItem>

              <Divider />

              <FAQItem
                value="cafeteria"
                icon={<UtensilsCrossed className="h-4 w-4 text-[#142857]" />}
                question="Does the school have a cafeteria?"
              >
                Yes. Our cafeteria offers balanced, affordable meals and snacks.
              </FAQItem>

              <Divider />

              <FAQItem
                value="healthy"
                icon={<Salad className="h-4 w-4 text-[#142857]" />}
                question="How is healthy eating promoted?"
              >
                Healthy habits are promoted with awareness campaigns, balanced
                menus, and limiting ultra-processed products on campus.
              </FAQItem>

              <Divider />

              <FAQItem
                value="devices"
                icon={<Smartphone className="h-4 w-4 text-[#142857]" />}
                question="What is the policy on electronic devices?"
              >
                Personal devices are not permitted during class unless authorized
                for educational purposes.
              </FAQItem>

              <Divider />

              <FAQItem
                value="admissions-age"
                icon={<GraduationCap className="h-4 w-4 text-[#142857]" />}
                question="From what age can students apply?"
              >
                Admission starts at <strong>Pre-Kindergarten</strong> (4 years old
                by June 30 of the entry year).
              </FAQItem>

              <Divider />

              <FAQItem
                value="transport"
                icon={<Bus className="h-4 w-4 text-[#142857]" />}
                question="Does the school provide transportation?"
              >
                Yes. We offer safe, supervised bus service covering several areas
                of Cochabamba.
              </FAQItem>
            </Accordion>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- helpers ---------- */

function FAQItem({
  value,
  icon,
  question,
  children,
}: {
  value: string;
  icon: React.ReactNode;
  question: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem value={value} className="group px-1 md:px-2">
      <AccordionTrigger className="text-left px-3 md:px-4 py-4 md:py-5 rounded-xl hover:bg-[#f7f9fd] data-[state=open]:bg-[#f7f9fd] transition">
        <div className="flex items-center gap-3">
          <span className="shrink-0">{icon}</span>
          <span className="font-medium text-[#142857]">{question}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-3 md:px-4 pb-5 text-sm text-[#142857]/80 leading-relaxed">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

function Divider() {
  return <div className="mx-3 md:mx-4 h-px bg-[#ececf4]" />;
}
