import { mkdir, writeFile } from "node:fs/promises";
import { fetchWeek } from "../lib/feed";
async function main() {
  const weeks = [];
  for (let number = 1; number <= 18; number++) {
    const games = await fetchWeek(number);
    weeks.push({
      number,
      games,
      fetchedAt: new Date().toISOString(),
      error: null,
      publishedAt: null,
      lines: {},
    });
    console.log(`Week ${number}: ${games.length} games`);
  }
  const games = weeks.flatMap((w) => w.games);
  if (games.length !== 272 || new Set(games.map((g) => g.id)).size !== 272)
    throw new Error("Expected 272 unique regular-season games.");
  await mkdir("data", { recursive: true });
  await writeFile("data/schedule-2026.json", JSON.stringify(weeks, null, 2) + "\n");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
