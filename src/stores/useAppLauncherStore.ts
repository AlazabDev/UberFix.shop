import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LauncherItem {
  id: string;
  label: string;
  icon: string; // lucide icon name
  url: string;
  color: string; // HSL bg color class
  isExternal: boolean;
}

const defaultItems: LauncherItem[] = [
  { id: "1", label: "الرئيسية", icon: "Home", url: "/dashboard", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400", isExternal: false },
  { id: "2", label: "طلبات الصيانة", icon: "ClipboardList", url: "/requests", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400", isExternal: false },
  { id: "3", label: "البريد", icon: "Mail", url: "/inbox", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400", isExternal: false },
  { id: "4", label: "المواعيد", icon: "Calendar", url: "/appointments", color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400", isExternal: false },
  { id: "5", label: "الفواتير", icon: "DollarSign", url: "/invoices", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400", isExternal: false },
  { id: "6", label: "العقارات", icon: "Building2", url: "/properties", color: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400", isExternal: false },
  { id: "7", label: "الموردين", icon: "Users", url: "/vendors", color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400", isExternal: false },
  { id: "8", label: "التقارير", icon: "BarChart3", url: "/reports", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400", isExternal: false },
  { id: "9", label: "الإعدادات", icon: "Settings", url: "/settings", color: "bg-slate-100 text-slate-600 dark:bg-slate-900/40 dark:text-slate-400", isExternal: false },
];

interface AppLauncherStore {
  items: LauncherItem[];
  addItem: (item: Omit<LauncherItem, "id">) => void;
  updateItem: (id: string, item: Partial<LauncherItem>) => void;
  removeItem: (id: string) => void;
  reorderItems: (items: LauncherItem[]) => void;
}

export const useAppLauncherStore = create<AppLauncherStore>()(
  persist(
    (set) => ({
      items: defaultItems,
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, { ...item, id: crypto.randomUUID() }],
        })),
      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      reorderItems: (items) => set({ items }),
    }),
    { name: "app-launcher-items" }
  )
);
