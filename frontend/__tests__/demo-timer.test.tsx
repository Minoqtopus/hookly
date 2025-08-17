/**
 * Demo Timer Tests
 * Tests the demo timer functionality and user experience
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import DemoTimer from '@/app/components/DemoTimer';
import { useDemoTimer } from '@/app/lib/useDemoTimer';
import { renderHook } from '@testing-library/react';

// Mock sessionStorage
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

Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

describe('DemoTimer Component', () => {
  const mockOnExpiry = jest.fn();
  const mockOnAlmostExpired = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should not render when no demo timer is active', () => {
    render(
      <DemoTimer 
        onExpiry={mockOnExpiry}
        onAlmostExpired={mockOnAlmostExpired}
      />
    );
    
    // Should not render anything
    expect(screen.queryByText(/demo time/i)).not.toBeInTheDocument();
  });

  test('should display countdown when demo timer is active', () => {
    // Set demo timer in sessionStorage (5 minutes ago)
    const startTime = Date.now() - (0 * 60 * 1000); // Just started
    mockSessionStorage.store['demo_timer_start'] = startTime.toString();
    mockSessionStorage.store['demo_duration'] = '300'; // 5 minutes
    
    render(
      <DemoTimer 
        onExpiry={mockOnExpiry}
        onAlmostExpired={mockOnAlmostExpired}
      />
    );
    
    // Should show timer
    expect(screen.getByText(/demo time remaining/i)).toBeInTheDocument();
    expect(screen.getByText(/5:00/)).toBeInTheDocument();
  });

  test('should show urgent styling when time is low', () => {
    // Set demo timer to 30 seconds remaining
    const startTime = Date.now() - (4.5 * 60 * 1000); // 4.5 minutes ago
    mockSessionStorage.store['demo_timer_start'] = startTime.toString();
    mockSessionStorage.store['demo_duration'] = '300'; // 5 minutes total
    
    render(
      <DemoTimer 
        onExpiry={mockOnExpiry}
        onAlmostExpired={mockOnAlmostExpired}
      />
    );
    
    // Should show critical urgency message
    expect(screen.getByText(/demo expiring soon/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up now/i)).toBeInTheDocument();
  });

  test('should call onAlmostExpired when 1 minute remains', async () => {
    // Set demo timer to 61 seconds remaining
    const startTime = Date.now() - (4 * 60 * 1000 - 1000); // 4 minutes ago
    mockSessionStorage.store['demo_timer_start'] = startTime.toString();
    mockSessionStorage.store['demo_duration'] = '300';
    
    render(
      <DemoTimer 
        onExpiry={mockOnExpiry}
        onAlmostExpired={mockOnAlmostExpired}
      />
    );
    
    // Advance timer by 2 seconds to trigger the 60-second warning
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    await waitFor(() => {
      expect(mockOnAlmostExpired).toHaveBeenCalled();
    });
  });

  test('should call onExpiry when timer reaches zero', async () => {
    // Set demo timer to 1 second remaining
    const startTime = Date.now() - (4 * 60 * 1000 + 59000); // 4:59 ago
    mockSessionStorage.store['demo_timer_start'] = startTime.toString();
    mockSessionStorage.store['demo_duration'] = '300';
    
    render(
      <DemoTimer 
        onExpiry={mockOnExpiry}
        onAlmostExpired={mockOnAlmostExpired}
      />
    );
    
    // Advance timer by 2 seconds to trigger expiry
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    await waitFor(() => {
      expect(mockOnExpiry).toHaveBeenCalled();
    });
  });

  test('should show expired state when timer has expired', () => {
    // Set demo timer to already expired
    const startTime = Date.now() - (6 * 60 * 1000); // 6 minutes ago
    mockSessionStorage.store['demo_timer_start'] = startTime.toString();
    mockSessionStorage.store['demo_duration'] = '300'; // 5 minutes total
    
    render(
      <DemoTimer 
        onExpiry={mockOnExpiry}
        onAlmostExpired={mockOnAlmostExpired}
      />
    );
    
    // Should show expired message
    expect(screen.getByText(/demo time expired/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up to continue/i)).toBeInTheDocument();
    expect(mockOnExpiry).toHaveBeenCalled();
  });
});

describe('useDemoTimer Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should initialize with inactive state', () => {
    const { result } = renderHook(() => useDemoTimer());
    
    expect(result.current.isActive).toBe(false);
    expect(result.current.timeLeft).toBe(null);
    expect(result.current.isExpired).toBe(false);
  });

  test('should start demo timer', () => {
    const { result } = renderHook(() => useDemoTimer());
    
    act(() => {
      result.current.startDemo(300);
    });
    
    expect(result.current.isActive).toBe(true);
    expect(result.current.timeLeft).toBe(300);
    expect(result.current.isExpired).toBe(false);
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'demo_timer_start',
      expect.any(String)
    );
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'demo_duration',
      '300'
    );
  });

  test('should end demo timer', () => {
    const { result } = renderHook(() => useDemoTimer());
    
    // Start timer first
    act(() => {
      result.current.startDemo(300);
    });
    
    // Then end it
    act(() => {
      result.current.endDemo();
    });
    
    expect(result.current.isActive).toBe(false);
    expect(result.current.timeLeft).toBe(null);
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('demo_timer_start');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('demo_duration');
  });

  test('should extend demo timer', () => {
    const { result } = renderHook(() => useDemoTimer());
    
    // Start with 5 minutes
    act(() => {
      result.current.startDemo(300);
    });
    
    // Extend by 2 minutes
    act(() => {
      result.current.extendDemo(120);
    });
    
    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'demo_duration',
      '420' // 300 + 120
    );
  });

  test('should detect expired timer from sessionStorage', () => {
    // Set expired timer in sessionStorage
    const startTime = Date.now() - (6 * 60 * 1000); // 6 minutes ago
    mockSessionStorage.store['demo_timer_start'] = startTime.toString();
    mockSessionStorage.store['demo_duration'] = '300'; // 5 minutes total
    
    const { result } = renderHook(() => useDemoTimer());
    
    expect(result.current.isActive).toBe(true);
    expect(result.current.isExpired).toBe(true);
    expect(result.current.timeLeft).toBe(0);
  });

  test('should update time left periodically', async () => {
    // Set timer with 2 minutes remaining
    const startTime = Date.now() - (3 * 60 * 1000); // 3 minutes ago
    mockSessionStorage.store['demo_timer_start'] = startTime.toString();
    mockSessionStorage.store['demo_duration'] = '300'; // 5 minutes total
    
    const { result } = renderHook(() => useDemoTimer());
    
    // Should start with ~2 minutes (120 seconds)
    expect(result.current.timeLeft).toBeCloseTo(120, -1);
    
    // Advance time by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Should update the time left
    await waitFor(() => {
      expect(result.current.timeLeft).toBeCloseTo(119, -1);
    });
  });
});