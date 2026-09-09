import { NextRequest } from "next/server";
import { handleAtlasControl } from "@/lib/atlas-control";
import { readState } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(req: NextRequest) {
  return handleAtlasControl(req, { readState: async () => (await readState()).state });
}
