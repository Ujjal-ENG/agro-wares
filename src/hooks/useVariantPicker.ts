import { useState, useCallback, useMemo } from "react";
import type { VariantMatrix, ProductVariant, VariantCombo } from "@/types/ecommerce";

interface UseVariantPickerReturn {
  selection: VariantCombo;
  setSelection: (key: string, value: string) => void;
  resetSelection: () => void;
  selectedVariant: ProductVariant | null;
  disabledOptions: Record<string, Set<string>>;
  isComplete: boolean;
}

export function useVariantPicker(
  matrix: VariantMatrix,
  variants: ProductVariant[]
): UseVariantPickerReturn {
  const [selection, setSelectionState] = useState<VariantCombo>({});

  const setSelection = useCallback((key: string, value: string) => {
    setSelectionState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetSelection = useCallback(() => {
    setSelectionState({});
  }, []);

  // Check if selection is complete (all axes have values)
  const isComplete = useMemo(() => {
    return matrix.axes.every((axis) => selection[axis.key]);
  }, [matrix.axes, selection]);

  // Find the selected variant
  const selectedVariant = useMemo(() => {
    if (!isComplete) return null;
    return (
      variants.find((v) =>
        matrix.axes.every((axis) => v.combo[axis.key] === selection[axis.key])
      ) || null
    );
  }, [isComplete, variants, matrix.axes, selection]);

  // Calculate disabled options - the key algorithm
  const disabledOptions = useMemo(() => {
    const disabled: Record<string, Set<string>> = {};

    for (const axis of matrix.axes) {
      disabled[axis.key] = new Set<string>();

      for (const value of axis.values) {
        // Build a test selection with this value
        const testSelection = { ...selection, [axis.key]: value };

        // Check if any variant matches this partial selection AND has stock
        const comboExists = variants.some((v) => {
          // Check if this variant matches all currently selected values
          const matches = Object.entries(testSelection).every(
            ([k, val]) => !val || v.combo[k] === val
          );
          return matches && v.stock > 0;
        });

        if (!comboExists) {
          disabled[axis.key].add(value);
        }
      }
    }

    return disabled;
  }, [matrix.axes, variants, selection]);

  return {
    selection,
    setSelection,
    resetSelection,
    selectedVariant,
    disabledOptions,
    isComplete,
  };
}
