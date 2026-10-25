import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  return NextResponse.json({
    ok: true,
    service: "aether-os",
    openai: Boolean(key && !key.includes("your_openai")),
  });
}
