import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('searchCities', () => {
  it('does not request empty or whitespace-only names', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('')).resolves.toEqual([]);
    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('encodes the trimmed name and maps geocoding results', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 1,
            name: 'São Paulo',
            admin1: 'São Paulo',
            country: 'Brasil',
            country_code: 'BR',
            latitude: -23.55,
            longitude: -46.63,
            timezone: 'America/Sao_Paulo',
          },
          { name: 'Outra cidade' },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('  São Paulo & região  ')).resolves.toEqual([
      {
        id: 1,
        name: 'São Paulo',
        region: 'São Paulo',
        country: 'Brasil',
        countryCode: 'BR',
        latitude: -23.55,
        longitude: -46.63,
        timezone: 'America/Sao_Paulo',
      },
      { name: 'Outra cidade' },
    ]);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Paulo%20%26%20regi%C3%A3o&count=10&language=pt&format=json',
      { signal: expect.any(AbortSignal) },
    );
  });

  it('preserves punctuation, Unicode and markup characters in one encoded query parameter', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [] }) });
    vi.stubGlobal('fetch', fetchMock);
    const query = "D'Água-<img src=x> & região";

    await expect(searchCities(`  ${query}  `)).resolves.toEqual([]);

    expect(fetchMock).toHaveBeenCalledOnce();
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get('name')).toBe(query);
    expect(url.searchParams.getAll('name')).toHaveLength(1);
    expect(url.searchParams.get('language')).toBe('pt');
    expect(fetchMock.mock.calls[0][0]).toContain(encodeURIComponent(query));
  });

  it('returns an empty list when results is missing, null or empty', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ results: null }) });
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('cidade')).resolves.toEqual([]);
    await expect(searchCities('cidade')).resolves.toEqual([]);
    await expect(searchCities('cidade')).resolves.toEqual([]);
  });

  it('handles null results and omits unavailable city fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ results: null }) })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: [
              {
                name: 'Cidade',
                id: null,
                admin1: null,
                country: null,
                country_code: null,
                latitude: null,
                longitude: null,
                timezone: null,
              },
            ],
          }),
        }),
    );

    await expect(searchCities('cidade')).resolves.toEqual([]);
    await expect(searchCities('cidade')).resolves.toEqual([{ name: 'Cidade' }]);
  });

  it('throws WeatherServiceError for an unsuccessful response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    await expect(searchCities('cidade')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('treats a geocoding rate limit as an error rather than an empty result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }));

    await expect(searchCities('cidade')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('rejects malformed result structures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [{}] }) }),
    );

    await expect(searchCities('cidade')).rejects.toBeInstanceOf(WeatherServiceError);
  });
});

