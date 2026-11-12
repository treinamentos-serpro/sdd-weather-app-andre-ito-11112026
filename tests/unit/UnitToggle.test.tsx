import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import type { Unit } from '../../src/types/weather';

function StatefulUnitToggle() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return <UnitToggle unit={unit} onChange={setUnit} />;
}

function WeatherWithUnitToggle() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather
        city={{ name: 'São Paulo' }}
        current={{ time: '2026-11-11T12:00', temperatureC: 0 }}
        unit={unit}
      />
    </>
  );
}

describe('UnitToggle', () => {
  it('exposes a named group and the selected unit with aria-pressed', () => {
    render(<UnitToggle onChange={vi.fn()} unit="celsius" />);

    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('calls onChange when a unit button is activated', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<UnitToggle onChange={onChange} unit="celsius" />);
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith('fahrenheit');
  });

  it('updates current weather from 0 °C to 32 °F and back', async () => {
    const user = userEvent.setup();
    render(<WeatherWithUnitToggle />);

    expect(screen.getByRole('region', { name: 'Clima atual em São Paulo' })).toHaveTextContent(
      '0,0 °C',
    );
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(screen.getByRole('region', { name: 'Clima atual em São Paulo' })).toHaveTextContent(
      '32,0 °F',
    );
    await user.click(screen.getByRole('button', { name: 'Celsius' }));
    expect(screen.getByRole('region', { name: 'Clima atual em São Paulo' })).toHaveTextContent(
      '0,0 °C',
    );
  });

  it('moves focus and changes selection with arrow keys', async () => {
    const user = userEvent.setup();

    render(<StatefulUnitToggle />);
    const celsiusButton = screen.getByRole('button', { name: 'Celsius' });
    const fahrenheitButton = screen.getByRole('button', { name: 'Fahrenheit' });

    celsiusButton.focus();
    await user.keyboard('{ArrowRight}');

    expect(fahrenheitButton).toHaveFocus();
    expect(fahrenheitButton).toHaveAttribute('aria-pressed', 'true');
    expect(celsiusButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('activates the focused unit with Space', async () => {
    const user = userEvent.setup();

    render(<StatefulUnitToggle />);
    const fahrenheitButton = screen.getByRole('button', { name: 'Fahrenheit' });
    fahrenheitButton.focus();
    await user.keyboard(' ');

    expect(fahrenheitButton).toHaveAttribute('aria-pressed', 'true');
  });
});
