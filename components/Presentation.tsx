"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { slides } from "./slides";

const W = 1920;
const H = 1080;

const variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export default function Presentation() {
  const [current, setCurrent] = useState(0);
  const [step, setStep] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [scale, setScale] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const currentRef = useRef(0);
  currentRef.current = current;

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Deep link: #7 or #7.2 opens slide 7 (step 2). Handy for rehearsal.
  useEffect(() => {
    const m = window.location.hash.match(/^#(\d+)(?:\.(\d+))?$/);
    if (m) {
      const n = Math.min(Math.max(parseInt(m[1], 10) - 1, 0), slides.length - 1);
      setCurrent(n);
      setStep(Math.min(parseInt(m[2] ?? "0", 10), (slides[n].steps ?? 1) - 1));
    }
  }, []);

  useEffect(() => {
    if (!timerOn) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [timerOn]);

  const go = useCallback((n: number) => {
    if (n < 0 || n >= slides.length) return;
    setCurrent(n);
    setStep(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const total = slides[current].steps ?? 1;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        if (step < total - 1) setStep((s) => s + 1);
        else go(current + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        if (step > 0) setStep((s) => s - 1);
        else go(current - 1);
      } else if (e.key === "Home") go(0);
      else if (e.key === "End") go(slides.length - 1);
      else if (e.key === "n" || e.key === "N") setShowNotes((v) => !v);
      else if (e.key === "t" || e.key === "T") setTimerOn((v) => !v);
      else if (e.key === "f" || e.key === "F") {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, step, go]);

  const slide = slides[current];

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "center" }} className="relative shrink-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {slide.render(step)}
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-0 left-0 h-[4px] bg-[#d97757]" style={{ width: `${((current + 1) / slides.length) * 100}%` }} />
        <div className="absolute bottom-[18px] right-[40px] font-mono text-[16px] text-neutral-500">
          {current + 1}/{slides.length}
          {timerOn ? `  ${fmt(elapsed)}` : ""}
        </div>
      </div>

      {showNotes && (
        <div className="fixed bottom-0 left-0 right-0 max-h-[38vh] overflow-auto bg-[#111] border-t border-neutral-700 px-10 py-6 text-[20px] leading-relaxed text-neutral-200 z-50">
          <div className="font-mono text-[14px] text-neutral-500 mb-2">
            {slide.id} · {slide.time ?? ""} · N notes · T timer · F fullscreen
          </div>
          {slide.notes}
        </div>
      )}
    </div>
  );
}
