import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

async function fetchWithTimeout(url: string): Promise<unknown> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new WeatherServiceError('A requisição demorou demais.'));
    }, 8_000);
  });

  try {
    return await Promise.race([
      (async () => {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new WeatherServiceError('Não foi possível consultar os dados. Tente novamente.');
        }
        try {
          return await response.json();
        } catch (error) {
          if (error instanceof SyntaxError) {
            throw new WeatherServiceError('Os dados recebidos são inválidos. Tente novamente.');
          }
          throw error;
        }
      })(),
      timeoutPromise,
    ]);
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    if (
      controller.signal.aborted ||
      (typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        error.name === 'AbortError')
    ) {
      throw new WeatherServiceError('A requisição demorou demais.');
    }
    throw new WeatherServiceError('Falha de rede.');
  } finally {
    clearTimeout(timeout);
  }
}

function mapCity(value: unknown): City {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('name' in value) ||
    typeof value.name !== 'string'
  ) {
    throw new WeatherServiceError('Resposta de geocodificação inválida.');
  }

  const result = value as Record<string, unknown>;
  return {
    name: value.name,
    ...(optionalNumber(result.id) !== undefined && { id: optionalNumber(result.id) }),
    ...(typeof result.admin1 === 'string' && { region: result.admin1 }),
    ...(typeof result.country === 'string' && { country: result.country }),
    ...(typeof result.country_code === 'string' && { countryCode: result.country_code }),
    ...(optionalNumber(result.latitude) !== undefined && {
      latitude: optionalNumber(result.latitude),
    }),
    ...(optionalNumber(result.longitude) !== undefined && {
      longitude: optionalNumber(result.longitude),
    }),
    ...(typeof result.timezone === 'string' && { timezone: result.timezone }),
  };
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const data = await fetchWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`,
  );
  if (!isRecord(data)) {
    throw new WeatherServiceError('Resposta de geocodificação inválida.');
  }
  if (data.results == null) return [];
  if (!Array.isArray(data.results)) {
    throw new WeatherServiceError('Resposta de geocodificação inválida.');
  }

  return data.results.map(mapCity);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function numberAt(value: unknown, index: number): number | undefined {
  if (!Array.isArray(value)) return undefined;
  const item: unknown = value[index];
  return typeof item === 'number' && Number.isFinite(item) ? item : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export async function getWeather(city: City): Promise<WeatherData> {
  if (!Number.isFinite(city.latitude) || !Number.isFinite(city.longitude)) {
    throw new WeatherServiceError('Coordenadas da cidade indisponíveis.');
  }

  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
    daily: 'temperature_2m_min,temperature_2m_max,weather_code,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
  });
  const data = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${params}`);

  if (
    !isRecord(data) ||
    (data.current != null && !isRecord(data.current)) ||
    (data.daily != null && !isRecord(data.daily)) ||
    (isRecord(data.daily) && data.daily.time != null && !Array.isArray(data.daily.time)) ||
    (data.timezone != null && typeof data.timezone !== 'string')
  ) {
    throw new WeatherServiceError('Resposta de previsão incompleta.');
  }

  const currentData = isRecord(data.current) ? data.current : undefined;
  const current: CurrentWeather | undefined = currentData && {
    time: typeof currentData.time === 'string' ? currentData.time : undefined,
    temperatureC: optionalNumber(currentData.temperature_2m),
    apparentTemperatureC: optionalNumber(currentData.apparent_temperature),
    humidityPercent: optionalNumber(currentData.relative_humidity_2m),
    windSpeedKmh: optionalNumber(currentData.wind_speed_10m),
    weatherCode: optionalNumber(currentData.weather_code),
  };
  const daily = isRecord(data.daily) ? data.daily : {};
  const dates: unknown[] = Array.isArray(daily.time) ? daily.time : [];
  const forecastDays: ForecastDay[] = dates.slice(0, 5).flatMap((date, index) =>
    typeof date === 'string' && date
      ? [
          {
            date,
            minTemperatureC: numberAt(daily.temperature_2m_min, index),
            maxTemperatureC: numberAt(daily.temperature_2m_max, index),
            precipitationProbabilityPercent: numberAt(daily.precipitation_probability_max, index),
            weatherCode: numberAt(daily.weather_code, index),
          },
        ]
      : [],
  );

  return {
    city,
    timezone: typeof data.timezone === 'string' ? data.timezone : undefined,
    current,
    forecastDays,
    fetchedAt: new Date().toISOString(),
  };
}
