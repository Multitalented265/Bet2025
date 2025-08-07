/**
 * Security configuration and utilities
 */

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // 100 requests per window
  LOGIN_MAX_ATTEMPTS: 5, // 5 login attempts per window
  BLOCK_DURATION: 15 * 60 * 1000, // 15 minutes block after max attempts
};

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

// CORS configuration
export const CORS_CONFIG = {
  origin: process.env.NEXTAUTH_URL || 'https://bet2025-2-saau.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  amount: /^\d+(\.\d{1,2})?$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
};

// Security event types
export const SECURITY_EVENTS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGIN_BLOCKED: 'LOGIN_BLOCKED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
} as const;

// Admin IP whitelist (for production)
export const ADMIN_ALLOWED_IPS = process.env.ADMIN_ALLOWED_IPS?.split(',') || [];

/**
 * Validates if an IP address is allowed for admin access
 */
export function isIPAllowed(ip: string): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return true; // Allow all IPs in development
  }
  
  if (ADMIN_ALLOWED_IPS.length === 0) {
    return true; // Allow all IPs if no whitelist is set
  }
  
  return ADMIN_ALLOWED_IPS.includes(ip);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  return VALIDATION_PATTERNS.email.test(email);
}

/**
 * Validates password strength
 */
export function isStrongPassword(password: string): boolean {
  return VALIDATION_PATTERNS.password.test(password);
}

/**
 * Validates amount format
 */
export function isValidAmount(amount: string | number): boolean {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(numAmount) && numAmount > 0 && numAmount <= 1000000;
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags
  const withoutTags = input.replace(/<[^>]*>/g, '');
  
  // Remove potentially dangerous characters
  const sanitized = withoutTags
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
  
  return sanitized;
}

/**
 * Generates a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Logs security events
 */
export function logSecurityEvent(
  event: keyof typeof SECURITY_EVENTS, 
  details: Record<string, any> = {}
): void {
  console.log(`🔒 SECURITY EVENT: ${event}`, {
    timestamp: new Date().toISOString(),
    event,
    ...details
  });
}

/**
 * Validates and sanitizes form data
 */
export function sanitizeFormData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Checks if a request is suspicious
 */
export function isSuspiciousRequest(request: Request): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /php/i,
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number; blockedUntil?: number }>();
  
  isRateLimited(key: string, maxRequests: number): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    // Check if blocked
    if (record?.blockedUntil && now < record.blockedUntil) {
      return true;
    }
    
    // Reset if window expired
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + RATE_LIMIT_CONFIG.WINDOW_MS });
      return false;
    }
    
    // Check if limit exceeded
    if (record.count >= maxRequests) {
      // Block for 15 minutes
      record.blockedUntil = now + RATE_LIMIT_CONFIG.BLOCK_DURATION;
      return true;
    }
    
    // Increment count
    record.count++;
    return false;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
  
  getAttempts(key: string): number {
    const record = this.attempts.get(key);
    return record?.count || 0;
  }
} 