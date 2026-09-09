"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { CustomButton } from "@/ui/components/CustomButton";

export function PlayerAvatar({
  name,
  userId,
  revision = 0,
  size = "sm",
}: {
  name: string;
  userId: string;
  revision?: number;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [revision, userId]);
  const letter = (name.trim()[0] || "?").toUpperCase();
  const pixels = size === "lg" ? 72 : size === "md" ? 40 : 30;
  return (
    <span className={`avatar avatar-${size}`} aria-hidden="true">
      {revision > 0 && !failed ? (
        // Authenticated league photos are session-gated; a plain img keeps cookies on the request.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/avatars/${encodeURIComponent(userId)}?v=${revision}`}
          alt=""
          width={pixels}
          height={pixels}
          onError={() => setFailed(true)}
        />
      ) : (
        letter
      )}
    </span>
  );
}

export function ProfilePhotoField({
  name,
  userId,
  revision,
  disabled,
  onRevision,
  onNotice,
  onError,
}: {
  name: string;
  userId: string;
  revision: number;
  disabled?: boolean;
  onRevision: (revision: number) => void;
  onNotice: (message: string) => void;
  onError: (message: string) => void;
}) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function run(task: () => Promise<void>) {
    setBusy(true);
    onError("");
    try {
      await task();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="photo-field">
      <PlayerAvatar name={name} userId={userId} revision={revision} size="lg" />
      <div className="photo-field-copy">
        <p>League photo</p>
        <span>JPEG, PNG, or WebP · cropped square · under 4 MB</span>
        <div className="photo-field-actions">
          <input
            id={inputId}
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            disabled={disabled || busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              void run(async () => {
                if (file.size > 4 * 1024 * 1024)
                  throw new Error("Keep photos under 4 MB.");
                const form = new FormData();
                form.append("photo", file);
                const response = await fetch("/api/profile/avatar", {
                  method: "POST",
                  body: form,
                });
                const result = await response.json();
                if (!response.ok)
                  throw new Error(result.error ?? "The photo could not be saved.");
                onRevision(result.avatarRevision);
                window.dispatchEvent(new Event("account-changed"));
                onNotice("Profile photo saved.");
              });
            }}
          />
          <CustomButton
            type="button"
            variant="outline"
            className="photo-field-button"
            disabled={disabled || busy}
            leftIcon={Camera}
            onClick={() => input.current?.click()}
          >
            {revision ? "Change photo" : "Add a photo"}
          </CustomButton>
          {revision > 0 && (
            <CustomButton
              type="button"
              variant="outline"
              className="photo-field-button"
              disabled={disabled || busy}
              leftIcon={Trash2}
              onClick={() =>
                void run(async () => {
                  const response = await fetch("/api/profile/avatar", {
                    method: "DELETE",
                  });
                  const result = await response.json();
                  if (!response.ok)
                    throw new Error(result.error ?? "The photo could not be removed.");
                  onRevision(0);
                  window.dispatchEvent(new Event("account-changed"));
                  onNotice("Profile photo removed.");
                })
              }
            >
              Remove
            </CustomButton>
          )}
        </div>
      </div>
    </div>
  );
}
