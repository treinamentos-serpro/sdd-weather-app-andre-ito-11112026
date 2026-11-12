import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('exposes a search landmark and a labeled input', () => {
    render(<SearchBar disabled={false} onSearch={vi.fn()} />);

    expect(screen.getByRole('search', { name: 'Busca de cidade' })).toBeVisible();
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBeVisible();
  });

  it('trims the city before calling onSearch', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar disabled={false} onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), '  São Paulo  ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith('São Paulo');
  });

  it('does not search an empty or whitespace-only query', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar disabled={false} onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Digite o nome de uma cidade.');

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), '   ');
    fireEvent.submit(screen.getByRole('search'));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeVisible();
  });

  it.each([
    '',
    '   ',
  ])('keeps focus in the search field when submitting %j with Enter', async (value) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar disabled={false} onSearch={onSearch} />);

    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    await user.click(input);
    if (value) await user.type(input, value);
    await user.keyboard('{Enter}');

    expect(onSearch).not.toHaveBeenCalled();
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Digite o nome de uma cidade.');
  });

  it('disables the input and prevents searching when disabled', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar disabled onSearch={onSearch} />);

    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).not.toHaveBeenCalled();
  });
});
