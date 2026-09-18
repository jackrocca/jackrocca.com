// Seeds an isolated LOCAL league store with fixture members, cards, and photos so
// the Score Board can be tried without Google sign-in or production data.
//
//   SESSION_SECRET=<same value as the dev server> npm run seed:local
//
// Refuses to run when Blob credentials or a Vercel environment are present, so it
// can never touch league Blob state. Writes to LOCAL_STORE_PATH or work/league.local.json.
import path from "node:path";
import { rm } from "node:fs/promises";
async function main() {
  if (
    process.env.VERCEL ||
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV === "production" ||
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_STORE_ID ||
    process.env.LEAGUE_STORAGE_PREFIX
  )
    throw new Error(
      "Refusing to seed: unset BLOB_READ_WRITE_TOKEN / BLOB_STORE_ID / LEAGUE_STORAGE_PREFIX and run locally only.",
    );
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)
    throw new Error(
      "Set SESSION_SECRET (32+ characters) to the value the dev server uses.",
    );
  const { mutate, localLeagueDir } = await import("../lib/store");
  const { joinLeagueWithGoogle } = await import("../lib/google-account");
  const { publishWeek, saveEntry, confirmBuyIn, deadline } = await import("../lib/rules");
  const { markOnboarded } = await import("../lib/onboarding");
  const { writeAvatar } = await import("../lib/avatar-store");
  const { loginResponse } = await import("../lib/auth");
  const { PICK_TYPES } = await import("../lib/types");
  const sharp = (await import("sharp")).default;
  const owner = process.env.OWNER_EMAIL ?? "owner@example.com";
  // Cards are saved "on" the Tuesday before Week 1 so every game is still open.
  const now = Date.parse("2026-09-08T20:00:00Z");
  await rm(path.join(localLeagueDir(), "league.local.json"), { force: true });
  const names = ["Jack", "Ada", "Bea", "Cy", "Dev", "Eli", "Fay"];
  const colors = [
    "#0b706f",
    "#c56638",
    "#4c6ef5",
    "#b8862b",
    "#6a4c93",
    "#2b8a3e",
    "#c2255c",
  ];
  const users = await mutate((s) => {
    s.users = [];
    s.entries = [];
    s.audit = [];
    const users = names.map((name, i) =>
      joinLeagueWithGoogle(
        s,
        {
          sub: `fixture-${name.toLowerCase()}`,
          email: i === 0 ? owner : `${name.toLowerCase()}@example.com`,
          email_verified: true,
          name,
        },
        owner,
      ),
    );
    const [week1, week2] = s.weeks;
    for (const week of [week1, week2]) {
      if (!week.publishedAt) publishWeek(week, now);
      week.fetchedAt = null;
    }
    const eligible = (week: typeof week1, type: (typeof PICK_TYPES)[number]) =>
      week.games.filter((g) => {
        const line = week.lines[g.id];
        return (
          line &&
          (type === "over" || type === "under"
            ? line.total !== null
            : line.homeSpread !== null && line.homeSpread !== 0)
        );
      });
    const card = (week: typeof week1, offsets: number[]) => {
      const taken = new Set<string>();
      const picks = {} as Record<(typeof PICK_TYPES)[number], string>;
      PICK_TYPES.forEach((type, i) => {
        const games = eligible(week, type);
        let index = offsets[i] % games.length;
        while (taken.has(games[index].id)) index = (index + 1) % games.length;
        taken.add(games[index].id);
        picks[type] = games[index].id;
      });
      return picks;
    };
    // Week 1: six cards, several sharing games so avatar clusters stack; Fay never plays.
    const spreads = [
      [0, 1, 2, 3],
      [0, 3, 2, 4],
      [1, 0, 2, 3],
      [1, 5, 7, 9],
      [2, 3, 6, 4],
      [5, 3, 8, 4],
    ];
    users.slice(0, 6).forEach((u, i) => {
      saveEntry(
        s,
        u.id,
        {
          week: 1,
          picks: card(week1, spreads[i]),
          superSpread: false,
          totalHelper: i === 3 ? "over" : null,
          perfectPrediction: false,
          revision: 0,
        },
        now,
      );
      if (i !== 5) confirmBuyIn(s, u.id, now + 1);
    });
    // Week 2: three cards that stay private until the Thursday kickoff.
    users.slice(0, 3).forEach((u, i) => {
      saveEntry(
        s,
        u.id,
        {
          week: 2,
          picks: card(week2, [i, i + 3, i + 6, i + 9]),
          superSpread: false,
          totalHelper: null,
          perfectPrediction: false,
          revision: 0,
        },
        now + 5,
      );
    });
    for (const u of users) markOnboarded(s, u.id);
    return users;
  });
  for (const [i, u] of users.entries()) {
    if (i % 2) continue;
    const webp = await sharp({
      create: { width: 256, height: 256, channels: 3, background: colors[i] },
    })
      .composite([
        {
          input: Buffer.from(
            '<svg width="256" height="256"><circle cx="128" cy="100" r="52" fill="rgba(255,255,255,0.85)"/><ellipse cx="128" cy="230" rx="90" ry="60" fill="rgba(255,255,255,0.85)"/></svg>',
          ),
        },
      ])
      .webp()
      .toBuffer();
    await writeAvatar(u.id, webp);
    await mutate((s) => {
      s.users.find((member) => member.id === u.id)!.avatarRevision = 1;
    });
  }
  const week1 = deadline((await import("../lib/store")).initialState().weeks[0]);
  console.log(`Seeded ${users.length} members into ${localLeagueDir()}.`);
  console.log(
    `Week 1 picks reveal after ${new Date(week1).toISOString()}; Week 2 cards stay private until Thursday.`,
  );
  console.log(
    "\nSign in locally by setting one of these cookies on http://localhost:3106",
  );
  console.log(
    '(DevTools console: document.cookie = "<value>; path=/" then reload /pick4):\n',
  );
  for (const u of users) {
    const cookie = (await loginResponse(u)).headers.get("set-cookie")!.split(";")[0];
    console.log(`${u.name.padEnd(5)} ${u.role.padEnd(6)} ${cookie}`);
  }
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
