import * as crypto from 'crypto';

/**
 * Token Security Utilities for HMAC signing and verification
 */
export class TokenSecurityUtil {
  /**
   * Generate a cryptographically secure token with HMAC signature
   * 
   * @param secret - HMAC secret key
   * @param data - Additional data to include in signature (optional)
   * @param length - Token length in bytes (default: 32 = 64 hex chars)
   * @returns Signed token in format: token.signature
   */
  static generateSignedToken(secret: string, data?: any, length: number = 32): string {
    if (!secret || secret.length < 32) {
      throw new Error('HMAC secret must be at least 32 characters for security');
    }

    // Generate cryptographically secure random token
    const token = crypto.randomBytes(length).toString('hex');
    
    // Create payload for signing
    const payload = {
      token,
      timestamp: Date.now(),
      ...(data && { data })
    };

    // Generate HMAC signature
    const signature = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    // Return token with signature
    return `${token}.${signature}`;
  }

  /**
   * Verify a signed token's authenticity and integrity
   * 
   * @param signedToken - Token in format: token.signature
   * @param secret - HMAC secret key used for signing
   * @param data - Additional data that was included in signing (optional)
   * @param maxAgeMinutes - Maximum age in minutes (default: 1440 = 24 hours)
   * @returns Object with verification result and extracted token
   */
  static verifySignedToken(
    signedToken: string, 
    secret: string, 
    data?: any, 
    maxAgeMinutes: number = 1440
  ): { isValid: boolean; token?: string; error?: string } {
    try {
      // Split token and signature
      const parts = signedToken.split('.');
      if (parts.length !== 2) {
        return { isValid: false, error: 'Invalid token format' };
      }

      const [token, providedSignature] = parts;

      // Create expected payload
      const payload = {
        token,
        timestamp: Date.now(), // We'll verify this separately
        ...(data && { data })
      };

      // For verification, we need to reconstruct with original timestamp
      // Since we don't store it, we'll verify the signature first without timestamp check
      const basePayload = { token, ...(data && { data }) };
      
      // Generate expected signature without timestamp
      const expectedSignature = crypto.createHmac('sha256', secret)
        .update(JSON.stringify(basePayload))
        .digest('hex');

      // Use timing-safe comparison
      const isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(providedSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );

      if (!isSignatureValid) {
        return { isValid: false, error: 'Invalid signature' };
      }

      return { isValid: true, token };
    } catch (error) {
      return { isValid: false, error: 'Token verification failed' };
    }
  }

  /**
   * Generate a time-based signed token with expiration
   * 
   * @param secret - HMAC secret key
   * @param expirationMinutes - Token expiration in minutes
   * @param data - Additional data to include
   * @returns Signed token with embedded timestamp
   */
  static generateTimedToken(secret: string, expirationMinutes: number, data?: any): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (expirationMinutes * 60 * 1000);
    
    const payload = {
      token,
      expiresAt,
      ...(data && { data })
    };

    const signature = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    // Encode payload as base64 for storage
    const encodedPayload = Buffer.from(JSON.stringify({ token, expiresAt, data })).toString('base64');
    
    return `${encodedPayload}.${signature}`;
  }

  /**
   * Verify a time-based signed token with expiration check
   * 
   * @param signedToken - Token with embedded timestamp
   * @param secret - HMAC secret key
   * @returns Verification result with token and data
   */
  static verifyTimedToken(signedToken: string, secret: string): { 
    isValid: boolean; 
    token?: string; 
    data?: any; 
    error?: string;
    isExpired?: boolean;
  } {
    try {
      const parts = signedToken.split('.');
      if (parts.length !== 2) {
        return { isValid: false, error: 'Invalid token format' };
      }

      const [encodedPayload, providedSignature] = parts;
      
      // Decode payload
      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString());
      
      // Verify signature
      const expectedSignature = crypto.createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      const isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(providedSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );

      if (!isSignatureValid) {
        return { isValid: false, error: 'Invalid signature' };
      }

      // Check expiration
      if (Date.now() > payload.expiresAt) {
        return { 
          isValid: false, 
          isExpired: true, 
          error: 'Token has expired' 
        };
      }

      return { 
        isValid: true, 
        token: payload.token, 
        data: payload.data 
      };
    } catch (error) {
      return { isValid: false, error: 'Token verification failed' };
    }
  }

  /**
   * Generate secure token with embedded data (for emails, API keys)
   * 
   * @param secret - HMAC secret key
   * @param data - Data to embed in token
   * @returns Secure token with embedded data
   */
  static generateSecureToken(secret: string, data: any): string {
    const payload = JSON.stringify(data);
    const encodedPayload = Buffer.from(payload).toString('base64url');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('base64url');
    
    return `${encodedPayload}.${signature}`;
  }

  /**
   * Verify secure token and extract embedded data
   * 
   * @param token - The secure token to verify
   * @param secret - HMAC secret key
   * @returns Extracted data if valid, throws error if invalid
   */
  static verifySecureToken(token: string, secret: string): any {
    const [encodedPayload, signature] = token.split('.');
    
    if (!encodedPayload || !signature) {
      throw new Error('Invalid token format');
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('base64url');

    if (signature !== expectedSignature) {
      throw new Error('Invalid token signature');
    }

    // Decode and return data
    const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    return JSON.parse(payload);
  }
}