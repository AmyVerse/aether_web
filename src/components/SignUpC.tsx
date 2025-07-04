"use client";

import { useToast } from "@/hooks/useToast";
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
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { showSuccess, showError } = useToast();

  // Password validation: 8+ characters, 1 uppercase, 1 lowercase, 1 number
  const isPasswordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password);

  // --- API Calls ---
  // Step 0: Email check, then send OTP if email is valid
  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    // Toast cleared automatically
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
        showError(checkEmailData.error || "Invalid email.");
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
        showError(sendOtpData.error || "Could not send OTP.");
        setLoading(false);
        return;
      }

      showSuccess("OTP sent to your email.");
      setStep(1);
      setLoading(false);
    } catch {
      showError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  // Step 1: OTP verify
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Toast cleared automatically
    setLoading(true);

    try {
      const verifyOtpRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const verifyOtpData = await verifyOtpRes.json();
      if (!verifyOtpRes.ok || verifyOtpData.status !== "verified") {
        showError(
          verifyOtpData.error ||
            (verifyOtpData.status === "expired_or_missing"
              ? "OTP expired or missing."
              : verifyOtpData.status === "invalid_otp"
                ? "Invalid OTP."
                : "OTP verification failed."),
        );
        setLoading(false);
        return;
      }

      showSuccess("OTP verified.");
      setStep(2);
      setLoading(false);
    } catch {
      showError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  // Step 2: Register (email and password only, backend will fill name/role info)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Toast cleared automatically
    setLoading(true);

    try {
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const signupData = await signupRes.json();
      if (!signupRes.ok) {
        showError(signupData.error || "Could not create account.");
        setLoading(false);
        return;
      }
      showSuccess("Account created!");
      setStep(3);
      setLoading(false);
    } catch {
      showError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  // Start timer when OTP step is entered
  useEffect(() => {
    if (step === 1) {
      setResendTimer(60);
      const interval = setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1) {
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Resend handler
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        showSuccess("OTP sent!");
        setResendTimer(60);
      } else {
        showError("Failed to resend OTP");
      }
    } catch {
      showError("Failed to resend OTP");
    }
    setLoading(false);
  };

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
      <div className="flex flex-col items-center w-full max-w-md">
        <div className="bg-transparent p-6 sm:p-8 md:p-10 rounded-xl outline-gray-300 outline-dotted w-full text-center">
          <h2 className="text-2xl font-bold mb-1">Create Account</h2>
          <p className="text-gray-400 mb-10 font-light font-[inter] leading-relaxed">
            Sign up to get started.
          </p>

          {step === 0 && (
            <form onSubmit={handleEmailContinue} className="w-full">
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
            </form>
          )}

          {step === 1 && (
            <form onSubmit={handleOtpSubmit} className="w-full">
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full leading-tight px-4 py-3 border border-gray-300 rounded-lg outline-none mb-2"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  autoFocus
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || loading}
                  className={`text-sm font-medium mb-5 ${
                    resendTimer > 0 || loading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-indigo-600 hover:underline"
                  }`}
                >
                  {resendTimer > 0
                    ? `Resend available in ${resendTimer}s`
                    : "Didn't receive OTP? Resend."}
                </button>
              </div>
              <button
                type="submit"
                className="w-full font-[poppins] bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handlePasswordSubmit} className="w-full">
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
                  required
                  autoFocus
                  minLength={8}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-4 top-0 bottom-0 my-auto flex items-center h-full text-gray-400"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaLock />
                </span>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full leading-tight pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>
              {password && !isPasswordValid && (
                <div className="text-red-500 justify-start relative text-sm mb-4">
                  Password must be at least 8 characters, include one uppercase
                  letter, one lowercase letter, and one number.
                </div>
              )}
              {password && confirmPassword && password !== confirmPassword && (
                <div className="text-red-500 justify-start relative text-sm mb-4">
                  Passwords do not match.
                </div>
              )}
              <button
                type="submit"
                disabled={
                  loading || !isPasswordValid || password !== confirmPassword
                }
                className={`w-full leading-tight mt-3 font-[poppins] py-3 mb-4 rounded-lg transition flex items-center justify-center ${
                  loading || !isPasswordValid || password !== confirmPassword
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-800 text-white hover:bg-gray-900"
                }`}
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="w-full px-4 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-semibold mb-4">Account Created!</h2>
              <p className="text-gray-600 mb-6">Redirecting to sign in...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
