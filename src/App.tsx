import { useEffect, useRef } from "react";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Resize the canvas to its container, accounting for devicePixelRatio
  // so that future drawing stays crisp.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="stage">
      <div className="scroll" role="img" aria-label="Japanese hanging scroll">
        <Roller position="top" />

        <div className="scroll__paper">
          <div className="scroll__inkframe">
            <canvas ref={canvasRef} className="scroll__canvas" />
          </div>
        </div>

        <Roller position="bottom" />
      </div>
    </div>
  );
}

function Roller({ position }: { position: "top" | "bottom" }) {
  return (
    <div className={`roller roller--${position}`}>
      <span className="roller__cap roller__cap--left" />
      <span className="roller__bar" />
      <span className="roller__cap roller__cap--right" />
    </div>
  );
}
