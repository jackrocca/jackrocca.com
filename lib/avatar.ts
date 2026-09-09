import sharp from "sharp";
import { AppError } from "./rules";

export const AVATAR_MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const AVATAR_SIZE = 256;
const formats = new Set(["jpeg", "png", "webp", "gif", "avif"]);

export async function processAvatar(input: Buffer) {
  if (!input.length) throw new AppError("Choose a photo to upload.");
  if (input.length > AVATAR_MAX_UPLOAD_BYTES)
    throw new AppError("Keep photos under 4 MB.");
  try {
    const image = sharp(input, {
      failOn: "error",
      animated: false,
      limitInputPixels: 4096 * 4096,
    });
    const meta = await image.metadata();
    if (!formats.has(meta.format ?? ""))
      throw new AppError("Use a JPEG, PNG, or WebP photo.");
    return await image
      .rotate()
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover", position: "attention" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError("That file could not be read as a photo.");
  }
}

export function avatarUserId(value: string) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
    throw new AppError("Not found.", 404);
  return value;
}
