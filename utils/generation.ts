// utils/generation.ts
export function getGeneration(birthYear: number) {
  if (!birthYear || Number.isNaN(birthYear)) return "Unknown";
  if (birthYear >= 2013) return "Gen Alpha";
  if (birthYear >= 1997) return "Gen Z";
  if (birthYear >= 1981) return "Millennial";
  if (birthYear >= 1965) return "Gen X";
  if (birthYear >= 1946) return "Baby Boomer";
  return "Traditionalist";
}
