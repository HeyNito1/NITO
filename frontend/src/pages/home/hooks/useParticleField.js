import { useEffect, useRef } from "react";

// Original procedural animation: a gently deforming particle sphere.
// No WebGL dependency; pauses offscreen and honors reduced-motion settings.
export function useParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const points = Array.from({ length: 6800 }, (_, i) => {
      const y = 1 - (i / 6799) * 2;
      const angle = i * Math.PI * (3 - Math.sqrt(5));
      const ring = Math.sqrt(1 - y * y);
      return {
        x: Math.cos(angle) * ring,
        y,
        z: Math.sin(angle) * ring,
        seed: i * 0.617,
      };
    });
    let size = 0;
    let frame = 0;
    let visible = true;
    let lastTime = 0;
    let disposed = false;
    const draw = (time) => {
      context.clearRect(0, 0, size, size);
      const phase = media.matches ? 0 : time * 0.0001;
      const turn = phase * 0.24;
      const radius = size * 0.435;
      for (const point of points) {
        const wave =
          1 +
          0.035 * Math.sin(point.y * 17 + phase) +
          0.03 * Math.cos(point.seed + phase * 2);
        const x = (point.x * Math.cos(turn) + point.z * Math.sin(turn)) * wave;
        const z = point.z * Math.cos(turn) - point.x * Math.sin(turn);
        const y = point.y * wave;
        const edge = Math.sqrt(Math.max(0, 1 - z * z));
        const opacity =
          0.035 + Math.pow(edge, 8) * 0.58 + Math.max(0, z) * 0.08;
        const dot = Math.max(0.45, (size / 700) * (0.65 + (z + 1) * 0.48));
        context.beginPath();
        context.fillStyle = `rgba(235,240,244,${opacity})`;
        context.arc(
          size / 2 + x * radius,
          size / 2 + y * radius,
          dot,
          0,
          Math.PI * 2,
        );
        context.fill();
      }
    };
    const tick = (time) => {
      frame = 0;
      if (disposed || !visible || document.hidden || media.matches) return;
      if (time - lastTime >= 40) {
        draw(time);
        lastTime = time;
      }
      frame = requestAnimationFrame(tick);
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (disposed) return;
      draw(performance.now());
      if (visible && !document.hidden && !media.matches)
        frame = requestAnimationFrame(tick);
    };
    const resize = new ResizeObserver((entries) => {
      size = entries[0].contentRect.width;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * scale;
      canvas.height = size * scale;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      resume();
    });
    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      resume();
    });
    resize.observe(canvas);
    intersection.observe(canvas);
    media.addEventListener("change", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      media.removeEventListener("change", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, []);
  return canvasRef;
}
