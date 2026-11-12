import { type KeyboardEvent, useRef } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const units: { value: Unit; label: string; name: string }[] = [
  { value: 'celsius', label: '°C', name: 'Celsius' },
  { value: 'fahrenheit', label: '°F', name: 'Fahrenheit' },
];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const currentIndex = units.findIndex((option) => option.value === unit);
    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % units.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + units.length) % units.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = units.length - 1;
    }

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    buttonRefs.current[nextIndex]?.focus();
    onChange(units[nextIndex].value);
  }

  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
      role="group"
    >
      {units.map((option, index) => {
        const isSelected = unit === option.value;

        return (
          <button
            aria-label={option.name}
            aria-pressed={isSelected}
            className={`min-h-10 min-w-12 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 ${
              isSelected
                ? 'bg-accent-500 text-night-900'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
            key={option.value}
            onClick={() => onChange(option.value)}
            onKeyDown={handleKeyDown}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            tabIndex={isSelected ? 0 : -1}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
