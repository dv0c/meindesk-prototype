import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { safeFetch } from "@/lib/rss/fetch-utils";

export const runtime = "nodejs";

/**
 * Proxy endpoint to fetch external HTML pages
 * Used by the RSS Builder to display pages in an iframe-like preview
 * 
 * GET /api/proxy?url=https://example.com
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json({ error: "Missing ?url parameter" }, { status: 400 });
  }

  // Validate URL
  let targetUrl: URL;
  try {
    targetUrl = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const response = await safeFetch(targetUrl.href);

    if (!response || !response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page: ${response?.status || "No response"}` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") || "";

    // Only allow HTML responses
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "URL does not return HTML content" },
        { status: 400 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Make all URLs absolute
    const baseUrl = `${targetUrl.protocol}//${targetUrl.hostname}`;

    // Fix relative URLs in various attributes
    $("a, link").each((_, el) => {
      const href = $(el).attr("href");
      if (href && !href.startsWith("http") && !href.startsWith("//") && !href.startsWith("javascript:") && !href.startsWith("#")) {
        $(el).attr("href", new URL(href, baseUrl).href);
      }
    });

    $("img, script").each((_, el) => {
      const src = $(el).attr("src");
      if (src && !src.startsWith("http") && !src.startsWith("//") && !src.startsWith("data:")) {
        $(el).attr("src", new URL(src, baseUrl).href);
      }
    });

    $("source, video, audio").each((_, el) => {
      const src = $(el).attr("src");
      if (src && !src.startsWith("http") && !src.startsWith("//")) {
        $(el).attr("src", new URL(src, baseUrl).href);
      }
    });

    // Fix CSS background-image URLs in style attributes
    $("[style]").each((_, el) => {
      const style = $(el).attr("style") || "";
      const fixedStyle = style.replace(/url\(['"]?([^'")\s]+)['"]?\)/g, (match, url) => {
        if (url.startsWith("http") || url.startsWith("//") || url.startsWith("data:")) {
          return match;
        }
        try {
          return `url('${new URL(url, baseUrl).href}')`;
        } catch {
          return match;
        }
      });
      $(el).attr("style", fixedStyle);
    });

    // Remove script tags for security (we don't want third-party JS running)
    $("script").remove();

    // Add base tag to head
    $("head").prepend(`<base href="${baseUrl}/" target="_blank">`);

    // Inject our selector script that will be used by the builder
    const selectorScript = `
      <style>
        .rss-builder-tooltip {
          position: fixed;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          background: #1f2937;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          z-index: 999999;
          font-family: system-ui, sans-serif;
          max-width: 90vw;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .rss-context-menu {
          position: fixed;
          background: #1f2937;
          border-radius: 8px;
          padding: 4px;
          z-index: 9999999;
          font-family: system-ui, sans-serif;
          font-size: 13px;
          min-width: 180px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          display: none;
        }
        .rss-context-menu.visible { display: block; }
        .rss-context-menu button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          text-align: left;
          color: white;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .rss-context-menu button:hover { background: #374151; }
        .rss-context-menu button .tag { 
          color: #60a5fa; 
          font-family: monospace;
          font-size: 11px;
        }
        .rss-context-menu button .info {
          margin-left: auto;
          color: #9ca3af;
          font-size: 11px;
        }
        .rss-context-menu .divider {
          height: 1px;
          background: #374151;
          margin: 4px 0;
        }
      </style>
      <div class="rss-builder-tooltip" id="rss-tooltip">
        Click to select • Right-click for options
      </div>
      <div class="rss-context-menu" id="rss-context-menu"></div>
      <script>
        window.rssBuilderReady = true;
        const tooltip = document.getElementById('rss-tooltip');
        const contextMenu = document.getElementById('rss-context-menu');
        let contextTarget = null;
        
        function notifyParent(type, data) {
          window.parent.postMessage({ type: 'rss-builder', action: type, ...data }, '*');
        }
        
        function highlightElement(el) {
          document.querySelectorAll('[data-rss-highlight]').forEach(e => {
            e.style.outline = '';
            e.removeAttribute('data-rss-highlight');
          });
          if (el && el !== document.body && el !== document.documentElement) {
            el.style.outline = '3px solid #3b82f6';
            el.setAttribute('data-rss-highlight', 'true');
          }
        }
        
        function selectElement(el) {
          if (!el || el === document.body || el === document.documentElement) return;
          notifyParent('element-selected', {
            selector: generateSelector(el),
            tagName: el.tagName.toLowerCase(),
            text: el.textContent?.trim().slice(0, 100) || '',
            src: el.src || el.getAttribute('src') || '',
            href: el.href || el.getAttribute('href') || '',
            childCount: el.children.length,
            outerHTML: el.outerHTML.slice(0, 500)
          });
          hideContextMenu();
        }
        
        function hideContextMenu() {
          contextMenu.classList.remove('visible');
          contextTarget = null;
        }
        
        function showContextMenu(x, y, el) {
          contextTarget = el;
          const parent = el.parentElement;
          const grandparent = parent?.parentElement;
          
          let html = '';
          html += '<button data-action="this"><span class="tag">&lt;' + el.tagName.toLowerCase() + '&gt;</span> <span class="info">' + el.children.length + ' children</span></button>';
          
          if (parent && parent !== document.body && parent !== document.documentElement) {
            html += '<button data-action="parent"><span class="tag">&lt;' + parent.tagName.toLowerCase() + '&gt;</span> Select parent <span class="info">' + parent.children.length + ' children</span></button>';
          }
          if (grandparent && grandparent !== document.body && grandparent !== document.documentElement) {
            html += '<button data-action="grandparent"><span class="tag">&lt;' + grandparent.tagName.toLowerCase() + '&gt;</span> Select grandparent</button>';
          }
          
          contextMenu.innerHTML = html;
          contextMenu.style.left = x + 'px';
          contextMenu.style.top = y + 'px';
          contextMenu.classList.add('visible');
          
          // Adjust if off screen
          const rect = contextMenu.getBoundingClientRect();
          if (rect.right > window.innerWidth) {
            contextMenu.style.left = (window.innerWidth - rect.width - 8) + 'px';
          }
          if (rect.bottom > window.innerHeight) {
            contextMenu.style.top = (window.innerHeight - rect.height - 8) + 'px';
          }
        }
        
        // Context menu click handler
        contextMenu.addEventListener('click', (e) => {
          const btn = e.target.closest('button');
          if (!btn || !contextTarget) return;
          
          const action = btn.dataset.action;
          let target = contextTarget;
          if (action === 'parent') target = contextTarget.parentElement;
          if (action === 'grandparent') target = contextTarget.parentElement?.parentElement;
          
          selectElement(target);
        });
        
        // Click outside to close
        document.addEventListener('click', (e) => {
          if (!e.target.closest('.rss-context-menu')) {
            if (contextMenu.classList.contains('visible')) {
              hideContextMenu();
              return;
            }
            // Normal click selection
            if (e.target.closest('#rss-tooltip') || e.target.closest('.rss-builder-tooltip')) return;
            e.preventDefault();
            e.stopPropagation();
            selectElement(e.target);
          }
        }, true);
        
        // Right-click: show context menu
        document.addEventListener('contextmenu', (e) => {
          if (e.target.closest('#rss-tooltip') || e.target.closest('.rss-builder-tooltip') || e.target.closest('.rss-context-menu')) return;
          e.preventDefault();
          e.stopPropagation();
          showContextMenu(e.clientX, e.clientY, e.target);
        }, true);
        
        // Escape to close menu
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') hideContextMenu();
        });
        
        let hoverElement = null;
        document.addEventListener('mouseover', (e) => {
          if (!e.target.closest('#rss-tooltip') && !e.target.closest('.rss-builder-tooltip') && !e.target.closest('.rss-context-menu')) {
            hoverElement = e.target;
            highlightElement(e.target);
            updateTooltipFor(e.target);
          }
        });
        
        function updateTooltipFor(el) {
          if (!el || el === document.body) {
            tooltip.innerHTML = '<b>Click</b> select • <b>Right-click</b> for options';
            return;
          }
          const tag = el.tagName.toLowerCase();
          const childCount = el.children.length;
          tooltip.innerHTML = '<b>&lt;' + tag + '&gt;</b> (' + childCount + ' children) • <b>Click</b> select • <b>Right-click</b> menu';
        }
        
        document.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowUp' && hoverElement) {
            e.preventDefault();
            if (hoverElement.parentElement && hoverElement.parentElement !== document.body && hoverElement.parentElement !== document.documentElement) {
              hoverElement = hoverElement.parentElement;
              highlightElement(hoverElement);
              updateTooltipFor(hoverElement);
            }
          }
          if (e.key === 'ArrowDown' && hoverElement) {
            e.preventDefault();
            if (hoverElement.firstElementChild) {
              hoverElement = hoverElement.firstElementChild;
              highlightElement(hoverElement);
              updateTooltipFor(hoverElement);
            }
          }
        });
        
        function generateSelector(el) {
          if (el.id && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(el.id)) return '#' + el.id;
          
          // Classes to EXCLUDE (they change states or cause issues)
          const excludeClasses = [
            'hidden', 'visible', 'invisible', 'active', 'inactive', 'open', 'closed',
            'hover', 'focus', 'selected', 'disabled', 'enabled', 'checked',
            'transition', 'animate', 'duration', 'delay', 'ease',
            'transform', 'translate', 'rotate', 'scale', 'skew',
            'opacity', 'backdrop', 'filter', 'blur'
          ];
          
          function isValidClass(c) {
            if (!c || c.length > 30) return false;
            if (!/^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(c)) return false;
            // Exclude classes that start with problematic prefixes
            for (const exclude of excludeClasses) {
              if (c === exclude || c.startsWith(exclude + '-') || c.startsWith(exclude + '_')) return false;
            }
            return true;
          }
          
          const path = [];
          while (el && el.nodeType === 1 && el !== document.body && el !== document.documentElement) {
            let selector = el.tagName.toLowerCase();
            if (el.className && typeof el.className === 'string') {
              const classes = el.className.trim().split(/\\s+/).filter(isValidClass).slice(0, 2);
              if (classes.length > 0) selector += '.' + classes.join('.');
            }
            // REMOVED: nth-of-type - it makes selectors match only 1 element
            path.unshift(selector);
            if (el.id && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(el.id)) break;
            el = el.parentNode;
          }
          return path.join(' > ');
        }
        
        notifyParent('ready', {});
      </script>
    `;

    $("body").append(selectorScript);

    return new NextResponse($.html(), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Proxied-From": targetUrl.hostname,
      },
    });
  } catch (err: any) {
    console.error("Proxy error:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to fetch page" },
      { status: 500 }
    );
  }
}
