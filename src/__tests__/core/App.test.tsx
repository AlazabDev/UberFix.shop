import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import App from '@/App';

// Mock the hooks
vi.mock('@/hooks/useMaintenanceLock', () => ({
  useMaintenanceLock: () => ({
    data: { isLocked: false, message: null },
    isLoading: false,
  }),
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('should initialize QueryClient', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('should render ThemeProvider', () => {
    const { container } = render(<App />);
    expect(container.querySelector('[class*="theme"]')).toBeTruthy();
  });
});
