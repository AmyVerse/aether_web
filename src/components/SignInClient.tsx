"use client";

import { useToast } from "@/hooks/useToast";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";

export default function SignInClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dashboard after successful login
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Always redirect to /dashboard - the layout will handle role-based rendering
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      showError(
        result.error === "CredentialsSignin"
          ? "Invalid email or password"
          : result.error,
      );
    } else if (result?.ok) {
      showSuccess("Login successful!");
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn("google");
    setGoogleLoading(false);
  };

  const isDisabled = loading || googleLoading;

  return (
    <div className="font-[manrope] flex items-center justify-center bg-[#f3f5fe] px-2">
      <div className="flex flex-col items-center max-w-full sm:max-w-md md:max-w-lg">
        <div className="bg-transparent p-6 sm:p-8 md:p-10 rounded-xl outline-gray-300 outline-dotted w-full text-center">
          <h2 className="text-2xl font-bold mb-1 sm:mb-3">Welcome Back</h2>
          <p className="text-gray-400 mb-10 font-light font-[inter] leading-relaxed text-2">
            Enter your credentials to access your account.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FaEnvelope />
              </span>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full leading-tight pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isDisabled}
              />
            </div>
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FaLock />
              </span>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full leading-tight pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isDisabled}
              />
            </div>
            <button
              type="submit"
              disabled={isDisabled}
              className={`w-full leading-tight bg-gray-800 font-[poppins] text-white py-3 mb-3 rounded-lg hover:bg-gray-900 transition ${
                isDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
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
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isDisabled}
            className="w-full flex items-center leading-tight justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-[poppins] py-3 rounded-lg hover:bg-gray-100 transition shadow"
          >
            {googleLoading ? (
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
            ) : (
              <Image src="/google.webp" alt="Google" width={18} height={18} />
            )}
            {googleLoading
              ? "Signing in with Google..."
              : "Continue with Google"}
          </button>
        </div>
      </div>
    </div>
  );
}
