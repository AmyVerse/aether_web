import { useToast } from "@/hooks/useToast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ===== TYPES =====
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface ApiCache {
  [key: string]: CacheEntry<any>;
}

interface DataCacheState {
  // Cache storage
  apiCache: ApiCache;

  // Cache management
  setCacheEntry: <T>(key: string, data: T, ttlMs?: number) => void;
  getCacheEntry: <T>(key: string) => T | null;
  invalidateCache: (keyPattern?: string) => void;
  clearExpiredCache: () => void;

  // Specific data caches with refresh flags
  lastRefreshTriggers: {
    teacherClasses: number;
    students: number;
    sessions: number;
    timetable: number;
    reports: number;
  };

  // Trigger cache refresh
  triggerRefresh: (type: keyof DataCacheState["lastRefreshTriggers"]) => void;
}

// ===== CACHE CONFIGURATION =====
const CACHE_TTL = {
  DEFAULT: 5 * 60 * 1000, // 5 minutes
  TEACHER_CLASSES: 10 * 60 * 1000, // 10 minutes
  CLASS_DETAILS: 15 * 60 * 1000, // 15 minutes
  STUDENTS: 30 * 60 * 1000, // 30 minutes
  SESSIONS: 5 * 60 * 1000, // 5 minutes
  TIMETABLE: 60 * 60 * 1000, // 1 hour
  REPORTS: 15 * 60 * 1000, // 15 minutes
  TEACHER_STATS: 10 * 60 * 1000, // 10 minutes
} as const;

// ===== CACHE STORE =====
export const useDataCache = create<DataCacheState>()(
  persist(
    (set, get) => ({
      apiCache: {},
      lastRefreshTriggers: {
        teacherClasses: 0,
        students: 0,
        sessions: 0,
        timetable: 0,
        reports: 0,
      },

      setCacheEntry: <T>(key: string, data: T, ttlMs = CACHE_TTL.DEFAULT) => {
        const now = Date.now();
        const entry: CacheEntry<T> = {
          data,
          timestamp: now,
          expiresAt: now + ttlMs,
        };

        set((state) => ({
          apiCache: {
            ...state.apiCache,
            [key]: entry,
          },
        }));
      },

      getCacheEntry: <T>(key: string): T | null => {
        const cache = get().apiCache;
        const entry = cache[key];

        if (!entry) return null;

        const now = Date.now();
        if (now > entry.expiresAt) {
          // Entry expired, remove it
          set((state) => {
            const newCache = { ...state.apiCache };
            delete newCache[key];
            return { apiCache: newCache };
          });
          return null;
        }

        return entry.data as T;
      },

      invalidateCache: (keyPattern?: string) => {
        set((state) => {
          if (!keyPattern) {
            // Clear all cache
            return { apiCache: {} };
          }

          // Clear cache entries matching pattern
          const newCache = { ...state.apiCache };
          Object.keys(newCache).forEach((key) => {
            if (key.includes(keyPattern)) {
              delete newCache[key];
            }
          });

          return { apiCache: newCache };
        });
      },

      clearExpiredCache: () => {
        const now = Date.now();
        set((state) => {
          const newCache = { ...state.apiCache };
          Object.keys(newCache).forEach((key) => {
            if (now > newCache[key].expiresAt) {
              delete newCache[key];
            }
          });
          return { apiCache: newCache };
        });
      },

      triggerRefresh: (type) => {
        set((state) => ({
          lastRefreshTriggers: {
            ...state.lastRefreshTriggers,
            [type]: Date.now(),
          },
        }));
      },
    }),
    {
      name: "data-cache-store",
      storage: createJSONStorage(() => localStorage),
      // Only persist cache entries that haven't expired
      partialize: (state) => ({
        apiCache: Object.fromEntries(
          Object.entries(state.apiCache).filter(
            ([, entry]) => Date.now() < entry.expiresAt,
          ),
        ),
        lastRefreshTriggers: state.lastRefreshTriggers,
      }),
    },
  ),
);

// ===== CACHED API HOOKS =====

