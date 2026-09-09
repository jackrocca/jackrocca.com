import { NextRequest } from "next/server";
import { readState } from "@/lib/store";
import { handleAtlasControl } from "@/lib/atlas-control";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleAtlasControl(req, { readState: async () => (await readState()).state });
}
