"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";

export default function SignupClient({
  setIsSigninPageAction,
}: {
  setIsSigninPageAction: (v: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [loading, setLoading] = useState(false); // <-- Add loading state

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setCountdown(3);
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccessMsg("User created!");
      let count = 3;
      setCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count === 0) {
          clearInterval(interval);
          setIsSigninPageAction(true); // <-- Just flip to sign in page
        }
      }, 1000);
    } else {
      const data = await res.json();
      setError(data.error || "Signup failed");
    }
  };

  return (
    <div className="font-[manrope] flex items-center justify-center bg-[#f3f5fe] px-2">
      <div className="flex flex-col items-center w-full max-w-md sm:max-w-md md:max-w-lg">
        {/* Card */}
        <div className="bg-transparent p-6 sm:p-8 md:p-10 rounded-xl outline-gray-300 outline-dotted w-full text-center">
          <h2 className="text-2xl font-bold mb-3">Create Account</h2>
          <p className="text-gray-400 mb-10 font-light font-[inter] leading-relaxed">
            Sign up to get started.
          </p>

          {successMsg ? (
            <div className="text-green-600 text-lg mb-6">
              {successMsg}
              <div className="mt-2 text-gray-700 text-base">
                Redirecting to sign in {countdown}...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignup}>
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaUser />
                </span>
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full leading-tight pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                />
              </div>

              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaLock />
                </span>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full leading-tight pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm mb-4">{error}</div>
              )}

              <button
                type="submit"
                className="w-full leading-tight bg-gray-800 font-[poppins] text-white py-3 mb-4 rounded-lg hover:bg-gray-900 transition flex items-center justify-center"
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
                    Signing Up...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
