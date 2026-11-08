import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, StatusBadge } from '../Badge';

describe('Badge Component', () => {
  it('renders children with default neutral variant', () => {
    render(<Badge>Test Badge</Badge>);
    const badge = screen.getByText('Test Badge');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-slate-100');
  });

  it('renders correct variant classes', () => {
    render(<Badge variant="success">Success Item</Badge>);
    const badge = screen.getByText('Success Item');
    expect(badge.className).toContain('bg-emerald-50');
  });

  it('renders status badges with appropriate styles', () => {
    const { rerender } = render(<StatusBadge status="APPROVED" />);
    expect(screen.getByText('APPROVED')).toHaveClass('text-emerald-700');

    rerender(<StatusBadge status="PENDING" />);
    expect(screen.getByText('PENDING')).toHaveClass('text-amber-700');

    rerender(<StatusBadge status="REJECTED" />);
    expect(screen.getByText('REJECTED')).toHaveClass('text-rose-700');

    rerender(<StatusBadge status="UNDER_REVIEW" />);
    expect(screen.getByText('UNDER REVIEW')).toHaveClass('text-sky-700');
  });
});
