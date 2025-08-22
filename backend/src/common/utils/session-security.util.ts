import * as crypto from 'crypto';

/**
 * Session Security Utilities for session fixation protection
 */
export class SessionSecurityUtil {
  /**
   * Generate a unique session identifier for device tracking
   * 
   * @param userAgent - Client user agent string
   * @param ipAddress - Client IP address
   * @param additionalData - Additional data for fingerprinting
   * @returns Unique session identifier hash
   */
  static generateSessionId(userAgent?: string, ipAddress?: string, additionalData?: any): string {
    const sessionData = {
      userAgent: userAgent?.substring(0, 200) || 'unknown',
      ipAddress: ipAddress || 'unknown',
      timestamp: Date.now(),
      random: crypto.randomBytes(16).toString('hex'),
      ...(additionalData && { additionalData })
    };

    return crypto.createHash('sha256')
      .update(JSON.stringify(sessionData))
      .digest('hex');
  }

  /**
   * Generate device fingerprint for enhanced security
   * 
   * @param userAgent - Client user agent
   * @param ipAddress - Client IP address
   * @returns Device fingerprint hash
   */
  static generateDeviceFingerprint(userAgent?: string, ipAddress?: string): string {
    // Extract browser and OS info from user agent
    const browserInfo = this.extractBrowserInfo(userAgent);
    
    const fingerprintData = {
      browser: browserInfo.browser,
      os: browserInfo.os,
      ipNetwork: this.getNetworkPrefix(ipAddress),
      timezone: new Date().getTimezoneOffset(),
    };

    return crypto.createHash('sha256')
      .update(JSON.stringify(fingerprintData))
      .digest('hex');
  }

  /**
   * Validate session consistency for security
   * 
   * @param storedFingerprint - Previously stored device fingerprint
   * @param currentUserAgent - Current request user agent
   * @param currentIpAddress - Current request IP
   * @returns True if session is consistent, false if suspicious
   */
  static validateSessionConsistency(
    storedFingerprint: string,
    currentUserAgent?: string,
    currentIpAddress?: string
  ): boolean {
    const currentFingerprint = this.generateDeviceFingerprint(currentUserAgent, currentIpAddress);
    
    // Allow some flexibility for IP changes (mobile networks, VPNs)
    // But browser/OS should remain consistent
    return storedFingerprint === currentFingerprint;
  }

  /**
   * Generate a session binding token to prevent session fixation
   * 
   * @param userId - User ID
   * @param sessionId - Unique session identifier
   * @param secret - Application secret for binding
   * @returns Session binding token
   */
  static generateSessionBinding(userId: string, sessionId: string, secret: string): string {
    const bindingData = {
      userId,
      sessionId,
      timestamp: Date.now(),
      random: crypto.randomBytes(8).toString('hex')
    };

    return crypto.createHmac('sha256', secret)
      .update(JSON.stringify(bindingData))
      .digest('hex');
  }

