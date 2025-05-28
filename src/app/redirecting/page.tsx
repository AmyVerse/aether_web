"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RedirectingPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let count = 4;
    setCountdown(count);
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(interval);
        router.push("/");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center font-[manrope] bg-gray-100">
      <div className="text-center">
        <p className="text-gray-700 text-xl font-medium mb-4">
          Unauthorized Access
        </p>
        <p className="text-lg text-gray-500 mb-2">
          Redirecting to Landing page in {countdown}
        </p>
      </div>
    </div>
  );
}
