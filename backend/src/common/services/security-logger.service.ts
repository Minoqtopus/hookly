import { Injectable } from '@nestjs/common';

export enum SecurityEventType {
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILURE = 'auth_failure',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_SUCCESS = 'password_reset_success',
  EMAIL_VERIFICATION_SENT = 'email_verification_sent',
  EMAIL_VERIFICATION_SUCCESS = 'email_verification_success',
  OAUTH_SUCCESS = 'oauth_success',
  OAUTH_FAILURE = 'oauth_failure',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  TOKEN_REFRESH = 'token_refresh',
  TOKEN_REVOCATION = 'token_revocation',
  ACCOUNT_LOCKOUT = 'account_lockout',
  SESSION_ANOMALY = 'session_anomaly',
  CSRF_ATTEMPT = 'csrf_attempt',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt'
}

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  riskScore?: number;
  timestamp: Date;
  sessionId?: string;
  success: boolean;
}

/**
 * Security Event Logging Service for comprehensive audit trails
 */
@Injectable()
export class SecurityLoggerService {
  /**
   * Log security events for monitoring and incident response
   * 
   * @param event - Security event details
   */
  logSecurityEvent(event: SecurityEvent): void {
    try {
      // Enhanced logging with structured format
      const logEntry = {
        timestamp: event.timestamp.toISOString(),
        type: event.type,
        success: event.success,
        userId: event.userId || 'anonymous',
        email: event.email ? this.maskEmail(event.email) : undefined,
        ipAddress: event.ipAddress ? this.maskIP(event.ipAddress) : undefined,
        userAgent: event.userAgent ? this.truncateUserAgent(event.userAgent) : undefined,
        sessionId: event.sessionId,
        riskScore: event.riskScore,
        details: event.details,
        severity: this.calculateSeverity(event),
      };

      // Log to console with appropriate level
      if (logEntry.severity === 'critical' || logEntry.severity === 'high') {
        console.error('🚨 SECURITY ALERT:', JSON.stringify(logEntry, null, 2));
      } else if (logEntry.severity === 'medium') {
        console.warn('⚠️  SECURITY WARNING:', JSON.stringify(logEntry, null, 2));
      } else {
        console.info('🔐 SECURITY EVENT:', JSON.stringify(logEntry, null, 2));
      }

      // In production, send to:
      // - Security monitoring systems (Datadog, Splunk, etc.)
      // - SIEM tools
      // - Alert notification systems
      // - Database for analysis

    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Log authentication attempt
   */
  logAuthAttempt(
    email: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string,
    details?: Record<string, any>
  ): void {
    this.logSecurityEvent({
      type: success ? SecurityEventType.AUTH_SUCCESS : SecurityEventType.AUTH_FAILURE,
      email,
      ipAddress,
      userAgent,
      details,
      success,
      timestamp: new Date(),
      riskScore: success ? 0 : 25,
    });
  }

  /**
   * Log OAuth authentication
   */
  logOAuthAttempt(
    email: string,
    provider: string,
    success: boolean,
    ipAddress?: string,
    userAgent?: string
  ): void {
    this.logSecurityEvent({
      type: success ? SecurityEventType.OAUTH_SUCCESS : SecurityEventType.OAUTH_FAILURE,
      email,
      ipAddress,
      userAgent,
      details: { provider },
      success,
      timestamp: new Date(),
      riskScore: success ? 0 : 30,
    });
  }

  /**
   * Log rate limiting events
   */
  logRateLimitExceeded(
    endpoint: string,
    ipAddress?: string,
    userAgent?: string,
    userId?: string
  ): void {
    this.logSecurityEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      userId,
      ipAddress,
      userAgent,
      details: { endpoint },
      success: false,
      timestamp: new Date(),
      riskScore: 40,
    });
  }

  /**
   * Log suspicious activity
   */
  logSuspiciousActivity(
    activity: string,
    riskScore: number,
    userId?: string,
    ipAddress?: string,
    details?: Record<string, any>
  ): void {
    this.logSecurityEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      userId,
      ipAddress,
      details: { activity, ...details },
      success: false,
      timestamp: new Date(),
      riskScore,
    });
  }

  /**
   * Log password reset attempts
   */
  logPasswordReset(
    email: string,
    success: boolean,
    ipAddress?: string,
    stage: 'request' | 'completion' = 'request'
  ): void {
    const type = stage === 'request' ? 
      SecurityEventType.PASSWORD_RESET_REQUEST : 
      SecurityEventType.PASSWORD_RESET_SUCCESS;

    this.logSecurityEvent({
      type,
      email,
      ipAddress,
      success,
      timestamp: new Date(),
      riskScore: success ? 10 : 30,
    });
  }

  /**
   * Log token operations
   */
  logTokenOperation(
    operation: 'refresh' | 'revocation',
    userId: string,
    success: boolean,
    ipAddress?: string,
    details?: Record<string, any>
  ): void {
    const type = operation === 'refresh' ? 
      SecurityEventType.TOKEN_REFRESH : 
      SecurityEventType.TOKEN_REVOCATION;

    this.logSecurityEvent({
      type,
      userId,
      ipAddress,
      details,
      success,
      timestamp: new Date(),
      riskScore: success ? 0 : 35,
    });
  }

  /**
   * Calculate event severity based on type and risk score
   */
  private calculateSeverity(event: SecurityEvent): 'low' | 'medium' | 'high' | 'critical' {
    const riskScore = event.riskScore || 0;

    // Critical events
    if (riskScore >= 80 || [
      SecurityEventType.BRUTE_FORCE_ATTEMPT,
      SecurityEventType.CSRF_ATTEMPT,
      SecurityEventType.ACCOUNT_LOCKOUT
    ].includes(event.type)) {
      return 'critical';
    }

    // High severity events
    if (riskScore >= 60 || [
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      SecurityEventType.SESSION_ANOMALY
    ].includes(event.type)) {
      return 'high';
    }

    // Medium severity events
    if (riskScore >= 30 || [
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      SecurityEventType.AUTH_FAILURE,
      SecurityEventType.OAUTH_FAILURE
    ].includes(event.type)) {
      return 'medium';
    }

    // Low severity (normal operations)
    return 'low';
  }

  /**
   * Mask email for privacy in logs
   */
  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) return 'invalid-email';
    
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.length > 2 ? 
      `${localPart[0]}***${localPart[localPart.length - 1]}` : 
      '***';
    
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Mask IP address for privacy
   */
  private maskIP(ip: string): string {
    if (!ip) return 'unknown';
    
    // IPv4
    if (ip.includes('.')) {
      const parts = ip.split('.');
      return parts.length >= 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.***` : ip;
    }
    
    // IPv6
    if (ip.includes(':')) {
      const parts = ip.split(':');
      return parts.length >= 4 ? `${parts[0]}:${parts[1]}:${parts[2]}:***` : ip;
    }
    
    return ip;
  }

  /**
   * Truncate user agent for log storage
   */
  private truncateUserAgent(userAgent: string): string {
    return userAgent ? userAgent.substring(0, 200) : 'unknown';
  }
}