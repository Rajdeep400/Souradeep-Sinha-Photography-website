'use client';

import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

export type CropValue = {
  focal: string;
  zoom: number;
};

type DragStart = {
  pointerX: number;
  pointerY: number;
  focalX: number;
  focalY: number;
};

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
  const frameRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<DragStart | null>(null);

  const [dragging, setDragging] = useState(false);

  function clamp(value: number) {
    return Math.min(100, Math.max(0, value));
  }

  function parseFocal(focal: string): [number, number] {
    const [rawX, rawY] = (focal || '50% 40%').trim().split(/\s+/);

    const parsedX = Number.parseFloat(rawX);
    const parsedY = Number.parseFloat(rawY);

    // IMPORTANT:
    // Do NOT use "parseFloat(...) || 50".
    // 0 is a valid crop position and must remain 0.
    const x = Number.isFinite(parsedX) ? parsedX : 50;
    const y = Number.isFinite(parsedY) ? parsedY : 40;

    return [clamp(x), clamp(y)];
  }

  const [x, y] = parseFocal(value.focal);
  const zoom = Math.max(1, Number(value.zoom) || 1);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const [currentX, currentY] = parseFocal(value.focal);

    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      focalX: currentX,
      focalY: currentY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const frame = frameRef.current;
    const start = dragStartRef.current;

    if (!dragging || !frame || !start) {
      return;
    }

    const rect = frame.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    const deltaX = event.clientX - start.pointerX;
    const deltaY = event.clientY - start.pointerY;

    /*
     * Dragging the photograph right means we want to reveal
     * more of the photograph's LEFT side, therefore focal X decreases.
     *
     * Dragging down reveals more of the TOP, therefore focal Y decreases.
     */
    const nextX = clamp(
      start.focalX - (deltaX / rect.width) * 100,
    );

    const nextY = clamp(
      start.focalY - (deltaY / rect.height) * 100,
    );

    onChange({
      ...value,
      focal: `${nextX.toFixed(1)}% ${nextY.toFixed(1)}%`,
    });
  }

  function stopDragging(event: ReactPointerEvent<HTMLDivElement>) {
    if (
      event.currentTarget.hasPointerCapture?.(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStartRef.current = null;
    setDragging(false);
  }

  return (
    <div className="mt-2">
      <div
        ref={frameRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        style={{
          aspectRatio: aspect,
        }}
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
          style={{
            objectPosition: `${x}% ${y}%`,
            transform: `scale(${zoom})`,
            transformOrigin: `${x}% ${y}%`,
            willChange: 'transform, object-position',
          }}
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
            value={zoom}
            onChange={(event) =>
              onChange({
                ...value,
                zoom: Number(event.target.value),
              })
            }
            className="w-full"
            aria-label={`${label} zoom`}
          />
        </label>

        <button
          type="button"
          className="text-xs underline"
          onClick={() =>
            onChange({
              focal: '50% 40%',
              zoom: 1,
            })
          }
        >
          Reset
        </button>
      </div>

      <p className="mt-1 max-w-sm text-[11px] text-ink/45">
        Drag left, right, up or down. Zoom when you need a tighter crop.
      </p>
    </div>
  );
}