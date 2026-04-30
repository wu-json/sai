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

            {/* Ink-brush "Sai" — top-left header style */}
            <div className="sai-logo">
              <svg viewBox="0 0 160 44" className="sai-svg">
                <defs>
                  {/* Ink bleed filter — organic rough edges + ink spread */}
                  <filter id="inkBleed" x="-25%" y="-25%" width="150%" height="150%">
                    <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.025"
                    numOctaves="3"
                    seed="3"
                    result="noise"
                    />
                    <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="2.5"
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="roughened"
                    />
                    <feGaussianBlur
                    in="roughened"
                    stdDeviation="0.9"
                    result="bleed"
                    />
                    <feComponentTransfer in="bleed">
                      <feFuncA type="linear" slope="0.25" intercept="0" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode result="bleedLayer" />
                      <feMergeNode in="roughened" />
                    </feMerge>
                  </filter>

                  {/* Wet-edge filter — subtle ink pool beneath the text */}
                  <filter id="wetEdge" x="-15%" y="-15%" width="130%" height="130%">
                    <feMorphology
                    in="SourceGraphic"
                    operator="dilate"
                    radius="0.4"
                    result="expanded"
                    />
                    <feColorMatrix
                    in="expanded"
                    type="matrix"
                    values="
                        0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0 0
                        1.5 0 0 0 0
                      "
                    result="darkSpread"
                    />
                    <feComponentTransfer in="darkSpread">
                      <feFuncA type="linear" slope="0.15" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="darkSpread" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Heavy brush displacement — for the thick trail body */}
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
                    scale="3.5"
                    xChannelSelector="R"
                    yChannelSelector="G"
                    />
                  </filter>

                  {/* Dry-brush texture for hair-line details */}
                  <filter id="dryBrush" x="-10%" y="-200%" width="130%" height="500%">
                    <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.06"
                    numOctaves="3"
                    seed="23"
                    result="dryNoise"
                    />
                    <feDisplacementMap
                    in="SourceGraphic"
                    in2="dryNoise"
                    scale="2.5"
                    xChannelSelector="R"
                    yChannelSelector="G"
                    />
                  </filter>

                  {/* Bold ink gradient — saturated dark, trails off to transparent */}
                  <linearGradient id="boldTrailGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#0a0a0a" stop-opacity="1.0" />
                    <stop offset="15%" stop-color="#111" stop-opacity="0.97" />
                    <stop offset="40%" stop-color="#111" stop-opacity="0.85" />
                    <stop offset="65%" stop-color="#1a1a1a" stop-opacity="0.5" />
                    <stop offset="82%" stop-color="#222" stop-opacity="0.18" />
                    <stop offset="92%" stop-color="#333" stop-opacity="0.05" />
                    <stop offset="100%" stop-color="#444" stop-opacity="0.0" />
                  </linearGradient>

                  {/* Dark under-layer for wet-edge pooling */}
                  <linearGradient id="trailWetGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#000" stop-opacity="0.4" />
                    <stop offset="25%" stop-color="#0a0a0a" stop-opacity="0.25" />
                    <stop offset="55%" stop-color="#1a1a1a" stop-opacity="0.1" />
                    <stop offset="80%" stop-color="#2a2a2a" stop-opacity="0.03" />
                    <stop offset="100%" stop-color="#000" stop-opacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Wet-edge ink pool beneath the text */}
                <text
               className="sai-text"
               x="4"
               y="25"
               filter="url(#wetEdge)"
               style={{
                 fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                 opacity: 0.35,
                  }}
                >
               Sai
                </text>

                {/* Main ink text with rough brush-stroke edges */}
                <text
               className="sai-text"
               x="4"
               y="25"
               filter="url(#inkBleed)"
               style={{
                 fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                  }}
                >
               Sai
                </text>

                {/* === THICK, STRAIGHT TRAILING INK STROKE === */}

                {/* 1. Wet under-pool — casts a dark ink spill beneath */}
                <path
               d="M37,21.5
                  L115,22.5
                  C118,22.6 120,23.5 121,25
                  C120,23.5 117,22 115,21.5
                  L37,19.5
                  C35,19.3 33.5,20 34,21
                  C34.2,21.3 35,21.7 37,21.5Z"
               fill="url(#trailWetGrad)"
               filter="url(#wetEdge)"
               opacity="0.75"
                />

                {/* 2. Main thick trail body — heavy brush press, straight line */}
                <path
               d="M38,20.5
                  L113,21.5
                  C116,21.6 118,22.5 118.5,24
                  C117.5,22.5 115.5,21 113,20.5
                  L38,18.5
                  C36,18.3 34.5,19 35,20
                  C35.2,20.3 36,20.7 38,20.5Z"
               fill="url(#boldTrailGrad)"
               filter="url(#heavyBrush)"
               opacity="0.95"
                />

                {/* 3. Dry-brush layer — lighter highlight running along top edge of trail */}
                <path
               d="M42,19.5
                  L108,20.3
                  C110,20.3 111.5,20.8 112,21.5
                  C111,20.8 109.5,20 108,19.8
                  L42,18.8
                  C40,18.6 39,19 39.5,19.5
                  C39.7,19.7 40,19.6 42,19.5Z"
               fill="url(#boldTrailGrad)"
               filter="url(#dryBrush)"
               opacity="0.55"
                />

                {/* 4. Dry-brush hairs flying off the tail end */}
                <path
               d="M117,19
                  L124,18.5
                  C125.5,18.4 126,18.8 125.5,19.2
                  L117.5,19.8Z"
               fill="#0a0a0a"
               opacity="0.5"
                />
                <path
               d="M118,17.5
                  L126,16.8
                  C127.5,16.7 128,17.2 127.5,17.6
                  L118.5,18.5Z"
               fill="#111"
               opacity="0.35"
                />
                <path
               d="M117,21
                  L125,20.5
                  C126.5,20.4 127,20.8 126.5,21.2
                  L117.5,21.5Z"
               fill="#0a0a0a"
               opacity="0.4"
                />
                <path
               d="M118,22.5
                  L123,22.2
                  C124,22.1 124.5,22.5 124,22.8
                  L118.2,23Z"
               fill="#111"
               opacity="0.3"
                />

                {/* 5. Ink splatter — aggressive flicks at the stroke end */}
                <circle cx="123" cy="17.5" r="1.4" fill="#0a0a0a" opacity="0.55" />
                <circle cx="126" cy="18.5" r="0.9" fill="#111" opacity="0.4" />
                <circle cx="121" cy="19" r="0.7" fill="#0a0a0a" opacity="0.45" />
                <circle cx="127" cy="20" r="1.1" fill="#111" opacity="0.35" />
                <circle cx="128.5" cy="17" r="0.5" fill="#0a0a0a" opacity="0.3" />
                <circle cx="124.5" cy="21.5" r="0.6" fill="#222" opacity="0.25" />
                <circle cx="119" cy="16.5" r="0.8" fill="#111" opacity="0.3" />

                {/* 6. Ink pool at the stroke origin — saturated start */}
                <ellipse cx="39" cy="19.5" rx="7" ry="5" fill="url(#trailWetGrad)" filter="url(#wetEdge)" opacity="0.65" />

                {/* 7. Scattered dry-brush texture marks along the trail body */}
                <path d="M60,18.8 L61,18 61.5,20 L60.2,19.8Z" fill="#0a0a0a" opacity="0.4" />
                <path d="M75,18.5 L75.8,17.5 76.2,19.5 L75.2,19.5Z" fill="#111" opacity="0.35" />
                <path d="M90,18.2 L90.8,17.2 91.2,19.2 L90.2,19.2Z" fill="#0a0a0a" opacity="0.3" />
                <path d="M102,18 L102.5,17 103,19 L102.2,19Z" fill="#111" opacity="0.25" />
                <path d="M110,17.8 L110.5,16.8 111,18.5 L110.2,18.2Z" fill="#0a0a0a" opacity="0.35" />
                </svg>

              {/* Subtle ink splatter dots — organic detail */}
              <div className="sai-dots">
                <div className="sai-dot" />
                <div className="sai-dot" />
                <div className="sai-dot" />
                <div className="sai-dot" />
                <div className="sai-dot" />
              </div>
            </div>
          </>
        );
}
