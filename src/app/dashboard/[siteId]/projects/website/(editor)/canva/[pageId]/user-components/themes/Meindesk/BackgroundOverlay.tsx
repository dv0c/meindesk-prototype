/**
 * Shared background overlay component for Meindesk theme
 * Provides grid pattern and animated noise texture options
 */

interface BackgroundOverlayProps {
    enableGrid?: boolean
    enableNoise?: boolean
    gridOpacity?: number
    noiseOpacity?: number
}

export function BackgroundOverlay({
    enableGrid = false,
    enableNoise = false,
    gridOpacity = 0.3,
    noiseOpacity = 0.03,
}: BackgroundOverlayProps) {
    return (
        <>
            {/* Grid background pattern */}
            {enableGrid && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, ${gridOpacity}) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, ${gridOpacity}) 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                        opacity: gridOpacity,
                    }}
                    aria-hidden="true"
                />
            )}

            {/* Animated Noise overlay */}
            {enableNoise && (
                <div
                    className="absolute inset-0 pointer-events-none animate-noise"
                    style={{
                        opacity: noiseOpacity,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                    aria-hidden="true"
                />
            )}

            {/* CSS animation for noise */}
            {enableNoise && (
                <style jsx>{`
                    @keyframes noise-animation {
                        0%, 100% { transform: translate(0, 0); }
                        10% { transform: translate(-5%, -5%); }
                        20% { transform: translate(-10%, 5%); }
                        30% { transform: translate(5%, -10%); }
                        40% { transform: translate(-5%, 15%); }
                        50% { transform: translate(-10%, 5%); }
                        60% { transform: translate(15%, 0); }
                        70% { transform: translate(0, 10%); }
                        80% { transform: translate(-15%, 0); }
                        90% { transform: translate(10%, 5%); }
                    }
                    .animate-noise {
                        animation: noise-animation 0.5s steps(10) infinite;
                    }
                `}</style>
            )}
        </>
    )
}
