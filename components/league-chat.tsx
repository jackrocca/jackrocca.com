"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, MessagesSquare } from "lucide-react";
import { CustomButton } from "@/ui/components/CustomButton";
import { PlayerAvatar } from "@/components/player-avatar";
import { chatTimeline, clockLabel, dividerLabel } from "@/lib/chat-timeline";
import type { ChatMessage } from "@/lib/types";

type Player = { id: string; name: string; avatarRevision: number };
type ChatPayload = {
  messages: ChatMessage[];
  players: Player[];
  reset: boolean;
};

const MAX_BODY = 400;
const COUNTER_AT = MAX_BODY - 80;
const FOLLOW_SLACK = 80;

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function LeagueChat({
  userId,
  busy,
  onBusy,
  onError,
  onSent,
}: {
  userId: string;
  busy: boolean;
  onBusy: (busy: boolean) => void;
  onError: (message: string) => void;
  onSent?: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [unseen, setUnseen] = useState(0);
  const page = useRef<HTMLElement>(null);
  const thread = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const follow = useRef(true);
  const counted = useRef(0);
  const firstScroll = useRef(true);
  // Messages present when the thread opened render in place; only later arrivals animate in.
  const settled = useRef<Set<string> | null>(null);
  const latest = useRef<string | undefined>(undefined);
  latest.current = messages.at(-1)?.id;

  async function load(after?: string) {
    const response = await fetch(
      after ? `/api/chat?after=${encodeURIComponent(after)}` : "/api/chat",
      { cache: "no-store" },
    );
    const result = (await response.json()) as ChatPayload & { error?: string };
    if (!response.ok) throw new Error(result.error ?? "Chat is unavailable.");
    if (!settled.current || result.reset) {
      settled.current ??= new Set();
      for (const message of result.messages) settled.current.add(message.id);
    }
    setPlayers(result.players);
    setMessages((current) => {
      if (result.reset || !after) return result.messages;
      const seen = new Set(current.map((message) => message.id));
      return [...current, ...result.messages.filter((message) => !seen.has(message.id))];
    });
    setLoaded(true);
  }

  useEffect(() => {
    void load().catch((e) => onError((e as Error).message));
    const tick = () => {
      if (document.hidden) return;
      void load(latest.current).catch(() => {
        /* Keep the thread visible and retry on the next interval. */
      });
    };
    const interval = setInterval(tick, 4000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [userId]);

  // Size the pane to the viewport so the composer stays put and only the thread scrolls.
  useLayoutEffect(() => {
    const pane = page.current;
    if (!pane) return;
    const fit = () => {
      const shell = pane.closest<HTMLElement>(".app-shell");
      const reserve = shell
        ? parseFloat(getComputedStyle(shell).paddingBottom) || 0
        : 112;
      const top = pane.getBoundingClientRect().top + window.scrollY;
      const viewport = window.visualViewport?.height ?? window.innerHeight;
      pane.style.setProperty(
        "--chat-height",
        `${Math.round(Math.max(360, viewport - top - reserve))}px`,
      );
      // A resize (rotation, keyboard) should keep the latest message pinned in view.
      const el = thread.current;
      if (el && follow.current) el.scrollTop = el.scrollHeight;
    };
    fit();
    window.addEventListener("resize", fit);
    window.visualViewport?.addEventListener("resize", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.visualViewport?.removeEventListener("resize", fit);
    };
  }, []);

  // Layout effect: the first paint of the thread should already sit at the latest message.
  useLayoutEffect(() => {
    const el = thread.current;
    if (!el || !loaded) return;
    const added = messages.length - counted.current;
    counted.current = messages.length;
    if (follow.current) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: firstScroll.current || reduceMotion() ? "instant" : "smooth",
      });
      firstScroll.current = false;
      setUnseen(0);
    } else if (added > 0) {
      setUnseen((count) => count + added);
    }
  }, [messages, loaded]);

  function onScroll() {
    const el = thread.current;
    if (!el) return;
    follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < FOLLOW_SLACK;
    if (follow.current) setUnseen((count) => (count ? 0 : count));
  }

  function jumpToLatest() {
    const el = thread.current;
    if (!el) return;
    follow.current = true;
    setUnseen(0);
    el.scrollTo({
      top: el.scrollHeight,
      behavior: reduceMotion() ? "instant" : "smooth",
    });
  }

  async function send() {
    const body = draft.trim();
    if (!body || busy) return;
    onBusy(true);
    onError("");
    // Clear right away so the reply feels instant; the draft comes back if the send fails.
    setDraft("");
    follow.current = true;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Message was not sent.");
      setMessages((current) =>
        current.some((message) => message.id === result.message.id)
          ? current
          : [...current, result.message],
      );
      onSent?.();
    } catch (e) {
      setDraft(body);
      onError((e as Error).message);
    } finally {
      onBusy(false);
      input.current?.focus();
    }
  }

  const byId = new Map(players.map((player) => [player.id, player]));
  const timeline = chatTimeline(messages);
  const empty = loaded && messages.length === 0;
  const remaining = MAX_BODY - draft.length;
  return (
    <section className="chat-page" ref={page} aria-label="League chat">
      <div className="chat-thread" ref={thread} onScroll={onScroll}>
        {loaded && (
          <div className={`chat-thread-inner${empty ? " empty" : ""}`}>
            {empty && (
              <div className="chat-empty">
                <span className="chat-empty-icon">
                  <MessagesSquare size={22} strokeWidth={1.75} />
                </span>
                <h3>The thread is quiet.</h3>
                <p>
                  Send the first message. Trash talk, injuries, and kickoff reminders live
                  here.
                </p>
              </div>
            )}
            {timeline.map((item) => {
              if (item.kind === "divider")
                return (
                  <div key={item.id} className="chat-divider">
                    <time dateTime={new Date(item.at).toISOString()}>
                      {dividerLabel(item.at)}
                    </time>
                  </div>
                );
              const { message, first, last } = item;
              const player = byId.get(message.userId);
              const own = message.userId === userId;
              const fresh = settled.current ? !settled.current.has(message.id) : false;
              const classes = [
                "chat-message",
                own && "own",
                first && "first",
                last && "last",
                fresh && "fresh",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <article key={message.id} className={classes}>
                  {!own && (
                    <span className="chat-gutter">
                      {last && (
                        <PlayerAvatar
                          name={player?.name ?? "Player"}
                          userId={message.userId}
                          revision={player?.avatarRevision ?? 0}
                        />
                      )}
                    </span>
                  )}
                  <div className="chat-body">
                    {first && !own && (
                      <span className="chat-author">{player?.name ?? "Player"}</span>
                    )}
                    <div className="chat-row">
                      <div className="chat-bubble">
                        <p>{message.body}</p>
                      </div>
                      <time className="chat-time" dateTime={message.createdAt}>
                        {clockLabel(Date.parse(message.createdAt))}
                      </time>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <CustomButton
        type="button"
        variant="unstyled"
        className="chat-jump"
        data-visible={unseen > 0}
        tabIndex={unseen > 0 ? 0 : -1}
        aria-hidden={unseen === 0}
        onClick={jumpToLatest}
      >
        {unseen === 1 ? "1 new message" : `${unseen} new messages`}
        <ArrowDown size={14} strokeWidth={2.25} />
      </CustomButton>
      <form
        className="chat-composer"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <textarea
          ref={input}
          name="body"
          rows={1}
          maxLength={MAX_BODY}
          value={draft}
          placeholder="Message the league"
          aria-label="Message the league"
          autoComplete="off"
          enterKeyHint="send"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void send();
            }
          }}
        />
        {draft.length >= COUNTER_AT && (
          <span className="chat-count" aria-live="polite">
            {remaining}
          </span>
        )}
        <CustomButton
          type="submit"
          variant="unstyled"
          className="chat-send"
          disabled={busy || !draft.trim()}
          aria-label="Send message"
          // Keep focus (and the mobile keyboard) in the textarea when tapping send.
          onPointerDown={(e) => e.preventDefault()}
        >
          <ArrowUp size={16} strokeWidth={2.5} />
        </CustomButton>
      </form>
    </section>
  );
}
