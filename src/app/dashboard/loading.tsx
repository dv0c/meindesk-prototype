// app/loading.tsx
const Loading = () => {
  return (
    <main className="relative flex items-center justify-center h-screen w-screen bg-black overflow-hidden">
      {/* Top/Bottom fade mask */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

      {/* SVG Text */}
      <svg
        viewBox="0 0 800 120"
        className="w-3/4 max-w-3xl relative z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="48"
          fontWeight="bold"
          fill="transparent"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-draw animate-fade-scale"
        >
          Meindesk Prototype
        </text>
      </svg>

      <style>{`
        /* Draw text */
        .text-draw {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw 3s forwards;
        }

        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }

        /* Fade + scale animation */
        .animate-fade-scale {
          opacity: 0;
          transform: translateY(20px) scale(0.8);
          animation: fadeScale 3s forwards;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes fadeScale {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          50% {
            opacity: 0.5;
            transform: translateY(10px) scale(1);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1.2);
          }
        }
      `}</style>
    </main>
  );
};

export default Loading;
