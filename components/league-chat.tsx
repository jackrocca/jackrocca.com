"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, MessagesSquare } from "lucide-react";
import { CustomButton } from "@/ui/components/CustomButton";
import { PlayerAvatar } from "@/components/player-avatar";
import type { ChatMessage } from "@/lib/types";

type Player = { id: string; name: string; avatarRevision: number };
type ChatPayload = {
  messages: ChatMessage[];
  players: Player[];
  reset: boolean;
};

const stamp = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });

export function LeagueChat({
  userId,
  busy,
  onBusy,
  onError,
}: {
  userId: string;
  busy: boolean;
  onBusy: (busy: boolean) => void;
  onError: (message: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const latest = useRef<string | undefined>(undefined);
  latest.current = messages.at(-1)?.id;

  async function load(after?: string) {
    const response = await fetch(
      after ? `/api/chat?after=${encodeURIComponent(after)}` : "/api/chat",
      { cache: "no-store" },
    );
    const result = (await response.json()) as ChatPayload & { error?: string };
    if (!response.ok) throw new Error(result.error ?? "Chat is unavailable.");
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

  useEffect(() => {
    if (!follow.current) return;
    end.current?.scrollIntoView({ block: "end", behavior: loaded ? "smooth" : "auto" });
  }, [messages, loaded]);

  useEffect(() => {
    const onScroll = () => {
      follow.current =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 120;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function send() {
    const body = draft.trim();
    if (!body || busy) return;
    onBusy(true);
    onError("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Message was not sent.");
      setDraft("");
      follow.current = true;
      setMessages((current) =>
        current.some((message) => message.id === result.message.id)
          ? current
          : [...current, result.message],
      );
    } catch (e) {
      onError((e as Error).message);
    } finally {
      onBusy(false);
    }
  }

  const byId = new Map(players.map((player) => [player.id, player]));
  return (
    <section className="chat-page" aria-label="League chat">
      <div className="chat-thread">
        {loaded && messages.length === 0 && (
          <div className="empty-state">
            <MessagesSquare size={36} />
            <h3>The thread is quiet.</h3>
            <p>
              Send the first message. Trash talk, injuries, and kickoff reminders live
              here.
            </p>
          </div>
        )}
        {messages.map((message) => {
          const player = byId.get(message.userId);
          const own = message.userId === userId;
          return (
            <article key={message.id} className={`chat-message${own ? " own" : ""}`}>
              <PlayerAvatar
                name={player?.name ?? "Player"}
                userId={message.userId}
                revision={player?.avatarRevision ?? 0}
              />
              <div>
                <header>
                  <strong>{own ? "You" : (player?.name ?? "Player")}</strong>
                  <time dateTime={message.createdAt}>{stamp(message.createdAt)}</time>
                </header>
                <p>{message.body}</p>
              </div>
            </article>
          );
        })}
        <div ref={end} />
      </div>
      <form
        className="chat-composer"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <label className="chat-composer-field">
          <span className="sr-only">Message the league</span>
          <textarea
            name="body"
            rows={1}
            maxLength={400}
            value={draft}
            disabled={busy}
            placeholder="Message the league"
            aria-label="Message the league"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
        </label>
        <CustomButton
          type="submit"
          variant="unstyled"
          className="chat-send"
          disabled={busy || !draft.trim()}
          aria-label="Send message"
        >
          <ArrowUp size={18} />
        </CustomButton>
      </form>
    </section>
  );
}
