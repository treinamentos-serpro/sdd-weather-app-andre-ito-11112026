import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/mocks/weatherData';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/services/weatherService')>()),
  getWeather: vi.fn(),
  searchCities: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('App', () => {
  it('starts idle and shows loading before rendering weather', async () => {
    let resolveSearch: (cities: City[]) => void = () => {};
    vi.mocked(searchCities).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSearch = resolve;
        }),
    );
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Busque uma cidade' })).toBeVisible();

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(screen.getByRole('status')).toHaveTextContent('Buscando previsão do tempo...');
    expect(screen.getByRole('region', { name: 'Resultado da previsão' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBeDisabled();
    await act(async () => {
      resolveSearch([mockWeatherData.city]);
    });
    expect(screen.getByRole('button', { name: /São Paulo/ })).toBeVisible();
    expect(getWeather).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /São Paulo/ }));
    expect(await screen.findByRole('region', { name: 'Clima atual em São Paulo' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Resultado da previsão' })).toHaveAttribute(
      'aria-busy',
      'false',
    );
    expect(screen.getByRole('region', { name: 'Resultado da previsão' })).toHaveFocus();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(searchCities).toHaveBeenCalledWith('São Paulo');
    expect(getWeather).toHaveBeenCalledWith(mockWeatherData.city);
  });

  it('shows the empty state when no city matches', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Curitiba');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Resultado da previsão' })).toHaveFocus();
    expect(screen.getByText(/Curitiba/)).toBeVisible();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('renders markup in an unmatched search as text without creating elements', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const user = userEvent.setup();
    const query = "D'Água-<img src=x> & região";
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), query);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    const emptyState = await screen.findByRole('status', { name: 'Nenhuma cidade encontrada' });
    expect(emptyState).toHaveTextContent(query);
    expect(emptyState.querySelector('img')).toBeNull();
    expect(searchCities).toHaveBeenCalledWith(query);
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('keeps the unit as UI state and updates displayed temperatures', async () => {
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /São Paulo/ }));
    await screen.findByRole('region', { name: 'Clima atual em São Paulo' });

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('76,5 °F')).toBeVisible();
  });

  it('identifies the selected city when current weather is unavailable', async () => {
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue({
      ...mockWeatherData,
      current: undefined,
      forecastDays: [mockWeatherData.forecastDays[0]],
    });
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /São Paulo/ }));
    expect(await screen.findByRole('heading', { name: 'Clima atual indisponível' })).toBeVisible();
    expect(screen.getByText('Os dados atuais não estão disponíveis para São Paulo.')).toBeVisible();
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });

  it('retries the failed weather request without repeating the search', async () => {
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'))
      .mockResolvedValueOnce(mockWeatherData);
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /São Paulo/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');
    expect(screen.getByRole('region', { name: 'Resultado da previsão' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('region', { name: 'Clima atual em São Paulo' })).toBeVisible();
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(2);
  });

  it('updates temperatures without requesting weather again', async () => {
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /São Paulo/ }));
    await screen.findByRole('region', { name: 'Clima atual em São Paulo' });
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(screen.getByText('76,5 °F')).toBeVisible();
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it('retains the selected unit during loading and converts current and daily values', async () => {
    let resolveWeather: (value: WeatherData) => void = () => {};
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveWeather = resolve;
        }),
    );
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /São Paulo/ }));
    await waitFor(() => expect(getWeather).toHaveBeenCalledOnce());
    expect(screen.getByRole('status')).toHaveTextContent('Buscando previsão');
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    await act(async () => {
      resolveWeather({
        ...mockWeatherData,
        current: { time: '2026-11-11T12:00', temperatureC: 0 },
        forecastDays: [{ date: '2026-11-11', minTemperatureC: -10, maxTemperatureC: 25.5 }],
      });
    });
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveFocus();
    const currentWeather = screen.getByRole('region', { name: 'Clima atual em São Paulo' });
    const forecast = screen.getByRole('article');
    expect(within(currentWeather).getByText('32,0 °F')).toBeVisible();
    expect(within(forecast).getByText('77,9 °F')).toBeVisible();
    expect(within(forecast).getByText('14,0 °F')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Celsius' }));
    expect(within(currentWeather).getByText('0,0 °C')).toBeVisible();
    expect(within(forecast).getByText('25,5 °C')).toBeVisible();
    expect(within(forecast).getByText('-10,0 °C')).toBeVisible();
    expect(searchCities).toHaveBeenCalledOnce();
    expect(getWeather).toHaveBeenCalledOnce();
  });

  it('shows a search failure and retries without losing the query', async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(
        new WeatherServiceError('Não foi possível consultar os dados. Tente novamente.'),
      )
      .mockResolvedValueOnce([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível consultar os dados.',
    );
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toHaveValue('São Paulo');
    expect(
      screen.queryByRole('heading', { name: 'Nenhuma cidade encontrada' }),
    ).not.toBeInTheDocument();
    expect(getWeather).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('button', { name: /São Paulo/ })).toBeVisible();
    expect(getWeather).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: /São Paulo/ }));
    expect(await screen.findByRole('region', { name: 'Clima atual em São Paulo' })).toBeVisible();
    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenCalledOnce();
  });
});
