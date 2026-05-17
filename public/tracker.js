(function () {
    "use strict";

    function getSiteId() {
        const script = document.currentScript;
        if (script) {
            return script.getAttribute("data-site-id");
        }
        return null;
    }

    function getApiUrl() {
        const script = document.currentScript;
        if (script && script.src) {
            try {
                const url = new URL(script.src);
                return `${url.origin}/api/analytics`;
            } catch (e) {
                console.warn("Analytics: Could not parse script source URL.");
            }
        }
        return "/api/analytics";
    }

    const SITE_ID = getSiteId();
    const ENDPOINT = getApiUrl();

    if (!SITE_ID) {
        console.warn("Analytics: Missing data-site-id attribute on script tag.");
        return;
    }


    function detectArticleSlug() {
        const path = window.location.pathname;
        const articlePatterns = [
            /^\/article\/([^\/]+)\/?$/,
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
            siteId: SITE_ID,
            path: window.location.pathname,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            articleSlug: articleSlug,
        };

        fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            keepalive: true,
        }).catch(() => {
        });
    }

    // Track the initial page load
    if (document.readyState === "complete") {
        trackPageView();
    } else {
        window.addEventListener("load", trackPageView);
    }

    // SPA Support
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
