/**
 * Shared elevation / ring utilities using Tailwind’s canonical opacity syntax
 * (e.g. `shadow-slate-900/4` instead of `shadow-slate-900/[0.04]`).
 */
export const cardChrome =
  "shadow-sm ring-1 shadow-slate-900/4 ring-slate-900/3" as const;

/** Wide panels (e.g. data tables) — slightly softer shadow than {@link cardChrome}. */
export const panelChrome =
  "shadow-sm ring-1 shadow-slate-900/3.5 ring-slate-900/3" as const;

export const innerWell = "shadow-inner shadow-slate-900/2" as const;

export const inputInnerShadow = "shadow-inner shadow-slate-900/3" as const;

/** Compact toolbar control groups in the HTML workspace. */
export const toolClusterShadow = "shadow-sm shadow-slate-900/2.5" as const;

export const softShadowSm = "shadow-sm shadow-slate-900/2" as const;
