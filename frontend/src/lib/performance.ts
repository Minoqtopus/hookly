/**
 * Performance Monitoring Utilities
 * 
 * Production-ready performance tracking for $1M MRR scaling
 */

// Web Vitals tracking
export const reportWebVitals = (metric: any) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service (Google Analytics, DataDog, etc.)
    console.log('Web Vital:', metric);
    
    // Example: Send to Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }
  }
};

// Performance mark for custom metrics
export const performanceMark = (name: string) => {
  if (typeof window !== 'undefined' && window.performance) {
    window.performance.mark(name);
  }
};

// Performance measure for custom metrics
export const performanceMeasure = (name: string, startMark: string, endMark?: string) => {
  if (typeof window !== 'undefined' && window.performance) {
    if (endMark) {
      window.performance.measure(name, startMark, endMark);
    } else {
      window.performance.measure(name, startMark);
    }
    
    const measure = window.performance.getEntriesByName(name, 'measure')[0];
    if (measure && process.env.NODE_ENV === 'production') {
      // Send custom metric to monitoring service
      console.log('Custom Metric:', { name, duration: measure.duration });
    }
  }
};

// Resource loading monitoring
export const monitorResourceLoading = () => {
  if (typeof window !== 'undefined' && window.performance) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigationEntries = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        const resourceEntries = window.performance.getEntriesByType('resource');
        
        if (process.env.NODE_ENV === 'production') {
          console.log('Resource Loading Metrics:', {
            navigation: navigationEntries,
            resources: resourceEntries.length,
            totalLoadTime: navigationEntries[0]?.loadEventEnd - navigationEntries[0]?.fetchStart,
          });
        }
      }, 0);
    });
  }
};

// Bundle size monitoring (client-side estimate)
export const estimateBundleSize = () => {
  if (typeof window !== 'undefined') {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    const assetCount = {
      scripts: scripts.length,
      stylesheets: stylesheets.length,
      total: scripts.length + stylesheets.length,
    };
    
    if (process.env.NODE_ENV === 'production') {
      console.log('Asset Count:', assetCount);
    }
    
    return assetCount;
  }
  return null;
};

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  if (typeof window !== 'undefined') {
    // Monitor resource loading
    monitorResourceLoading();
    
    // Estimate bundle size
    setTimeout(() => {
      estimateBundleSize();
    }, 1000);
    
    // Monitor long tasks (performance.js)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              if (process.env.NODE_ENV === 'production') {
                console.log('Long Task Detected:', entry.duration);
              }
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // PerformanceObserver not supported
      }
    }
  }
};