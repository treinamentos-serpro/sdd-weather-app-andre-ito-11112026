import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastList from '../../src/components/ForecastList';
import { mockWeatherData } from '../../src/mocks/weatherData';

describe('ForecastList', () => {
  it('renders each forecast day with condition, temperatures and rain probability', () => {
    render(<ForecastList days={mockWeatherData.forecastDays} unit="celsius" />);

    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(5);

    const firstDay = within(articles[0]);
    expect(firstDay.getByRole('heading', { name: /11 de nov\./i })).toBeVisible();
    expect(firstDay.getByRole('img', { name: 'Parcialmente nublado' })).toBeVisible();
    expect(firstDay.getByText('26,4 °C')).toBeVisible();
    expect(firstDay.getByText('18,2 °C')).toBeVisible();
    expect(firstDay.getByText('20%')).toBeVisible();
  });

  it('formats maximum and minimum temperatures in the selected unit', () => {
    render(<ForecastList days={[mockWeatherData.forecastDays[0]]} unit="fahrenheit" />);

    expect(screen.getByText('79,5 °F')).toBeVisible();
    expect(screen.getByText('64,8 °F')).toBeVisible();
  });

  it('shows an empty state when no forecast days are available', () => {
    render(<ForecastList days={[]} unit="celsius" />);

    expect(screen.getByText('Previsão indisponível.')).toBeVisible();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('shows a missing daily measurement without replacing other values or inventing days', () => {
    render(
      <ForecastList
        days={[
          {
            date: '2026-11-11',
            minTemperatureC: 0,
            maxTemperatureC: 25.5,
            weatherCode: 3,
          },
        ]}
        unit="celsius"
      />,
    );

    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(1);
    expect(screen.getByText('Previsão incompleta.')).toBeVisible();
    expect(within(articles[0]).getByText('Indisponível')).toBeVisible();
    expect(within(articles[0]).getByText('0,0 °C')).toBeVisible();
    expect(within(articles[0]).getByText('25,5 °C')).toBeVisible();
    expect(within(articles[0]).getByText('Nublado')).toBeVisible();
  });
});
