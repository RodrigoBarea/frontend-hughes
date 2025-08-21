import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'parent_token';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const r = await fetch(`${API_URL}/api/parents/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await r.json();
  if (!r.ok) {
    return NextResponse.json({ message: data.error?.message || 'Login falló' }, { status: r.status });
    // Opcional: log detail server-side
  }

  const res = NextResponse.json({ parent: data.parent });
  res.cookies.set(COOKIE_NAME, data.jwt, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
  return res;
}
