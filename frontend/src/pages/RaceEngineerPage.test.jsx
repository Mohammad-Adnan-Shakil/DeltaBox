import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RaceEngineerPage from './RaceEngineerPage';

// Mock the API
vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('RaceEngineerPage', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('should render race engineer page title', () => {
    render(
      <BrowserRouter>
        <RaceEngineerPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Race Engineer/i)).toBeInTheDocument();
  });

  it('should render race context form', () => {
    render(
      <BrowserRouter>
        <RaceEngineerPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Lap")).toBeInTheDocument();
    expect(screen.getByText("Position")).toBeInTheDocument();
  });

  it('should have Transmit button', () => {
    render(
      <BrowserRouter>
        <RaceEngineerPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Transmit/i)).toBeInTheDocument();
  });
});
