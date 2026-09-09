import { ChatMessage, ChatState, State } from "./types";
import { AppError } from "./rules";

export const CHAT_MAX_BODY = 400;
export const CHAT_KEEP = 400;
export const CHAT_PAGE = 100;

export function initialChat(): ChatState {
  return { version: 1, revision: 0, messages: [] };
}

export function normalizeChatBody(raw: string) {
  const body = raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!body) throw new AppError("Write a message before sending.");
  if (body.length > CHAT_MAX_BODY)
    throw new AppError(`Keep messages to ${CHAT_MAX_BODY} characters.`);
  return body;
}

export function postChatMessage(
  chat: ChatState,
  userId: string,
  raw: string,
  now = Date.now(),
): ChatMessage {
  const message: ChatMessage = {
    id: crypto.randomUUID(),
    userId,
    body: normalizeChatBody(raw),
    createdAt: new Date(now).toISOString(),
  };
  chat.messages.push(message);
  chat.messages = chat.messages.slice(-CHAT_KEEP);
  return message;
}

export function chatView(state: State, chat: ChatState, after?: string | null) {
  const players = state.users.map((user) => ({
    id: user.id,
    name: user.name,
    avatarRevision: user.avatarRevision ?? 0,
  }));
  if (!after) {
    return {
      messages: chat.messages.slice(-CHAT_PAGE),
      players,
      reset: true,
    };
  }
  const index = chat.messages.findIndex((message) => message.id === after);
  if (index === -1) {
    return {
      messages: chat.messages.slice(-CHAT_PAGE),
      players,
      reset: true,
    };
  }
  return {
    messages: chat.messages.slice(index + 1).slice(-CHAT_PAGE),
    players,
    reset: false,
  };
}
