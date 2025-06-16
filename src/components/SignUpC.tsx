"use client";

import Toast from "@/components/toast";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";

export default function SignUpClient({
  setIsSigninPageAction,
}: {
  setIsSigninPageAction: (v: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(0); // 0 = email, 1 = OTP, 2 = password, 3 = success
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword] = useState(false);

  const formVariants = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  };

  // Password validation: only check for 6+ characters
  const isPasswordValid = password.length >= 6;

  // --- API Calls ---
  // Step 0: Email check, then send OTP if email is valid
  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    setLoading(true);

    try {
      // 1. Validate email (not registration, just eligibility)
      const checkEmailRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const checkEmailData = await checkEmailRes.json();
      if (!checkEmailRes.ok) {
        setToast({
          message: checkEmailData.error || "Invalid email.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      // 2. Send OTP (only if email is valid and not registered)
      const sendOtpRes = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const sendOtpData = await sendOtpRes.json();
      if (!sendOtpRes.ok) {
        setToast({
          message: sendOtpData.error || "Could not send OTP.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      setToast({
        message: "OTP sent to your email.",
        type: "success",
      });
      setStep(1);
      setLoading(false);
    } catch {
      setToast({ message: "Something went wrong. Try again.", type: "error" });
      setLoading(false);
    }
  };

  // Step 1: OTP verify
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    setLoading(true);

    try {
      const verifyOtpRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const verifyOtpData = await verifyOtpRes.json();
      if (!verifyOtpRes.ok || verifyOtpData.status !== "verified") {
        setToast({
          message:
            verifyOtpData.error ||
            (verifyOtpData.status === "expired_or_missing"
              ? "OTP expired or missing."
              : verifyOtpData.status === "invalid_otp"
                ? "Invalid OTP."
                : "OTP verification failed."),
          type: "error",
        });
        setLoading(false);
        return;
      }

      setToast({
        message: "OTP verified.",
        type: "success",
      });
      setStep(2);
      setLoading(false);
    } catch {
      setToast({ message: "Something went wrong. Try again.", type: "error" });
      setLoading(false);
    }
  };

  // Step 2: Register (email and password only, backend will fill name/role info)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    setLoading(true);

    try {
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const signupData = await signupRes.json();
      if (!signupRes.ok) {
        setToast({
          message: signupData.error || "Could not create account.",
          type: "error",
        });
        setLoading(false);
        return;
      }
      setToast({
        message: "Account created!",
        type: "success",
      });
      setStep(3);
      setLoading(false);
    } catch {
      setToast({ message: "Something went wrong. Try again.", type: "error" });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        setIsSigninPageAction(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step, setIsSigninPageAction]);

  return (
    <div className="font-[manrope] flex items-center justify-center bg-[#f3f5fe] px-2">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onCloseAction={() => setToast(null)}
        />
      )}
      <div className="flex flex-col items-center w-full max-w-md">
        <div className="bg-transparent p-6 sm:p-8 md:p-10 rounded-xl outline-gray-300 outline-dotted w-full text-center overflow-hidden">
          <h2 className="text-2xl font-bold mb-1">Create Account</h2>
          <p className="text-gray-400 mb-10 font-light font-[inter] leading-relaxed">
            Sign up to get started.
          </p>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.form
                key="email-step"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                onSubmit={handleEmailContinue}
                className="w-full"
              >
                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full leading-tight pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gray-800 font-[poppins] text-white py-3 rounded-lg hover:bg-gray-900 transition"
                  disabled={loading}
                >
                  {loading ? (
                    <span>
                      <svg
                        className="animate-spin h-5 w-5 mr-2 inline-block"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Sending OTP...
                    </span>
                  ) : (
                    "Continue"
                  )}
                </button>
              </motion.form>
            )}

            {step === 1 && (
              <motion.form
                key="otp-step"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                onSubmit={handleOtpSubmit}
                className="w-full"
              >
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg mb-4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="w-full font-[poppins] bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="password-step"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                onSubmit={handlePasswordSubmit}
                className="w-full"
              >
                {/* Password Field */}
                <div className="relative mb-4 flex items-center">
                  <span className="absolute left-4 top-0 bottom-0 my-auto flex items-center h-full text-gray-400">
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create Password"
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={step === 2}
                    autoFocus={step === 2}
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-0 bottom-0 my-auto flex items-center h-full text-gray-400"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {/* Confirm Password Field */}
                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaLock />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="w-full leading-tight pl-12 pr-12 py-3 border border-gray-300 rounded-lg outline-none"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
                {/* Password rules warning (only when typing first input) */}
                {password && !confirmPassword && !isPasswordValid && (
                  <div className="text-red-500 justify-start relative text-sm mb-4">
                    Password must be at least 6 characters.
                  </div>
                )}
                {/* Password match warning (only when both fields have value) */}
                {password &&
                  confirmPassword &&
                  password !== confirmPassword && (
                    <div className="text-red-500 justify-start relative text-sm mb-4">
                      Passwords do not match.
                    </div>
                  )}
                <button
                  type="submit"
                  disabled={
                    loading || !isPasswordValid || password !== confirmPassword
                  }
                  className={`w-full leading-tight mt-3 font-[poppins] py-3 mb-4 rounded-lg transition flex items-center justify-center
    ${
      loading || !isPasswordValid || password !== confirmPassword
        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
        : "bg-gray-800 text-white hover:bg-gray-900"
    }`}
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </motion.form>
            )}

            {step === 3 && (
              <motion.div
                key="success-step"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="w-full px-4 flex flex-col items-center justify-center"
              >
                <h2 className="text-2xl font-semibold mb-4">
                  Account Created!
                </h2>
                <p className="text-gray-600 mb-6">Redirecting to sign in...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
