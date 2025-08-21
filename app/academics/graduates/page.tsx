// app/where-our-graduates-go/page.tsx
"use client";

import { FaGlobeAmericas } from "react-icons/fa"; // Ícono de mundo
import ReactCountryFlag from "react-country-flag";

type University = {
  name: string;
  country: "Bolivia" | "United States" | "Argentina" | "Italy";
  website?: string;
  logo?: string;
};

const UNIVERSITIES: University[] = [
  // Bolivia
  {
    name: "Universidad Católica Boliviana",
    country: "Bolivia",
    website: "https://www.ucb.edu.bo",
    logo: "/logos/catolica.jpg",
  },
  {
    name: "Universidad Privada Boliviana",
    country: "Bolivia",
    website: "https://www.upb.edu",
    logo: "/logos/logo upb.png",
  },

  // USA
  {
    name: "Massachusetts Institute of Technology (MIT)",
    country: "United States",
    website: "https://www.mit.edu",
    logo: "/logos/mit.png",
  },
  {
    name: "University of Harvard",
    country: "United States",
    website: "https://www.harvard.edu",
    logo: "/logos/harvard.png",
  },

  // Argentina
  {
    name: "Universidad de Palermo (UP)",
    country: "Argentina",
    website: "https://www.palermo.edu",
    logo: "/logos/palermo.png",
  },

  // Italy
  {
    name: "Università Degli Studi Di Milano",
    country: "Italy",
    website: "https://www.unimi.it",
    logo: "/logos/milano.png",
  },
];

const COUNTRY_CODES: Record<University["country"], string> = {
  Bolivia: "BO",
  "United States": "US",
  Argentina: "AR",
  Italy: "IT",
};

// Orden: país, luego nombre
const ROWS = [...UNIVERSITIES].sort((a, b) => {
  if (a.country === b.country) return a.name.localeCompare(b.name);
  return a.country.localeCompare(b.country);
});

export default function WhereOurGraduatesGoPage() {
  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="flex items-center gap-3">
            <FaGlobeAmericas className="text-[var(--hs-yellow)] text-4xl md:text-5xl" />
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-hughes-blue">
              Our Graduates Around the World
            </h1>
          </div>

          <p className="mt-4 max-w-3xl text-lg text-hughes-blue/80">
            Hughes Schools alumni are accepted to top universities worldwide and in
            Bolivia — a testament to the strength of our academic program.{" "}
            <strong>100% matriculated to 4-year colleges and/or universities.</strong>
          </p>
        </div>
      </section>

      {/* LISTA COMPACTA EN TABLA */}
      <section className="bg-[#f5f6fb]">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 pb-24 md:pb-36">
          <div
            className="overflow-hidden rounded-2xl border bg-white"
            style={{ borderColor: "#ececf4" }}
          >
            <div
              className="px-4 py-4 md:px-6 border-b"
              style={{ borderColor: "#ececf4" }}
            >
              <h2 className="text-xl md:text-2xl font-bold text-hughes-blue">
                Universities by Country
              </h2>
              <p className="text-sm text-hughes-blue/70 mt-1">
                Compact list of institutions attended by our graduates.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#fafbff] text-hughes-blue/80">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3 md:px-6">
                      Country
                    </th>
                    <th className="text-left font-semibold px-4 py-3 md:px-6">
                      University
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((u, idx) => (
                    <tr
                      key={`${u.country}-${u.name}-${idx}`}
                      className="border-t hover:bg-[#fafbff]"
                      style={{ borderColor: "#ececf4" }}
                    >
                      <td className="px-4 py-3 md:px-6 text-hughes-blue/90 flex items-center gap-2">
                        <ReactCountryFlag
                          countryCode={COUNTRY_CODES[u.country]}
                          svg
                          style={{
                            width: "1.5em",
                            height: "1.5em",
                            borderRadius: "3px",
                          }}
                        />
                        {u.country}
                      </td>
                      <td className="px-4 py-3 md:px-6">
                        {u.website ? (
                          <a
                            href={u.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-hughes-blue hover:underline"
                          >
                            {u.name}
                          </a>
                        ) : (
                          <span className="text-hughes-blue/90">{u.name}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {ROWS.length === 0 && (
                    <tr>
                      <td
                        className="px-4 py-6 md:px-6 text-hughes-blue/60"
                        colSpan={2}
                      >
                        No data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
