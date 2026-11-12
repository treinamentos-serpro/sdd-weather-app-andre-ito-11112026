export interface WeatherPresentation {
  condition: string;
  icon: string;
}

const presentations: Record<number, WeatherPresentation> = {
  0: { condition: 'Céu limpo', icon: '☀️' },
  1: { condition: 'Predominantemente limpo', icon: '🌤️' },
  2: { condition: 'Parcialmente nublado', icon: '⛅' },
  3: { condition: 'Nublado', icon: '☁️' },
  45: { condition: 'Neblina', icon: '🌫️' },
  48: { condition: 'Neblina com geada', icon: '🌫️' },
  51: { condition: 'Garoa fraca', icon: '🌦️' },
  53: { condition: 'Garoa moderada', icon: '🌦️' },
  55: { condition: 'Garoa intensa', icon: '🌧️' },
  61: { condition: 'Chuva fraca', icon: '🌧️' },
  63: { condition: 'Chuva moderada', icon: '🌧️' },
  65: { condition: 'Chuva intensa', icon: '🌧️' },
  71: { condition: 'Neve fraca', icon: '🌨️' },
  73: { condition: 'Neve moderada', icon: '🌨️' },
  75: { condition: 'Neve intensa', icon: '❄️' },
  80: { condition: 'Pancadas de chuva fracas', icon: '🌦️' },
  81: { condition: 'Pancadas de chuva moderadas', icon: '🌧️' },
  82: { condition: 'Pancadas de chuva fortes', icon: '🌧️' },
  95: { condition: 'Trovoada', icon: '⛈️' },
  96: { condition: 'Trovoada com granizo', icon: '⛈️' },
  99: { condition: 'Trovoada com granizo intenso', icon: '⛈️' },
};

export function getWeatherPresentation(weatherCode?: number): WeatherPresentation {
  if (weatherCode === undefined) {
    return { condition: 'Condição indisponível', icon: '🌡️' };
  }

  return (
    presentations[weatherCode] ?? {
      condition: 'Condição indisponível',
      icon: '🌡️',
    }
  );
}
