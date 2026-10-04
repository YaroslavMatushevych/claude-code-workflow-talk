"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

export const ACCENT = "#d97757";

export function Slide({ chapter, children }: { chapter?: string; children: ReactNode }) {
  return (
    <div className="relative w-full h-full bg-black text-white flex flex-col px-[120px] py-[72px]">
      {chapter && (
        <div className="absolute top-[40px] left-[120px] font-mono text-[18px] tracking-[0.25em] uppercase text-neutral-600">
          {chapter}
        </div>
      )}
      <div className="flex-1 flex flex-col justify-center">{children}</div>
    </div>
  );
}

export function Title({ children, size = 84 }: { children: ReactNode; size?: number }) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ fontSize: size }}
      className="font-bold tracking-tight leading-[1.05]"
    >
      {children}
    </motion.h1>
  );
}

// Exclusive reveal: one block on screen, swapped per step.
export function Swap({ k, children }: { k: number | string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={k}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{ duration: 0.22 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export type Line = { t: string; c?: "p" | "o" | "h" | "d" };

const lineColor = { p: "text-white", o: "text-neutral-400", h: "text-[#d97757]", d: "text-neutral-700" } as const;

// Terminal block. p = command, o = output, h = highlighted, d = dimmed.
export function Term({ lines, size = 28 }: { lines: Line[]; size?: number }) {
  return (
    <div
      className="rounded-2xl border border-neutral-800 bg-[#080808] px-12 py-10 font-mono leading-[1.5] w-fit max-w-full"
      style={{ fontSize: size }}
    >
      {lines.map((l, i) => (
        <div key={i} className={`whitespace-pre ${lineColor[l.c ?? "o"]}`}>
          {l.t}
        </div>
      ))}
    </div>
  );
}

// Code block. Lines outside `hl` dim, so one chunk stays in focus.
export function Code({ text, hl, size = 24 }: { text: string; hl?: [number, number]; size?: number }) {
  const lines = text.split("\n");
  return (
    <div
      className="rounded-2xl border border-neutral-800 bg-[#080808] px-12 py-9 font-mono leading-[1.5] w-fit max-w-full"
      style={{ fontSize: size }}
    >
      {lines.map((l, i) => {
        const on = !hl || (i + 1 >= hl[0] && i + 1 <= hl[1]);
        return (
          <div key={i} className={`whitespace-pre transition-opacity duration-300 ${on ? "text-neutral-100" : "text-neutral-700"}`}>
            {l || " "}
          </div>
        );
      })}
    </div>
  );
}

// Rows with one highlighted, rest dimmed (the timeline pattern).
export function Rows({ rows, active, size = 56 }: { rows: ReactNode[]; active: number; size?: number }) {
  return (
    <div className="flex flex-col gap-6">
      {rows.map((r, i) => (
        <div
          key={i}
          style={{ fontSize: size, color: i === active ? "#fafafa" : "#5c5c5c" }}
          className="font-bold tracking-tight transition-colors duration-300"
        >
          {r}
        </div>
      ))}
    </div>
  );
}

export function Big({ children, size = 220, accent = true }: { children: ReactNode; size?: number; accent?: boolean }) {
  return (
    <div style={{ fontSize: size, color: accent ? ACCENT : "#fafafa" }} className="font-bold tracking-tighter leading-none">
      {children}
    </div>
  );
}

export function Mono({ children, size = 40, dim }: { children: ReactNode; size?: number; dim?: boolean }) {
  return (
    <div style={{ fontSize: size }} className={`font-mono ${dim ? "text-neutral-500" : "text-neutral-100"}`}>
      {children}
    </div>
  );
}

export function Cap({ children, size = 30 }: { children: ReactNode; size?: number }) {
  return (
    <div style={{ fontSize: size }} className="text-neutral-400 mt-6">
      {children}
    </div>
  );
}
