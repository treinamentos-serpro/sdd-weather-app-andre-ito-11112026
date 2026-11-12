import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/services/weatherService')>()),
  getWeather: vi.fn(),
  searchCities: vi.fn(),
}));

const firstCity: City = { name: 'São Paulo', latitude: -23, longitude: -46 };
const secondCity: City = { name: 'Campinas', latitude: -22, longitude: -47 };
const weather: WeatherData = {
  city: firstCity,
  timezone: 'America/Sao_Paulo',
  current: { time: '2026-11-11T12:00', temperatureC: 25 },
  forecastDays: [],
  fetchedAt: '2026-11-11T15:00:00Z',
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('useWeather', () => {
  it('starts idle and ignores empty searches', async () => {
    const { result } = renderHook(() => useWeather());
    expect(result.current).toMatchObject({
      status: 'idle',
      data: null,
      cities: [],
      error: null,
      query: '',
    });
    await act(() => result.current.search('   '));
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });

  it('shows search results without loading weather and loads only the selected city', async () => {
    vi.mocked(searchCities).mockResolvedValue([firstCity, secondCity]);
    vi.mocked(getWeather).mockResolvedValue({ ...weather, city: secondCity });
    const { result } = renderHook(() => useWeather());

    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.search('  São Paulo  ');
    });
    expect(result.current.status).toBe('loading');
    await act(() => pending);
    expect(searchCities).toHaveBeenCalledWith('São Paulo');
    expect(getWeather).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({
      status: 'results',
      cities: [firstCity, secondCity],
      data: null,
      query: 'São Paulo',
      error: null,
    });

    await act(() => result.current.selectCity(secondCity));
    expect(getWeather).toHaveBeenCalledExactlyOnceWith(secondCity);
    expect(result.current.data?.city).toEqual(secondCity);
  });

  it('reports an empty result without requesting weather', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Inexistente'));
    expect(result.current).toMatchObject({
      status: 'empty',
      data: null,
      cities: [],
      query: 'Inexistente',
    });
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('retries a failed search', async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'))
      .mockResolvedValueOnce([firstCity]);
    vi.mocked(getWeather).mockResolvedValue(weather);
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('São Paulo'));
    expect(result.current).toMatchObject({
      status: 'error',
      error: 'Falha de rede.',
      query: 'São Paulo',
    });
    await act(() => result.current.retry());
    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(result.current).toMatchObject({ status: 'results', error: null, data: null });
    await act(() => result.current.selectCity(firstCity));
    expect(result.current).toMatchObject({ status: 'success', data: weather });
  });

  it('retries failed weather without repeating the city search', async () => {
    vi.mocked(searchCities).mockResolvedValue([firstCity]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'))
      .mockResolvedValueOnce(weather);
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('São Paulo'));
    await act(() => result.current.selectCity(firstCity));
    expect(result.current).toMatchObject({
      status: 'error',
      error: 'Falha de rede.',
      cities: [firstCity],
    });
    await act(() => result.current.retry());
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(result.current).toMatchObject({ status: 'success', error: null, data: weather });
  });

  it('keeps cities without coordinates in results but prevents their weather request', async () => {
    vi.mocked(searchCities).mockResolvedValue([{ name: 'Cidade' }]);
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Cidade'));
    expect(result.current).toMatchObject({ status: 'results', cities: [{ name: 'Cidade' }] });
    expect(getWeather).not.toHaveBeenCalled();
    await act(() => result.current.selectCity({ name: 'Cidade' }));
    expect(result.current).toMatchObject({
      status: 'error',
      error: 'Coordenadas da cidade indisponíveis.',
    });
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('hides technical details from unexpected errors', async () => {
    vi.mocked(searchCities).mockRejectedValue(new Error('sensitive technical details'));
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('São Paulo'));
    expect(result.current).toMatchObject({
      status: 'error',
      error: 'Não foi possível buscar cidades. Tente novamente.',
    });
  });

  it('ignores a stale city search after a newer search succeeds', async () => {
    let resolveFirst: (cities: City[]) => void = () => {};
    vi.mocked(searchCities)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce([secondCity]);
    vi.mocked(getWeather).mockResolvedValue({ ...weather, city: secondCity });
    const { result } = renderHook(() => useWeather());
    let firstRequest: Promise<void> = Promise.resolve();
    act(() => {
      firstRequest = result.current.search('Primeira');
    });
    await act(() => result.current.search('Segunda'));
    await act(async () => {
      resolveFirst([firstCity]);
      await firstRequest;
    });
    expect(result.current).toMatchObject({
      status: 'results',
      query: 'Segunda',
      cities: [secondCity],
      data: null,
    });
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('ignores stale weather after another city is selected', async () => {
    let resolveFirst: (value: WeatherData) => void = () => {};
    vi.mocked(searchCities).mockResolvedValue([firstCity, secondCity]);
    vi.mocked(getWeather)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce({ ...weather, city: secondCity });
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('São Paulo'));
    let firstRequest: Promise<void> = Promise.resolve();
    await act(async () => {
      firstRequest = result.current.selectCity(firstCity);
      await Promise.resolve();
    });
    await act(() => result.current.selectCity(secondCity));
    await act(async () => {
      resolveFirst(weather);
      await firstRequest;
    });
    expect(result.current).toMatchObject({ status: 'success', data: { city: secondCity } });
  });
});
