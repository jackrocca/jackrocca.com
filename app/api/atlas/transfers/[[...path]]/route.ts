import { NextRequest } from "next/server";
import { readState } from "@/lib/store";
import { handleAtlasTransfer } from "@/lib/atlas-transfers";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export function GET(req: NextRequest) {
  return handleAtlasTransfer(req, { readState: async () => (await readState()).state });
}
export const POST = GET;
export const PUT = GET;
