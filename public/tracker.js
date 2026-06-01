(function () {
  "use strict";

  function findTrackerScript() {
    if (document.currentScript) {
      return document.currentScript;
    }
    return (
      document.getElementById("meindesk-analytics-tracker") ||
      document.querySelector('script[src*="tracker.js"][data-site-id]') ||
      document.querySelector('script[src*="tracker.js"]')
    );
  }

  function getSiteId() {
    const cfg = window.__MEINDESK_ANALYTICS__;
    if (cfg && cfg.siteId) {
      return String(cfg.siteId);
    }
    const script = findTrackerScript();
    if (script) {
      return script.getAttribute("data-site-id");
    }
    return null;
  }

  function getApiUrl() {
    const cfg = window.__MEINDESK_ANALYTICS__;
    if (cfg && cfg.endpoint) {
      return String(cfg.endpoint);
    }
    const script = findTrackerScript();
    if (script && script.src) {
      try {
        const url = new URL(script.src);
        let origin = url.origin;
        if (url.hostname === "meindesk.gr") {
          origin = "https://www.meindesk.gr";
        }
        return `${origin}/api/analytics`;
      } catch (e) {
        console.warn("Analytics: Could not parse script source URL.");
      }
    }
    return "https://www.meindesk.gr/api/analytics";
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
    const ingestToken =
      (window.__MEINDESK_ANALYTICS__ && window.__MEINDESK_ANALYTICS__.ingestToken) ||
      findTrackerScript()?.getAttribute("data-ingest-token") ||
      undefined;

    const payload = {
      siteId: SITE_ID,
      path: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      articleSlug: articleSlug,
      ...(ingestToken ? { ingestToken } : {}),
    };

    fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
      mode: "cors",
    }).catch(() => {
    });
  }

  if (document.readyState === "complete") {
    trackPageView();
  } else {
    window.addEventListener("load", trackPageView);
  }

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
