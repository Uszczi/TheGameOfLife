import { useEffect, useRef, useState, type PointerEvent } from "react";
import "./App.css";
import { PatternSidebar } from "./PatternSidebar";
import { patterns, type PatternDef } from "./patterns";
import { next } from "./life";
import { asKeySet, Key, type Cell, type CellXY } from "./types";

const CELL = 16;
const MIN_SCALE = 0.2;
const MAX_SCALE = 8;

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

function centerOn(cells: Cell[], size: CellXY, scale: number): CellXY {
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
  const cellSize = CELL * scale;
  const width = (maxX - minX + 1) * cellSize;
  const height = (maxY - minY + 1) * cellSize;
  return {
    x: minX * cellSize - (size.x - width) / 2,
    y: minY * cellSize - (size.y - height) / 2,
  };
}

function App() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{
    sx: number;
    sy: number;
    ox: number;
    oy: number;
    moved: boolean;
  } | null>(null);
  const [selectedId, setSelectedId] = useState("blinker");
  const [cells, setCells] = useState(() => asKeySet(patterns.blinker));
  const [fps, setFps] = useState(1);
  const [isRunning, setIsRunning] = useState(true);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<CellXY>({ x: -300, y: -400 });
  const [size, setSize] = useState<CellXY>({ x: 600, y: 800 });
  const scaleRef = useRef(scale);
  const offsetRef = useRef(offset);
  scaleRef.current = scale;
  offsetRef.current = offset;

  const zoomTo = (nextScale: number, mx: number, my: number) => {
    const current = scaleRef.current;
    const next = clampScale(nextScale);
    if (next === current) return;
    const o = offsetRef.current;
    const newOffset = {
      x: ((mx + o.x) / current) * next - mx,
      y: ((my + o.y) / current) * next - my,
    };
    scaleRef.current = next;
    offsetRef.current = newOffset;
    setScale(next);
    setOffset(newOffset);
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ x: Math.max(1, Math.floor(width)), y: Math.max(1, Math.floor(height)) });
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = wrap.getBoundingClientRect();
      zoomTo(
        scaleRef.current * Math.exp(-e.deltaY * 0.0015),
        e.clientX - rect.left,
        e.clientY - rect.top,
      );
    };
    wrap.addEventListener("wheel", onWheel, { passive: false });
    return () => wrap.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(
      () => setCells((prev) => next(prev)),
      1000 / fps,
    );
    return () => clearInterval(interval);
  }, [isRunning, fps]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.x * dpr;
    canvas.height = size.y * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cellSize = CELL * scale;

    ctx.fillStyle = "#eee";
    ctx.fillRect(0, 0, size.x, size.y);

    ctx.fillStyle = "#111827";
    for (const k of cells) {
      const [c, r] = k.split(",").map(Number);
      const x = c * cellSize - offset.x;
      const y = r * cellSize - offset.y;
      if (x + cellSize < 0 || y + cellSize < 0 || x > size.x || y > size.y) continue;
      ctx.fillRect(x, y, cellSize, cellSize);
    }

    if (cellSize >= 4) {
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const sx = -(((offset.x % cellSize) + cellSize) % cellSize);
      const sy = -(((offset.y % cellSize) + cellSize) % cellSize);
      for (let x = sx; x <= size.x; x += cellSize) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, size.y);
      }
      for (let y = sy; y <= size.y; y += cellSize) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(size.x, Math.round(y) + 0.5);
      }
      ctx.stroke();
    }
  }, [size, offset, cells, scale]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    wrapRef.current?.setPointerCapture(e.pointerId);
    drag.current = {
      sx: e.clientX,
      sy: e.clientY,
      ox: offset.x,
      oy: offset.y,
      moved: false,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    if (d.moved) {
      const nextOffset = { x: d.ox - dx, y: d.oy - dy };
      offsetRef.current = nextOffset;
      setOffset(nextOffset);
    }
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    const wrap = wrapRef.current;
    if (!d || d.moved || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const cellSize = CELL * scale;
    const k = Key(
      Math.floor((e.clientX - rect.left + offset.x) / cellSize),
      Math.floor((e.clientY - rect.top + offset.y) / cellSize),
    );
    setCells((prev) => {
      const nextCells = new Set(prev);
      nextCells.has(k) ? nextCells.delete(k) : nextCells.add(k);
      return nextCells;
    });
  };

  const onSelectPattern = (pattern: PatternDef) => {
    setSelectedId(pattern.id);
    setCells(asKeySet(pattern.cells));
    const nextOffset = centerOn(pattern.cells, size, scale);
    offsetRef.current = nextOffset;
    setOffset(nextOffset);
  };

  return (
    <div className="app">
      <PatternSidebar
        selectedId={selectedId}
        fps={fps}
        scale={scale}
        minScale={MIN_SCALE}
        maxScale={MAX_SCALE}
        isRunning={isRunning}
        onSelect={onSelectPattern}
        onFpsChange={setFps}
        onScaleChange={(next) => zoomTo(next, size.x / 2, size.y / 2)}
        onToggleRunning={() => setIsRunning((value) => !value)}
      />
      <div
        ref={wrapRef}
        className="board"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <canvas
          ref={canvasRef}
          style={{ width: size.x, height: size.y, display: "block" }}
        />
      </div>
    </div>
  );
}

export default App;
