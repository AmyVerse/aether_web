"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import Dialog from "../ui/dialog";

interface AddRoomModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onRoomAddedAction: () => void;
}

export function AddRoomModal({
  isOpen,
  onCloseAction,
  onRoomAddedAction,
}: AddRoomModalProps) {
  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "",
    capacity: "",
    floor: "",
    building: "",
    facilities: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity) || 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add room");
      }

      // Reset form and close modal
      setFormData({
        room_number: "",
        room_type: "",
        capacity: "",
        floor: "",
        building: "",
        facilities: [],
      });
      onRoomAddedAction();
      onCloseAction();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCloseAction}
      title="Add New Room"
      showActions={false}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="room_number"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Room Number *
          </label>
          <input
            type="text"
            id="room_number"
            name="room_number"
            value={formData.room_number}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., CR-101, LB-A, AUD-1"
          />
        </div>
        <div>
          <label
            htmlFor="capacity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Capacity *
          </label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter room capacity"
          />
        </div>
        <div>
          <label
            htmlFor="room_type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Room Type *
          </label>
          <select
            id="room_type"
            name="room_type"
            value={formData.room_type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Room Type</option>
            <option value="Classroom">Classroom</option>
            <option value="Lab">Lab</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="building"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Building
          </label>
          <input
            type="text"
            id="building"
            name="building"
            value={formData.building}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Main Building, Block A"
          />
        </div>
        <div>
          <label
            htmlFor="floor"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Floor
          </label>
          <select
            id="floor"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Floor</option>
            <option value="Ground Floor">Ground Floor</option>
            <option value="First Floor">First Floor</option>
            <option value="Second Floor">Second Floor</option>
            <option value="Third Floor">Third Floor</option>
            <option value="Fourth Floor">Fourth Floor</option>
            <option value="Fifth Floor">Fifth Floor</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Facilities
          </label>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasProjector"
              name="hasProjector"
              checked={formData.facilities.includes("Projector")}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="hasProjector"
              className="ml-2 text-sm text-gray-700"
            >
              Has Projector
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasAirConditioner"
              name="hasAirConditioner"
              checked={formData.facilities.includes("Air Conditioner")}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="hasAirConditioner"
              className="ml-2 text-sm text-gray-700"
            >
              Has Air Conditioner
            </label>
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onCloseAction}
            width="flex-1"
            height="h-10"
            padding="px-4 py-2"
            font="text-sm"
            className="border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            width="flex-1"
            height="h-10"
            padding="px-4 py-2"
            font="text-sm"
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add Room"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
