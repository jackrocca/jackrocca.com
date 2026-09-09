import { NextRequest } from "next/server";
import { readState } from "@/lib/store";
import { handleAtlasRPC } from "@/lib/atlas-rpc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(req: NextRequest) {
  return handleAtlasRPC(req, { readState: async () => (await readState()).state });
}
