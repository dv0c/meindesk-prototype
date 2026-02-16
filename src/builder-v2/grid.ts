import { BuilderBreakpoint } from "./types";

export const GRID_COLUMNS: Record<BuilderBreakpoint, number> = {
  desktop: 12,
  tablet: 8,
  mobile: 4,
};

export const GRID_ROW_HEIGHT = 12;

export function clampLayout(
  breakpoint: BuilderBreakpoint,
  layout: { colStart: number; colSpan: number; rowStart: number; rowSpan: number }
) {
  const maxCols = GRID_COLUMNS[breakpoint];
  const colSpan = Math.max(1, Math.min(layout.colSpan, maxCols));
  const colStart = Math.max(1, Math.min(layout.colStart, maxCols - colSpan + 1));
  const rowStart = Math.max(1, layout.rowStart);
  const rowSpan = Math.max(1, layout.rowSpan);

  return { colStart, colSpan, rowStart, rowSpan };
}

export function deriveResponsiveFromDesktop(desktop: {
  colStart: number;
  colSpan: number;
  rowStart: number;
  rowSpan: number;
}) {
  const tabletCols = GRID_COLUMNS.tablet;
  const mobileCols = GRID_COLUMNS.mobile;

  const tabletColStart = Math.max(1, Math.min(Math.round((desktop.colStart / 12) * tabletCols), tabletCols));
  const tabletColSpan = Math.max(1, Math.min(Math.round((desktop.colSpan / 12) * tabletCols), tabletCols));

  const mobileColStart = 1;
  const mobileColSpan = Math.max(1, Math.min(Math.round((desktop.colSpan / 12) * mobileCols), mobileCols));

  return {
    tablet: clampLayout("tablet", {
      colStart: tabletColStart,
      colSpan: tabletColSpan,
      rowStart: desktop.rowStart,
      rowSpan: desktop.rowSpan,
    }),
    mobile: clampLayout("mobile", {
      colStart: mobileColStart,
      colSpan: mobileColSpan,
      rowStart: desktop.rowStart,
      rowSpan: desktop.rowSpan,
    }),
  };
}
