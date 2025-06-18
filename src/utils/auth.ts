/**
 * Utility function to verify a password against a hashed password.
 * Uses bcrypt for hashing and comparison.
 *
 * @param {string} plainPassword - The plain text password to verify.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} - Returns true if the passwords match, false otherwise.
 */
async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  // Import bcrypt here if not already imported at the top
  const bcrypt = await import("bcrypt");
  return bcrypt.compare(plainPassword, hashedPassword);
}

export { verifyPassword };
