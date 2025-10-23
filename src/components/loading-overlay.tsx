// app/loading-overlay.tsx
"use client";
import { useEffect, useState } from "react";

export default function LoadingOverlay() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Wait until text animation ends, then start fade out
    const fadeTimer = setTimeout(() => setFadeOut(true), 1500); // matches your text animation duration
    // Remove overlay after fade duration
    const removeTimer = setTimeout(() => setShow(false), 1500 + 500); // 500ms fade-out
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 bg-black flex items-center justify-center z-50 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <svg viewBox="0 0 800 120" className="w-3/4 max-w-3xl" xmlns="http://www.w3.org/2000/svg">
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="66"
          fontWeight="bold"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-draw"
        >
          Meindesk Prototype
        </text>
      </svg>

      <style>{`
        .text-draw {
          stroke-dasharray: 1100;
          stroke-dashoffset: 1100;
          animation: drawText 1.5s ease forwards;
        }

        @keyframes drawText {
          0% {
            stroke-dashoffset: 1100;
            opacity: 0.1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
