import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusBadge } from '../../client/src/components/ui/status-badge';

describe('StatusBadge Component', () => {
  it('renders with pending status correctly', () => {
    render(<StatusBadge status="pending" />);
    const badge = screen.getByText('Pending');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('div')).toHaveClass('bg-yellow-100');
  });

  it('renders with approved status correctly', () => {
    render(<StatusBadge status="approved" />);
    const badge = screen.getByText('Approved');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('div')).toHaveClass('bg-green-100');
  });

  it('renders with rejected status correctly', () => {
    render(<StatusBadge status="rejected" />);
    const badge = screen.getByText('Rejected');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('div')).toHaveClass('bg-red-100');
  });

  it('renders with default styling for unknown status', () => {
    render(<StatusBadge status="unknown" />);
    const badge = screen.getByText('Unknown');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('div')).toHaveClass('bg-gray-100');
  });
});