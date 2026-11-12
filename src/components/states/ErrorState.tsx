interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section
      aria-label="Erro ao carregar previsão"
      className="rounded-xl border border-red-200/20 bg-white/5 p-5 text-white shadow-glass backdrop-blur-md"
      role="alert"
    >
      <h2 className="text-base font-semibold">Não foi possível carregar os dados</h2>
      <p className="mt-2 text-sm text-white/75">{message}</p>
      <button
        className="mt-4 min-h-11 rounded-lg bg-accent-500 px-4 py-2 font-medium text-night-900 transition-colors hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </section>
  );
}
