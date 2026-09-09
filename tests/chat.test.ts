import test from "node:test";
import assert from "node:assert/strict";
import { AppError } from "../lib/rules";
import {
  CHAT_KEEP,
  chatView,
  initialChat,
  normalizeChatBody,
  postChatMessage,
} from "../lib/chat";
import { chatTimeline, dividerLabel } from "../lib/chat-timeline";
import { initialState } from "../lib/store";
import type { ChatMessage, User } from "../lib/types";

function user(id: string, name: string): User {
  return {
    id,
    name,
    role: "player",
    sessionVersion: 0,
    createdAt: "2026-09-09T00:00:00Z",
  };
}

test("chat messages trim, bound length, and drop control characters", () => {
  assert.equal(normalizeChatBody("  Hello\r\nroom  "), "Hello\nroom");
  assert.throws(() => normalizeChatBody("   "), AppError);
  assert.throws(() => normalizeChatBody("x".repeat(401)), AppError);
  assert.equal(normalizeChatBody("ok\u0000there"), "okthere");
});

test("chat keeps a bounded history and pages from a cursor", () => {
  const chat = initialChat();
  const first = postChatMessage(chat, "one", "first", Date.parse("2026-09-09T00:00:00Z"));
  for (let i = 0; i < CHAT_KEEP + 5; i++)
    postChatMessage(chat, "two", `msg ${i}`, Date.parse("2026-09-09T00:00:00Z") + i);
  assert.equal(chat.messages.length, CHAT_KEEP);
  assert.equal(
    chat.messages.some((message) => message.id === first.id),
    false,
  );
  const state = initialState();
  state.users = [user("one", "Ada"), user("two", "Jack")];
  const page = chatView(state, chat);
  assert.equal(page.messages.length, 100);
  assert.equal(page.reset, true);
  assert.deepEqual(page.players.map((player) => player.name).sort(), ["Ada", "Jack"]);
  const next = chatView(state, chat, page.messages[0].id);
  assert.equal(next.reset, false);
  assert.equal(next.messages[0].id, page.messages[1].id);
  const missing = chatView(state, chat, first.id);
  assert.equal(missing.reset, true);
  assert.ok(!JSON.stringify(page).includes("email"));
});

test("chat timeline groups a run of messages and marks quiet spells", () => {
  const base = Date.parse("2026-09-09T19:00:00Z");
  const at = (offsetMinutes: number, userId: string, id: string): ChatMessage => ({
    id,
    userId,
    body: id,
    createdAt: new Date(base + offsetMinutes * 60_000).toISOString(),
  });
  const items = chatTimeline([
    at(0, "ada", "a1"),
    at(1, "ada", "a2"),
    at(2, "jack", "j1"),
    at(30, "jack", "j2"),
    at(31, "jack", "j3"),
  ]);
  assert.deepEqual(
    items.map((item) =>
      item.kind === "divider"
        ? "divider"
        : `${item.message.id}${item.first ? " first" : ""}${item.last ? " last" : ""}`,
    ),
    ["divider", "a1 first", "a2 last", "j1 first last", "divider", "j2 first", "j3 last"],
  );
  assert.deepEqual(chatTimeline([]), []);
  const noon = Date.parse("2026-09-09T19:00:00Z");
  assert.equal(dividerLabel(noon, noon + 60_000), "Today 12:00 PM");
  assert.equal(dividerLabel(noon, noon + 86_400_000), "Yesterday 12:00 PM");
  assert.equal(dividerLabel(noon, noon + 3 * 86_400_000), "Wednesday 12:00 PM");
  assert.equal(dividerLabel(noon, noon + 30 * 86_400_000), "Sep 9, 12:00 PM");
});
