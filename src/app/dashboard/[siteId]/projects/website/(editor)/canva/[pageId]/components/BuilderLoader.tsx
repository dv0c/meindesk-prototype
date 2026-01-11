"use client"

import { motion } from "framer-motion"

export const BuilderLoader = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950 text-white"
        >
            <div className="flex flex-col items-center gap-6">
                {/* Prototype Text */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl font-bold tracking-[0.3em] text-zinc-100 uppercase"
                >
                    PROTOTYPE
                </motion.h1>

                {/* Loading Bar Container */}
                <div className="h-[2px] w-64 overflow-hidden bg-zinc-800 rounded-full">
                    {/* Loading Bar */}
                    <motion.div
                        className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{
                            duration: 2.5,
                            ease: "easeInOut",
                            times: [0, 0.2, 0.5, 0.8, 1]
                        }}
                    />
                </div>
            </div>
        </motion.div>
    )
}
