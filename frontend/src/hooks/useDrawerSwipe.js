import { useEffect, useRef } from "react";

/** Adds edge-swipe open and directional swipe-close behaviour to a drawer. */
export default function useDrawerSwipe(open, setOpen, side = "left") {
  const start = useRef(null);

  useEffect(() => {
    const onStart = (event) => {
      const touch = event.touches?.[0];
      if (!touch) return;
      start.current = { x: touch.clientX, y: touch.clientY };
    };

    const onEnd = (event) => {
      const touch = event.changedTouches?.[0];
      const origin = start.current;
      start.current = null;
      if (!touch || !origin) return;

      const dx = touch.clientX - origin.x;
      const dy = touch.clientY - origin.y;
      if (Math.abs(dx) < 65 || Math.abs(dx) < Math.abs(dy) * 1.25) return;

      const width = window.innerWidth;
      const edge = 28;
      if (open) {
        const shouldClose = side === "left" ? dx < -65 : dx > 65;
        if (shouldClose) setOpen(false);
        return;
      }

      const shouldOpen = side === "left"
        ? origin.x <= edge && dx > 65
        : origin.x >= width - edge && dx < -65;
      if (shouldOpen) setOpen(true);
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [open, setOpen, side]);
}
