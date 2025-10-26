// Map your generations to Audius genres for "For Your Generation" row
export type Generation = "Gen Alpha" | "Gen Z" | "Millennial" | "Gen X" | "Boomer" | "Silent";

export function genresForGeneration(gen: Generation): string[] {
  switch (gen) {
    case "Gen Alpha":
      return ["Electronic", "Pop", "Hip-Hop/Rap"];
    case "Gen Z":
      return ["Hip-Hop/Rap", "Pop", "Electronic"];
    case "Millennial":
      return ["Pop", "R&B/Soul", "Electronic", "Alternative"];
    case "Gen X":
      return ["Rock", "Alternative", "R&B/Soul"];
    case "Boomer":
      return ["Rock", "Jazz", "Blues"];
    case "Silent":
      return ["Jazz", "Classical", "Blues"];
    default:
      return ["Pop", "Electronic", "Hip-Hop/Rap"];
  }
}
