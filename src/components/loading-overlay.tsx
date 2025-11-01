// app/loading-overlay.tsx
"use client";
import { useEffect, useState } from "react";

export default function LoadingOverlay() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [textAnimationFinished, setTextAnimationFinished] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    // Listen for full page load
    const handlePageLoad = () => setPageLoaded(true);
    if (document.readyState === "complete") {
      setPageLoaded(true);
    } else {
      window.addEventListener("load", handlePageLoad);
    }

    return () => window.removeEventListener("load", handlePageLoad);
  }, []);

  useEffect(() => {
    // Trigger fade-out when BOTH animation finished and page loaded
    if (textAnimationFinished && pageLoaded) {
      setFadeOut(true);
      const timer = setTimeout(() => setShow(false), 500); // match fade-out duration
      return () => clearTimeout(timer);
    }
  }, [textAnimationFinished, pageLoaded]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 bg-black flex items-center justify-center z-50 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <svg
        viewBox="0 0 800 120"
        className="w-3/4 max-w-3xl"
        xmlns="http://www.w3.org/2000/svg"
      >
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
          onAnimationEnd={() => setTextAnimationFinished(true)}
        >
          Meindesk Prototype
        </text>
      </svg>

      <style>{`
        .text-draw {
          stroke-dasharray: 1100;
          stroke-dashoffset: 1100;
          animation: drawText 2s ease forwards;
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
