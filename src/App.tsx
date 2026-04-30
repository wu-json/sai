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
          <>
            <canvas ref={canvasRef} className="canvas" />

            {/* Ink-brush "Sai" — sumi-e style custom brush-stroke paths */}
            <div className="sai-logo">
              <svg viewBox="0 0 175 50" className="sai-svg">
                <defs>
                  {/* Ink bleed — organic rough edges + ink spread */}
                  <filter id="inkBleed" x="-30%" y="-30%" width="160%" height="160%">
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.025"
                      numOctaves="4"
                      seed="3"
                      result="noise"
                    />
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="noise"
                      scale="3.5"
                      xChannelSelector="R"
                      yChannelSelector="G"
                      result="roughened"
                    />
                    <feGaussianBlur
                      in="roughened"
                      stdDeviation="0.8"
                      result="bleed"
                    />
                    <feComponentTransfer in="bleed">
                      <feFuncA type="linear" slope="0.2" intercept="0" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode result="bleedLayer" />
                      <feMergeNode in="roughened" />
                    </feMerge>
                  </filter>

                  {/* Wet-edge — ink pool / spread underneath strokes */}
                  <filter id="wetEdge" x="-20%" y="-20%" width="140%" height="140%">
                    <feMorphology
                      in="SourceGraphic"
                      operator="dilate"
                      radius="0.6"
                      result="expanded"
                    />
                    <feColorMatrix
                      in="expanded"
                      type="matrix"
                      values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   2 0 0 0 0"
                      result="darkSpread"
                    />
                    <feComponentTransfer in="darkSpread">
                      <feFuncA type="linear" slope="0.12" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="darkSpread" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Heavy brush displacement — thick stroke texture */}
                  <filter id="heavyBrush" x="-10%" y="-150%" width="120%" height="400%">
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.035"
                      numOctaves="3"
                      seed="19"
                      result="heavyNoise"
                    />
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="heavyNoise"
                      scale="4"
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>

                  {/* Dry-brush — hair-line texture for tails and highlights */}
                  <filter id="dryBrush" x="-10%" y="-200%" width="130%" height="500%">
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.07"
                      numOctaves="3"
                      seed="23"
                      result="dryNoise"
                    />
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="dryNoise"
                      scale="3"
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>

                  {/* Torn-edge — aggressive ragged edges */}
                  <filter id="tornEdge" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.04"
                      numOctaves="4"
                      seed="7"
                      result="noise"
                    />
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="noise"
                      scale="3"
                      xChannelSelector="R"
                      yChannelSelector="G"
                      result="displaced"
                    />
                    <feGaussianBlur in="displaced" stdDeviation="0.4" result="blurred" />
                    <feComponentTransfer in="blurred">
                      <feFuncA type="linear" slope="1.3" intercept="-0.08" />
                    </feComponentTransfer>
                  </filter>

                  {/* Bold ink gradient — fades out for trailing stroke */}
                  <linearGradient id="trailGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#0a0a0a" stop-opacity="1" />
                    <stop offset="30%" stop-color="#111" stop-opacity="0.9" />
                    <stop offset="55%" stop-color="#1a1a1a" stop-opacity="0.55" />
                    <stop offset="75%" stop-color="#222" stop-opacity="0.2" />
                    <stop offset="100%" stop-color="#444" stop-opacity="0" />
                  </linearGradient>

                  {/* Wet under-pool gradient */}
                  <linearGradient id="wetGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#000" stop-opacity="0.35" />
                    <stop offset="35%" stop-color="#0a0a0a" stop-opacity="0.2" />
                    <stop offset="70%" stop-color="#1a1a1a" stop-opacity="0.06" />
                    <stop offset="100%" stop-color="#000" stop-opacity="0" />
                  </linearGradient>
                </defs>

                {/* ============== S LETTER ============== */}

                {/* S — wet under-pool */}
                <path
                  d="M 8,10 C 18,4 30,5 34,12 C 38,18 36,26 30,31 C 24,36 14,38 8,38 C 5,38 3,36 4,34"
                  fill="none" stroke="#000" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"
                  opacity="0.18" filter="url(#wetEdge)"
                />

                {/* S — main brush stroke */}
                <path
                  d="M 8,10 C 18,4 30,5 34,12 C 38,18 36,26 30,31 C 24,36 14,38 8,38 C 5,38 3,36 4,34"
                  fill="none" stroke="#111" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"
                  opacity="0.93" filter="url(#tornEdge)"
                />

                {/* S — dry-brush highlight */}
                <path
                  d="M 8,10 C 18,4 30,5 34,12 C 38,18 36,26 30,31 C 24,36 14,38 8,38"
                  fill="none" stroke="#222" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                  opacity="0.35" filter="url(#dryBrush)"
                />

                {/* S — ink pool at brush-down (top-left) */}
                <ellipse cx="9" cy="10" rx="6" ry="5.5" fill="#111" opacity="0.85" filter="url(#inkBleed)" />
                <ellipse cx="9" cy="10" rx="8" ry="7" fill="#000" opacity="0.12" filter="url(#wetEdge)" />

                {/* S — ink pool at bottom curve (brush press) */}
                <ellipse cx="8" cy="37" rx="5" ry="4" fill="#111" opacity="0.4" filter="url(#wetEdge)" />

                {/* ============== A LETTER ============== */}

                {/* a — wet under-pool */}
                <path
                  d="M 42,34 C 44,20 50,16 56,21 C 60,26 58,34 52,36 C 47,38 43,36 42,34"
                  fill="none" stroke="#000" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"
                  opacity="0.18" filter="url(#wetEdge)"
                />

                {/* a — main brush stroke */}
                <path
                  d="M 42,34 C 44,20 50,16 56,21 C 60,26 58,34 52,36 C 47,38 43,36 42,34"
                  fill="none" stroke="#111" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"
                  opacity="0.93" filter="url(#tornEdge)"
                />

                {/* a — dry-brush highlight */}
                <path
                  d="M 42,34 C 44,20 50,16 56,21 C 60,26 58,34 52,36"
                  fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  opacity="0.3" filter="url(#dryBrush)"
                />

                {/* a — ink pool at brush-down */}
                <ellipse cx="42" cy="34" rx="4" ry="3.5" fill="#111" opacity="0.35" filter="url(#wetEdge)" />

                {/* a — tail flick */}
                <path
                  d="M 52,36 C 54,39 58,37 60,32"
                  fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round"
                  opacity="0.85" filter="url(#dryBrush)"
                />

                {/* ============== I DOT ============== */}

                {/* i — wet under-pool */}
                <ellipse cx="66" cy="14" rx="5.5" ry="6" fill="#000" opacity="0.12" filter="url(#wetEdge)" />

                {/* i — main ink splat */}
                <ellipse cx="66" cy="14" rx="4" ry="4.5" fill="#111" opacity="0.9" filter="url(#inkBleed)" />

                {/* i — dry highlight */}
                <ellipse cx="65.5" cy="13.5" rx="2" ry="2" fill="#333" opacity="0.25" filter="url(#dryBrush)" />

                {/* ============== TRAILING STROKE ============== */}

                {/* Trail — wet under-layer */}
                <path
                  d="M 57,34 Q 72,35 83,32"
                  fill="none" stroke="#000" stroke-width="8" stroke-linecap="round"
                  opacity="0.15" filter="url(#wetEdge)"
                />

                {/* Trail — main body (short, thick, tapers via gradient) */}
                <path
                  d="M 57,34 Q 70,34.5 80,32"
                  fill="none" stroke="url(#trailGrad)" stroke-width="5" stroke-linecap="round"
                  opacity="0.92" filter="url(#heavyBrush)"
                />

                {/* Trail — dry-brush highlight on top edge */}
                <path
                  d="M 57,33 Q 69,33.5 78,31.5"
                  fill="none" stroke="#222" stroke-width="1.5" stroke-linecap="round"
                  opacity="0.4" filter="url(#dryBrush)"
                />

                {/* Trail — dry-brush flicks at the tail */}
                <path d="M 80,31 L 87,28" fill="none" stroke="#111" stroke-width="1.5" stroke-linecap="round" opacity="0.4" filter="url(#dryBrush)" />
                <path d="M 81,33.5 L 86,35" fill="none" stroke="#111" stroke-width="1.2" stroke-linecap="round" opacity="0.3" filter="url(#dryBrush)" />
                <path d="M 79,30 L 84,27.5" fill="none" stroke="#222" stroke-width="1" stroke-linecap="round" opacity="0.25" filter="url(#dryBrush)" />
                <path d="M 82,32.5 L 85,33" fill="none" stroke="#0a0a0a" stroke-width="1.8" stroke-linecap="round" opacity="0.2" filter="url(#dryBrush)" />

                {/* Trail — subtle ink pool at the start */}
                <ellipse cx="57" cy="34" rx="5" ry="3.5" fill="url(#wetGrad)" filter="url(#wetEdge)" opacity="0.5" />

                {/* ============== INK SPLATTERS ============== */}

                {/* Tail-end splatter */}
                <circle cx="83" cy="26" r="1.4" fill="#0a0a0a" opacity="0.45" />
                <circle cx="86" cy="30" r="1" fill="#111" opacity="0.35" />
                <circle cx="88" cy="33" r="0.7" fill="#0a0a0a" opacity="0.25" />
                <circle cx="85" cy="25" r="0.6" fill="#222" opacity="0.2" />
                <circle cx="82" cy="28" r="0.9" fill="#111" opacity="0.3" />
                <circle cx="87" cy="36" r="0.5" fill="#1a1a1a" opacity="0.15" />
                <circle cx="79" cy="26.5" r="0.7" fill="#0a0a0a" opacity="0.25" />

                {/* Scatter flecks along the trail body */}
                <path d="M 63,33.5 L 63.5,32.5 64,34.5 63.2,34Z" fill="#0a0a0a" opacity="0.3" />
                <path d="M 70,33 L 70.5,32 71,34 70.2,33.5Z" fill="#111" opacity="0.25" />
                <path d="M 76,32 L 76.5,31 77,33 76.2,32.5Z" fill="#0a0a0a" opacity="0.2" />

                {/* Ambient ink mist — tiny faint dots around the logo */}
                <circle cx="15" cy="6" r="0.4" fill="#1a1a1a" opacity="0.12" />
                <circle cx="35" cy="14" r="0.3" fill="#222" opacity="0.1" />
                <circle cx="50" cy="14" r="0.5" fill="#1a1a1a" opacity="0.08" />
                <circle cx="72" cy="12" r="0.3" fill="#333" opacity="0.1" />
                <circle cx="25" cy="41" r="0.4" fill="#1a1a1a" opacity="0.1" />
                <circle cx="90" cy="30" r="0.3" fill="#333" opacity="0.08" />
              </svg>
            </div>
          </>
        );
}
