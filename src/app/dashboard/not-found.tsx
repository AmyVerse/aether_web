import Link from "next/link";
import { FaExclamationTriangle, FaHome } from "react-icons/fa";

export default function DashboardNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <FaExclamationTriangle className="text-6xl text-yellow-500 mb-6 mx-auto" />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or you don't have permission
          to access it.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <FaHome />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
