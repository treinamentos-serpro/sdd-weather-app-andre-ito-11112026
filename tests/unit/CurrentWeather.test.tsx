import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import type { City, CurrentWeather as CurrentWeatherData } from '../../src/types/weather';

const city: City = {
  name: 'São Paulo',
  country: 'Brasil',
};

const current: CurrentWeatherData = {
  time: '2026-11-11T12:15:00-03:00',
  temperatureC: 24.7,
  apparentTemperatureC: 25.1,
  humidityPercent: 65,
  windSpeedKmh: 8.4,
  precipitationMm: 0.4,
  pressureHpa: 1013.2,
  weatherCode: 2,
};

describe('CurrentWeather', () => {
  it('renders the city, current temperature, weather icon, condition and metrics', () => {
    render(<CurrentWeather city={city} current={current} unit="celsius" />);

    expect(screen.getByRole('region', { name: 'Clima atual em São Paulo' })).toBeVisible();
    expect(screen.getByText('24,7 °C')).toBeVisible();
    expect(screen.getByRole('img', { name: 'Parcialmente nublado' })).toBeVisible();
    expect(screen.getByText('Umidade')).toBeVisible();
    expect(screen.getByText('Sensação térmica')).toBeVisible();
    expect(screen.getByText('25,1 °C')).toBeVisible();
    expect(screen.getByText('65 %')).toBeVisible();
    expect(screen.getByText('8,4 km/h')).toBeVisible();
    expect(screen.getByText('0,4 mm')).toBeVisible();
    expect(screen.getByText('1.013,2 hPa')).toBeVisible();
  });

  it('formats the hero temperature in the selected unit', () => {
    render(<CurrentWeather city={city} current={current} unit="fahrenheit" />);

    expect(screen.getByText('76,5 °F')).toBeVisible();
  });

  it('shows missing measurements as unavailable', () => {
    render(
      <CurrentWeather city={city} current={{ time: '2026-11-11T12:15:00-03:00' }} unit="celsius" />,
    );

    expect(screen.getAllByText('Indisponível')).toHaveLength(6);
    expect(screen.getByRole('img', { name: 'Condição indisponível' })).toBeVisible();
  });

  it('uses the unknown-code fallback', () => {
    render(
      <CurrentWeather city={city} current={{ ...current, weatherCode: 999 }} unit="celsius" />,
    );

    expect(screen.getByText('Condição indisponível')).toBeVisible();
    expect(screen.getByRole('img', { name: 'Condição indisponível' })).toBeVisible();
  });
});
