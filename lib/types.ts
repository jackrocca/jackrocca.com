export const SEASON = 2026;
export const PICK_TYPES = ["favorite", "underdog", "over", "under"] as const;
export type PickType = (typeof PICK_TYPES)[number];
export type Team = {
  id: string;
  name: string;
  short: string;
  abbreviation: string;
  color: string;
  logo: string;
};
export type Game = {
  id: string;
  week: number;
  kickoff: string;
  timeConfirmed: boolean;
  home: Team;
  away: Team;
  venue: string;
  broadcast: string;
  state: "scheduled" | "live" | "final" | "postponed" | "canceled";
  detail: string;
  homeScore: number | null;
  awayScore: number | null;
  homeSpread: number | null;
  total: number | null;
  provider: string | null;
  resultOverride?: {
    homeScore: number;
    awayScore: number;
    state: "final" | "canceled";
    reason: string;
  };
  linesOverride?: { homeSpread: number | null; total: number | null };
};
export type Week = {
  number: number;
  games: Game[];
  fetchedAt: string | null;
  error: string | null;
  publishedAt: string | null;
  lines: Record<
    string,
    { homeSpread: number | null; total: number | null; provider: string | null }
  >;
};
export type User = {
  id: string;
  username?: string; // Legacy accounts are retained for historical exports.
  name: string;
  googleSub?: string;
  email?: string;
  role: "admin" | "player";
  sessionVersion: number;
  createdAt: string;
};
export type Selection = {
  gameId: string;
  teamId?: string;
  line: number;
  label: string;
};
export type Entry = {
  id: string;
  userId: string;
  week: number;
  season: number;
  picks: Record<PickType, Selection>;
  superSpread: boolean;
  totalHelper: "over" | "under" | null;
  perfectPrediction: boolean;
  late: boolean;
  submittedAt: string;
  updatedAt: string;
  revision: number;
};
export type Invite = {
  id: string;
  hash: string;
  name: string;
  expiresAt: string;
  usedAt: string | null;
  resetUserId?: string;
};
export type Audit = {
  at: string;
  actor: string;
  action: string;
  detail: string;
};
export type State = {
  version: 1;
  revision: number;
  users: User[];
  entries: Entry[];
  invites: Invite[];
  weeks: Week[];
  audit: Audit[];
  rates: Record<string, { count: number; reset: number }>;
};
export type Outcome = "win" | "push" | "loss" | "pending" | "void";
export type Score = {
  points: number;
  wins: number;
  perfect: boolean;
  complete: boolean;
  outcomes: Record<PickType, Outcome>;
};
export type PickInput = {
  week: number;
  picks: Record<PickType, string>;
  superSpread: boolean;
  totalHelper: "over" | "under" | null;
  perfectPrediction: boolean;
  revision: number;
};
export type PublicUser = Pick<User, "id" | "username" | "name" | "role">;
