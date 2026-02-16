# Canva Block Matrix (Stabilization Pass)

This document tracks the stabilization pass for block settings wiring and responsive behavior.

## System Status

- `defineBlock` responsive runtime CSS: fixed globally in `src/lib/block-api.tsx`.
- `withCraftComponent` responsive visibility support: added via class-based hide/preview states in `src/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/lib/withCraftComponent.tsx`.
- Global settings writing to `style` / `blockStyle`: fixed in `src/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/GlobalSettings.tsx`.
- Array field editor support (`textarea`/`select`/`checkbox`): fixed in `src/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/lib/generateSettings.tsx`.

## High-Risk Blocks (Previously Broken)

| Block | Issue | Status |
|---|---|---|
| `Search` | duplicated props and partial overlay theme wiring | Fixed |
| `SearchOverlay` | stale collection deps + debug noise + layout prop not used | Fixed |
| `CollectionField` | `linkHref` behavior existed without settings control | Fixed |
| `ArticleCover` | `enableSnapping` setting was dead/no-op | Removed |
| `UpdatesCarousel` | `showDots` functionally coupled to `showArrows` | Fixed |
| `HeroSection` (Meindesk) | split-flap speed default/range mismatch | Fixed |

## Default Theme Block Responsive Wiring

Updated to pass responsive/editing context to `useBlockStyles`:

- `src/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/user-components/themes/default/blocks/CardPost.tsx`
- `src/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/user-components/themes/default/blocks/DefaultFooter.tsx`
- `src/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/user-components/themes/default/blocks/DefaultHeader.tsx`
- `src/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/user-components/themes/default/blocks/Section.tsx`
- `src/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/user-components/themes/default/blocks/ThemeHero.tsx`

## Remaining Follow-Up (Non-blocking)

- Add explicit per-block generic typing for a few default theme blocks to remove editor-only TS warnings from inferred props.
- Add automated test for settings-to-prop mapping consistency (future guardrail).
