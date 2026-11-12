import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled: boolean;
}

export default function SearchBar({ onSearch, disabled }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showEmptyError, setShowEmptyError] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) {
      return;
    }

    const city = query.trim();
    if (!city) {
      setShowEmptyError(true);
      return;
    }

    setShowEmptyError(false);
    onSearch(city);
  }

  return (
    <form
      aria-label="Busca de cidade"
      className="flex w-full flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:flex-row sm:items-end"
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="flex-1">
        <label className="mb-1.5 block text-sm font-medium text-white" htmlFor="city-search">
          Cidade
        </label>
        <input
          aria-describedby={showEmptyError ? 'city-search-error' : undefined}
          aria-invalid={showEmptyError}
          autoComplete="off"
          className="min-h-11 w-full rounded-lg border border-white/15 bg-night-900/70 px-3 py-2 text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          id="city-search"
          name="city"
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            if (event.currentTarget.value.trim()) {
              setShowEmptyError(false);
            }
          }}
          placeholder="Ex.: São Paulo"
          type="search"
          value={query}
        />
        {showEmptyError && (
          <p className="mt-1.5 text-sm text-red-200" id="city-search-error" role="alert">
            Digite o nome de uma cidade.
          </p>
        )}
      </div>
      <button
        className="min-h-11 rounded-lg bg-accent-500 px-5 py-2 font-medium text-night-900 transition-colors enabled:hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        type="submit"
      >
        Buscar
      </button>
    </form>
  );
}
