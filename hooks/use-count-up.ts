"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Animate a number toward `target` whenever it changes (~600ms, brand easing).
 * Respects prefers-reduced-motion by snapping to the value.
 * Returns the current rounded display value.
 */
export function useCountUp(target: number, duration = 0.6): number {
  const reduce = useReducedMotion();
  const mv = useMotionValue(target);
  const [display, setDisplay] = useState(target);
  const first = useRef(true);

  useEffect(() => {
    if (reduce || first.current) {
      first.current = false;
      mv.set(target);
      setDisplay(target);
      return;
    }
    const controls: AnimationPlaybackControls = animate(mv, target, {
      duration,
      ease: EASE,
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [target, duration, reduce, mv]);

  return display;
}
