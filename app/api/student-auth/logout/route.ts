import { NextResponse } from 'next/server';

const COOKIE = process.env.JWT_COOKIE_NAME_STUDENT || 'student_token';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, '', {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: 0,
  });
  return res;
}
