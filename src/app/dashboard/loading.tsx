const loading = () => {
    return <main>
        <div className="flex flex-1 h-screen w-screen items-center justify-center">
            <span className="text-6xl font-bold flex flex-col items-center">
                Meindesk Prototype
                <span className="ml-2 loading-dots" aria-label="Loading">
                    <span className="dot">.</span>
                    <span className="dot">.</span>
                    <span className="dot">.</span>
                </span>
            </span>
            <style>{`
              .loading-dots {
                display: inline-block;
              }
              .loading-dots .dot {
                opacity: 0;
                animation: blink 1.4s infinite both;
              }
              .loading-dots .dot:nth-child(1) {
                animation-delay: 0s;
              }
              .loading-dots .dot:nth-child(2) {
                animation-delay: 0.2s;
              }
              .loading-dots .dot:nth-child(3) {
                animation-delay: 0.4s;
              }
              @keyframes blink {
                0%, 80%, 100% { opacity: 0; }
                40% { opacity: 1; }
              }
            `}</style>
        </div>
    </main>
}

export default loading