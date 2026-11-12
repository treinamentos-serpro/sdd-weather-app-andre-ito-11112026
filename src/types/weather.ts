export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id?: number;
  name: string;
  region?: string;
  country?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface CurrentWeather {
  time?: string;
  temperatureC?: number;
  apparentTemperatureC?: number;
  humidityPercent?: number;
  windSpeedKmh?: number;
  precipitationMm?: number;
  pressureHpa?: number;
  weatherCode?: number;
}

export interface ForecastDay {
  date: string;
  minTemperatureC?: number;
  maxTemperatureC?: number;
  precipitationProbabilityPercent?: number;
  weatherCode?: number;
}

export interface WeatherData {
  city: City;
  timezone?: string;
  current?: CurrentWeather;
  forecastDays: ForecastDay[];
  fetchedAt: string;
}

export interface WeatherAppError {
  kind: 'network' | 'http' | 'timeout' | 'invalid-response';
  retryable: boolean;
  messageKey: string;
}

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading'; requestId: number }
  | { status: 'success'; data: T }
  | { status: 'empty'; reason: 'no-results' | 'no-weather-data' }
  | { status: 'error'; error: WeatherAppError };
