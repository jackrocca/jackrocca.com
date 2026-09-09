import test from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../lib/store";
import { markFirstChat, markOnboarded, onboardingFlags } from "../lib/onboarding";
import { view } from "../lib/view";
import type { User } from "../lib/types";

const at = Date.parse("2026-09-09T16:00:00Z");
function player(id = "p1"): User {
  return {
    id,
    name: "Player",
    googleSub: `sub-${id}`,
    email: `${id}@gmail.com`,
    role: "player",
    sessionVersion: 0,
    createdAt: new Date(at).toISOString(),
  };
}

test("new players start with the tour and checklist pending", () => {
  const s = initialState();
  const user = player();
  s.users.push(user);
  assert.deepEqual(onboardingFlags(user), { onboarded: false, chatted: false });
  const seen = view(s, user, 1, true).user!;
  assert.equal(seen.onboarded, false);
  assert.equal(seen.chatted, false);
  assert.ok(!("onboardedAt" in seen));
});

test("finishing the tour is recorded once and never re-stamped", () => {
  const s = initialState();
  s.users.push(player());
  markOnboarded(s, "p1", at);
  assert.equal(s.users[0].onboardedAt, new Date(at).toISOString());
  markOnboarded(s, "p1", at + 60_000);
  assert.equal(s.users[0].onboardedAt, new Date(at).toISOString());
  assert.equal(view(s, s.users[0], 1, true).user!.onboarded, true);
});

test("the first chat message settles the checklist item", () => {
  const s = initialState();
  s.users.push(player());
  markFirstChat(s, "p1", at);
  markFirstChat(s, "p1", at + 1);
  assert.equal(s.users[0].firstChatAt, new Date(at).toISOString());
  assert.equal(view(s, s.users[0], 1, true).user!.chatted, true);
});

test("milestones for unknown players are rejected", () => {
  const s = initialState();
  assert.throws(() => markOnboarded(s, "ghost"), /Player not found/);
  assert.throws(() => markFirstChat(s, "ghost"), /Player not found/);
});
