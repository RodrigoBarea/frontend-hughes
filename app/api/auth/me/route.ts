import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'parent_token';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ message: 'No auth' }, { status: 401 });

  const r = await fetch(`${API_URL}/api/parents/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const data = await r.json();
  if (!r.ok) return NextResponse.json({ message: data.error?.message || 'Error' }, { status: r.status });
  return NextResponse.json(data);
}
