import { useEffect, useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

type Status = 'idle' | 'loading' | 'results' | 'success' | 'error' | 'empty';
type Operation = { type: 'search'; name: string } | { type: 'weather'; city: City };

export function useWeather() {
  const [status, setStatus] = useState<Status>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const requestId = useRef(0);
  const lastOperation = useRef<Operation | null>(null);

  useEffect(
    () => () => {
      requestId.current += 1;
    },
    [],
  );

  async function loadWeather(city: City, activeRequestId: number) {
    lastOperation.current = { type: 'weather', city };
    if (!Number.isFinite(city.latitude) || !Number.isFinite(city.longitude)) {
      setError('Coordenadas da cidade indisponíveis.');
      setStatus('error');
      return;
    }

    try {
      const weather = await getWeather(city);
      if (activeRequestId !== requestId.current) return;
      setData(weather);
      setStatus(!weather.current && weather.forecastDays.length === 0 ? 'empty' : 'success');
    } catch (reason) {
      if (activeRequestId !== requestId.current) return;
      setError(
        reason instanceof WeatherServiceError
          ? reason.message
          : 'Não foi possível carregar o clima. Tente novamente.',
      );
      setStatus('error');
    }
  }

  async function search(name: string) {
    const activeRequestId = ++requestId.current;
    const normalizedName = name.trim();
    setQuery(normalizedName);
    setData(null);
    setCities([]);
    setError(null);

    if (!normalizedName) {
      lastOperation.current = null;
      setStatus('idle');
      return;
    }

    lastOperation.current = { type: 'search', name: normalizedName };
    setStatus('loading');
    try {
      const results = await searchCities(normalizedName);
      if (activeRequestId !== requestId.current) return;
      setCities(results);
      if (results.length === 0) {
        setStatus('empty');
        return;
      }
      setStatus('results');
    } catch (reason) {
      if (activeRequestId !== requestId.current) return;
      setError(
        reason instanceof WeatherServiceError
          ? reason.message
          : 'Não foi possível buscar cidades. Tente novamente.',
      );
      setStatus('error');
    }
  }

  async function selectCity(city: City) {
    const activeRequestId = ++requestId.current;
    setStatus('loading');
    setData(null);
    setError(null);
    await loadWeather(city, activeRequestId);
  }

  async function retry() {
    const operation = lastOperation.current;
    if (!operation) return;
    if (operation.type === 'search') {
      await search(operation.name);
    } else {
      await selectCity(operation.city);
    }
  }

  return { status, data, cities, error, query, search, selectCity, retry };
}
