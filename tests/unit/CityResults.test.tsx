import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CityResults from '../../src/components/CityResults';
import type { City } from '../../src/types/weather';

describe('CityResults', () => {
  it('shows location details and only selects a city after an explicit action', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const cities: City[] = [
      {
        name: 'Springfield',
        region: 'Illinois',
        country: 'United States',
        latitude: 39.78,
        longitude: -89.64,
      },
      {
        name: 'Springfield',
        country: 'United States',
        latitude: 42.1,
        longitude: -72.59,
      },
      { name: 'Cidade sem coordenadas', country: 'Brasil' },
    ];

    render(<CityResults cities={cities} onSelect={onSelect} />);

    expect(
      screen.getByRole('button', { name: /Springfield.*Illinois.*United States/ }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: /Springfield.*Latitude 42.1, longitude -72.59/ }),
    ).toBeVisible();
    const unavailableCity = screen.getByRole('button', { name: /Cidade sem coordenadas/ });
    expect(unavailableCity).toBeDisabled();
    expect(
      screen.getByText('Não é possível consultar esta localidade sem coordenadas.'),
    ).toBeVisible();
    expect(onSelect).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /Springfield.*Illinois/ }));
    expect(onSelect).toHaveBeenCalledWith(cities[0]);
  });
});
