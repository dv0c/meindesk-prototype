# Sophia frontend collections

Headless sites (e.g. sophiaplatanisioti.gr) use two collections:

## `site-sections`

Hybrid static pages: Next.js keeps layout; CMS provides body HTML.

| Field | Type | Notes |
|-------|------|-------|
| slug | text | `homepage`, `biography`, `contact`, `ypiresies` |
| title | text | Admin label |
| html | richtext | Page body |
| heroImage | image | Optional |
| seoTitle | text | Optional |
| seoDescription | text | Optional |
| published | boolean | |

## `navigation-links`

Custom nav items (not category-driven).

| Field | Type | Notes |
|-------|------|-------|
| label | text | Display text |
| href | text | `/path` or full URL |
| placement | select | `header`, `mobile`, `footer` |
| order | number | Sort order |
| headerPosition | select | `start` (before categories) or `end` (after categories & Άρθρα) — header only |
| visible | boolean | |
| openInNewTab | boolean | |

Manage links in the CMS under **Navigation** (same manager as category nav order under **Categories**).

## Category navigation

Set on each **Category** via `metadata`:

```json
{
  "navPlacement": "header",
  "navOrder": 0
}
```

- `header` — top-level nav link (legacy HEADER)
- `hidden` — under Άρθρα dropdown (legacy HIDDEN)
- `none` — not in nav

## Frontend webhook

In **Site settings** (JSON) or env on meindesk.gr:

```json
{
  "frontend": {
    "revalidateUrl": "https://sophiaplatanisioti.gr/api/revalidate-all",
    "revalidateSecret": "<REVALIDATION_SECRET_TOKEN>"
  }
}
```

Or env: `FRONTEND_REVALIDATE_URL`, `FRONTEND_REVALIDATE_SECRET`.

On publish, Meindesk calls the frontend with **query-param auth** (not Bearer):

```
GET {revalidateUrl}?secret={revalidateSecret}
```

Store the base URL without `?secret=` in `revalidateUrl`; the secret belongs only in `revalidateSecret`. Configure the same token as `REVALIDATION_SECRET_TOKEN` on the headless site.

## Seed

```bash
npx tsx scripts/seed-sophia-site-collections.ts <siteId>
```

## Public API

- `GET /api/v1/{siteId}/collections`
- `GET /api/v1/{siteId}/collections/by-slug/site-sections/items?status=PUBLISHED`
- `GET /api/v1/{siteId}/collections/by-slug/navigation-links/items?status=PUBLISHED`
