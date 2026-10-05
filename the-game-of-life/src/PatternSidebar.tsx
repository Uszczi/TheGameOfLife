import { useState } from "react";
import { patternCategories, type PatternDef } from "./patterns";
import type { Cell } from "./types";

type Props = {
  selectedId: string | null;
  fps: number;
  scale: number;
  minScale: number;
  maxScale: number;
  isRunning: boolean;
  onSelect: (pattern: PatternDef) => void;
  onFpsChange: (fps: number) => void;
  onScaleChange: (scale: number) => void;
  onToggleRunning: () => void;
};

function scaleToSlider(scale: number, min: number, max: number) {
  return Math.round((Math.log(scale / min) / Math.log(max / min)) * 100);
}

function sliderToScale(value: number, min: number, max: number) {
  return min * (max / min) ** (value / 100);
}

function formatScale(scale: number) {
  return `${scale < 1 ? scale.toFixed(2) : scale.toFixed(1)}×`;
}

export function PatternSidebar({
  selectedId,
  fps,
  scale,
  minScale,
  maxScale,
  isRunning,
  onSelect,
  onFpsChange,
  onScaleChange,
  onToggleRunning,
}: Props) {
  const [open, setOpen] = useState(true);

  return (
    <aside className={`pattern-sidebar ${open ? "is-open" : "is-collapsed"}`}>
      <div className="pattern-sidebar__bar">
        {open ? <h2>Wzorce</h2> : <span className="pattern-sidebar__spine">Wzorce</span>}
        <button
          type="button"
          className="pattern-sidebar__toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          title={open ? "Zwiń listę wzorców" : "Rozwiń listę wzorców"}
        >
          {open ? "‹" : "›"}
        </button>
      </div>

      {open && (
        <nav className="pattern-sidebar__nav" aria-label="Wzorce gry w życie">
          {patternCategories.map((category) => (
            <details key={category.id} className="pattern-group" open>
              <summary>
                <span className="pattern-group__title">
                  <span className="pattern-group__name">{category.name}</span>
                  <span className="pattern-group__hint">{category.hint}</span>
                </span>
                <span className="pattern-group__count">{category.patterns.length}</span>
              </summary>
              <ul>
                {category.patterns.map((pattern) => (
                  <li key={pattern.id}>
                    <button
                      type="button"
                      className={selectedId === pattern.id ? "is-selected" : undefined}
                      onClick={() => onSelect(pattern)}
                    >
                      <PatternPreview cells={pattern.cells} />
                      <span>{pattern.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </nav>
      )}

      {open && (
        <div className="sidebar-controls">
          <button
            type="button"
            className={`run-toggle ${isRunning ? "is-running" : ""}`}
            onClick={onToggleRunning}
          >
            {isRunning ? "Stop" : "Start"}
          </button>
          <label className="sidebar-control">
            <span className="sidebar-control__label">
              FPS
              <strong>{fps}</strong>
            </span>
            <input
              type="range"
              min={1}
              max={60}
              value={fps}
              onChange={(e) => onFpsChange(Number(e.target.value))}
            />
          </label>
          <label className="sidebar-control">
            <span className="sidebar-control__label">
              Zoom
              <strong>{formatScale(scale)}</strong>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={scaleToSlider(scale, minScale, maxScale)}
              onChange={(e) =>
                onScaleChange(sliderToScale(Number(e.target.value), minScale, maxScale))
              }
            />
          </label>
        </div>
      )}
    </aside>
  );
}

function PatternPreview({ cells }: { cells: Cell[] }) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of cells) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const pad = 1;

  return (
    <svg
      className="pattern-preview"
      viewBox={`0 0 ${width + pad * 2} ${height + pad * 2}`}
      aria-hidden
    >
      {cells.map(([x, y], i) => (
        <rect
          key={i}
          x={x - minX + pad}
          y={y - minY + pad}
          width={0.92}
          height={0.92}
        />
      ))}
    </svg>
  );
}
