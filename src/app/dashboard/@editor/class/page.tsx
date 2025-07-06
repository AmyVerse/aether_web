"use client";

// Default component for @editor parallel route when on class pages
export default function EditorClass() {
  return (
    <div className="space-y-6 relative p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Class Management Tools
        </h2>
        <p className="text-gray-600">
          This section will contain class-specific editor tools and
          functionality.
        </p>
      </div>
    </div>
  );
}
