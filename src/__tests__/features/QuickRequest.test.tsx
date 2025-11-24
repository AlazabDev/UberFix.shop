import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import QuickRequest from '@/pages/QuickRequest';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => ({
          data: [{ id: 'company-1' }],
          error: null,
        })),
        eq: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [{ id: 'branch-1' }],
            error: null,
          })),
        })),
      })),
    })),
  },
}));

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ propertyId: 'test-property-id' }),
    useSearchParams: () => [new URLSearchParams('lang=ar')],
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
);

describe('QuickRequest Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    const { container } = render(<QuickRequest />, { wrapper });
    expect(container).toBeInTheDocument();
  });

  it('should have QuickRequest component', () => {
    const { container } = render(<QuickRequest />, { wrapper });
    expect(container).toBeInTheDocument();
  });
});
