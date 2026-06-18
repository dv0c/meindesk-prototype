(function () {
  "use strict";

  var VISITOR_COOKIE = "_md_vid";
  var SESSION_KEY = "_md_sid";

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
    var cfg = window.__MEINDESK_ANALYTICS__;
    if (cfg && cfg.siteId) {
      return String(cfg.siteId);
    }
    var script = findTrackerScript();
    if (script) {
      return script.getAttribute("data-site-id");
    }
    return null;
  }

  function getApiUrl() {
    var cfg = window.__MEINDESK_ANALYTICS__;
    if (cfg && cfg.endpoint) {
      return String(cfg.endpoint);
    }
    var script = findTrackerScript();
    if (script && script.src) {
      try {
        var url = new URL(script.src);
        var origin = url.origin;
        if (url.hostname === "meindesk.gr") {
          origin = "https://www.meindesk.gr";
        }
        return origin + "/api/analytics";
      } catch (e) {
        console.warn("Analytics: Could not parse script source URL.");
      }
    }
    return "https://www.meindesk.gr/api/analytics";
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var d = new Date();
      d.setTime(d.getTime() + days * 86400000);
      expires = "; expires=" + d.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax";
  }

  function getVisitorId() {
    var existing = getCookie(VISITOR_COOKIE);
    if (existing) return existing;
    var id = "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    setCookie(VISITOR_COOKIE, id, 365);
    return id;
  }

  function getSessionId() {
    try {
      var existing = sessionStorage.getItem(SESSION_KEY);
      if (existing) return existing;
      var id = "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(SESSION_KEY, id);
      return id;
    } catch (e) {
      return null;
    }
  }

  function parseUtm() {
    try {
      var params = new URLSearchParams(window.location.search);
      var meta = {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(function (key) {
        var val = params.get(key);
        if (val) meta[key] = val;
      });
      return Object.keys(meta).length ? meta : undefined;
    } catch (e) {
      return undefined;
    }
  }

  var SITE_ID = getSiteId();
  var ENDPOINT = getApiUrl();

  if (!SITE_ID) {
    console.warn("Analytics: Missing data-site-id attribute on script tag.");
    return;
  }

  function detectContent() {
    var path = window.location.pathname;
    var articlePatterns = [
      /^\/article\/([^\/]+)\/?$/,
      /^\/articles\/([^\/]+)\/?$/,
      /^\/blog\/([^\/]+)\/?$/,
      /^\/news\/([^\/]+)\/?$/,
      /^\/post\/([^\/]+)\/?$/,
      /^\/p\/([^\/]+)\/?$/,
    ];

    for (var i = 0; i < articlePatterns.length; i++) {
      var match = path.match(articlePatterns[i]);
      if (match && match[1]) {
        return { articleSlug: match[1], contentType: "article", contentId: match[1] };
      }
    }

    if (/^\/pages?\//.test(path)) {
      var slug = path.split("/").filter(Boolean).pop();
      return { contentType: "page", contentId: slug };
    }

    if (/^\/categor/.test(path)) {
      return { contentType: "category", contentId: path };
    }

    return { articleSlug: null, contentType: null, contentId: null };
  }

  function sendEvent(eventType, extra) {
    var content = detectContent();
    var ingestToken =
      (window.__MEINDESK_ANALYTICS__ && window.__MEINDESK_ANALYTICS__.ingestToken) ||
      (findTrackerScript() && findTrackerScript().getAttribute("data-ingest-token")) ||
      undefined;

    var payload = Object.assign(
      {
        siteId: SITE_ID,
        path: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        eventType: eventType || "page_view",
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
        articleSlug: content.articleSlug,
        contentType: content.contentType,
        contentId: content.contentId,
        metadata: parseUtm(),
      },
      extra || {},
      ingestToken ? { ingestToken: ingestToken } : {}
    );

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      mode: "cors",
    }).catch(function () {});
  }

  function trackPageView() {
    sendEvent("page_view");
  }

  window.__MEINDESK_TRACK__ = function (eventType, metadata) {
    sendEvent(eventType, { metadata: metadata });
  };

  if (document.readyState === "complete") {
    trackPageView();
  } else {
    window.addEventListener("load", trackPageView);
  }

  var originalPushState = history.pushState;
  var originalReplaceState = history.replaceState;

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
