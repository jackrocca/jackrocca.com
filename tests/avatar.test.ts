import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { AppError } from "../lib/rules";
import { AVATAR_SIZE, avatarUserId, processAvatar } from "../lib/avatar";

test("avatar processing crops a square webp and rejects junk files", async () => {
  const source = await sharp({
    create: { width: 80, height: 40, channels: 3, background: "#dd7044" },
  })
    .png()
    .toBuffer();
  const out = await processAvatar(source);
  const meta = await sharp(out).metadata();
  assert.equal(meta.format, "webp");
  assert.equal(meta.width, AVATAR_SIZE);
  assert.equal(meta.height, AVATAR_SIZE);
  await assert.rejects(() => processAvatar(Buffer.from("not-a-photo")), AppError);
});

test("avatar user ids must be UUIDs", () => {
  assert.equal(
    avatarUserId("2c7f1d5a-3b0e-4c11-9a22-7f6e8d9c0b1a"),
    "2c7f1d5a-3b0e-4c11-9a22-7f6e8d9c0b1a",
  );
  assert.throws(() => avatarUserId("../secret"), AppError);
  assert.throws(() => avatarUserId("not-a-uuid"), AppError);
});
