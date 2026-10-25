import { NextResponse } from "next/server";
import { spawnFromPrompt } from "@/lib/spawnServer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { prompt?: string };
    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    if (!prompt.trim() || prompt.length > 200) {
      return NextResponse.json(
        { error: "prompt required (1–200 chars)" },
        { status: 400 }
      );
    }
    const result = await spawnFromPrompt(prompt);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "spawn failed" }, { status: 500 });
  }
}
