import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type StoredObject = {
  data: Uint8Array;
  etag: string;
  metadata: Record<string, string>;
};
export interface PublicationStorage {
  read(key: string): Promise<StoredObject | null>;
  put(
    key: string,
    data: Uint8Array,
    condition?: string,
    metadata?: Record<string, string>,
  ): Promise<boolean>;
  signUpload(key: string, size: number, expiresIn: number): Promise<string>;
}

export class R2PublicationStorage implements PublicationStorage {
  constructor(
    private client: S3Client,
    private bucket: string,
  ) {}
  async read(key: string): Promise<StoredObject | null> {
    try {
      const result = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      if (!result.Body || !result.ETag) throw new Error("Incomplete storage response");
      return {
        data: await result.Body.transformToByteArray(),
        etag: result.ETag,
        metadata: result.Metadata ?? {},
      };
    } catch (error) {
      if (
        (error as { $metadata?: { httpStatusCode?: number } }).$metadata
          ?.httpStatusCode === 404
      )
        return null;
      throw error;
    }
  }
  async put(
    key: string,
    data: Uint8Array,
    condition?: string,
    metadata?: Record<string, string>,
  ) {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: data,
          ContentType: key.endsWith(".webp") ? "image/webp" : "application/json",
          Metadata: metadata,
          ...(condition === "*"
            ? { IfNoneMatch: "*" }
            : condition
              ? { IfMatch: condition }
              : {}),
        }),
      );
      return true;
    } catch (error) {
      const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata
        ?.httpStatusCode;
      if (status === 409 || status === 412) return false;
      throw error;
    }
  }
  async signUpload(key: string, size: number, expiresIn: number) {
    return getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentLength: size,
        ContentType: "application/octet-stream",
      }),
      { expiresIn },
    );
  }
}

export function publicationEnvironment() {
  const environment = process.env.PHOTO_PUBLICATION_ENV;
  if (!environment || !["production", "preview", "development"].includes(environment))
    throw new Error("Publication environment is not configured");
  if (process.env.VERCEL_ENV === "preview" && environment !== "preview")
    throw new Error("Preview cannot use another publication environment");
  if (process.env.VERCEL_ENV === "production" && environment !== "production")
    throw new Error("Production publication environment mismatch");
  return environment;
}

export function r2PublicationStorage(): PublicationStorage {
  publicationEnvironment();
  const account = process.env.PHOTO_R2_ACCOUNT_ID;
  const bucket = process.env.PHOTO_R2_BUCKET;
  const accessKeyId = process.env.PHOTO_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.PHOTO_R2_SECRET_ACCESS_KEY;
  if (
    !account ||
    !/^[a-f0-9]{32}$/.test(account) ||
    !bucket ||
    !accessKeyId ||
    !secretAccessKey
  )
    throw new Error("Private R2 gallery storage is not configured");
  return new R2PublicationStorage(
    new S3Client({
      region: "auto",
      forcePathStyle: true,
      endpoint: `https://${account}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    }),
    bucket,
  );
}
