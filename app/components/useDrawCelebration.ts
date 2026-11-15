"use client";

import { useCallback, useEffect, useRef } from "react";

type Celebration = {
  timers: number[];
  canvas?: HTMLCanvasElement;
  reset?: () => void;
};

/** An isolated celebration canvas, so a reset or new draw can stop the show. */
export default function useDrawCelebration() {
  const active = useRef<Celebration | null>(null);

  const stopCelebration = useCallback(() => {
    const show = active.current;
    active.current = null;
    if (!show) return;
    show.timers.forEach(window.clearTimeout);
    show.reset?.();
    show.canvas?.remove();
  }, []);

  useEffect(() => stopCelebration, [stopCelebration]);

  const celebrate = useCallback((finale = false) => {
    stopCelebration();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const show: Celebration = { timers: [] };
    active.current = show;

    void import("canvas-confetti").then((mod) => {
      if (active.current !== show) return;
      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      Object.assign(canvas.style, {
        position: "fixed", inset: "0", width: "100%", height: "100%",
        pointerEvents: "none", zIndex: "1450",
      });
      document.body.appendChild(canvas);
      show.canvas = canvas;
      const confetti = (mod.default ?? mod).create(canvas, { resize: true, useWorker: true });
      show.reset = () => confetti.reset();
      const compact = window.innerWidth < 600;
      const count = (n: number) => Math.round(n * (compact ? 0.55 : 1));
      const colors = ["#C4B5FD", "#A78BFA", "#6EE7B7", "#67E8F9", "#FFE8A3", "#FFFFFF"];
      const schedule = (delay: number, action: () => void) => {
        show.timers.push(window.setTimeout(() => {
          if (active.current === show) action();
        }, delay));
      };
      const burst = (x: number, y: number, color: string) => {
        // Fast outer stars and a slower, shimmering inner cloud.
        confetti({ particleCount: count(65), origin: { x, y }, spread: 360,
          startVelocity: 32, gravity: 0.45, decay: 0.94, ticks: 110,
          scalar: 1.15, shapes: ["star"], colors: [color, "#FFFFFF"], disableForReducedMotion: true });
        confetti({ particleCount: count(35), origin: { x, y }, spread: 360,
          startVelocity: 17, gravity: 0.3, decay: 0.93, ticks: 100,
          scalar: 0.65, shapes: ["circle"], colors: [color, "#FFE8A3"], disableForReducedMotion: true });
      };
      const cannons = (particles: number, velocity: number) => {
        [0, 1].forEach(x => confetti({ particleCount: count(particles),
          origin: { x, y: 0.88 }, angle: x === 0 ? 58 : 122, spread: 48,
          startVelocity: velocity, gravity: 0.85, ticks: 180, scalar: 1,
          colors, disableForReducedMotion: true }));
      };

      // A reveal hit, alternating aerial fireworks, then a paired finale.
      cannons(80, 58);
      schedule(180, () => burst(0.22, 0.24, "#C4B5FD"));
      schedule(480, () => burst(0.78, 0.22, "#6EE7B7"));
      schedule(850, () => burst(0.5, 0.15, "#FFE8A3"));
      schedule(1250, () => burst(0.15, 0.34, "#67E8F9"));
      schedule(1550, () => burst(0.85, 0.3, "#A78BFA"));
      schedule(1950, () => {
        burst(0.3, 0.2, "#FFE8A3");
        burst(0.7, 0.2, "#C4B5FD");
        cannons(finale ? 130 : 65, 48);
      });
      if (finale) {
        schedule(2500, () => burst(0.5, 0.12, "#6EE7B7"));
        schedule(2850, () => cannons(100, 64));
      }
      schedule(finale ? 8500 : 7500, stopCelebration);
    }).catch(() => {
      if (active.current === show) stopCelebration();
    });
  }, [stopCelebration]);

  return { celebrate, stopCelebration };
}
