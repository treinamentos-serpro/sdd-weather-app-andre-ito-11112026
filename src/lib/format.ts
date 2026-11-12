const dayLabelFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
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

export function formatDateTime(value: string | undefined): string {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?$/.exec(
      value ?? '',
    );
  if (!match) {
    return 'Indisponível';
  }

  const [, year, month, day, hour, minute] = match;
  const dateValue = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)),
  );
  if (
    dateValue.getUTCFullYear() !== Number(year) ||
    dateValue.getUTCMonth() !== Number(month) - 1 ||
    dateValue.getUTCDate() !== Number(day) ||
    dateValue.getUTCHours() !== Number(hour) ||
    dateValue.getUTCMinutes() !== Number(minute)
  ) {
    return 'Indisponível';
  }

  const parts = Object.fromEntries(
    dateTimeFormatter
      .formatToParts(dateValue)
      .map(({ type, value: partValue }) => [type, partValue]),
  );
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
}
