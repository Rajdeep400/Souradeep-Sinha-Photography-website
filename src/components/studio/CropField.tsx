'use client';

import { useRef, useState } from 'react';

export type CropValue = { focal: string; zoom: number };

/**
 * WhatsApp-DP style crop editor: the frame matches where the photograph will
 * actually appear, the client drags the image to place faces and can zoom in.
 * Nothing is typed — output is stored as focal position + zoom, and the source
 * file is never re-cropped.
 */
export function CropField({
  src,
  aspect,
  value,
  onChange,
  label,
}: {
  src: string;
  aspect: string;
  value: CropValue;
  onChange: (next: CropValue) => void;
  label: string;
}) {
  const frame = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const parse = (): [number, number] => {
    const [x, y] = (value.focal || '50% 40%').split(/\s+/);
    return [parseFloat(x) || 50, parseFloat(y) || 40];
  };

  const clamp = (n: number) => Math.min(100, Math.max(0, n));

  function move(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging || !frame.current) return;
    const rect = frame.current.getBoundingClientRect();
    const [x, y] = parse();
    // dragging right should reveal more of the left side of the photograph
    const nextX = clamp(x - (event.movementX / rect.width) * 100);
    const nextY = clamp(y - (event.movementY / rect.height) * 100);
    onChange({ ...value, focal: `${Math.round(nextX)}% ${Math.round(nextY)}%` });
  }

  const [x, y] = parse();

  return (
    <div className="mt-2">
      <div
        ref={frame}
        onPointerDown={(event) => {
          (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
          setDragging(true);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerLeave={() => setDragging(false)}
        onPointerMove={move}
        style={{ aspectRatio: aspect }}
        className={`relative w-full max-w-sm touch-none select-none overflow-hidden border border-ink/20 bg-ink/5 ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        role="group"
        aria-label={`${label} — drag the photograph to position it`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          draggable={false}
          className="pointer-events-none h-full w-full object-cover"
          style={{ objectPosition: `${x}% ${y}%`, transform: `scale(${value.zoom || 1})` }}
        />
        <div className="pointer-events-none absolute inset-0 border border-white/40" />
        <p className="pointer-events-none absolute bottom-2 left-2 bg-ink/60 px-2 py-1 text-[10px] uppercase tracking-widest text-bone">
          Drag to position
        </p>
      </div>

      <div className="mt-3 flex max-w-sm items-center gap-3">
        <label className="flex flex-1 items-center gap-2 text-xs text-ink/60">
          Zoom
          <input
            type="range"
            min={1}
            max={2.5}
            step={0.05}
            value={value.zoom || 1}
            onChange={(event) => onChange({ ...value, zoom: Number(event.target.value) })}
            className="w-full"
            aria-label={`${label} zoom`}
          />
        </label>
        <button
          type="button"
          className="text-xs underline"
          onClick={() => onChange({ focal: '50% 40%', zoom: 1 })}
        >
          Reset
        </button>
      </div>
      <p className="mt-1 max-w-sm text-[11px] text-ink/45">
        This frame is exactly what visitors will see. Position faces inside it, then save.
      </p>
    </div>
  );
}
