import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Item } from '@depois/shared';
import { ItemCard } from './item-card';

const item: Item = {
  id: '1',
  title: 'Past Lives',
  url: null,
  category: 'movie',
  notes: null,
  seen: false,
  seenAt: null,
  createdAt: '2026-11-06T12:00:00.000Z',
  updatedAt: '2026-11-06T12:00:00.000Z',
};

const labels = {
  seen: 'Visto',
  markSeen: 'Marcar Past Lives como visto',
  markUnseen: 'Marcar Past Lives como não visto',
  edit: 'Editar',
  remove: 'Excluir',
  noLink: 'Sem link',
  openLink: 'Abrir {host}',
  category: 'Filmes',
};

describe('ItemCard', () => {
  it('shows a name saved without a link and marks it seen', () => {
    const onToggleSeen = vi.fn();
    render(
      <ItemCard
        item={item}
        labels={labels}
        locale="pt-BR"
        onToggleSeen={onToggleSeen}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Past Lives' })).toBeTruthy();
    expect(screen.getByText('Sem link')).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Marcar Past Lives como visto' }));
    expect(onToggleSeen).toHaveBeenCalledWith(true);
  });
});
