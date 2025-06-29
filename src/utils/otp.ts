import crypto from "crypto";

/**
 * Generate a secure 6-digit OTP
 */
export const generateOtp = (length = 6): string => {
  // Use crypto.randomInt for better security
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10).toString();
  }
  return otp;
};

/**
 * Generate OTP with expiration timestamp
 */
export const generateOtpWithExpiry = (length = 6, expiryMinutes = 10) => {
  const otp = generateOtp(length);
  const expiresAt = Date.now() + expiryMinutes * 60 * 1000;
  return { otp, expiresAt };
};

/**
 * Validate OTP and check if it's expired
 */
export const validateOtp = (
  storedOtp: string,
  providedOtp: string,
  expiresAt: number,
) => {
  if (Date.now() > expiresAt) {
    return { valid: false, reason: "expired" };
  }
  if (storedOtp !== providedOtp) {
    return { valid: false, reason: "invalid" };
  }
  return { valid: true };
};
