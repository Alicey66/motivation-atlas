import type { Minigame } from "./types";

/** Every folder's index.ts, found at build time. Folders starting with "_" are skipped. */
const modules = import.meta.glob<Record<string, unknown>>(["./*/index.ts", "!./_*/index.ts"], { eager: true });

function isMinigame(value: unknown): value is Minigame {
  return typeof value === "object" && value !== null && typeof (value as Minigame).mount === "function";
}

/** Each folder's exported minigames, keyed by folder name. */
export const minigamesByFolder: Record<string, Minigame[]> = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => [path.split("/")[1], Object.values(mod).filter(isMinigame)]),
);

export const minigames: Minigame[] = Object.values(minigamesByFolder).flat();

export function minigamesFor(motivator: string): Minigame[] {
  return minigames.filter((g) => g.motivators.includes(motivator));
}
