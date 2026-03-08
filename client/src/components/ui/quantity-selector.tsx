import { Minus, Plus } from 'lucide-react';

type QuantitySelectorProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
};

export const QuantitySelector = ({
  value,
  min = 1,
  max = 99,
  onChange,
}: QuantitySelectorProps) => {
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="inline-flex items-center overflow-hidden rounded-xl bg-gray-100">
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <span
        className="min-w-[2.5rem] px-1 py-2 text-center text-sm font-semibold text-gray-900"
        aria-live="polite"
        aria-label={`Quantity: ${value}`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
};
