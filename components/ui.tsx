"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

export const ACCENT = "#d97757";

export function Slide({ chapter, children }: { chapter?: string; children: ReactNode }) {
  return (
    <div className="relative w-full h-full bg-black text-white flex flex-col px-[120px] py-[72px]">
      {chapter && (
        <div className="absolute top-[40px] left-[120px] font-mono text-[18px] tracking-[0.25em] uppercase text-[#8a8a8a]">
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

export type Line = { t: string; c?: "p" | "o" | "h" | "d" | "q" | "a" };

const lineColor = { p: "text-[#e5e5e5]", o: "text-[#c8c8c8]", h: "text-[#d97757]", d: "text-[#7a7a7a]", q: "text-[#f5f5f5]", a: "text-[#e5e5e5]" } as const;

// Shell line like a real prompt: green $ and command word, yellow strings, flags in blue, rest plain.
function Shell({ text }: { text: string }) {
  const m = text.match(/^\$ (\S+)(.*)$/);
  if (!m) return <>{text}</>;
  const parts = m[2].split(/("[^"]*")/g);
  return (
    <>
      <span className="text-[#5fd787]">$ </span>
      <span className="text-[#5fd787]">{m[1]}</span>
      {parts.map((t, i) =>
        t.startsWith('"') ? (
          <span key={i} className="text-[#f0c674]">{t}</span>
        ) : (
          t.split(/(\s-{1,2}[\w-]+)/g).map((u, j) =>
            /^\s-{1,2}[\w-]+$/.test(u) ? <span key={`${i}-${j}`} className="text-[#7aa2f7]">{u}</span> : <span key={`${i}-${j}`}>{u}</span>
          )
        )
      )}
    </>
  );
}

// Interactive answers render markdown: **bold** shows bold, like the real UI.
function Md({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((t, i) =>
        t.startsWith("**") ? <strong key={i} className="font-bold text-white">{t.slice(2, -2)}</strong> : <span key={i}>{t}</span>
      )}
    </>
  );
}

// Terminal block. p = shell command, q = prompt typed in the interactive session (red), a = answer, o = plain output, h = highlighted, d = dimmed.
export function Term({ lines, size = 28 }: { lines: Line[]; size?: number }) {
  return (
    <div
      className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] px-12 py-10 font-mono leading-[1.5] w-fit max-w-full"
      style={{ fontSize: size }}
    >
      {lines.map((l, i) => (
        <div
          key={i}
          className={`whitespace-pre ${lineColor[l.c ?? "o"]} ${l.c === "q" ? "-mx-6 rounded-lg bg-white/10 px-6" : ""}`}
        >
          {l.t ? (l.c === "p" ? <Shell text={l.t} /> : l.c === "a" ? <Md text={l.t} /> : l.t) : "\u00a0"}
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
          <div key={i} className={`whitespace-pre transition-opacity duration-300 ${on ? "text-neutral-100" : "text-[#7a7a7a]"}`}>
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
          style={{ fontSize: size, color: i === active ? "#fafafa" : "#858585" }}
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
    <div style={{ fontSize: size }} className={`font-mono ${dim ? "text-neutral-400" : "text-neutral-100"}`}>
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

// Starts on mount. The person is already gripping the row's left edge. They heave it left in three
// hard pulls with a pause to catch their breath between each, then lets go and wipes their forehead: phew. Every body part is keyframed.
type Pt = [number, number];
type Pose = { S: Pt; head: Pt; legA: [Pt, Pt]; legB: [Pt, Pt]; armF: [Pt, Pt]; armG: [Pt, Pt]; grip: number };
const HIP: Pt = [40, 58];
const stand: Pose = { S: [40, 33], head: [40, 15], legA: [[40, 74], [40, 90]], legB: [[43, 74], [45, 90]], armF: [[38, 46], [37, 58]], armG: [[43, 46], [44, 58]], grip: 0 };
const ready: Pose = { S: [42, 32], head: [44, 15], legA: [[35, 74], [30, 90]], legB: [[46, 74], [50, 90]], armF: [[36, 46], [32, 57]], armG: [[58, 27], [72, 26]], grip: 5 };
const brace: Pose = { S: [32, 36], head: [26, 19], legA: [[28, 76], [18, 90]], legB: [[48, 74], [58, 90]], armF: [[36, 48], [32, 60]], armG: [[52, 32], [72, 26]], grip: 5 };
const pant: Pose = { ...brace, S: [33, 38], head: [29, 25], armF: [[38, 50], [36, 62]] };
const pa: Pose = { S: [31, 36], head: [24, 20], legA: [[25, 76], [12, 90]], legB: [[46, 73], [57, 87]], armF: [[38, 48], [42, 58]], armG: [[52, 32], [72, 26]], grip: 5 };
const pb: Pose = { ...pa, legA: [[46, 73], [57, 87]], legB: [[25, 76], [12, 90]], armF: [[22, 46], [14, 54]] };
const pr: Pose = { S: [28, 37], head: [20, 22], legA: [[22, 76], [8, 90]], legB: [[48, 72], [60, 84]], armF: [[34, 48], [38, 60]], armG: [[50, 33], [72, 26]], grip: 5 };
const pr2: Pose = { ...pr, legA: [[48, 72], [60, 84]], legB: [[22, 76], [8, 90]], armF: [[18, 46], [8, 54]] };
// Relief: let go, shoulders drop, head tilts down, then the free hand wipes the forehead ("phew").
const relief: Pose = { ...stand, S: [41, 34], head: [41, 17], armF: [[30, 28], [33, 19]], armG: [[50, 46], [54, 58]], grip: 0 };
const wipeA: Pose = { ...relief, armF: [[29, 27], [34, 14]] };
const wipeB: Pose = { ...relief, armF: [[30, 25], [41, 9]] };
const rest: Pose = { ...stand, S: [41, 34], head: [41, 17], armG: [[48, 46], [51, 58]] };

const T = 8.8;
const keys: [number, Pose][] = [
  [0, ready], [0.6, brace],
  [0.6, pa], [0.95, pb], [1.3, pa], [1.5, brace],
  [1.9, pant], [2.3, brace],
  [2.3, pb], [2.7, pa], [3.1, pb], [3.3, brace],
  [3.75, pant], [4.2, brace],
  [4.2, pa], [4.7, pb], [5.1, pa], [5.4, pb], [5.62, pr], [5.78, pr2], [5.9, brace],
  [6.3, relief], [6.65, wipeA], [6.9, wipeB], [7.15, wipeA], [7.4, wipeB], [7.65, wipeA], [8.0, rest], [T, stand],
];
const times = keys.map(([t]) => t / T);
const poly = (a: Pt, b: Pt, c: Pt) => `M${a[0]},${a[1]} L${b[0]},${b[1]} L${c[0]},${c[1]}`;
const D = {
  torso: keys.map(([, k]) => poly([k.head[0], k.head[1] + 9], k.S, HIP)),
  legA: keys.map(([, k]) => poly(HIP, k.legA[0], k.legA[1])),
  legB: keys.map(([, k]) => poly(HIP, k.legB[0], k.legB[1])),
  armF: keys.map(([, k]) => poly(k.S, k.armF[0], k.armF[1])),
  armG: keys.map(([, k]) => poly(k.S, k.armG[0], k.armG[1])),
  cx: keys.map(([, k]) => k.head[0]),
  cy: keys.map(([, k]) => k.head[1]),
  gx: keys.map(([, k]) => k.armG[1][0]),
  gy: keys.map(([, k]) => k.armG[1][1]),
  gr: keys.map(([, k]) => k.grip),
};

// Row position (fraction of the start offset) at the end of each hold: stops, then jerks on again.
const rowStops: [number, number][] = [[0, 1], [0.6, 1], [1.5, 0.74], [2.3, 0.74], [3.3, 0.4], [4.2, 0.4], [5.9, 0]];
const heave: [number, number, number, number] = [0.5, 0, 0.3, 1];
// Last pull: starts slow, keeps speeding up, and is moving fastest when it lands.
const accelerate: [number, number, number, number] = [0.75, 0, 0.95, 0.6];

export function DragIn({ children, delay = 0.2, from = 620 }: { children: ReactNode; delay?: number; from?: number }) {
  const body = { delay, duration: T, times, ease: "linear" as const };
  const limb = { fill: "none", stroke: "#fafafa", strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <motion.div
      className="relative inline-block"
      initial={{ x: from, opacity: 0 }}
      animate={{ x: rowStops.map(([, f]) => f * from), opacity: 1 }}
      transition={{
        opacity: { duration: 0.25 },
        x: {
          delay,
          duration: 5.9,
          times: rowStops.map(([t]) => t / 5.9),
          ease: ["linear", heave, "linear", heave, "linear", accelerate],
        },
      }}
    >
      <motion.div
        className="absolute -inset-x-4 -inset-y-1 rounded-xl border-2 border-dashed border-[#d97757]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ delay, duration: 6.3, times: [0, 0.05, 0.92, 1] }}
      />
      <span className="relative z-10">{children}</span>
      <div className="absolute" style={{ right: "calc(100% - 64px)", top: "calc(50% - 18px)" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ delay, duration: T, times: [0, 0.03, 0.93, 1], ease: "linear" }}
        >
          <svg viewBox="0 0 120 100" width={160} height={133} className="drop-shadow-lg overflow-visible">
            <motion.path {...limb} animate={{ d: D.legB }} initial={{ d: D.legB[0] }} transition={body} />
            <motion.path {...limb} animate={{ d: D.armF }} initial={{ d: D.armF[0] }} transition={body} />
            <motion.path {...limb} animate={{ d: D.torso }} initial={{ d: D.torso[0] }} transition={body} />
            <motion.path {...limb} animate={{ d: D.legA }} initial={{ d: D.legA[0] }} transition={body} />
            <motion.path {...limb} stroke="#d97757" animate={{ d: D.armG }} initial={{ d: D.armG[0] }} transition={body} />
            <motion.circle fill="#fafafa" animate={{ cx: D.cx, cy: D.cy }} initial={{ cx: D.cx[0], cy: D.cy[0] }} r={9} transition={body} />
            <motion.circle fill="#d97757" animate={{ cx: D.gx, cy: D.gy, r: D.gr }} initial={{ cx: D.gx[0], cy: D.gy[0], r: 0 }} transition={body} />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}
