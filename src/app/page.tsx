"use client";

import SignInClient from "@/components/SignInClient";
import SignUpClient from "@/components/SignUpC";
import Image from "next/image";
import { useState } from "react";

export default function LandingPage() {
  const [isSigninPage, setIsSigninPage] = useState(true);

  return (
    <div className="min-h-screen font-[manrope] flex flex-col md:flex-row">
      {/* Left side: Info section */}
      <div className="flex w-full md:w-1/2 bg-gradient-to-tl from-gray-700 to-gray-900 flex-col justify-center items-center px-6 md:px-10 py-5 sm:py-10 md:py-0">
        <div>
          <h1 className="text-2xl sm:text-4xl font-semibold text-white mb-6 sm:mb-9">
            Aether
          </h1>
          <h3 className="text-sm sm:text-lg font-normal text-gray-400 tracking-wide">
            An ERP for
          </h3>
          <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight sm:mb-24">
            Indian Institute of <br />
            Information Technology, <br />
            Nagpur
          </h2>

          <p className="text-lg font-semibold text-gray-400 mb-4 max-sm:hidden">
            It offers:
          </p>
          <ul className="text-lg text-gray-300 space-y-2 list-disc list-inside max-sm:hidden">
            <li className="hover:text-white transition-colors duration-200 cursor-default">
              Efficient attendance tracking with export options
            </li>
            <li className="hover:text-white transition-colors duration-200 cursor-default">
              Academic records and exam marks management
            </li>
            <li className="hover:text-white transition-colors duration-200 cursor-default">
              Class scheduling and resource allocation
            </li>
            <li className="hover:text-white transition-colors duration-200 cursor-default">
              Real-time dashboards and analytics
            </li>
            <li className="hover:text-white transition-colors duration-200 cursor-default">
              Automated notifications and alerts
            </li>
            <li className="hover:text-white transition-colors duration-200 cursor-default">
              Centralized data management and reporting
            </li>
          </ul>
        </div>
      </div>

      {/* Right side: Auth form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-[#f3f5fe] px-6 py-10 md:p-0">
        <div className="flex-col items-center mb-8 max-sm:hidden">
          <Image src="/logo.svg" alt="Logo" width={40} height={40} />
        </div>

        <div className="w-full max-w-md">
          {isSigninPage ? (
            <SignInClient />
          ) : (
            <SignUpClient setIsSigninPageAction={setIsSigninPage} />
          )}
        </div>

        <p className="text-base text-gray-500 mt-6 text-center md:text-left">
          {isSigninPage ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSigninPage(false)}
                className="text-gray-800 font-medium hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsSigninPage(true)}
                className="text-gray-800 font-medium hover:underline"
              >
                Sign In
              </button>
            </>
          )}
        </p>
        <p className="text-sm text-gray-500 mt-2 text-center md:text-left">
          Need Help?{" "}
          <a
            href="mailto:amulyayadav665@gmail.com"
            className="text-gray-800 font-medium hover:underline"
          >
            Contact Us
          </a>
        </p>
      </div>

      {/* Footer (Mobile only) */}
      <div className="flex flex-col bg-[#f3f5fe] sm:hidden items-center pt-6 pb-4">
        <hr className="border-gray-300 w-[calc(100vw/1.5)] mx-auto pt-6" />
        <Image src="/logo.svg" alt="Logo" width={30} height={30} />
        <p className="text-xs text-gray-400 mt-3 text-center w-full">
          &copy; 2025 Aether IIITN.
        </p>
      </div>
    </div>
  );
}
