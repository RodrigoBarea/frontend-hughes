"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";

// 🎨 Brand colors
const BRAND = {
  blue: "var(--hs-blue)",
  yellow: "var(--hs-yellow)",
};

type SimpleItemProps = {
  href: string;
  label: string;
  newTab?: boolean;
};

function SimpleItem({ href, label, newTab = false }: SimpleItemProps) {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          target={newTab ? "_blank" : undefined}
          rel={newTab ? "noopener noreferrer" : undefined}
          className="relative text-sm font-semibold tracking-wide px-1 py-1"
          style={{ color: BRAND.blue }}
        >
          {label}
          <motion.span
            initial={{ width: 0 }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.28 }}
            className="absolute left-0 bottom-0 h-[2px]"
            style={{ backgroundColor: BRAND.yellow }}
          />
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

function ColLink({
  href,
  title,
  desc,
  newTab = false,
}: {
  href: string;
  title: string;
  desc?: string;
  newTab?: boolean;
}) {
  return (
    <Link
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      className="block rounded-xl p-3 transition hover:bg-gray-50 focus:bg-gray-50"
    >
      <div className="text-sm font-semibold" style={{ color: BRAND.blue }}>
        {title}
      </div>
      {desc && <p className="mt-1 text-xs text-gray-600 leading-snug">{desc}</p>}
    </Link>
  );
}

/** 🔽 Item especial para hacer scroll animado al footer */
function ContactScrollItem({ label = "Contact" }: { label?: string }) {
  const onClick = React.useCallback(() => {
    const el = document.getElementById("footer");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <NavigationMenuItem>
      {/* Usamos button para controlar el scroll con onClick */}
      <NavigationMenuLink asChild>
        <button
          type="button"
          onClick={onClick}
          className="relative text-sm font-semibold tracking-wide px-1 py-1"
          style={{ color: BRAND.blue }}
        >
          {label}
          <motion.span
            initial={{ width: 0 }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.28 }}
            className="absolute left-0 bottom-0 h-[2px]"
            style={{ backgroundColor: BRAND.yellow }}
          />
        </button>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

export default function MenuList() {
  return (
    <NavigationMenu className="group/navigation-menu relative flex max-w-max flex-1 items-center justify-center">
      <NavigationMenuList className="flex items-center gap-8">
        {/* Academics */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent p-0 data-[state=open]:bg-transparent data-[state=open]:shadow-none">
            <motion.span
              initial="rest"
              animate="rest"
              whileHover="hover"
              className="relative inline-block text-sm font-semibold tracking-wide"
              style={{ color: BRAND.blue }}
            >
              Academics
              <motion.span
                variants={{ rest: { width: 0 }, hover: { width: "100%" } }}
                transition={{ duration: 0.28 }}
                className="absolute left-0 bottom-0 h-[2px]"
                style={{ backgroundColor: BRAND.yellow }}
              />
            </motion.span>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="min-w-[640px] max-w-[900px]">
              <div className="grid grid-cols-3 gap-x-10 gap-y-4 p-6 bg-white rounded-xl shadow-xl">
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <ColLink href="/academics/programs" title="Academic Programs" />
                    <ColLink href="/academics/learning-env" title="Our Learning Environment" />
                    <ColLink href="/academics/graduates" title="Where Our Graduates Go" />
                  </div>
                  <div>
                    <ColLink href="/academics/undergraduate" title="Why choose Hughes Schools?" />
                    <ColLink href="/testimonials" title="Student Testimonials" />
                    <ColLink href="/academics/academic-staff" title="Academic Staff" />
                  </div>
                </div>
                <div className="col-span-1">
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Student Portal
                  </h4>
                  {/* 🔗 Abrir en nueva pestaña y apuntar a /student/login */}
                  <Link
                    href="/academics/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-2xl border"
                  >
                    <div className="p-4">
                      <div className="text-sm font-semibold" style={{ color: BRAND.blue }}>
                        Log in here
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        View your schedule, courses, and library resources.
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Performing Arts */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent p-0 data-[state=open]:bg-transparent data-[state=open]:shadow-none">
            <motion.span
              initial="rest"
              animate="rest"
              whileHover="hover"
              className="relative inline-block text-sm font-semibold tracking-wide"
              style={{ color: BRAND.blue }}
            >
              Performing Arts
              <motion.span
                variants={{ rest: { width: 0 }, hover: { width: "100%" } }}
                transition={{ duration: 0.28 }}
                className="absolute left-0 bottom-0 h-[2px]"
                style={{ backgroundColor: BRAND.yellow }}
              />
            </motion.span>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-max min-w=[320px] max-w-[90vw]">
              <div className="grid grid-cols-2 gap-x-10 gap-y-4 p-6 bg-white rounded-xl shadow-xl">
                <ColLink href="/arts/artprograms" title="Art Programs" />
                <ColLink href="/arts/art-staff" title="Art Staff" />
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Events */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent p-0 data-[state=open]:bg-transparent data-[state=open]:shadow-none">
            <motion.span
              initial="rest"
              animate="rest"
              whileHover="hover"
              className="relative inline-block text-sm font-semibold tracking-wide"
              style={{ color: BRAND.blue }}
            >
              Events
              <motion.span
                variants={{ rest: { width: 0 }, hover: { width: "100%" } }}
                transition={{ duration: 0.28 }}
                className="absolute left-0 bottom-0 h-[2px]"
                style={{ backgroundColor: BRAND.yellow }}
              />
            </motion.span>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-max min-w-[320px] max-w-[90vw]">
              <div className="grid grid-cols-2 gap-x-10 gap-y-4 p-6 bg-white rounded-xl shadow-xl">
                <ColLink href="/events" title="Events Recap" />
                <ColLink href="/events/calendar" title="Events Calendar" />
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Simples */}
        <SimpleItem href="/admissions" label="Admissions" />
        <SimpleItem href="/news" label="News" />
        <SimpleItem href="/donation" label="Donation" />
        <SimpleItem href="/about" label="About us" />
        <SimpleItem href="/faqs" label="FAQS" />
        {/* 🔗 Parents en nueva pestaña */}
        <SimpleItem href="/parents/login" label="Parents" newTab />
        {/* 👇 Contact con scroll animado al footer */}
        <ContactScrollItem label="Contact" />
        <SimpleItem href="/resources" label="Resources" />
      </NavigationMenuList>
    </NavigationMenu>
  );
}
