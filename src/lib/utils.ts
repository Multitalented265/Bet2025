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
    return "Payment processing failed. Please check your payment details and try again.";
  }
  
  if (lowerError.includes('invalid payment details')) {
    return "Please check your payment details and try again.";
  }
  
  if (lowerError.includes('network error') || lowerError.includes('connection error')) {
    return "Network connection error. Please check your internet connection and try again.";
  }
  
  // Authentication errors
  if (lowerError.includes('invalid credentials') || lowerError.includes('login failed')) {
    return "Invalid email or password. Please check your credentials and try again.";
  }
  
  if (lowerError.includes('unauthorized') || lowerError.includes('not authorized')) {
    return "You are not authorized to perform this action. Please log in again.";
  }
  
  if (lowerError.includes('session expired')) {
    return "Your session has expired. Please log in again.";
  }
  
  // User account errors
  if (lowerError.includes('user not found')) {
    return "Account not found. Please check your login details.";
  }
  
  if (lowerError.includes('email already exists') || lowerError.includes('email is already in use')) {
    return "An account with this email already exists. Please use a different email or try logging in.";
  }
  
  // Admin specific errors
  if (lowerError.includes('admin not found')) {
    return "Admin account not found. Please check your credentials.";
  }
  
  if (lowerError.includes('admin account is not active')) {
    return "This admin account is not active. Please contact support.";
  }
  
  // Support ticket errors
  if (lowerError.includes('ticket not found')) {
    return "Support ticket not found. Please check the ticket ID.";
  }
  
  // Generic errors
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
 * Determines if an error is user-friendly (should be shown as-is)
 * vs technical (should be mapped to user-friendly message)
 */
export function isUserFriendlyError(error: string | Error): boolean {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const lowerError = errorMessage.toLowerCase();
  
  // These are already user-friendly and shouldn't be changed
  const userFriendlyKeywords = [
    'please fund your wallet',
    'please add money',
    'please check your',
    'please try again',
    'please contact support',
    'please log in',
    'please use a different',
    'please increase',
    'please reduce',
    'please check your internet',
    'please try again later'
  ];
  
  return userFriendlyKeywords.some(keyword => lowerError.includes(keyword));
}

/**
 * Main error handler that decides whether to show the original error
 * or map it to a user-friendly message
 */
export function handleError(error: string | Error): string {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // If it's already user-friendly, return as-is
  if (isUserFriendlyError(error)) {
    return errorMessage;
  }
  
  // Otherwise, map to user-friendly message
  return getUserFriendlyError(error);
}
