import { AppError } from "./rules";
import { State, User } from "./types";

function member(state: State, userId: string): User {
  const user = state.users.find((item) => item.id === userId);
  if (!user) throw new AppError("Player not found.", 404);
  return user;
}

/** Records that the player finished or skipped the welcome tour. Idempotent. */
export function markOnboarded(state: State, userId: string, now = Date.now()) {
  const user = member(state, userId);
  if (!user.onboardedAt) user.onboardedAt = new Date(now).toISOString();
  return user;
}

/** Records the player's first chat message so the checklist can settle. Idempotent. */
export function markFirstChat(state: State, userId: string, now = Date.now()) {
  const user = member(state, userId);
  if (!user.firstChatAt) user.firstChatAt = new Date(now).toISOString();
  return user;
}

export function onboardingFlags(user: User) {
  return {
    onboarded: Boolean(user.onboardedAt),
    chatted: Boolean(user.firstChatAt),
  };
}
