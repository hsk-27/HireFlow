import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        Modal Content
      </Modal>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal content and title when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Review Candidate">
        <div>Applicant Scorecard Details</div>
      </Modal>
    );

    expect(screen.getByText('Review Candidate')).toBeInTheDocument();
    expect(screen.getByText('Applicant Scorecard Details')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked or Escape key pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Schedule Round">
        <div>Calendar View</div>
      </Modal>
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
