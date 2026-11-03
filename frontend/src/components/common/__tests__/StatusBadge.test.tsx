import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBadge from '../StatusBadge';

describe('StatusBadge component', () => {
  it('renders application status with human-readable label and correct styling', () => {
    render(<StatusBadge status="SHORTLISTED" />);
    expect(screen.getByText('SHORTLISTED')).toBeInTheDocument();
  });

  it('renders offer status accurately', () => {
    render(<StatusBadge status="ACCEPTED" />);
    expect(screen.getByText('ACCEPTED')).toBeInTheDocument();
  });

  it('renders company pending status accurately', () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });
});
