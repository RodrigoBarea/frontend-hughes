import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json(); // { payload: {...} }
    if (!body || typeof body.payload !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const STRAPI_URL = process.env.STRAPI_URL;
    const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

    if (!STRAPI_URL || !STRAPI_TOKEN) {
      return NextResponse.json({ ok: false, error: "Missing Strapi env vars" }, { status: 500 });
    }

    const res = await fetch(`${STRAPI_URL}/api/admissions-submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          payload: body.payload,
          submittedAt: new Date().toISOString(),
          source: "website",
        },
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      console.error("Strapi error:", json);
      return NextResponse.json({ ok: false, error: json }, { status: res.status });
    }

    return NextResponse.json({ ok: true, data: json.data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