describe('fetch timeout and network errors', () => {
  const requests = [
    { name: 'geocoding', run: () => searchCities('São Paulo') },
    {
      name: 'forecast',
      run: () => getWeather({ name: 'São Paulo', latitude: -23, longitude: -46 }),
    },
  ];

  it.each(requests)('aborts $name after 8 seconds and clears the timer', async ({ run }) => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, options: RequestInit) => {
        signal = options.signal ?? undefined;
        return new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        });
      }),
    );

    const result = run();
    const assertion = expect(result).rejects.toEqual(
      new WeatherServiceError('A requisição demorou demais.'),
    );
    await vi.advanceTimersByTimeAsync(7_999);
    expect(signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await assertion;
    expect(signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(requests)('converts $name network failures and clears the timer', async ({ run }) => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network error')));

    await expect(run()).rejects.toEqual(new WeatherServiceError('Falha de rede.'));
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(requests)('times out when the $name response body stalls', async ({ run }) => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => new Promise(() => {}) }),
    );

    const result = run();
    const assertion = expect(result).rejects.toEqual(
      new WeatherServiceError('A requisição demorou demais.'),
    );
    await vi.advanceTimersByTimeAsync(8_000);
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(requests)('reports invalid $name JSON with a friendly error', async ({ run }) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('unexpected token');
        },
      }),
    );

    await expect(run()).rejects.toEqual(
      new WeatherServiceError('Os dados recebidos são inválidos. Tente novamente.'),
    );
  });

  it('clears the timer when the request succeeds', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [] }) }),
    );

    await expect(searchCities('São Paulo')).resolves.toEqual([]);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('getWeather', () => {
  const city = { name: 'São Paulo', latitude: -23.55, longitude: -46.63 };
  const payload = {
    timezone: 'America/Sao_Paulo',
    current: {
      time: '2026-11-11T12:15',
      temperature_2m: 25,
      apparent_temperature: 26,
      relative_humidity_2m: 70,
      weather_code: 3,
      wind_speed_10m: 11,
    },
    daily: {
      time: ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'],
      temperature_2m_min: [10, 11, 12, 13, 14],
      temperature_2m_max: [20, 21, 22, 23, 24],
      precipitation_probability_max: [0, 10, 20, 30, 40],
      weather_code: [1, 2, 3, 61, 63],
    },
  };

  it('requests and maps current weather and five daily forecasts', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => payload });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);
    expect(result).toEqual({
      city,
      timezone: 'America/Sao_Paulo',
      fetchedAt: expect.any(String),
      current: {
        time: '2026-11-11T12:15',
        temperatureC: 25,
        apparentTemperatureC: 26,
        humidityPercent: 70,
        weatherCode: 3,
        windSpeedKmh: 11,
      },
      forecastDays: payload.daily.time.map((date, index) => ({
        date,
        minTemperatureC: payload.daily.temperature_2m_min[index],
        maxTemperatureC: payload.daily.temperature_2m_max[index],
        precipitationProbabilityPercent: payload.daily.precipitation_probability_max[index],
        weatherCode: payload.daily.weather_code[index],
      })),
    });
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(`${url.origin}${url.pathname}`).toBe('https://api.open-meteo.com/v1/forecast');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      latitude: '-23.55',
      longitude: '-46.63',
      current:
        'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
      daily: 'temperature_2m_min,temperature_2m_max,weather_code,precipitation_probability_max',
      forecast_days: '5',
      timezone: 'auto',
      temperature_unit: 'celsius',
      wind_speed_unit: 'kmh',
    });
  });

  it('retains daily data when current and timezone are null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ...payload, current: null, timezone: null }),
      }),
    );
    const result = await getWeather(city);
    expect(result.current).toBeUndefined();
    expect(result.timezone).toBeUndefined();
    expect(result.forecastDays).toHaveLength(5);
  });

  it('retains current data when daily and current time are missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ...payload, current: { temperature_2m: 0 }, daily: null }),
      }),
    );
    const result = await getWeather(city);
    expect(result.current).toMatchObject({ time: undefined, temperatureC: 0 });
    expect(result.forecastDays).toEqual([]);
  });

  it('returns no forecast days when the daily time array is absent', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ...payload, daily: { ...payload.daily, time: null } }),
      }),
    );
    const result = await getWeather(city);
    expect(result.forecastDays).toEqual([]);
  });

  it('rejects incompatible non-null forecast structures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ...payload, daily: { time: 'invalid' } }),
      }),
    );
    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('preserves partial daily values without inventing missing dates', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ...payload,
          daily: {
            ...payload.daily,
            time: ['2026-11-11', null, '2026-11-13'],
            temperature_2m_min: [10],
          },
        }),
      }),
    );
    const result = await getWeather(city);
    expect(result.forecastDays).toHaveLength(2);
    expect(result.forecastDays[1]).toMatchObject({
      date: '2026-11-13',
      minTemperatureC: undefined,
      maxTemperatureC: 22,
    });
  });

  it('distinguishes missing precipitation from a measured zero in partial data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ...payload,
          current: { ...payload.current, temperature_2m: null },
          daily: { ...payload.daily, precipitation_probability_max: [null, 0, 20, 30, 40] },
        }),
      }),
    );

    const result = await getWeather(city);
    expect(result.current).toMatchObject({ temperatureC: undefined, humidityPercent: 70 });
    expect(result.forecastDays[0]).toMatchObject({
      date: '2026-11-11',
      precipitationProbabilityPercent: undefined,
      maxTemperatureC: 20,
    });
    expect(result.forecastDays[1]).toMatchObject({
      date: '2026-11-12',
      precipitationProbabilityPercent: 0,
      maxTemperatureC: 21,
    });
  });

  it('keeps null weather measurements unavailable without inventing zeroes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          timezone: null,
          current: {
            time: null,
            temperature_2m: null,
            apparent_temperature: null,
            relative_humidity_2m: null,
            wind_speed_10m: null,
            weather_code: null,
          },
          daily: {
            time: ['2026-11-11', null],
            temperature_2m_min: null,
            temperature_2m_max: [null],
            precipitation_probability_max: [null],
            weather_code: [null],
          },
        }),
      }),
    );

    const result = await getWeather(city);
    expect(result.timezone).toBeUndefined();
    expect(result.current).toEqual({
      time: undefined,
      temperatureC: undefined,
      apparentTemperatureC: undefined,
      humidityPercent: undefined,
      windSpeedKmh: undefined,
      weatherCode: undefined,
    });
    expect(result.forecastDays).toEqual([
      {
        date: '2026-11-11',
        minTemperatureC: undefined,
        maxTemperatureC: undefined,
        precipitationProbabilityPercent: undefined,
        weatherCode: undefined,
      },
    ]);
  });

  it.fails('maps null precipitation to zero (not supported by the current specification)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ...payload,
          daily: { ...payload.daily, precipitation_probability_max: [null, 10, 20, 30, 40] },
        }),
      }),
    );

    const result = await getWeather(city);
    expect(result.forecastDays[0].precipitationProbabilityPercent).toBe(0);
  });

  it('rejects missing coordinates without calling the network', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(getWeather({ name: 'Cidade' })).rejects.toBeInstanceOf(WeatherServiceError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects HTTP errors and invalid JSON', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError();
        },
      });
    vi.stubGlobal('fetch', fetchMock);
    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });
});