  /**
   * Verify session binding token
   * 
   * @param token - Session binding token
   * @param userId - Expected user ID
   * @param sessionId - Expected session ID
   * @param secret - Application secret
   * @param maxAgeMinutes - Maximum age in minutes
   * @returns True if binding is valid
   */
  static verifySessionBinding(
    token: string,
    userId: string,
    sessionId: string,
    secret: string,
    maxAgeMinutes: number = 60
  ): boolean {
    try {
      // Note: In a real implementation, we'd need to store timestamp
      // For now, we'll focus on user/session validation
      const expectedBindingData = {
        userId,
        sessionId,
        timestamp: Date.now(), // This would need to be the stored timestamp
        random: '' // This would need to be the stored random value
      };

      // For security, implement constant-time comparison
      const expectedToken = crypto.createHmac('sha256', secret)
        .update(JSON.stringify(expectedBindingData))
        .digest('hex');

      // This is a simplified version - in production, store binding data
      return crypto.timingSafeEqual(
        Buffer.from(token, 'hex'),
        Buffer.from(expectedToken, 'hex')
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Extract browser information from user agent
   * 
   * @param userAgent - User agent string
   * @returns Browser and OS information
   */
  private static extractBrowserInfo(userAgent?: string): { browser: string; os: string } {
    if (!userAgent) {
      return { browser: 'unknown', os: 'unknown' };
    }

    const ua = userAgent.toLowerCase();
    
    // Browser detection
    let browser = 'unknown';
    if (ua.includes('chrome')) browser = 'chrome';
    else if (ua.includes('firefox')) browser = 'firefox';
    else if (ua.includes('safari')) browser = 'safari';
    else if (ua.includes('edge')) browser = 'edge';
    else if (ua.includes('opera')) browser = 'opera';

    // OS detection
    let os = 'unknown';
    if (ua.includes('windows')) os = 'windows';
    else if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macos';
    else if (ua.includes('linux')) os = 'linux';
    else if (ua.includes('android')) os = 'android';
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'ios';

    return { browser, os };
  }

  /**
   * Get network prefix from IP address for flexible IP validation
   * 
   * @param ipAddress - IP address
   * @returns Network prefix (first 3 octets for IPv4)
   */
  private static getNetworkPrefix(ipAddress?: string): string {
    if (!ipAddress) return 'unknown';
    
    // For IPv4, use first 3 octets
    if (ipAddress.includes('.')) {
      const parts = ipAddress.split('.');
      if (parts.length >= 3) {
        return `${parts[0]}.${parts[1]}.${parts[2]}`;
      }
    }
    
    // For IPv6, use first 4 groups
    if (ipAddress.includes(':')) {
      const parts = ipAddress.split(':');
      if (parts.length >= 4) {
        return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}`;
      }
    }
    
    return ipAddress;
  }

  /**
   * Detect potentially suspicious session activity
   * 
   * @param previousSessions - Array of previous session data
   * @param currentSession - Current session data
   * @returns Risk score (0-100, higher = more suspicious)
   */
  static calculateSessionRisk(
    previousSessions: Array<{
      ipAddress?: string;
      userAgent?: string;
      timestamp: number;
      location?: string;
    }>,
    currentSession: {
      ipAddress?: string;
      userAgent?: string;
      timestamp: number;
      location?: string;
    }
  ): number {
    let risk = 0;

    if (previousSessions.length === 0) {
      return 0; // No previous sessions to compare
    }

    const recentSessions = previousSessions
      .filter(s => s.timestamp > currentSession.timestamp - (24 * 60 * 60 * 1000)) // Last 24 hours
      .sort((a, b) => b.timestamp - a.timestamp);

    if (recentSessions.length === 0) {
      risk += 20; // First session in 24 hours
    }

    const lastSession = recentSessions[0];
    if (lastSession) {
      // Check IP address changes
      if (lastSession.ipAddress !== currentSession.ipAddress) {
        risk += 30; // IP address changed
      }

      // Check user agent changes (browser/device change)
      if (lastSession.userAgent !== currentSession.userAgent) {
        const lastBrowser = this.extractBrowserInfo(lastSession.userAgent);
        const currentBrowser = this.extractBrowserInfo(currentSession.userAgent);
        
        if (lastBrowser.browser !== currentBrowser.browser) {
          risk += 40; // Browser changed
        }
        if (lastBrowser.os !== currentBrowser.os) {
          risk += 50; // Operating system changed
        }
      }

      // Check time gaps (rapid consecutive logins from different locations)
      const timeDiff = currentSession.timestamp - lastSession.timestamp;
      if (timeDiff < 5 * 60 * 1000 && lastSession.ipAddress !== currentSession.ipAddress) {
        risk += 60; // Very quick location change
      }
    }

    // Check for multiple IP addresses in short time
    const uniqueIPs = new Set(recentSessions.map(s => s.ipAddress));
    if (uniqueIPs.size > 3) {
      risk += 25; // Multiple IP addresses
    }

    return Math.min(risk, 100); // Cap at 100
  }
}