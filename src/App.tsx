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
             <svg viewBox="0 0 150 40" className="sai-svg">
               <defs>
                 {/* Ink bleed filter — organic rough edges + ink spread */}
                 <filter id="inkBleed" x="-25%" y="-25%" width="150%" height="150%">
                   {/* Noise for rough texture — low frequency = organic variation */}
                   <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.025"
                    numOctaves="3"
                    seed="3"
                    result="noise"
                   />
                   {/* Displace edges — creates natural brush-stroke roughness */}
                   <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="2.5"
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="roughened"
                   />
                   {/* Ink spread — simulates ink bleeding into paper fibers */}
                   <feGaussianBlur
                    in="roughened"
                    stdDeviation="0.9"
                    result="bleed"
                   />
                   {/* Sharpen the bleed slightly for ink-pooling look */}
                   <feComponentTransfer in="bleed">
                     <feFuncA type="linear" slope="0.25" intercept="0" />
                   </feComponentTransfer>
                   {/* Layer: ink pool behind, rough edges sharp on top */}
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

                 {/* Dry-brush texture for the trail */}
                 <filter id="dryBrush" x="-10%" y="-200%" width="130%" height="500%">
                   <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.06"
                    numOctaves="3"
                    seed="11"
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

                 {/* Wet-brush filter with stronger displacement for the main trail */}
                 <filter id="wetBrush" x="-10%" y="-200%" width="130%" height="500%">
                   <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.03"
                    numOctaves="2"
                    seed="15"
                    result="wetNoise"
                   />
                   <feDisplacementMap
                    in="SourceGraphic"
                    in2="wetNoise"
                    scale="3.0"
                    xChannelSelector="R"
                    yChannelSelector="G"
                   />
                 </filter>

                 {/* Bold ink gradient — very dark at start, fading to near-transparent */}
                 <linearGradient id="boldTrailGrad" x1="0" y1="0" x2="1" y2="0">
                   <stop offset="0%" stop-color="#0a0a0a" stop-opacity="1.0" />
                   <stop offset="20%" stop-color="#111" stop-opacity="0.95" />
                   <stop offset="45%" stop-color="#1a1a1a" stop-opacity="0.8" />
                   <stop offset="70%" stop-color="#222" stop-opacity="0.45" />
                   <stop offset="88%" stop-color="#333" stop-opacity="0.15" />
                   <stop offset="100%" stop-color="#444" stop-opacity="0.0" />
                 </linearGradient>

                 {/* Dark under-layer gradient for wet-edge pooling */}
                 <linearGradient id="trailWetGrad" x1="0" y1="0" x2="1" y2="0">
                   <stop offset="0%" stop-color="#000" stop-opacity="0.35" />
                   <stop offset="30%" stop-color="#111" stop-opacity="0.25" />
                   <stop offset="60%" stop-color="#222" stop-opacity="0.1" />
                   <stop offset="85%" stop-color="#333" stop-opacity="0.02" />
                   <stop offset="100%" stop-color="#000" stop-opacity="0.0" />
                 </linearGradient>

                 {/* Lighter top-layer gradient for brush-body highlight */}
                 <linearGradient id="trailBodyGrad" x1="0" y1="0" x2="1" y2="0">
                   <stop offset="0%" stop-color="#000" stop-opacity="0.6" />
                   <stop offset="25%" stop-color="#1a1a1a" stop-opacity="0.5" />
                   <stop offset="55%" stop-color="#333" stop-opacity="0.2" />
                   <stop offset="80%" stop-color="#444" stop-opacity="0.05" />
                   <stop offset="100%" stop-color="#555" stop-opacity="0.0" />
                 </linearGradient>
               </defs>

               {/* Wet-edge ink pool beneath the text (subtle layering effect) */}
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

               {/* Main ink text with rough brush-stroke edges on top */}
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

               {/* === AGGRESSIVE TRAILING JAPANESE INK STROKE === */}

               {/* 1. Wet-edge underpool — casts shadow/darkness beneath the entire trail */}
               <path
               d="M38,20
                  C42,16.5 48,13.5 56,12
                  C64,10.5 74,9.8 84,10.5
                  C92,11.2 100,13 106,16
                  C110,18 112,20 113,22
                  C112,20.5 110,18.5 107,17
                  C102,14 95,12 86,11.2
                  C76,10.3 66,10.8 57,12.5
                  C50,14.2 43,17 39,19.5
                  C38,20 37.5,20.2 38,20Z"
               fill="url(#trailWetGrad)"
               filter="url(#wetEdge)"
               opacity="0.8"
               />

               {/* 2. Main bold trail body — dark, saturated ink */}
               <path
               d="M38,19.5
                  C42,16 48,13 56,11.5
                  C64,10 74,9.5 84,10.2
                  C92,10.8 100,12.8 106,15.5
                  C110,17.5 112,19.5 113,21.5
                  C112.5,20 111,18.2 108,16.8
                  C104,14.5 97,12.5 88,11.5
                  C78,10.5 68,10.5 58,12
                  C51,13.5 44,16 40,18.5
                  C39,19 38.5,19.3 38,19.5Z"
               fill="url(#boldTrailGrad)"
               filter="url(#wetBrush)"
               opacity="0.92"
               />

               {/* 3. Brush-body highlight — lighter layer on top for depth */}
               <path
               d="M44,17
                  C50,14 58,12 68,11
                  C78,10 88,10.2 96,11.5
                  C102,12.5 107,14 110,16
                  C109,15 107,13.5 104,12.5
                  C98,10.8 90,10.2 82,10.5
                  C72,10.8 63,11.5 55,13
                  C49,14.2 45,15.8 44,17Z"
               fill="url(#trailBodyGrad)"
               filter="url(#dryBrush)"
               opacity="0.7"
               />

               {/* 4. Dry-brush hairs — thin filaments flying off the tail */}
               {/* Top hair */}
               <path
               d="M106,14
                  C110,13 114,12.5 117,13.5
                  C118,14 117.5,14.5 116,14.2
                  C113,13.5 109,13.5 107,14
                  C106,14.2 105.5,13.8 106,14Z"
               fill="#0a0a0a"
               opacity="0.5"
               />

               <path
               d="M108,12.5
                  C112,11.5 116,11 119,12
                  C120,12.3 119.5,13 118,12.8
                  C115,12 111,12 109,12.5
                  C108,12.6 107.5,12.3 108,12.5Z"
               fill="#111"
               opacity="0.35"
               />

               {/* Bottom hair */}
               <path
               d="M107,17
                  C111,16.5 115,16 118,17
                  C119,17.5 118.5,18 117,17.8
                  C114,17.2 110,17 108,17.2
                  C107,17.3 106.5,16.8 107,17Z"
               fill="#0a0a0a"
               opacity="0.45"
               />

               {/* 5. Ink splatter dots at the stroke end — aggressive ink pop */}
               <circle cx="116.5" cy="13" r="1.2" fill="#0a0a0a" opacity="0.5" />
               <circle cx="119.5" cy="14" r="0.8" fill="#111" opacity="0.4" />
               <circle cx="114" cy="15" r="0.6" fill="#0a0a0a" opacity="0.35" />
               <circle cx="118.5" cy="16.5" r="1" fill="#111" opacity="0.3" />
               <circle cx="120" cy="12.5" r="0.5" fill="#0a0a0a" opacity="0.25" />

               {/* 6. Ink pool at the start of the trail — where ink was saturated */}
               <ellipse cx="40" cy="19" rx="6" ry="4" fill="url(#trailWetGrad)" filter="url(#wetEdge)" opacity="0.6" />

               {/* 7. Additional dry-brush texture scattered on the trail body */}
               <path
               d="M72,10.5
                  L73,10 73.5,11.5 L72.5,11.5Z"
               fill="#111"
               opacity="0.4"
               />
               <path
               d="M85,11.5
                  L85.5,10.5 86,12 L85,12Z"
               fill="#0a0a0a"
               opacity="0.35"
               />
               <path
               d="M96,13
                  L96.5,12 97,13.5 L96,13.5Z"
               fill="#111"
               opacity="0.3"
               />
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
