import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AIPage from './AIPage';

vi.mock('../hooks/useFetch', () => ({
  useFetch: vi.fn(),
  usePost: vi.fn(),
}));

import { useFetch, usePost } from '../hooks/useFetch';

const mockDrivers = [
  { driverId: 1, name: "Test Driver", code: "TES", team: "Test Racing", points: 100 },
];

const mockRaces = [
  { raceId: 1, raceName: "Test GP", round: 1, circuitName: "Test Circuit", date: "2026-03-15", status: "SCHEDULED" },
];

describe('AIPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFetch
      .mockReturnValueOnce({ data: mockDrivers, loading: false, error: null, refetch: vi.fn() })
      .mockReturnValueOnce({ data: mockRaces, loading: false, error: null, refetch: vi.fn() });
    usePost.mockReturnValue({ execute: vi.fn(), loading: false, error: null });
  });

  it('should render prediction setup header', () => {
    render(
      <BrowserRouter>
        <AIPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Prediction Setup/i)).toBeInTheDocument();
  });

  it('should render driver and race selectors', () => {
    render(
      <BrowserRouter>
        <AIPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Select driver")).toBeInTheDocument();
    expect(screen.getByText("Select race")).toBeInTheDocument();
  });

  it('should have RUN PREDICTION button', () => {
    render(
      <BrowserRouter>
        <AIPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/RUN PREDICTION/i)).toBeInTheDocument();
  });
});
