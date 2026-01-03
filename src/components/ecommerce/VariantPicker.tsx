import { cn } from "@/lib/utils";
import type { VariantMatrix, ProductVariant, VariantCombo } from "@/types/ecommerce";

interface VariantPickerProps {
  matrix: VariantMatrix;
  variants: ProductVariant[];
  selection: VariantCombo;
  disabledOptions: Record<string, Set<string>>;
  onSelect: (key: string, value: string) => void;
}

export function VariantPicker({
  matrix,
  variants,
  selection,
  disabledOptions,
  onSelect,
}: VariantPickerProps) {
  return (
    <div className="space-y-4">
      {matrix.axes.map((axis) => (
        <div key={axis.key}>
          <label className="mb-2 block text-sm font-medium">
            {axis.label}:{" "}
            <span className="text-primary">{selection[axis.key] || "Select"}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {axis.values.map((value) => {
              const isSelected = selection[axis.key] === value;
              const isDisabled = disabledOptions[axis.key]?.has(value);

              return (
                <button
                  key={value}
                  onClick={() => !isDisabled && onSelect(axis.key, value)}
                  disabled={isDisabled}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition-all",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary",
                    isDisabled &&
                      "cursor-not-allowed opacity-40 line-through hover:border-border"
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
