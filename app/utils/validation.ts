/**
 * Validation Utilities
 * Contains validation functions for common use cases in the application
 * @module utils/validation
 */

/**
 * Validates an email address
 * @param email The email address to validate
 * @returns boolean indicating if the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password
 * @param password The password to validate
 * @returns boolean indicating if the password is valid (min 6 characters)
 */
export const isValidPassword = (password: string): boolean => {
  if (!password) return false;
  return password.length >= 6; // Minimum 6 characters
};

/**
 * Validates a username
 * @param username The username to validate
 * @returns boolean indicating if the username is valid (letters, numbers, underscore, min 3 chars)
 */
export const isValidUsername = (username: string): boolean => {
  if (!username) return false;
  // Letters, numbers, and underscores, min 3 characters
  const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
  return usernameRegex.test(username);
};

export default {
  isValidEmail,
  isValidPassword,
  isValidUsername,
};
