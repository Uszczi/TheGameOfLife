import { type Cell } from "./types";

export type PatternDef = {
  id: string;
  name: string;
  cells: Cell[];
};

export type PatternCategory = {
  id: string;
  name: string;
  hint: string;
  patterns: PatternDef[];
};

export const patternCategories: PatternCategory[] = [
  {
    id: "still-lifes",
    name: "Still lifes",
    hint: "Nic się nie zmienia",
    patterns: [
      {
        id: "block",
        name: "Blok",
        cells: [
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ],
      },
      {
        id: "beehive",
        name: "Ul",
        cells: [
          [1, 0],
          [2, 0],
          [0, 1],
          [3, 1],
          [1, 2],
          [2, 2],
        ],
      },
      {
        id: "loaf",
        name: "Bochenek",
        cells: [
          [1, 0],
          [2, 0],
          [0, 1],
          [3, 1],
          [1, 2],
          [3, 2],
          [2, 3],
        ],
      },
      {
        id: "boat",
        name: "Łódka",
        cells: [
          [0, 0],
          [1, 0],
          [0, 1],
          [2, 1],
          [1, 2],
        ],
      },
    ],
  },
  {
    id: "oscillators",
    name: "Oscylatory",
    hint: "Wraca do siebie co kilka pokoleń",
    patterns: [
      {
        id: "blinker",
        name: "Blinker",
        cells: [
          [0, 0],
          [1, 0],
          [2, 0],
        ],
      },
      {
        id: "toad",
        name: "Ropucha",
        cells: [
          [1, 0],
          [2, 0],
          [3, 0],
          [0, 1],
          [1, 1],
          [2, 1],
        ],
      },
      {
        id: "beacon",
        name: "Latarnia",
        cells: [
          [0, 0],
          [1, 0],
          [0, 1],
          [3, 2],
          [2, 3],
          [3, 3],
        ],
      },
      {
        id: "pentadecathlon",
        name: "Pentadecathlon",
        cells: Array.from({ length: 10 }, (_, x) => [x, 0] as Cell),
      },
      {
        id: "pulsar",
        name: "Pulsar",
        cells: pulsar(),
      },
    ],
  },
  {
    id: "spaceships",
    name: "Statki kosmiczne",
    hint: "Przemieszczają się po planszy",
    patterns: [
      {
        id: "glider",
        name: "Szybowiec",
        cells: [
          [1, 0],
          [2, 1],
          [0, 2],
          [1, 2],
          [2, 2],
        ],
      },
      {
        id: "lwss",
        name: "Lekki statek",
        cells: [
          [1, 0],
          [4, 0],
          [0, 1],
          [0, 2],
          [4, 2],
          [0, 3],
          [1, 3],
          [2, 3],
          [3, 3],
        ],
      },
    ],
  },
  {
    id: "methuselahs",
    name: "Metuzalachy",
    hint: "Długo ewoluują z małego wzoru",
    patterns: [
      {
        id: "rPentomino",
        name: "R-pentomino",
        cells: [
          [1, 0],
          [2, 0],
          [0, 1],
          [1, 1],
          [1, 2],
        ],
      },
      {
        id: "diehard",
        name: "Diehard",
        cells: [
          [6, 0],
          [0, 1],
          [1, 1],
          [1, 2],
          [5, 2],
          [6, 2],
          [7, 2],
        ],
      },
      {
        id: "acorn",
        name: "Żołądź",
        cells: [
          [1, 0],
          [3, 1],
          [0, 2],
          [1, 2],
          [4, 2],
          [5, 2],
          [6, 2],
        ],
      },
    ],
  },
  {
    id: "guns",
    name: "Działa",
    hint: "Produkują szybowce w nieskończoność",
    patterns: [
      {
        id: "gosperGliderGun",
        name: "Działo Gospera",
        cells: [
          [0, 4],
          [0, 5],
          [1, 4],
          [1, 5],
          [10, 4],
          [10, 5],
          [10, 6],
          [11, 3],
          [11, 7],
          [12, 2],
          [12, 8],
          [13, 2],
          [13, 8],
          [14, 5],
          [15, 3],
          [15, 7],
          [16, 4],
          [16, 5],
          [16, 6],
          [17, 5],
          [20, 2],
          [20, 3],
          [20, 4],
          [21, 2],
          [21, 3],
          [21, 4],
          [22, 1],
          [22, 5],
          [24, 0],
          [24, 1],
          [24, 5],
          [24, 6],
          [34, 2],
          [34, 3],
          [35, 2],
          [35, 3],
        ],
      },
    ],
  },
];

export const patterns: Record<string, Cell[]> = Object.fromEntries(
  patternCategories.flatMap((category) =>
    category.patterns.map((pattern) => [pattern.id, pattern.cells]),
  ),
);

function pulsar(): Cell[] {
  const a = [2, 3, 4, 8, 9, 10];
  const b = [0, 5, 7, 12];
  const cells: Cell[] = [];
  for (const y of [0, 5, 7, 12]) a.forEach((x) => cells.push([x, y]));
  for (const y of [2, 3, 4, 8, 9, 10]) b.forEach((x) => cells.push([x, y]));
  return cells;
}
