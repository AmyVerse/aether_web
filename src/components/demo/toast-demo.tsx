"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";

export default function ToastDemo() {
  const { showSuccess, showError } = useToast();

  const handleShowSuccess = () => {
    showSuccess("Operation completed successfully! All data has been saved.");
  };

  const handleShowError = () => {
    showError(
      "Failed to save changes. Please check your internet connection and try again.",
    );
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Toast Notifications Demo</h3>
      <div className="space-y-3">
        <Button
          onClick={handleShowSuccess}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          Show Success Toast
        </Button>

        <Button
          onClick={handleShowError}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          Show Error Toast
        </Button>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p className="font-medium mb-2">Features:</p>
        <ul className="space-y-1 text-xs">
          <li>• Auto-dismiss (3 seconds)</li>
          <li>• Simple success/error types</li>
          <li>• Easy to use</li>
        </ul>
      </div>
    </Card>
  );
}
