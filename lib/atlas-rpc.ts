import { createHash, randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { handleAtlasControl } from "./atlas-control";
import { AtlasAccessError, atlasPrivateHeaders, requireAtlasOwner } from "./atlas-access";

type Dependencies = Parameters<typeof handleAtlasControl>[1];

// Compatibility transport for the existing UI while workflow projections are
// migrated. Grid/preview reads use D1/R2; other JSON reads require the Mac.
export async function handleAtlasRPC(
  req: NextRequest,
  dependencies: Dependencies,
): Promise<Response> {
  const reply = (body: unknown, status: number) =>
    Response.json(body, { status, headers: atlasPrivateHeaders });
  try {
    await requireAtlasOwner(req, dependencies.readState, dependencies.ownerPolicy);
    if (req.method !== "GET")
      return reply({ error: "Use the durable action transport." }, 405);
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api\/atlas\/rpc\//, "");
    if (path === url.pathname || !/^[a-zA-Z0-9_/-]+$/.test(path))
      return reply({ error: "Unknown archive route." }, 404);
    const forward = (endpoint: string, body?: unknown) =>
      handleAtlasControl(
        new NextRequest(url.origin + "/api/atlas/" + endpoint, {
          method: body === undefined ? "GET" : "POST",
          headers: {
            cookie: req.headers.get("cookie") ?? "",
            origin: url.origin,
            "content-type": "application/json",
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        }),
        dependencies,
      );
    if (path === "assets" || path === "assets/timeline" || path === "trash") {
      const query = new URLSearchParams(url.search);
      if (path === "trash") query.set("status", "trashed");
      return forward(
        "catalog/" + (path === "assets/timeline" ? "timeline" : "assets") + "?" + query,
      );
    }
    let unavailableSuggestions: Response | undefined;
    const personSuggestions = /^people\/([1-9][0-9]*)\/maybe-faces$/.exec(path);
    if (personSuggestions || path === "people/maybe-faces/review-queue") {
      const query = url.searchParams;
      if (
        [...query.keys()].some(
          (key) =>
            ![
              "limit",
              "threshold",
              "pool_limit",
              "include_auto_reference",
              "offset",
              "page_size",
              "source",
              "snapshot",
            ].includes(key) || query.getAll(key).length !== 1,
        )
      )
        return reply({ error: "Unsupported suggestion filter." }, 400);
      const pinned = ["source", "snapshot", "offset", "page_size"].some((key) =>
        query.has(key),
      );
      const head = await forward("catalog/head");
      if (!head.ok) return head;
      const capabilities = (await head.json()).capabilities;
      if (Array.isArray(capabilities) && capabilities.includes("suggestion-views-v1")) {
        const projected = await forward(
          "catalog/suggestions/" +
            (personSuggestions ? "person/" + personSuggestions[1] : "review-queue") +
            url.search,
        );
        if (projected.ok) {
          const data = await projected.json();
          return Response.json(data.document, {
            headers: {
              ...atlasPrivateHeaders,
              "X-Atlas-Suggestion-Paged": "1",
              "X-Atlas-Suggestion-Source": data.source,
              "X-Atlas-Suggestion-Snapshot": data.snapshot,
            },
          });
        }
        if (pinned || ![404, 409].includes(projected.status)) return projected;
        unavailableSuggestions = projected;
      } else if (pinned)
        return reply(
          { error: "Suggestion pages are unavailable. Reload this view." },
          409,
        );
    }
    let unavailableDetail: Response | undefined;
    let unavailableSummary: Response | undefined;
    let unavailableDuplicates: Response | undefined;
    let unavailableClusters: Response | undefined;
    const clusterPhotos = /^people\/clusters\/([1-9][0-9]*)\/assets$/.exec(path);
    if (clusterPhotos) {
      const query = new URLSearchParams(url.search);
      if (
        [...query.keys()].some(
          (key) =>
            !["limit", "offset", "snapshot", "workflow_snapshot"].includes(key) ||
            query.getAll(key).length !== 1,
        )
      )
        return reply({ error: "Unsupported group photo filter." }, 400);
      if (query.has("limit")) {
        const raw = query.get("limit")!;
        if (!/^\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > 20000)
          return reply({ error: "Invalid group photo limit." }, 400);
        query.set("limit", String(Math.min(Number(raw), 500)));
      }
      const head = await forward("catalog/head");
      if (!head.ok) return head;
      const capabilities = (await head.json()).capabilities;
      if (Array.isArray(capabilities) && capabilities.includes("cluster-photos-v1")) {
        const projected = await forward(
          "catalog/clusters/" +
            clusterPhotos[1] +
            "/assets" +
            (query.size ? "?" + query : ""),
        );
        if (projected.ok) {
          const data = await projected.json();
          return Response.json(data.document, {
            headers: {
              ...atlasPrivateHeaders,
              "X-Atlas-Snapshot": data.snapshot,
              "X-Atlas-Workflow-Snapshot": data.workflowSnapshot,
              "X-Atlas-Collection-Paged": "1",
            },
          });
        }
        if (
          query.has("snapshot") ||
          query.has("workflow_snapshot") ||
          ![404, 409].includes(projected.status)
        )
          return projected;
        unavailableClusters = projected;
      }
    }
    if (path === "people/clusters") {
      const head = await forward("catalog/head");
      if (!head.ok) return head;
      const capabilities = (await head.json()).capabilities;
      if (Array.isArray(capabilities) && capabilities.includes("cluster-views-v1")) {
        const projected = await forward("catalog/clusters/list" + url.search);
        if (projected.ok) {
          const data = await projected.json();
          return Response.json(data.document, {
            headers: {
              ...atlasPrivateHeaders,
              "X-Atlas-Snapshot": data.snapshot,
              "X-Atlas-Workflow-Snapshot": data.workflowSnapshot,
            },
          });
        }
        if (
          url.searchParams.has("snapshot") ||
          url.searchParams.has("workflow_snapshot") ||
          ![404, 409].includes(projected.status)
        )
          return projected;
        unavailableClusters = projected;
      }
    }
    if (path === "duplicates" || path === "duplicates/summary") {
      const query = new URLSearchParams(url.search);
      const allowed = [
        "min_score",
        "snapshot",
        "workflow_snapshot",
        ...(path === "duplicates" ? ["limit", "offset"] : []),
      ];
      if (
        [...query.keys()].some(
          (key) => !allowed.includes(key) || query.getAll(key).length !== 1,
        )
      )
        return reply({ error: "Unsupported duplicate review filter." }, 400);
      const score = query.get("min_score");
      if (
        score !== null &&
        (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(score.trim()) ||
          !Number.isFinite(Number(score)) ||
          Number(score) < 0 ||
          Number(score) > 1)
      )
        return reply({ error: "Invalid duplicate confidence." }, 400);
      // The current review UI uses the complete default grouping. Custom
      // thresholds can split groups and remain computed by the native Mac API.
      if (score === null || Number(score) === 0) {
        const head = await forward("catalog/head");
        if (!head.ok) return head;
        const capabilities = (await head.json()).capabilities;
        if (Array.isArray(capabilities) && capabilities.includes("duplicate-review-v1")) {
          query.delete("min_score");
          const projected = await forward(
            "catalog/workflows/" +
              (path === "duplicates" ? "duplicates" : "duplicates-summary") +
              (query.size ? "?" + query : ""),
          );
          if (projected.ok) {
            const data = await projected.json();
            return Response.json(data.document, {
              headers: {
                ...atlasPrivateHeaders,
                "X-Atlas-Snapshot": data.snapshot,
                "X-Atlas-Workflow-Snapshot": data.workflowSnapshot,
                "X-Atlas-Synchronized-At": String(data.synchronizedAt),
              },
            });
          }
          if (
            query.has("snapshot") ||
            query.has("workflow_snapshot") ||
            ![404, 409].includes(projected.status)
          )
            return projected;
          unavailableDuplicates = projected;
        }
      } else if (query.has("snapshot") || query.has("workflow_snapshot")) {
        return reply(
          { error: "Custom duplicate confidence requires a fresh Mac view." },
          400,
        );
      }
    }
    if (path === "summary") {
      const pending = url.searchParams.get("with_pending");
      if (
        [...url.searchParams.keys()].some((key) => key !== "with_pending") ||
        url.searchParams.getAll("with_pending").length > 1 ||
        (pending !== null && !["0", "1", "false", "true"].includes(pending))
      )
        return reply({ error: "Unsupported catalog summary filter." }, 400);
      const head = await forward("catalog/head");
      if (!head.ok) return head;
      const capabilities = (await head.json()).capabilities;
      if (Array.isArray(capabilities) && capabilities.includes("summary-v1")) {
        const projected = await forward("catalog/workflows/summary");
        if (projected.ok) {
          const data = await projected.json();
          const document = { ...data.document };
          if (pending === "0" || pending === "false") {
            for (const key of [
              "pending_previews",
              "video_passthrough",
              "pending_annotations",
              "pending_face_detection",
              "pending_face_embeddings",
              "candidate_albums",
              "confirmed_albums",
              "confirmed_people",
              "unknown_face_clusters",
            ])
              delete document[key];
          }
          return Response.json(document, {
            headers: {
              ...atlasPrivateHeaders,
              "X-Atlas-Snapshot": data.snapshot,
              "X-Atlas-Synchronized-At": String(data.synchronizedAt),
            },
          });
        }
        if (![404, 409].includes(projected.status)) return projected;
        unavailableSummary = projected;
      }
    }
    const photoDetail = /^assets\/([a-zA-Z0-9_-]{1,128})$/.exec(path);
    if (photoDetail) {
      if (
        [...url.searchParams.keys()].some(
          (key) => key !== "snapshot" || url.searchParams.getAll(key).length !== 1,
        )
      )
        return reply({ error: "Unsupported photo detail filter." }, 400);
      const head = await forward("catalog/head");
      if (!head.ok) return head;
      const capabilities = (await head.json()).capabilities;
      if (Array.isArray(capabilities) && capabilities.includes("photo-details-v1")) {
        const detail = await forward("catalog/details/" + photoDetail[1] + url.search);
        if (detail.ok) {
          const data = await detail.json();
          return Response.json(data.document, {
            headers: {
              ...atlasPrivateHeaders,
              "X-Atlas-Snapshot": data.snapshot,
            },
          });
        }
        if (url.searchParams.has("snapshot") || ![404, 409].includes(detail.status))
          return detail;
        unavailableDetail = detail;
      }
    }
    const peopleTarget =
      ["people", "people/relationships", "people/graph"].includes(path) &&
      (path !== "people/graph" ||
        [...url.searchParams].every(
          ([key, value]) =>
            (
              ({ limit: "500", edge_limit: "240", min_shared_assets: "2" }) as Record<
                string,
                string
              >
            )[key] === value && url.searchParams.getAll(key).length === 1,
        ));
    const personPhotos = /^people\/([1-9][0-9]*)\/assets$/.exec(path);
    const workflowTarget =
      personPhotos ||
      peopleTarget ||
      ["places", "named-places", "tags", "saved-searches", "albums"].includes(path) ||
      /^albums\/[1-9][0-9]*\/assets$/.test(path);
    let workflowsAvailable = false;
    if (workflowTarget) {
      const capabilities = await forward("catalog/head");
      if (!capabilities.ok) return capabilities;
      const data = await capabilities.json();
      const feature = personPhotos
        ? "person-photos-v1"
        : peopleTarget
          ? "people-views-v1"
          : path.startsWith("albums/")
            ? "direct-albums-v1"
            : "workflows-v1";
      workflowsAvailable =
        Array.isArray(data.capabilities) && data.capabilities.includes(feature);
    }
    if (workflowsAvailable && peopleTarget) {
      const target =
        path === "people/graph"
          ? "people-graph"
          : path === "people/relationships"
            ? "relationships"
            : "people";
      const query = path === "people/graph" ? "" : url.search;
      const projected = await forward("catalog/workflows/" + target + query);
      if (projected.ok) {
        const data = await projected.json();
        return Response.json(data.document, {
          headers: {
            ...atlasPrivateHeaders,
            "X-Atlas-Snapshot": data.snapshot,
            "X-Atlas-Workflow-Snapshot": data.workflowSnapshot,
            "X-Atlas-Synchronized-At": String(data.synchronizedAt),
          },
        });
      }
      if (
        url.searchParams.has("snapshot") ||
        url.searchParams.has("workflow_snapshot") ||
        ![404, 409].includes(projected.status)
      )
        return projected;
    }
    if (
      workflowsAvailable &&
      ["places", "named-places", "tags", "saved-searches"].includes(path)
    ) {
      if (url.search)
        return reply({ error: "This archive view does not accept filters." }, 400);
      const projected = await forward("catalog/workflows/" + path);
      if (projected.ok) {
        const data = await projected.json();
        return Response.json(data.document, {
          headers: {
            ...atlasPrivateHeaders,
            "X-Atlas-Snapshot": data.snapshot,
            "X-Atlas-Synchronized-At": String(data.synchronizedAt),
          },
        });
      }
      // First synchronization or a concurrent edit can leave a view unavailable.
      // The existing worker transport remains usable while the Mac is online.
      if (![404, 409].includes(projected.status)) return projected;
    }
    const albumPhotos = /^albums\/([1-9][0-9]*)\/assets$/.exec(path);
    const collectionPhotos = albumPhotos || personPhotos;
    let unavailableCollection: Response | undefined;
    if (workflowsAvailable && (path === "albums" || collectionPhotos)) {
      const query = new URLSearchParams(url.search);
      if ([...query.keys()].some((key) => query.getAll(key).length !== 1))
        return reply(
          { error: "Duplicate photo collection filters are not supported." },
          400,
        );
      if (collectionPhotos && query.has("limit")) {
        const raw = query.get("limit")!;
        if (!/^\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > 20000)
          return reply({ error: "Invalid photo collection limit." }, 400);
        query.set("limit", String(Math.min(Number(raw), 500)));
      }
      const projected = await forward(
        "catalog/workflows/" +
          (personPhotos
            ? "person-assets/" + personPhotos[1]
            : albumPhotos
              ? "album-assets/" + albumPhotos[1]
              : "albums") +
          (query.size ? "?" + query : ""),
      );
      if (projected.ok) {
        const data = await projected.json();
        return Response.json(data.document, {
          headers: {
            ...atlasPrivateHeaders,
            "X-Atlas-Snapshot": data.snapshot,
            "X-Atlas-Synchronized-At": String(data.synchronizedAt),
            "X-Atlas-Workflow-Snapshot": data.workflowSnapshot,
            ...(collectionPhotos ? { "X-Atlas-Collection-Paged": "1" } : {}),
          },
        });
      }
      if (
        query.has("snapshot") ||
        query.has("workflow_snapshot") ||
        ![404, 409].includes(projected.status)
      )
        return projected;
      unavailableCollection = projected;
    }
    const preview = /^assets\/([a-zA-Z0-9_-]+)\/preview$/.exec(path);
    if (preview) {
      const res = await forward("catalog/assets/" + preview[1]);
      if (!res.ok) return res;
      const sha = (await res.json()).record?.preview?.sha256;
      if (typeof sha !== "string" || !/^[a-f0-9]{64}$/.test(sha))
        return reply({ error: "Preview unavailable." }, 404);
      return forward("catalog/media/" + sha);
    }
    if (/^faces\/[a-zA-Z0-9_-]+\/crop$/.test(path) && url.search)
      return reply({ error: "Face thumbnails do not accept query parameters." }, 400);
    let unavailableThumbnail: Response | undefined;
    if (/^faces\/[a-zA-Z0-9_-]{1,128}\/crop$/.test(path)) {
      const head = await forward("catalog/head");
      if (!head.ok) return head;
      const capabilities = (await head.json()).capabilities;
      if (Array.isArray(capabilities) && capabilities.includes("face-thumbnails-v1")) {
        const thumbnail = await forward("catalog/" + path);
        if (thumbnail.ok || ![404, 409].includes(thumbnail.status)) return thumbnail;
        unavailableThumbnail = thumbnail;
      }
    }
    const status = await forward("worker");
    if (!status.ok) return status;
    if ((await status.json()).online !== true) {
      if (unavailableSuggestions) return unavailableSuggestions;
      if (unavailableClusters) return unavailableClusters;
      if (unavailableDuplicates) return unavailableDuplicates;
      if (unavailableSummary) return unavailableSummary;
      if (unavailableDetail) return unavailableDetail;
      if (unavailableThumbnail) return unavailableThumbnail;
      if (unavailableCollection) return unavailableCollection;
      return reply({ error: "Your Mac is offline. Connect it to load this view." }, 503);
    }
    const response = await forward("commands", {
      command: {
        id: randomBytes(16).toString("hex"),
        method: "GET",
        target: "/api/" + path + url.search,
        body: {},
      },
    });
    if (response.ok && /^faces\/[a-zA-Z0-9_-]+\/crop$/.test(path) && !url.search) {
      let command = (await response.json()).command;
      const id = command.id;
      const deadline = Date.now() + 12000;
      while (
        command.state !== "completed" &&
        command.state !== "in_doubt" &&
        Date.now() < deadline
      ) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const poll = await forward("commands/" + id);
        if (!poll.ok) return poll;
        command = (await poll.json()).command;
        if (command.id !== id) throw new Error("Mismatched receipt");
      }
      if (command.state !== "completed")
        return reply({ error: "Your Mac has not returned this thumbnail yet." }, 503);
      if (command.result?.status !== 200)
        return reply({ error: "Face thumbnail unavailable." }, 404);
      const thumbnail = command.result?.body?.thumbnail;
      if (
        !thumbnail ||
        !["image/jpeg", "image/png", "image/webp"].includes(thumbnail.content_type) ||
        typeof thumbnail.base64 !== "string" ||
        thumbnail.base64.length > 699052
      )
        throw new Error("Invalid thumbnail");
      const bytes = Buffer.from(thumbnail.base64, "base64");
      if (
        !bytes.length ||
        bytes.length > 524288 ||
        bytes.length !== thumbnail.size ||
        createHash("sha256").update(bytes).digest("hex") !== thumbnail.sha256
      )
        throw new Error("Invalid thumbnail integrity");
      return new Response(bytes, {
        headers: {
          ...atlasPrivateHeaders,
          "Content-Type": thumbnail.content_type,
          "Content-Length": String(bytes.length),
        },
      });
    }
    if (response.ok) response.headers.set("X-Atlas-Queued-Read", "1");
    return response;
  } catch (error) {
    return reply(
      {
        error:
          error instanceof AtlasAccessError
            ? error.message
            : "Private archive connection is unavailable.",
      },
      error instanceof AtlasAccessError ? error.status : 503,
    );
  }
}
