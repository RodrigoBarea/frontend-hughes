'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

/* ───────────── Utilidades de tipos ───────────── */
type Dict = Record<string, unknown>;

function isDict(v: unknown): v is Dict {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function pickStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}
function pickNumOrStr(v: unknown): number | string | undefined {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '') return v;
  return undefined;
}

/* ───────────── Login ───────────── */
export default function StudentLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get('from') || '/student/help-center';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/student-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let body: unknown = {};
      try { body = text ? JSON.parse(text) : {}; } catch {}

      if (!res.ok) {
        const msg = isDict(body) ? pickStr(body.message) : '';
        setError(msg || 'Credenciales inválidas');
        setLoading(false);
        return;
      }

      // Tokens posibles
      const token =
        (isDict(body) && (pickStr(body.jwt) || pickStr(body.token) || pickStr(body.tokenU) || pickStr(body.sessionToken))) ||
        '';

      // Usuario posible en varias claves
      const userObj = isDict(body) && isDict(body.user)
        ? body.user
        : isDict(body) && isDict(body.student)
        ? body.student
        : undefined;

      const uid = userObj ? pickNumOrStr(userObj.id) : undefined;
      const mail = userObj ? pickStr(userObj.email) : email;

      const session = {
        id: uid,
        email: mail,
        tokenU: token || undefined,
        createdAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('hs_student_session', JSON.stringify(session));
        localStorage.setItem('hs_student', JSON.stringify(session));
      } catch {}

      setLoading(false);
      router.push(redirectTo);
    } catch {
      setLoading(false);
      setError('Error inesperado. Intenta nuevamente.');
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fbfd]">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="leading-tight">
            <p className="text-[11px] font-semibold tracking-widest text-slate-500">HUGHES SCHOOLS</p>
            <h1 className="text-sm font-bold text-[#0b1b2b]">Student Portal</h1>
          </div>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Volver al inicio
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid items-start gap-10 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-[#ffb800]" />
              <span className="text-xs font-semibold text-slate-600">Acceso seguro para Estudiantes</span>
            </span>
            <h2 className="mt-5 text-4xl font-extrabold leading-tight text-[#0b1b2b]">Student Portal</h2>
            <p className="mt-4 max-w-2xl text-slate-700">
              Ingresa con tu correo institucional y contraseña para acceder a tus recursos.
            </p>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-100 p-5">
                <h3 className="text-lg font-semibold text-[#0b1b2b]">Login de Estudiante</h3>
              </div>

              <form onSubmit={onSubmit} className="space-y-4 p-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="juanperez@hs.edu"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-offset-2 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Contraseña</label>
                  <div className="flex items-stretch gap-2">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-offset-2 transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="whitespace-nowrap rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPass ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffb800] px-4 py-2.5 text-sm font-semibold text-[#111827] shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60"
                >
                  {loading ? 'Ingresando…' : 'Ingresar'}
                  <svg className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 11H3a1 1 0 110-2h10.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                <p className="text-center text-xs text-slate-500">
                  ¿Problemas para ingresar? Contacta a soporte académico.
                </p>
              </form>
            </div>

            <div className="mt-6 h-2 w-full rounded-full bg-[#0b1b2b]" />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Hughes Schools</span>
          <span className="inline-flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#0b1b2b]" />
            <span className="h-2 w-2 rounded-full bg-[#ffb800]" />
          </span>
        </div>
      </footer>
    </div>
  );
}
