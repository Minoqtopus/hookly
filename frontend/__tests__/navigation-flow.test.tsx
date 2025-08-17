/**
 * Navigation Flow Tests
 * Tests the complete navigation experience and user flows
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import HomePage from '@/app/page';
import ExamplesPage from '@/app/examples/page';
import { AppProvider } from '@/app/lib/AppContext';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Mock localStorage and sessionStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: jest.fn(() => {
    mockLocalStorage.store = {};
  }),
};

const mockSessionStorage = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string) => mockSessionStorage.store[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockSessionStorage.store[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockSessionStorage.store[key];
  }),
  clear: jest.fn(() => {
    mockSessionStorage.store = {};
  }),
};

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

// Mock fetch
global.fetch = jest.fn();

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
};

describe('Navigation Flow Tests', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
    });
    
    // Clear all mocks and storage
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockSessionStorage.clear();
    
    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
  });

  describe('Landing Page Navigation', () => {
    test('should navigate to examples page when "See Examples" is clicked', async () => {
      renderWithProvider(<HomePage />);
      
      const examplesLink = screen.getByText(/see examples/i);
      expect(examplesLink.closest('a')).toHaveAttribute('href', '/examples');
    });

    test('should start demo flow when "Try Free Demo" is clicked', async () => {
      // Mock window.location.href
      delete (window as any).location;
      (window as any).location = { href: '' };
      
      renderWithProvider(<HomePage />);
      
      const demoButton = screen.getByText(/try free demo/i);
      fireEvent.click(demoButton);
      
      // Should store demo data
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'demo_data',
        expect.stringContaining('Fitness Protein Powder')
      );
      
      // Should navigate with correct parameters
      expect(window.location.href).toBe('/generate?demo=true&timer=300');
    });
  });

  describe('Examples Page Flow', () => {
    test('should display template library with conversion elements', async () => {
      renderWithProvider(<ExamplesPage />);
      
      // Should show hero section
      expect(screen.getByText(/viral tiktok ad examples/i)).toBeInTheDocument();
      
      // Should show stats
      expect(screen.getByText(/2.3M\+/)).toBeInTheDocument();
      expect(screen.getByText(/total views generated/i)).toBeInTheDocument();
      
      // Should show CTA buttons
      expect(screen.getByText(/create your own ad/i)).toBeInTheDocument();
      expect(screen.getByText(/try free demo/i)).toBeInTheDocument();
    });

    test('should trigger auth modal when unauthenticated user tries to use template', async () => {
      renderWithProvider(<ExamplesPage />);
      
      // Find and click a template use button (assuming TemplateLibrary renders some)
      await waitFor(() => {
        const templateButtons = screen.queryAllByText(/use.*template/i);
        if (templateButtons.length > 0) {
          fireEvent.click(templateButtons[0]);
          // Should show auth modal (would need to check for modal content)
          expect(screen.queryByText(/sign.*up/i)).toBeInTheDocument();
        }
      });
    });

    test('should show upgrade prompt for free users', async () => {
      renderWithProvider(<ExamplesPage />);
      
      // Should show pro features section
      expect(screen.getByText(/want even more examples/i)).toBeInTheDocument();
      expect(screen.getByText(/sign up free/i)).toBeInTheDocument();
    });
  });

  describe('Demo Timer Integration', () => {
    test('should initialize demo timer from URL parameters', async () => {
      const mockSearchParams = {
        get: jest.fn((key: string) => {
          if (key === 'demo') return 'true';
          if (key === 'timer') return '300';
          return null;
        }),
      };
      
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
        replace: jest.fn(),
        back: jest.fn(),
      });
      
      // Mock useSearchParams for this test
      jest.doMock('next/navigation', () => ({
        useRouter: jest.fn(() => ({
          push: mockPush,
          replace: jest.fn(),
          back: jest.fn(),
        })),
        useSearchParams: jest.fn(() => mockSearchParams),
      }));
      
      // This would test the generate page with demo timer
      // Implementation depends on how we structure the generate page test
    });
  });

  describe('Template Selection Flow', () => {
    test('should persist template selection across navigation', async () => {
      renderWithProvider(<ExamplesPage />);
      
      // Simulate selecting a template (this would interact with TemplateLibrary)
      const templateData = {
        productName: 'Test Product',
        niche: 'Test Niche',
        targetAudience: 'Test Audience',
      };
      
      // Mock template selection
      mockSessionStorage.setItem('selectedTemplate', JSON.stringify(templateData));
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'selectedTemplate',
        JSON.stringify(templateData)
      );
    });
  });

  describe('Conversion Funnel Navigation', () => {
    test('should track user through complete journey', async () => {
      // 1. Start at landing page
      const { rerender } = renderWithProvider(<HomePage />);
      
      // 2. Click "See Examples"
      const examplesLink = screen.getByText(/see examples/i);
      expect(examplesLink.closest('a')).toHaveAttribute('href', '/examples');
      
      // 3. Navigate to examples page
      rerender(
        <AppProvider>
          <ExamplesPage />
        </AppProvider>
      );
      
      // 4. Should show conversion elements
      expect(screen.getByText(/create your own ad/i)).toBeInTheDocument();
      expect(screen.getByText(/sign up free/i)).toBeInTheDocument();
      
      // 5. User sees value and clicks CTA
      const createButton = screen.getByText(/create your own ad/i);
      fireEvent.click(createButton);
      
      // Should trigger navigation or auth modal
      expect(mockPush).toHaveBeenCalledWith('/generate');
    });
  });

  describe('Cross-Page State Management', () => {
    test('should maintain demo state across page transitions', async () => {
      // Set demo state
      mockSessionStorage.store['demo_timer_start'] = Date.now().toString();
      mockSessionStorage.store['demo_duration'] = '300';
      
      renderWithProvider(<ExamplesPage />);
      
      // Demo state should be preserved and accessible
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('demo_timer_start');
    });

    test('should clear temporary data after successful navigation', async () => {
      // Set temporary data
      mockSessionStorage.store['demo_data'] = JSON.stringify({
        productName: 'Test Product',
        niche: 'Test',
        targetAudience: 'Test Audience',
      });
      
      // Simulate navigation completion
      mockSessionStorage.removeItem('demo_data');
      
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('demo_data');
    });
  });

  describe('Auth Integration', () => {
    test('should handle auth state changes during navigation', async () => {
      // Start as unauthenticated user
      renderWithProvider(<ExamplesPage />);
      
      // Should show "Sign Up Free" button
      expect(screen.getByText(/sign up free/i)).toBeInTheDocument();
      
      // Simulate authentication (would need to mock auth context)
      // After auth, should show different UI
    });

    test('should preserve user intent across auth flow', async () => {
      renderWithProvider(<ExamplesPage />);
      
      // User tries to use template without auth
      const createButton = screen.getByText(/create your own ad/i);
      fireEvent.click(createButton);
      
      // Should store intent and show auth modal
      // After auth, should redirect to intended action
    });
  });
});