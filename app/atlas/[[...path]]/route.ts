import { NextRequest } from "next/server";
import { readState } from "@/lib/store";
import { handleAtlasInterface } from "@/lib/atlas-interface";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(req: NextRequest) {
  return handleAtlasInterface(req, { readState: async () => (await readState()).state });
}
export const HEAD = GET;