// Generic cached fetch hook
export function useCachedFetch<T>() {
  const { setCacheEntry, getCacheEntry, invalidateCache } = useDataCache();
  const { showError } = useToast();

  const cachedFetch = async (
    url: string,
    options: RequestInit = {},
    cacheKey?: string,
    ttlMs: number = CACHE_TTL.DEFAULT,
    bypassCache = false,
  ): Promise<T | null> => {
    const finalCacheKey = cacheKey || url;

    // Check cache first (unless bypassing)
    if (!bypassCache) {
      const cached = getCacheEntry<T>(finalCacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful responses
      if (data.success !== false) {
        setCacheEntry(finalCacheKey, data, ttlMs);
      }

      return data;
    } catch (error) {
      console.error(`Fetch error for ${url}:`, error);
      showError(
        `Failed to fetch data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return null;
    }
  };

  return { cachedFetch, invalidateCache };
}

// Specific hooks for different data types
export function useTeacherClassesCache() {
  const { cachedFetch, invalidateCache } = useCachedFetch();
  const { triggerRefresh, lastRefreshTriggers } = useDataCache();

  const fetchTeacherClasses = async (
    academicYear: string,
    semesterType: string,
    forceRefresh = false,
  ) => {
    const url = `/api/teacher/classes?academicYear=${academicYear}&semesterType=${semesterType}`;
    const cacheKey = `teacher-classes-${academicYear}-${semesterType}`;

    return cachedFetch(
      url,
      {},
      cacheKey,
      CACHE_TTL.TEACHER_CLASSES,
      forceRefresh,
    );
  };

  const invalidateTeacherClasses = () => {
    invalidateCache("teacher-classes");
    triggerRefresh("teacherClasses");
  };

  return {
    fetchTeacherClasses,
    invalidateTeacherClasses,
    lastRefresh: lastRefreshTriggers.teacherClasses,
  };
}

export function useClassDetailsCache() {
  const { cachedFetch, invalidateCache } = useCachedFetch();

  const fetchClassDetails = async (classId: string, forceRefresh = false) => {
    const url = `/api/teacher/classes/${classId}`;
    const cacheKey = `class-details-${classId}`;

    return cachedFetch(
      url,
      {},
      cacheKey,
      CACHE_TTL.CLASS_DETAILS,
      forceRefresh,
    );
  };

  const fetchClassStudents = async (classId: string, forceRefresh = false) => {
    const url = `/api/teacher/classes/${classId}/students`;
    const cacheKey = `class-students-${classId}`;

    return cachedFetch(url, {}, cacheKey, CACHE_TTL.STUDENTS, forceRefresh);
  };

  const fetchAvailableStudents = async (
    classId: string,
    forceRefresh = false,
  ) => {
    const url = `/api/teacher/classes/${classId}/available-students`;
    const cacheKey = `available-students-${classId}`;

    return cachedFetch(url, {}, cacheKey, CACHE_TTL.STUDENTS, forceRefresh);
  };

  const invalidateClassData = (classId: string) => {
    invalidateCache(`class-${classId}`);
    invalidateCache(`available-students-${classId}`);
  };

  return {
    fetchClassDetails,
    fetchClassStudents,
    fetchAvailableStudents,
    invalidateClassData,
  };
}

export function useSessionsCache() {
  const { cachedFetch, invalidateCache } = useCachedFetch();
  const { triggerRefresh, lastRefreshTriggers } = useDataCache();

  const fetchClassSessions = async (classId: string, forceRefresh = false) => {
    const url = `/api/teacher/classes/${classId}/sessions`;
    const cacheKey = `class-sessions-${classId}`;

    return cachedFetch(url, {}, cacheKey, CACHE_TTL.SESSIONS, forceRefresh);
  };

  const fetchSessionStudents = async (
    sessionId: string,
    forceRefresh = false,
  ) => {
    const url = `/api/teacher/sessions/${sessionId}/students`;
    const cacheKey = `session-students-${sessionId}`;

    return cachedFetch(url, {}, cacheKey, CACHE_TTL.SESSIONS, forceRefresh);
  };

  const invalidateSessions = (classId?: string) => {
    if (classId) {
      invalidateCache(`class-sessions-${classId}`);
      invalidateCache(`session-students`); // Invalidate all session students
    } else {
      invalidateCache("sessions");
    }
    triggerRefresh("sessions");
  };

  return {
    fetchClassSessions,
    fetchSessionStudents,
    invalidateSessions,
    lastRefresh: lastRefreshTriggers.sessions,
  };
}

export function useTimetableCache() {
  const { cachedFetch, invalidateCache } = useCachedFetch();
  const { triggerRefresh, lastRefreshTriggers } = useDataCache();

  const fetchTimetableData = async (
    academicYear: string,
    semesterType: string,
    forceRefresh = false,
  ) => {
    const url = `/api/editor?action=timetable&academic_year=${academicYear}&semester_type=${semesterType}`;
    const cacheKey = `timetable-${academicYear}-${semesterType}`;

    return cachedFetch(url, {}, cacheKey, CACHE_TTL.TIMETABLE, forceRefresh);
  };

  const fetchRooms = async (forceRefresh = false) => {
    const url = "/api/editor?action=rooms";
    const cacheKey = "rooms-list";

    return cachedFetch(url, {}, cacheKey, CACHE_TTL.TIMETABLE, forceRefresh);
  };

  const fetchSubjects = async (forceRefresh = false) => {
    const url = "/api/editor?action=subjects";
    const cacheKey = "subjects-list";

    return cachedFetch(url, {}, cacheKey, CACHE_TTL.TIMETABLE, forceRefresh);
  };

  const invalidateTimetable = () => {
    invalidateCache("timetable");
    invalidateCache("rooms-list");
    invalidateCache("subjects-list");
    triggerRefresh("timetable");
  };

  return {
    fetchTimetableData,
    fetchRooms,
    fetchSubjects,
    invalidateTimetable,
    lastRefresh: lastRefreshTriggers.timetable,
  };
}

export function useTeacherStatsCache() {
  const { cachedFetch, invalidateCache } = useCachedFetch();

  const fetchTeacherStats = async (
    academicYear: string,
    semesterType: string,
    forceRefresh = false,
  ) => {
    const url = `/api/teacher/classes?academicYear=${academicYear}&semesterType=${semesterType}`;
    const cacheKey = `teacher-stats-${academicYear}-${semesterType}`;

    return cachedFetch(
      url,
      {},
      cacheKey,
      CACHE_TTL.TEACHER_STATS,
      forceRefresh,
    );
  };

  const invalidateTeacherStats = () => {
    invalidateCache("teacher-stats");
  };

  return {
    fetchTeacherStats,
    invalidateTeacherStats,
  };
}

// ===== CACHE INVALIDATION HELPERS =====

// Call this after any submit-type operations
export function useInvalidateRelatedCache() {
  const { invalidateTeacherClasses } = useTeacherClassesCache();

  const { invalidateClassData } = useClassDetailsCache();
  const { invalidateSessions } = useSessionsCache();
  const { invalidateTimetable } = useTimetableCache();
  const { invalidateTeacherStats } = useTeacherStatsCache();

  const invalidateAfterClassOperation = (classId?: string) => {
    invalidateTeacherClasses();
    invalidateTeacherStats();
    if (classId) {
      invalidateClassData(classId);
      invalidateSessions(classId);
    }
  };

  const invalidateAfterStudentOperation = (classId?: string) => {
    invalidateTeacherStats();
    if (classId) {
      invalidateClassData(classId);
    }
  };

  const invalidateAfterSessionOperation = (classId?: string) => {
    if (classId) {
      invalidateSessions(classId);
    }
  };

  const invalidateAfterTimetableOperation = () => {
    invalidateTimetable();
    invalidateTeacherClasses();
  };

  return {
    invalidateAfterClassOperation,
    invalidateAfterStudentOperation,
    invalidateAfterSessionOperation,
    invalidateAfterTimetableOperation,
  };
}

// ===== CLEANUP =====
// Auto-cleanup expired cache entries every 10 minutes
setInterval(
  () => {
    useDataCache.getState().clearExpiredCache();
  },
  10 * 60 * 1000,
);
