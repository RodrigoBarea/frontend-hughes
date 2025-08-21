"use client";

import Image from "next/image";
import { useEffect, useState } from 'react';

export default function FooterHS({
  applyHref = "/admissions",
  ctaText = "Ready to join the Hughes Schools Family?",
  logoSrc = "/Logo%20Transparente.png",
  schoolName = "Hughes Schools",
  description = "Hughes Schools offers a rigorous and modern education focused on academic excellence and comprehensive development.",
}: {
  applyHref?: string;
  ctaText?: string;
  logoSrc?: string;
  schoolName?: string;
  description?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const address = "Km. 6 a Sacaba, Avenida Nicolás Maldonado, Cochabamba, Bolivia";
  const phone = "4716262 - 4717354";
  const email = "info@hughes-schools.org";
  const query = encodeURIComponent(`${schoolName}, ${address}`);
  const mapSrc = `https://www.google.com/maps?q=${query}&z=15&output=embed`;

  return (
    <footer id="footer" className="w-full bg-[#0E1621] text-white">
      {/* CTA Pill */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative -translate-y-8">
          <div
            className="mx-auto flex w-full max-w-4xl items-center justify-between gap-6 rounded-[50px] px-8 py-4 shadow-xl md:px-12 md:py-6"
            style={{ background: "var(--hs-yellow)" }}
          >
            <h2 className="text-white text-lg font-extrabold tracking-tight md:text-2xl">
              {ctaText}
            </h2>
            <a
              href={applyHref}
              className="inline-flex items-center rounded-full bg-[#0B1220] px-6 py-2 text-sm font-semibold text-white transition border border-transparent hover:bg-transparent hover:border-white hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 md:px-8 md:py-3 md:text-base"
            >
              Apply Now
            </a>
          </div>
        </div>
      </div>

      {/* Footer Body */}
      <div className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid grid-cols-1 gap-10 pt-2 md:grid-cols-12">
          {/* Column 1: Logo + description */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-4">
              <div className="relative h-32 w-[300px] md:h-36 md:w-[340px]">
                <Image src={logoSrc} alt={`${schoolName} Logo`} fill className="object-contain" />
              </div>
            </div>
            <p className="mt-5 text-base leading-relaxed text-white/85 max-w-sm">{description}</p>
          </div>

          {/* Column 2: Contact info */}
          <div className="md:col-span-4">
            <h4 className="text-xl font-semibold">Contact</h4>
            <ul className="mt-4 space-y-3 text-base text-white/85 max-w-xs">
              <li>
                <span className="block text-white/60">Address</span>
                <span>{address}</span>
              </li>
              <li>
                <span className="block text-white/60">Phone</span>
                <a href={`tel:${phone}`} className="underline underline-offset-2 hover:opacity-90">
                  {phone}
                </a>
              </li>
              <li>
                <span className="block text-white/60">Email</span>
                <a href={`mailto:${email}`} className="underline underline-offset-2 hover:opacity-90">
                  {email}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Map */}
          <div className="md:col-span-4">
            <h4 className="text-xl font-semibold">Location</h4>
            <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 shadow-md">
              {mounted && (
                <iframe
                  title="Mapa Hugues School"
                  src={mapSrc}
                  className="h-72 w-full md:h-80"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </div>
            <a
              className="mt-3 inline-block text-sm text-white/80 underline underline-offset-4 hover:text-white"
              href={`https://www.google.com/maps/search/?api=1&query=${query}`}
              target="_blank"
              rel="noreferrer"
            >
              View on Google Maps
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-white/10" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 py-5 text-xs text-white/60 md:flex-row">
          <p className="text-[13px] md:text-sm">
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {schoolName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white">Privacy</a>
            <span aria-hidden>•</span>
            <a href="#" className="hover:text-white">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
