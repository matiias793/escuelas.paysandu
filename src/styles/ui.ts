export const appPanelClass =
  'rounded-2xl border border-primary/20 bg-neutral-card/95 shadow-sm shadow-primary/15 ring-1 ring-primary/10 backdrop-blur-[2px]';

export const appPanelElevatedClass =
  'rounded-2xl border border-primary/25 bg-neutral-card shadow-md shadow-primary/15 ring-1 ring-primary/15';

export const appAuthInputClass =
  'w-full rounded-2xl border border-primary/25 bg-neutral-card px-4 py-3 text-neutral-800 shadow-sm shadow-primary/10 ring-1 ring-primary/10 transition-all placeholder:text-neutral-400 font-medium focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent';

export const appAuthSelectClass = `${appAuthInputClass} appearance-none cursor-pointer`;

export const appAuthLabelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-400';

export const appPageTitleClass =
  'text-2xl font-bold tracking-tight text-primary-dark sm:text-3xl';

const btnBase =
  'flex items-center gap-2 font-bold py-2.5 px-4 rounded-full border transition-all duration-200 active:scale-95 text-xs sm:text-sm';

export const plannerBtnPrimary = `${btnBase} border-primary/30 bg-primary text-white hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed`;

export const plannerBtnSecondary = `${btnBase} border-surface-border bg-neutral-card text-primary-dark shadow-sm hover:bg-primary/10`;

export const adminToolbarPanelClass = `${appPanelClass} grid grid-cols-1 gap-3 p-3 sm:flex sm:flex-wrap sm:items-end sm:gap-3 sm:p-4`;

export const adminToolbarFieldClass = 'w-full min-w-0 sm:min-w-[110px] sm:flex-1';

export const adminToolbarBtnClass = `${plannerBtnPrimary} w-full justify-center sm:w-auto`;

export const adminToolbarBtnSecondaryClass = `${plannerBtnSecondary} w-full justify-center sm:w-auto`;

export const adminMobileFieldLabelClass =
  'mb-1 block text-[10px] font-semibold uppercase tracking-wide text-neutral-400 sm:sr-only';
