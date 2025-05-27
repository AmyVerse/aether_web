"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaEnvelope, FaLock } from "react-icons/fa";
import Link from "next/link";

export default function SignInClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false); // <-- Add loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // <-- Start loading

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false); // <-- Stop loading after response
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen font-[manrope] flex items-center justify-center bg-[#f3f5fe] px-2">
      <div className="flex flex-col items-center w-full max-w-md sm:max-w-md md:max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.svg" alt="Logo" width={40} height={40} />
        </div>

        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-md w-full text-center">
          <h2 className="text-2xl font-bold mb-3">Welcome Back</h2>
          <p className="text-gray-400 mb-10 font-light font-[inter] leading-relaxed">
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
              />
            </div>

            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full leading-tight bg-gray-800 font-[poppins] text-white py-3 mb-4 rounded-lg hover:bg-gray-900 transition"
            >
              {" "}
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
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center leading-tight justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-[poppins] py-3 rounded-lg hover:bg-gray-100 transition shadow mb-8"
          >
            <Image src="/google.webp" alt="Google" width={25} height={20} />
            Sign in with Google
          </button>
        </div>

        <p className="text-gray-500 text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-gray-800 font-medium hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
