export interface CellXY {
  x: number;
  y: number;
}
export type Cell = [number, number];

export const Key = (x: number, y: number) => `${x},${y}`;
export const fromKey = (cell: string) => cell.split(",").map(Number) as Cell;

export const asKeySet = (array: Array<Cell>) =>
  new Set(array.map(([x, y]) => Key(x, y)));
