"use client";
import { useSession } from "next-auth/react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface CachedSessionData {
  user: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    roleId?: string;
    role?: string;
  } | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

interface SessionContextType {
  sessionData: CachedSessionData;
  isLoading: boolean;
  userRoleId: string | undefined;
  userRole: string | undefined;
  userImage: string | undefined;
  userName: string | undefined;
  userEmail: string | undefined;
}

const SessionContext = createContext<SessionContextType | null>(null);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const { data: session, status } = useSession();
  const [cachedSession, setCachedSession] = useState<CachedSessionData>({
    user: null,
    status: "loading",
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load cached session from localStorage on mount
    if (!isInitialized) {
      const cached = localStorage.getItem("cached-session");
      if (cached) {
        try {
          const parsedSession = JSON.parse(cached);
          setCachedSession(parsedSession);
        } catch (error) {
          console.warn("Failed to parse cached session:", error);
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    // Update cache when session changes
    if (status !== "loading" && session) {
      const sessionData: CachedSessionData = {
        user: {
          id: session.user?.id,
          name: session.user?.name || undefined,
          email: session.user?.email || undefined,
          image: session.user?.image || undefined,
          role: session.user?.role || undefined,
          roleId: session.user?.roleId || undefined,
        },
        status: "authenticated",
      };

      setCachedSession((prevCache) => {
        // Only update if data has actually changed
        const currentCacheString = JSON.stringify(prevCache);
        const newCacheString = JSON.stringify(sessionData);

        if (currentCacheString !== newCacheString) {
          localStorage.setItem("cached-session", newCacheString);
          return sessionData;
        }
        return prevCache;
      });
    } else if (status === "unauthenticated") {
      const unauthenticatedData: CachedSessionData = {
        user: null,
        status: "unauthenticated",
      };
      setCachedSession(unauthenticatedData);
      localStorage.removeItem("cached-session");
    }
  }, [session, status]);

  const contextValue: SessionContextType = {
    sessionData: cachedSession,
    isLoading: status === "loading" && !isInitialized,
    userRole: cachedSession.user?.role,
    userImage: cachedSession.user?.image,
    userName: cachedSession.user?.name,
    userEmail: cachedSession.user?.email,
    userRoleId: cachedSession.user?.roleId,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useCachedSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useCachedSession must be used within a SessionProvider");
  }
  return context;
}

// Hook for just getting user role (most common use case)
export function useUserRole() {
  const { userRole } = useCachedSession();
  return userRole;
}

// Hook for getting user info
export function useUserInfo() {
  const { userName, userEmail, userImage } = useCachedSession();
  return { userName, userEmail, userImage };
}
