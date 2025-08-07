import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Maps technical error messages to user-friendly messages
 * This provides better UX by showing understandable error messages
 */
export function getUserFriendlyError(error: string | Error): string {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Convert to lowercase for case-insensitive matching
  const lowerError = errorMessage.toLowerCase();
  
  // Betting related errors
  if (lowerError.includes('insufficient balance') || lowerError.includes('insufficient funds')) {
    return "Insufficient funds in your wallet. Please add money to your wallet before placing a bet.";
  }
  
  if (lowerError.includes('minimum bet amount is 100 mwk')) {
    return "Minimum bet amount is 100 MWK. Please increase your bet amount.";
  }
  
  if (lowerError.includes('maximum bet amount is 1,000,000 mwk')) {
    return "Maximum bet amount is 1,000,000 MWK. Please reduce your bet amount.";
  }
  
  if (lowerError.includes('candidate not found')) {
    return "This candidate is no longer available for betting.";
  }
  
  if (lowerError.includes('withdrawn') && lowerError.includes('cannot place a bet')) {
    return "This candidate has withdrawn from the election. Betting is closed for this candidate.";
  }
  
  if (lowerError.includes('betting has been disabled')) {
    return "Betting has been temporarily disabled by the administrator. Please try again later.";
  }
  
  // Wallet related errors
  if (lowerError.includes('insufficient balance') && lowerError.includes('withdrawal')) {
    return "Insufficient funds in your wallet. Please add money before making a withdrawal.";
  }
  
  if (lowerError.includes('minimum withdrawal amount')) {
    return "Minimum withdrawal amount is 1,000 MWK. Please increase your withdrawal amount.";
  }
  
  if (lowerError.includes('maximum withdrawal amount')) {
    return "Maximum withdrawal amount is 1,000,000 MWK. Please reduce your withdrawal amount.";
  }
  
  // Payment related errors
  if (lowerError.includes('payment failed') || lowerError.includes('transaction failed')) {
    return "Payment processing failed. Please try again or contact support if the problem persists.";
  }
  
  if (lowerError.includes('invalid payment') || lowerError.includes('payment invalid')) {
    return "Invalid payment information. Please check your payment details and try again.";
  }
  
  if (lowerError.includes('payment timeout') || lowerError.includes('timeout')) {
    return "Payment request timed out. Please try again.";
  }
  
  // Authentication errors
  if (lowerError.includes('invalid credentials') || lowerError.includes('wrong password')) {
    return "Invalid email or password. Please check your credentials and try again.";
  }
  
  if (lowerError.includes('user not found') || lowerError.includes('account not found')) {
    return "Account not found. Please check your email address or create a new account.";
  }
  
  if (lowerError.includes('email already exists') || lowerError.includes('user already exists')) {
    return "An account with this email already exists. Please try logging in instead.";
  }
  
  // Network and server errors
  if (lowerError.includes('network error') || lowerError.includes('connection failed')) {
    return "Network connection failed. Please check your internet connection and try again.";
  }
  
  if (lowerError.includes('server error') || lowerError.includes('internal server error')) {
    return "A server error occurred. Please try again in a few moments.";
  }
  
  if (lowerError.includes('timeout') || lowerError.includes('request timeout')) {
    return "Request timed out. Please try again.";
  }
  
  if (lowerError.includes('validation error') || lowerError.includes('invalid input')) {
    return "Please check your input and try again.";
  }
  
  // Default fallback - return the original error if no match found
  return errorMessage;
}

/**
 * Checks if an error message is already user-friendly
 */
function isUserFriendlyError(error: string): boolean {
  const userFriendlyPhrases = [
    'please',
    'try again',
    'check your',
    'contact support',
    'minimum',
    'maximum',
    'insufficient',
    'invalid',
    'failed',
    'timeout',
    'network',
    'connection'
  ];
  
  const lowerError = error.toLowerCase();
  return userFriendlyPhrases.some(phrase => lowerError.includes(phrase));
}

/**
 * Main error handler that decides whether to show the original error
 * or map it to a user-friendly message
 */
export function handleError(error: string | Error): string {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // If it's already user-friendly, return as-is
  if (isUserFriendlyError(errorMessage)) {
    return errorMessage;
  }
  
  // Otherwise, map to user-friendly message
  return getUserFriendlyError(error);
}

/**
 * Sanitizes user input to prevent XSS attacks
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
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 */
export function isStrongPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Sanitizes and validates form data
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
 * Generates a secure random string
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
 * Validates amount input for financial transactions
 */
export function isValidAmount(amount: string | number): boolean {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(numAmount) && numAmount > 0 && numAmount <= 1000000;
}

/**
 * Logs security events for monitoring
 */
export function logSecurityEvent(event: string, details: Record<string, any> = {}): void {
  console.log(`🔒 SECURITY EVENT: ${event}`, {
    timestamp: new Date().toISOString(),
    ...details
  });
}
