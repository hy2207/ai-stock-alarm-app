import type { SaveWatchlistInput } from "../../lib/dto/saveWatchlist";

export type OnboardingItemKind = "ticker" | "sector";

export interface OnboardingSelectionItem {
  ticker: string;
  kind: OnboardingItemKind;
}

const MAX_SELECTIONS = 3;

export function toggleOnboardingSelection(
  selected: string[],
  value: string,
): string[] {
  if (selected.includes(value)) {
    return selected.filter((item) => item !== value);
  }

  if (selected.length >= MAX_SELECTIONS) {
    return selected;
  }

  return [...selected, value];
}

export function getOnboardingSelectionState(selected: string[]) {
  return {
    count: selected.length,
    max: MAX_SELECTIONS,
    canSubmit: selected.length > 0,
    isAtMax: selected.length >= MAX_SELECTIONS,
    helperText: `${selected.length}/${MAX_SELECTIONS} selected`,
  };
}

export function validateOnboardingSelection(selected: string[]):
  | { ok: true }
  | { ok: false; message: string } {
  if (selected.length === 0) {
    return {
      ok: false,
      message: "Select at least one ticker or sector.",
    };
  }

  if (selected.length > MAX_SELECTIONS) {
    return {
      ok: false,
      message: "Select up to three tickers or sectors.",
    };
  }

  return { ok: true };
}

export function getSettingsWatchlistEditState(
  currentWatchlist: string[],
  editingWatchlist: string[],
) {
  const validation = validateOnboardingSelection(editingWatchlist);
  const hasChanges =
    currentWatchlist.length !== editingWatchlist.length ||
    currentWatchlist.some((item, index) => editingWatchlist[index] !== item);

  return {
    ...getOnboardingSelectionState(editingWatchlist),
    hasChanges,
    canSave: validation.ok && hasChanges,
    validationMessage: validation.ok ? null : validation.message,
    selectedLabel:
      editingWatchlist.length === 0
        ? "No watchlist items selected"
        : editingWatchlist.join(", "),
  };
}

export function buildWatchlistInput(
  selected: string[],
  availableItems: OnboardingSelectionItem[],
): SaveWatchlistInput {
  const itemsByTicker = new Map(
    availableItems.map((item) => [item.ticker, item]),
  );

  const validation = validateOnboardingSelection(selected);
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  return {
    items: selected.map((value) => {
      const item = itemsByTicker.get(value);
      if (!item) {
        throw new Error(`Unknown watchlist item: ${value}`);
      }

      return { ticker: item.ticker };
    }),
  };
}
