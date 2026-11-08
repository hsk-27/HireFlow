import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../Pagination';

describe('Pagination Component', () => {
  it('does not render when totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination currentPage={0} totalPages={1} onPageChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders pagination controls and page info', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        totalElements={50}
        onPageChange={() => {}}
      />
    );
    expect(screen.getByText(/Showing page/)).toBeInTheDocument();
    expect(screen.getByText(/50/)).toBeInTheDocument();
    expect(screen.getByText(/total items/)).toBeInTheDocument();
  });

  it('disables previous button on first page and triggers page change on next', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        currentPage={0}
        totalPages={3}
        totalElements={30}
        onPageChange={onPageChange}
      />
    );

    const prevButtons = screen.getAllByRole('button', { name: /previous/i });
    expect(prevButtons[0]).toBeDisabled();

    const nextButtons = screen.getAllByRole('button', { name: /next/i });
    fireEvent.click(nextButtons[0]);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
