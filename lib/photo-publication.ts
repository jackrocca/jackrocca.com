import { createHash, timingSafeEqual } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import { catalogSchema, newestFirst, type Catalog } from "./photography";
import type { PublicationStorage } from "./publication-storage";

export const PROTOCOL = "atlas-publication-v1.1";
export const LIMITS = {
  batch: 100,
  photos: 10000,
  objectBytes: 8 * 1024 * 1024,
  manifestBytes: 8 * 1024 * 1024,
  requestBytes: 64 * 1024,
  uploadExpiry: 300,
  validationBatch: 24,
  activeJobs: 8,
  jobAgeMs: 7 * 86400000,
} as const;
export const hash = (data: Uint8Array | string) =>
  createHash("sha256").update(data).digest("hex");
const bytes = (value: unknown) => Buffer.from(JSON.stringify(value));
const sha = z.string().regex(/^[a-f0-9]{64}$/);
const id = z.string().regex(/^[a-f0-9]{32}$/);
export const beginSchema = z
  .object({
    protocol: z.literal(PROTOCOL),
    baseRevision: sha.nullable(),
    revision: sha,
    idempotencyKey: z.string().regex(/^[a-zA-Z0-9_-]{16,128}$/),
  })
  .strict();
export const declarationSchema = z
  .object({
    sha256: sha,
    size: z.number().int().positive().max(LIMITS.objectBytes),
    kind: z.enum(["preview", "manifest"]),
  })
  .strict();
const uploadSchema = z
  .object({ objects: z.array(declarationSchema).min(1).max(LIMITS.batch) })
  .strict();
const commitSchema = z.object({ manifestHash: sha }).strict();
type Declaration = z.infer<typeof declarationSchema>;
type Job = {
  publicationId: string;
  baseRevision: string | null;
  revision: string;
  keyHash: string;
  state: "uploading" | "validating" | "succeeded" | "conflict" | "expired";
  createdAt: string;
  manifestHash?: string;
  validated: number;
  total: number;
  completedAt?: string;
  error?: string;
  declarations: Record<string, Declaration>;
};
type Receipt = Omit<Job, "declarations">;
type Control = {
  revision: string | null;
  manifestKey: string | null;
  jobs: Record<string, Job>;
};
const initial = (): Control => ({ revision: null, manifestKey: null, jobs: {} });

export class PublicationFault extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 400,
    public currentRevision?: string | null,
  ) {
    super(message);
  }
}

async function inBatches<T>(items: T[], action: (item: T) => Promise<void>) {
  // Bound storage concurrency and wait for the entire batch before advancing.
  for (let start = 0; start < items.length; start += 4) {
    const results = await Promise.allSettled(items.slice(start, start + 4).map(action));
    const failed = results.find((result) => result.status === "rejected");
    if (failed?.status === "rejected") throw failed.reason;
  }
}

