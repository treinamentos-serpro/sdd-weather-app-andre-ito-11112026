import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

describe('state components', () => {
  it('announces loading content through a status role', () => {
    render(<LoadingState message="Buscando cidade..." />);

    expect(screen.getByRole('status')).toHaveTextContent('Buscando cidade...');
  });

  it('shows an error message and calls onRetry', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Verifique sua conexão." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Verifique sua conexão.');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows the empty-state title and hint', () => {
    render(<EmptyState hint="Tente buscar outra cidade." title="Nenhum resultado" />);

    expect(screen.getByRole('status', { name: 'Nenhum resultado' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Nenhum resultado' })).toBeVisible();
    expect(screen.getByText('Tente buscar outra cidade.')).toBeVisible();
  });
});
