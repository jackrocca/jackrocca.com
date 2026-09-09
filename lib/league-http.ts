import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/rules";

export const leagueApiHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
  "X-Content-Type-Options": "nosniff",
};

export function leagueFailure(e: unknown) {
  if (e instanceof ZodError)
    return NextResponse.json(
      { error: e.issues[0]?.message ?? "Check your form values." },
      { status: 400, headers: leagueApiHeaders },
    );
  if (e instanceof AppError)
    return NextResponse.json(
      { error: e.message },
      { status: e.status, headers: leagueApiHeaders },
    );
  console.error(
    "Pick4 request failed:",
    e instanceof Error ? e.message : "Unknown error",
  );
  return NextResponse.json(
    { error: "The request could not be completed. Please try again." },
    { status: 503, headers: leagueApiHeaders },
  );
}

export function leagueJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: leagueApiHeaders });
}
