import { fromKey, Key } from "./types";

export function next(cells: Set<string>) {
  const counts = new Map<string, number>();

  for (let cell of cells) {
    const [x, y] = fromKey(cell);

    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        if (dx === 0 && dy === 0) continue;
        const key = Key(x + dx, y + dy);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
  }

  const next = new Set<string>();
  for (const [k, n] of counts) {
    if (n === 3 || (n === 2 && cells.has(k))) next.add(k);
  }

  return next;
}
