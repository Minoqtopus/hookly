/**
 * Demo Tracking Service
 * 
 * Tracks demo usage on the client side for immediate UX feedback
 * Works in conjunction with backend validation for security
 */

export class DemoTrackingService {
  private readonly DEMO_COUNT_KEY = 'demo_usage_count';
  private readonly DEMO_TIMESTAMP_KEY = 'demo_last_used';
  private readonly DEMO_FINGERPRINT_KEY = 'demo_device_fingerprint';
  private readonly DEMO_CONTENT_KEY = 'demo_last_content';
  private readonly MAX_DEMOS_PER_DAY = 1;

  /**
   * Generate a simple device fingerprint for tracking
   * Non-invasive, uses only basic browser characteristics
   */
  private generateFingerprint(): string {
    const components = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      window.screen.width,
      window.screen.height,
      window.screen.colorDepth,
    ];
    
    // Simple hash function for fingerprint
    const str = components.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Check if demo is available for current user
   */
  isDemoAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        // If localStorage is not available, allow demo (graceful degradation)
        return true;
      }

      const count = this.getDemoCount();
      const lastUsed = this.getLastUsedTimestamp();
      
      // Check if it's been 24 hours since last use
      if (lastUsed) {
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const timeSinceLastUse = Date.now() - lastUsed;
        
        if (timeSinceLastUse >= twentyFourHours) {
          // Reset count if 24 hours have passed
          this.resetDemoCount();
          return true;
        }
      }

      return count < this.MAX_DEMOS_PER_DAY;
    } catch (error) {
      console.error('Error checking demo availability:', error);
      // On error, allow demo to not break UX
      return true;
    }
  }

  /**
   * Track a demo usage
   */
  trackDemoUsage(generatedContent?: any): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      const currentCount = this.getDemoCount();
      const fingerprint = this.generateFingerprint();

      localStorage.setItem(this.DEMO_COUNT_KEY, (currentCount + 1).toString());
      localStorage.setItem(this.DEMO_TIMESTAMP_KEY, Date.now().toString());
      localStorage.setItem(this.DEMO_FINGERPRINT_KEY, fingerprint);
      
      if (generatedContent) {
        localStorage.setItem(this.DEMO_CONTENT_KEY, JSON.stringify(generatedContent));
      }
    } catch (error) {
      console.error('Error tracking demo usage:', error);
    }
  }

  /**
   * Get the number of demos used today
   */
  getDemoCount(): number {
    try {
      const count = localStorage.getItem(this.DEMO_COUNT_KEY);
      return count ? parseInt(count, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get the last used timestamp
   */
  getLastUsedTimestamp(): number | null {
    try {
      const timestamp = localStorage.getItem(this.DEMO_TIMESTAMP_KEY);
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get the last generated content (for showing in limit modal)
   */
  getLastGeneratedContent(): any | null {
    try {
      const content = localStorage.getItem(this.DEMO_CONTENT_KEY);
      return content ? JSON.parse(content) : null;
    } catch {
      return null;
    }
  }

  /**
   * Reset demo count (for testing or after 24 hours)
   */
  resetDemoCount(): void {
    try {
      localStorage.setItem(this.DEMO_COUNT_KEY, '0');
    } catch (error) {
      console.error('Error resetting demo count:', error);
    }
  }

  /**
   * Clear all demo tracking data
   */
  clearAllDemoData(): void {
    try {
      localStorage.removeItem(this.DEMO_COUNT_KEY);
      localStorage.removeItem(this.DEMO_TIMESTAMP_KEY);
      localStorage.removeItem(this.DEMO_FINGERPRINT_KEY);
      localStorage.removeItem(this.DEMO_CONTENT_KEY);
    } catch (error) {
      console.error('Error clearing demo data:', error);
    }
  }

  /**
   * Check if the current fingerprint matches stored one
   * Helps detect if user is trying to bypass limits
   */
  isSameDevice(): boolean {
    try {
      const storedFingerprint = localStorage.getItem(this.DEMO_FINGERPRINT_KEY);
      const currentFingerprint = this.generateFingerprint();
      return storedFingerprint === currentFingerprint;
    } catch {
      return true;
    }
  }
}

// Export singleton instance
export const demoTrackingService = new DemoTrackingService();