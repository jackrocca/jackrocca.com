import { createHash } from "node:crypto";
import type { PublicationStorage, StoredObject } from "../lib/publication-storage";
export class MemoryPublicationStorage implements PublicationStorage {
  objects = new Map<string, StoredObject>();
  uploads = new Map<string, { key: string; size: number; expires: number }>();
  origin = "http://127.0.0.1:1";
  now = () => Date.now();
  async read(key: string) {
    return this.objects.get(key) ?? null;
  }
  async put(key: string, data: Uint8Array, condition?: string, metadata = {}) {
    const old = this.objects.get(key);
    if (
      (condition === "*" && old) ||
      (condition && condition !== "*" && old?.etag !== condition)
    )
      return false;
    this.objects.set(key, {
      data: Uint8Array.from(data),
      metadata,
      etag: createHash("sha256").update(data).digest("hex"),
    });
    return true;
  }
  async signUpload(key: string, size: number, expiresIn: number) {
    const token = createHash("sha256")
      .update(key + String(this.now()))
      .digest("hex");
    this.uploads.set(token, { key, size, expires: this.now() + expiresIn * 1000 });
    return `${this.origin}/test-upload/${token}`;
  }
  async upload(url: string, data: Uint8Array) {
    const token = new URL(url).pathname.split("/").pop()!;
    const authorization = this.uploads.get(token);
    if (
      !authorization ||
      authorization.expires <= this.now() ||
      authorization.size !== data.length
    )
      return false;
    await this.put(authorization.key, data);
    return true;
  }
}
