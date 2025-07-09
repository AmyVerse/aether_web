import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Academic year format: 2024-2025 (not 2024-25)
export type AcademicYear = string; // e.g. "2024-2025"
export type SemesterType = "odd" | "even";

interface SessionState {
  academicYear: AcademicYear;
  semesterType: SemesterType;
  setAcademicYear: (year: AcademicYear) => void;
  setSemesterType: (type: SemesterType) => void;
  // Optionally, add more session-related state here
}

const defaultAcademicYear = (() => {
  const now = new Date();
  const year = now.getFullYear();
  // Academic year starts in July, so if before July, use previous year
  const startYear = now.getMonth() < 6 ? year - 1 : year;
  return `${startYear}-${startYear + 1}`;
})();

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      academicYear: defaultAcademicYear,
      semesterType: "odd",
      setAcademicYear: (year: AcademicYear) => set({ academicYear: year }),
      setSemesterType: (type: SemesterType) => set({ semesterType: type }),
    }),
    {
      name: "session-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
