import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    region: 'São Paulo',
    country: 'Brasil',
    countryCode: 'BR',
    latitude: -23.5505,
    longitude: -46.6333,
    timezone: 'America/Sao_Paulo',
  },
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-11-11T12:15:00-03:00',
    temperatureC: 24.7,
    apparentTemperatureC: 25.1,
    humidityPercent: 65,
    windSpeedKmh: 8.4,
    precipitationMm: 0.4,
    pressureHpa: 1013.2,
    weatherCode: 2,
  },
  forecastDays: [
    {
      date: '2026-11-11',
      minTemperatureC: 18.2,
      maxTemperatureC: 26.4,
      precipitationProbabilityPercent: 20,
      weatherCode: 2,
    },
    {
      date: '2026-11-12',
      minTemperatureC: 19.1,
      maxTemperatureC: 25.3,
      precipitationProbabilityPercent: 70,
      weatherCode: 61,
    },
    {
      date: '2026-11-13',
      minTemperatureC: 17.6,
      maxTemperatureC: 23.8,
      precipitationProbabilityPercent: 40,
      weatherCode: 3,
    },
    {
      date: '2026-11-14',
      minTemperatureC: 16.9,
      maxTemperatureC: 24.2,
      precipitationProbabilityPercent: 10,
      weatherCode: 1,
    },
    {
      date: '2026-11-15',
      minTemperatureC: 18.4,
      maxTemperatureC: 27.1,
      precipitationProbabilityPercent: 5,
      weatherCode: 0,
    },
  ],
  fetchedAt: '2026-11-11T15:15:00.000Z',
};