export class PhotoPublicationService {
  readonly prefix: string;
  private cachedCatalog?: { key: string; value: Catalog };
  private previewCache = new Map<string, Uint8Array>();
  private previewCacheBytes = 0;
  constructor(
    readonly storage: PublicationStorage,
    readonly environment: string,
    readonly now = () => new Date(),
  ) {
    if (!["production", "preview", "development"].includes(environment))
      throw new Error("Invalid environment");
    this.prefix = `photography/${environment}/publication-v1`;
  }
  private key(suffix: string) {
    return `${this.prefix}/${suffix}`;
  }
  private async control() {
    const object = await this.storage.read(this.key("control.json"));
    return {
      value: object
        ? (JSON.parse(Buffer.from(object.data).toString()) as Control)
        : initial(),
      etag: object?.etag ?? "*",
    };
  }
  private async transact<T>(action: (state: Control) => T): Promise<T> {
    for (let attempt = 0; attempt < 12; attempt++) {
      const { value, etag } = await this.control();
      const result = action(value);
      if (await this.storage.put(this.key("control.json"), bytes(value), etag))
        return result;
    }
    throw new PublicationFault(
      "busy",
      "Publication storage is busy. Retry this attempt.",
      503,
    );
  }
  private async receipt(pid: string): Promise<Receipt | null> {
    const object = await this.storage.read(this.key(`receipts/${pid}.json`));
    return object ? JSON.parse(Buffer.from(object.data).toString()) : null;
  }
  private job(state: Control, pid: string) {
    const job = state.jobs[pid];
    if (!job) throw new PublicationFault("not_found", "Publication not found.", 404);
    return job;
  }
  private assertActive(job: Job) {
    if (
      job.state === "expired" ||
      this.now().getTime() - Date.parse(job.createdAt) > LIMITS.jobAgeMs
    )
      throw new PublicationFault(
        "expired",
        "Publication expired. Review and start a new attempt.",
        410,
      );
    if (job.state === "conflict")
      throw new PublicationFault(
        "conflict",
        "Review a new publication against the current website revision.",
        409,
      );
  }
  private view(job: Receipt, currentRevision: string | null) {
    return {
      protocol: PROTOCOL,
      environment: this.environment,
      publicationId: job.publicationId,
      state: job.state,
      revision: job.revision,
      currentRevision,
      uploadedCount: job.validated,
      missingCount: Math.max(0, job.total - job.validated),
      completedAt: job.completedAt ?? null,
      error: job.error ?? null,
    };
  }
  // Archive successful ledger entries before removing them. A crash leaves either
  // both copies or the durable receipt, so successful retries never become new jobs.
  private async archiveCompleted() {
    const { value } = await this.control();
    const completed = Object.values(value.jobs)
      .filter(
        (j) =>
          j.state === "succeeded" ||
          this.now().getTime() - Date.parse(j.createdAt) > LIMITS.jobAgeMs,
      )
      .map((j) =>
        j.state === "succeeded"
          ? j
          : {
              ...j,
              state: "expired" as const,
              error: "Publication expired. Start a new reviewed attempt.",
            },
      );
    for (const job of completed) {
      const { declarations: _declarations, ...receipt } = job;
      await this.storage.put(
        this.key(`receipts/${job.publicationId}.json`),
        bytes(receipt),
        "*",
      );
    }
    if (completed.length)
      await this.transact((state) => {
        for (const job of completed)
          if (
            state.jobs[job.publicationId]?.state === "succeeded" ||
            (state.jobs[job.publicationId] &&
              this.now().getTime() - Date.parse(state.jobs[job.publicationId].createdAt) >
                LIMITS.jobAgeMs)
          )
            delete state.jobs[job.publicationId];
      });
  }
  async begin(input: unknown) {
    const req = beginSchema.parse(input);
    const keyHash = hash(`${this.environment}:${req.idempotencyKey}`);
    const pid = keyHash.slice(0, 32);
    const old = await this.receipt(pid);
    if (old) {
      if (old.revision !== req.revision || old.baseRevision !== req.baseRevision)
        throw new PublicationFault(
          "idempotency",
          "The idempotency key belongs to a different publication.",
          409,
        );
      return this.view(old, (await this.control()).value.revision);
    }
    await this.archiveCompleted();
    // Archiving may have moved this exact retry into a durable receipt.
    const archived = await this.receipt(pid);
    if (archived) {
      if (
        archived.revision !== req.revision ||
        archived.baseRevision !== req.baseRevision
      )
        throw new PublicationFault(
          "idempotency",
          "The retry differs from the original publication.",
          409,
        );
      return this.view(archived, (await this.control()).value.revision);
    }
    return this.transact((state) => {
      const existing = state.jobs[pid];
      if (existing) {
        if (
          existing.revision !== req.revision ||
          existing.baseRevision !== req.baseRevision
        )
          throw new PublicationFault(
            "idempotency",
            "The retry differs from the original publication.",
            409,
          );
        return this.view(existing, state.revision);
      }
      if (state.revision !== req.baseRevision)
        throw new PublicationFault(
          "conflict",
          "Website changed. Review a new publication.",
          409,
          state.revision,
        );
      if (Object.keys(state.jobs).length >= LIMITS.activeJobs)
        throw new PublicationFault(
          "job_limit",
          "Too many unfinished publications. Operator cleanup is required.",
          429,
        );
      const job: Job = {
        publicationId: pid,
        keyHash,
        baseRevision: req.baseRevision,
        revision: req.revision,
        state: "uploading",
        createdAt: this.now().toISOString(),
        validated: 0,
        total: 0,
        declarations: {},
      };
      state.jobs[pid] = job;
      return this.view(job, state.revision);
    });
  }
  async uploads(pid: string, input: unknown) {
    id.parse(pid);
    const { objects } = uploadSchema.parse(input);
    await this.transact((state) => {
      const job = this.job(state, pid);
      this.assertActive(job);
      if (job.state === "succeeded")
        throw new PublicationFault(
          "state",
          "This publication is already completed.",
          409,
        );
      for (const obj of objects) {
        const previous = job.declarations[obj.sha256];
        if (job.state === "validating" && !previous)
          throw new PublicationFault(
            "state",
            "Validation has started; object declarations are frozen.",
            409,
          );
        if (previous && JSON.stringify(previous) !== JSON.stringify(obj))
          throw new PublicationFault(
            "declaration",
            "An object was declared with conflicting size or type.",
          );
        job.declarations[obj.sha256] = obj;
      }
      if (Object.keys(job.declarations).length > LIMITS.photos + 1)
        throw new PublicationFault("limits", "Publication object limit exceeded.");
      if (job.state === "uploading") job.total = Object.keys(job.declarations).length;
    });
    const missing: {
      sha256: string;
      url: string;
      headers: Record<string, string>;
      expiresAt: string;
    }[] = [];
    await inBatches(objects, async (obj) => {
      const final =
        obj.kind === "preview"
          ? await this.storage.read(this.key(`previews/${obj.sha256}.webp`))
          : null;
      if (final && final.data.length === obj.size && hash(final.data) === obj.sha256)
        return;
      const key = this.key(`staging/${pid}/${obj.sha256}`);
      const staged = await this.storage.read(key);
      if (staged && staged.data.length === obj.size && hash(staged.data) === obj.sha256)
        return;
      missing.push({
        sha256: obj.sha256,
        url: await this.storage.signUpload(key, obj.size, LIMITS.uploadExpiry),
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": String(obj.size),
        },
        expiresAt: new Date(
          this.now().getTime() + LIMITS.uploadExpiry * 1000,
        ).toISOString(),
      });
    });
    return { protocol: PROTOCOL, missing };
  }
  private async manifest(job: Job): Promise<Catalog> {
    const declaration = job.manifestHash && job.declarations[job.manifestHash];
    if (!declaration || declaration.kind !== "manifest")
      throw new PublicationFault("manifest", "Declare and upload the manifest first.");
    const object = await this.storage.read(
      this.key(`staging/${job.publicationId}/${job.manifestHash}`),
    );
    if (
      !object ||
      object.data.length !== declaration.size ||
      hash(object.data) !== job.manifestHash
    )
      throw new PublicationFault(
        "checksum",
        "Manifest is missing or its checksum differs. Re-upload and retry.",
      );
    let raw: unknown;
    try {
      raw = JSON.parse(Buffer.from(object.data).toString());
    } catch {
      throw new PublicationFault("manifest", "Invalid manifest JSON.");
    }
    const catalog = catalogSchema.parse(raw);
    // Reject silently stripped fields (including private metadata) and noncanonical
    // field order; the pinned exporter determines the revision byte representation.
    if (JSON.stringify(raw) !== JSON.stringify(catalog))
      throw new PublicationFault(
        "schema",
        "Manifest contains unexpected fields or noncanonical records.",
      );
    if (
      catalog.photos.length > LIMITS.photos ||
      hash(JSON.stringify(catalog.photos)) !== job.revision ||
      catalog.revision !== job.revision
    )
      throw new PublicationFault("revision", "Manifest count or revision is invalid.");
    if (
      JSON.stringify([...catalog.photos].sort(newestFirst)) !==
      JSON.stringify(catalog.photos)
    )
      throw new PublicationFault("order", "Photos must be ordered newest first.");
    return catalog;
  }
  async commit(pid: string, input: unknown) {
    id.parse(pid);
    const { manifestHash } = commitSchema.parse(input);
    const receipt = await this.receipt(pid);
    if (receipt) return this.view(receipt, (await this.control()).value.revision);
    let job = (await this.control()).value.jobs[pid];
    if (!job) throw new PublicationFault("not_found", "Publication not found.", 404);
    if (job.state === "succeeded")
      return this.view(job, (await this.control()).value.revision);
    this.assertActive(job);
    if (job.manifestHash && job.manifestHash !== manifestHash)
      throw new PublicationFault(
        "manifest",
        "A different manifest is already being validated.",
      );
    const catalog = await this.manifest({ ...job, manifestHash });
    const end = Math.min(job.validated + LIMITS.validationBatch, catalog.photos.length);
    await inBatches(catalog.photos.slice(job.validated, end), async (photo) => {
      const sha256 = photo.preview.slice(9, -5);
      const declaration = job.declarations[sha256];
      if (!declaration || declaration.kind !== "preview")
        throw new PublicationFault("missing", "A manifest preview was not declared.");
      const finalKey = this.key(photo.preview);
      const final = await this.storage.read(finalKey);
      const obj =
        final ?? (await this.storage.read(this.key(`staging/${pid}/${sha256}`)));
      if (!obj || obj.data.length !== declaration.size || hash(obj.data) !== sha256)
        throw new PublicationFault(
          "checksum",
          "A preview is missing or has a checksum mismatch. Re-upload and retry.",
        );
      let valid = false;
      try {
        const metadata = await sharp(obj.data, {
          limitInputPixels: 1280 * 1280,
        }).metadata();
        valid =
          metadata.format === "webp" &&
          metadata.width === photo.width &&
          metadata.height === photo.height &&
          !metadata.exif &&
          !metadata.xmp &&
          !metadata.icc &&
          (metadata.pages ?? 1) === 1;
        if (valid) await sharp(obj.data).raw().toBuffer();
      } catch {
        /* Untrusted uploads never reach the served prefix. */
      }
      if (!valid)
        throw new PublicationFault(
          "preview",
          "Preview content, dimensions, or embedded metadata is invalid.",
        );
      if (!final) await this.storage.put(finalKey, obj.data, "*");
    });
    // Freeze a validated manifest under a server-only key. Signed uploads can only
    // write staging, so they cannot overwrite a preview after validation.
    const manifestKey = this.key(`manifests/${job.revision}.json`);
    if (end === catalog.photos.length)
      await this.storage.put(manifestKey, bytes(catalog), "*");
    const result = await this.transact((state) => {
      job = this.job(state, pid);
      if (job.state === "succeeded") return this.view(job, state.revision);
      if (job.baseRevision !== state.revision) {
        job.state = "conflict";
        job.error = "Website changed during upload. Review a new publication.";
        return this.view(job, state.revision);
      }
      job.manifestHash = manifestHash;
      job.validated = Math.max(job.validated, end);
      job.total = catalog.photos.length;
      job.state = "validating";
      if (job.validated === catalog.photos.length) {
        // Completed receipts retain idempotency without carrying upload declarations
        // on every authorized gallery read. Immutable objects are already verified.
        job.declarations = {};
        job.state = "succeeded";
        job.completedAt = this.now().toISOString();
        state.revision = job.revision;
        state.manifestKey = manifestKey;
      }
      return this.view(job, state.revision);
    });
    if (result.state === "conflict")
      throw new PublicationFault("conflict", result.error!, 409, result.currentRevision);
    return result;
  }
  async status(pid: string) {
    id.parse(pid);
    const { value } = await this.control();
    const job = value.jobs[pid] ?? (await this.receipt(pid));
    if (!job) throw new PublicationFault("not_found", "Publication not found.", 404);
    return this.view(job, value.revision);
  }
  async catalog() {
    const { value } = await this.control();
    if (!value.manifestKey)
      throw new PublicationFault("unavailable", "No R2 publication is available.", 503);
    // Only immutable content is cached. The current control object is read on
    // every request, so withdrawal and rating changes always select a new catalog.
    if (
      this.cachedCatalog?.key === value.manifestKey &&
      this.cachedCatalog.value.revision === value.revision
    )
      return this.cachedCatalog.value;
    const object = await this.storage.read(value.manifestKey);
    if (!object)
      throw new PublicationFault(
        "unavailable",
        "Published manifest is unavailable.",
        503,
      );
    const catalog = catalogSchema.parse(JSON.parse(Buffer.from(object.data).toString()));
    if (catalog.revision !== value.revision)
      throw new PublicationFault("revision", "Published revision mismatch.", 503);
    this.cachedCatalog = { key: value.manifestKey, value: catalog };
    return catalog;
  }
  async preview(relative: string) {
    if (!/^previews\/[a-f0-9]{64}\.webp$/.test(relative))
      throw new Error("Invalid preview");
    const cached = this.previewCache.get(relative);
    if (cached) return cached;
    const object = await this.storage.read(this.key(relative));
    if (!object) throw new Error("Preview unavailable");
    // The gallery route authorizes against the current catalog before looking up
    // immutable bytes. Cache entries are never an authorization decision.
    const budget = 16 * 1024 * 1024;
    while (
      this.previewCacheBytes + object.data.length > budget &&
      this.previewCache.size
    ) {
      const oldest = this.previewCache.keys().next().value!;
      this.previewCacheBytes -= this.previewCache.get(oldest)!.length;
      this.previewCache.delete(oldest);
    }
    if (object.data.length <= budget && !this.previewCache.has(relative)) {
      this.previewCache.set(relative, object.data);
      this.previewCacheBytes += object.data.length;
    }
    return object.data;
  }
}

