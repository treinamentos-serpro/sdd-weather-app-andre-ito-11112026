import { expect, test } from '@playwright/test';

test('busca uma cidade e alterna a temperatura na previsão de cinco dias', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search?*', async (route) => {
    await route.fulfill({
      json: {
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
            admin1: 'São Paulo',
            country: 'Brasil',
            country_code: 'BR',
            timezone: 'America/Sao_Paulo',
          },
        ],
      },
    });
  });

  await page.route('https://api.open-meteo.com/v1/forecast?*', async (route) => {
    await route.fulfill({
      json: {
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-11-11T12:00',
          temperature_2m: 0,
          apparent_temperature: -1,
          relative_humidity_2m: 70,
          weather_code: 3,
          wind_speed_10m: 10,
        },
        daily: {
          time: ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'],
          temperature_2m_min: [0, 1, 2, 3, 4],
          temperature_2m_max: [10, 11, 12, 13, 14],
          weather_code: [3, 1, 2, 61, 0],
          precipitation_probability_max: [20, 10, 30, 70, 0],
        },
      },
    });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: /São Paulo/ }).click();

  const currentWeather = page.getByRole('region', { name: 'Clima atual em São Paulo' });
  await expect(currentWeather.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(currentWeather.getByText('0,0 °C')).toBeVisible();

  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(forecast).toBeVisible();
  await expect(forecast.getByRole('article')).toHaveCount(5);

  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(currentWeather.getByText('32,0 °F')).toBeVisible();
  await expect(forecast.getByText('32,0 °F')).toBeVisible();
});

test('exibe mensagem de cidade não encontrada quando results está ausente', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/v1/search?*', async (route) => {
    await route.fulfill({ json: {} });
  });
  await page.route('https://api.open-meteo.com/v1/forecast?*', async (route) => {
    forecastRequests += 1;
    await route.abort();
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Cidade sem resultado');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Cidade' })).toHaveValue('Cidade sem resultado');
  expect(forecastRequests).toBe(0);
});

test('renderiza clima e previsão no viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route('https://geocoding-api.open-meteo.com/v1/search?*', async (route) => {
    await route.fulfill({
      json: {
        results: [{ name: 'São Paulo', latitude: -23.55, longitude: -46.63 }],
      },
    });
  });
  await page.route('https://api.open-meteo.com/v1/forecast?*', async (route) => {
    await route.fulfill({
      json: {
        timezone: 'America/Sao_Paulo',
        current: { time: '2026-11-11T12:00', temperature_2m: 0, weather_code: 3 },
        daily: {
          time: ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'],
          temperature_2m_min: [0, 1, 2, 3, 4],
          temperature_2m_max: [10, 11, 12, 13, 14],
          weather_code: [3, 1, 2, 61, 0],
          precipitation_probability_max: [20, 10, 30, 70, 0],
        },
      },
    });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: /São Paulo/ }).click();

  const currentWeather = page.getByRole('region', { name: 'Clima atual em São Paulo' });
  await expect(currentWeather.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(currentWeather.getByText('0,0 °C')).toBeVisible();
  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(forecast.getByRole('article')).toHaveCount(5);
  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(currentWeather.getByText('32,0 °F')).toBeVisible();
});

test('exibe previsão incompleta sem fabricar medições ou dias', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/v1/search?*', async (route) => {
    await route.fulfill({
      json: { results: [{ name: 'São Paulo', latitude: -23.55, longitude: -46.63 }] },
    });
  });
  await page.route('https://api.open-meteo.com/v1/forecast?*', async (route) => {
    await route.fulfill({
      json: {
        timezone: 'America/Sao_Paulo',
        current: { time: '2026-11-11T12:00', temperature_2m: 20, weather_code: 3 },
        daily: {
          time: ['2026-11-11', '2026-11-12'],
          temperature_2m_min: [null, 12],
          temperature_2m_max: [25],
          precipitation_probability_max: [0, null],
          weather_code: [null, 3],
        },
      },
    });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: /São Paulo/ }).click();
  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(forecast.getByText('Previsão incompleta.')).toBeVisible();
  const days = forecast.getByRole('article');
  await expect(days).toHaveCount(2);
  await expect(days.nth(0).getByText('25,0 °C')).toBeVisible();
  await expect(days.nth(0).getByText('0%')).toBeVisible();
  await expect(days.nth(0).getByText('Indisponível', { exact: true })).toBeVisible();
  await expect(days.nth(1).getByText('Indisponível', { exact: true })).toHaveCount(2);
});
