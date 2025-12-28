import Link from "next/link";
import { Bebas_Neue } from "next/font/google";

const bebas = Bebas_Neue({
    weight: "400",
    subsets: ["latin"],
});

interface PrototypeBadgeProps {
    sticky?: boolean;
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export function PrototypeBadge({
    sticky = true,
    position = "bottom-right"
}: PrototypeBadgeProps) {

    const positionClasses = {
        "bottom-right": "bottom-6 right-6",
        "bottom-left": "bottom-6 left-6",
        "top-right": "top-6 right-6",
        "top-left": "top-6 left-6",
    };

    const positionClass = positionClasses[position];
    const stickyClass = sticky ? "fixed" : "absolute";

    return (
        <div className={`${stickyClass} ${positionClass} z-50 ring-1 ring-white/10 rounded-full shadow-2xl print:hidden hidden sm:block ${sticky ? 'animate-in fade-in slide-in-from-bottom-4 duration-700' : ''}`}>
            <Link
                href="https://meindesk.gr"
                target="_blank"
                className="
          group flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md 
          pl-2 pr-3 py-1.5 rounded-full 
          border border-white/5
          shadow-[0_8px_32px_rgba(0,0,0,0.12)]
          hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)] 
          hover:scale-[1.02] active:scale-[0.98]
          transition-all duration-300 ease-out
          cursor-pointer
        "
            >
                <div className="relative flex items-center justify-center w-5 h-5 bg-orange-500 rounded-full shadow-inner overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-600 to-orange-400 opacity-100"></div>
                    <span className={`text-xs font-bold text-white relative z-10 ${bebas.className}`}>P</span>
                </div>

                <div className="flex flex-col leading-none">
                    <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-semibold mb-px group-hover:text-neutral-300 transition-colors">
                        Made with
                    </span>
                    <span className={`text-xs tracking-widest text-white group-hover:text-orange-400 transition-colors ${bebas.className}`}>
                        PROTOTYPE
                    </span>
                </div>
            </Link>
        </div>
    );
}