export function validPublisherToken(
  presented: string | null,
  configured: string | undefined,
) {
  if (!configured || configured.length < 32 || !presented?.startsWith("Bearer "))
    return false;
  const actual = Buffer.from(presented.slice(7));
  const expected = Buffer.from(configured);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function publicationRequest(
  req: Request,
  path: string[],
  service: PhotoPublicationService,
  token: string | undefined,
  enabled: boolean,
) {
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };
  const reply = (data: unknown, status = 200) => Response.json(data, { status, headers });
  if (!enabled)
    return reply(
      { error: { code: "disabled", message: "Publication API is not enabled." } },
      503,
    );
  if (!validPublisherToken(req.headers.get("authorization"), token))
    return reply(
      {
        error: {
          code: "unauthorized",
          message: "Publisher credential is missing or revoked.",
        },
      },
      401,
    );
  if (req.headers.has("origin"))
    return reply(
      { error: { code: "server_only", message: "Use the local server publisher." } },
      403,
    );
  try {
    if (req.method === "GET" && path.length === 1)
      return reply(await service.status(path[0]));
    if (req.method !== "POST")
      return reply({ error: { code: "method", message: "Method not allowed." } }, 405);
    if (req.headers.get("content-type")?.split(";")[0] !== "application/json")
      throw new PublicationFault("content_type", "Use application/json.", 415);
    const reader = req.body?.getReader();
    let size = 0;
    const chunks: Uint8Array[] = [];
    if (reader)
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > LIMITS.requestBytes) {
          await reader.cancel();
          throw new PublicationFault("limits", "Request body too large.", 413);
        }
        chunks.push(value);
      }
    let input: unknown;
    try {
      input = JSON.parse(Buffer.concat(chunks).toString());
    } catch {
      throw new PublicationFault("json", "Invalid JSON.");
    }
    if (path.length === 1 && path[0] === "begin")
      return reply(await service.begin(input));
    if (path.length === 2 && path[1] === "uploads")
      return reply(await service.uploads(path[0], input));
    if (path.length === 2 && path[1] === "commit") {
      const result = await service.commit(path[0], input);
      return reply(result, result.state === "validating" ? 202 : 200);
    }
    return reply({ error: { code: "not_found", message: "Not found." } }, 404);
  } catch (error) {
    if (error instanceof PublicationFault)
      return reply(
        {
          error: {
            code: error.code,
            message: error.message,
            ...(error.currentRevision !== undefined
              ? { currentRevision: error.currentRevision }
              : {}),
          },
        },
        error.status,
      );
    if (error instanceof z.ZodError)
      return reply(
        {
          error: {
            code: "schema",
            message: "Publication does not match the v1 contract.",
          },
        },
        400,
      );
    // SDK errors may contain signed URLs/credentials; never log or reflect them.
    return reply(
      {
        error: {
          code: "unavailable",
          message: "Publication storage is unavailable. Retry this attempt.",
        },
      },
      503,
    );
  }
}
