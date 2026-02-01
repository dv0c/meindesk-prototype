(function () {
    "use strict";

    function getApiUrl() {
        // Attempt to derive the API origin from the script source
        const script = document.currentScript;
        if (script && script.src) {
            try {
                const url = new URL(script.src);
                return `${url.origin}/api/analytics`;
            } catch (e) {
                console.warn("Analytics: Could not parse script source URL.");
            }
        }
        // Fallback if hosted on the same domain (e.g. testing)
        return "/api/analytics";
    }

    const ENDPOINT = getApiUrl();

    /**
     * Detect if the current page is an article page and extract the slug.
     * Common patterns: /articles/slug, /blog/slug, /news/slug, /post/slug
     */
    function detectArticleSlug() {
        const path = window.location.pathname;
        // Match common article URL patterns
        const articlePatterns = [
            /^\/articles\/([^\/]+)\/?$/,
            /^\/blog\/([^\/]+)\/?$/,
            /^\/news\/([^\/]+)\/?$/,
            /^\/post\/([^\/]+)\/?$/,
            /^\/p\/([^\/]+)\/?$/,
        ];

        for (const pattern of articlePatterns) {
            const match = path.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    }

    function trackPageView() {
        const articleSlug = detectArticleSlug();

        const payload = {
            url: window.location.host, // The domain of the site being tracked
            path: window.location.pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            articleSlug: articleSlug, // Will be null if not an article page
        };

        fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            keepalive: true, // Ensures request completes even if page unloads
        }).catch((err) => {
            // Silently fail to avoid disrupting the host site
            // console.error("Analytics Error:", err);
        });
    }

    // Track the initial page load
    if (document.readyState === "complete") {
        trackPageView();
    } else {
        window.addEventListener("load", trackPageView);
    }

    // --- Optional: SPA Support (History API) ---
    // If the host site is a Single Page Application, we need to monkey-patch pushState/replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function () {
        originalPushState.apply(this, arguments);
        trackPageView();
    };

    history.replaceState = function () {
        originalReplaceState.apply(this, arguments);
        trackPageView();
    };

    window.addEventListener("popstate", trackPageView);
})();
