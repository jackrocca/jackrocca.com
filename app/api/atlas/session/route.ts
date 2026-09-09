import { NextRequest } from "next/server";
import { readState } from "@/lib/store";
import {
  AtlasAccessError,
  atlasPrivateHeaders,
  requireAtlasOwner,
} from "@/lib/atlas-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAtlasOwner(req, async () => (await readState()).state);
    return Response.json(
      { authenticated: true, access: "owner" },
      { headers: atlasPrivateHeaders },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof AtlasAccessError
            ? error.message
            : "Private archive access is temporarily unavailable.",
      },
      {
        status: error instanceof AtlasAccessError ? error.status : 503,
        headers: atlasPrivateHeaders,
      },
    );
  }
}
