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
           <svg viewBox="0 0 90 32" className="sai-svg">
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
