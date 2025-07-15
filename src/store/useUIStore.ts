import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Can add more UI state here in the future like:
  // theme: "light" | "dark";
  // fontSize: "small" | "medium" | "large";
  // etc.
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed: boolean) =>
        set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
    }),
    {
      name: "ui-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
