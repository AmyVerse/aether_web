// Utility to get academic year and semester type based on current date (or override)
export function getAcademicSession(dateOverride?: Date) {
  const now = dateOverride || new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 1 && month <= 6) {
    return {
      academicYear: `${year - 1}-${year}`,
      semesterType: "even" as const,
    };
  } else {
    return {
      academicYear: `${year}-${year + 1}`,
      semesterType: "odd" as const,
    };
  }
}
