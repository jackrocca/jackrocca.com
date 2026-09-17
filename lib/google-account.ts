// Compatibility re-export. Sign-in creates a site account (`lib/accounts.ts`);
// for 2026 that account is also the league membership, so the old name stays
// valid until explicit league joining lands.
export { googleProfileSchema, signInWithGoogle, type GoogleProfile } from "./accounts";
export { signInWithGoogle as joinLeagueWithGoogle } from "./accounts";
