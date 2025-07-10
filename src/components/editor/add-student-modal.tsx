"use client";
import { Button } from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";

interface AddStudentModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function AddStudentModal({
  isOpen,
  onCloseAction,
}: AddStudentModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    roll_number: "",
    name: "",
    batch_year: "",
  });
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess("Student added successfully!");
        setFormData({ email: "", roll_number: "", name: "", batch_year: "" });
        onCloseAction();
      } else {
        showError(data.error || "Failed to add student");
      }
    } catch (error) {
      showError("Error adding student");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCloseAction}
      title="Add New Student"
      showActions={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter student's full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="student@iiitng.ac.in"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roll Number *
          </label>
          <input
            type="text"
            name="roll_number"
            value={formData.roll_number}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="21CSE001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Batch Year *
          </label>
          <select
            name="batch_year"
            value={formData.batch_year}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select batch year</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onCloseAction}
            variant="outline"
            width="w-full"
            padding="px-4 py-2"
            font="text-sm"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            width="w-full"
            padding="px-4 py-2"
            font="text-sm"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Adding...
              </>
            ) : (
              "Add Student"
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
