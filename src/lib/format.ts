const dayLabelFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  weekday: 'short',
  timeZone: 'UTC',
});

export function formatDayLabel(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    return 'Data indisponível';
  }

  const [, year, month, day] = match;
  const dateValue = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12));

  if (
    dateValue.getUTCFullYear() !== Number(year) ||
    dateValue.getUTCMonth() !== Number(month) - 1 ||
    dateValue.getUTCDate() !== Number(day)
  ) {
    return 'Data indisponível';
  }

  return dayLabelFormatter.format(dateValue);
}
