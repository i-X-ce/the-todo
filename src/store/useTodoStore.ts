import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ThemeMode, TodoTab } from "../types";
import { tauriStoreStorage } from "./tauriStoreStorage";

type TodoState = {
  tabs: TodoTab[];
  activeTabId: string;
  themeMode: ThemeMode;
  alwaysOnTop: boolean;
  addTab: () => void;
  renameTab: (tabId: string, title: string) => void;
  removeTab: (tabId: string) => void;
  moveTab: (fromIndex: number, toIndex: number) => void;
  setActiveTab: (tabId: string) => void;
  addTask: (tabId: string, text: string) => void;
  updateTask: (tabId: string, taskId: string, text: string) => void;
  deleteTask: (tabId: string, taskId: string) => void;
  toggleTask: (tabId: string, taskId: string) => void;
  moveTask: (tabId: string, fromIndex: number, toIndex: number) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setAlwaysOnTop: (value: boolean) => void;
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const createInitialTab = (): TodoTab => ({
  id: createId(),
  title: "ToDo",
  tasks: [],
});

const moveArrayItem = <T>(arr: T[], from: number, to: number): T[] => {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const findActiveTab = (tabs: TodoTab[], activeTabId: string) => {
  return tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
};

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      tabs: [createInitialTab()],
      activeTabId: "",
      themeMode: "system",
      alwaysOnTop: false,

      addTab: () =>
        set((state) => {
          const newTab: TodoTab = {
            id: createId(),
            title: `Tab ${state.tabs.length + 1}`,
            tasks: [],
          };

          return {
            tabs: [...state.tabs, newTab],
            activeTabId: newTab.id,
          };
        }),

      renameTab: (tabId, title) =>
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId
              ? { ...tab, title: title.trim() || "Untitled" }
              : tab,
          ),
        })),

      removeTab: (tabId) =>
        set((state) => {
          if (state.tabs.length <= 1) {
            return state;
          }

          const tabs = state.tabs.filter((tab) => tab.id !== tabId);
          const activeTab = findActiveTab(tabs, state.activeTabId);

          return {
            tabs,
            activeTabId: activeTab.id,
          };
        }),

      moveTab: (fromIndex, toIndex) =>
        set((state) => ({
          tabs: moveArrayItem(state.tabs, fromIndex, toIndex),
        })),

      setActiveTab: (tabId) => set(() => ({ activeTabId: tabId })),

      addTask: (tabId, text) =>
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId
              ? {
                  ...tab,
                  tasks: [
                    ...tab.tasks,
                    {
                      id: createId(),
                      text,
                      completed: false,
                    },
                  ],
                }
              : tab,
          ),
        })),

      updateTask: (tabId, taskId, text) =>
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId
              ? {
                  ...tab,
                  tasks: tab.tasks.map((task) =>
                    task.id === taskId ? { ...task, text } : task,
                  ),
                }
              : tab,
          ),
        })),

      deleteTask: (tabId, taskId) =>
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId
              ? {
                  ...tab,
                  tasks: tab.tasks.filter((task) => task.id !== taskId),
                }
              : tab,
          ),
        })),

      toggleTask: (tabId, taskId) =>
        set((state) => ({
          tabs: state.tabs.map((tab) => {
            if (tab.id !== tabId) {
              return tab;
            }

            const target = tab.tasks.find((task) => task.id === taskId);
            if (!target) {
              return tab;
            }

            const toggled = { ...target, completed: !target.completed };
            const withoutTarget = tab.tasks.filter(
              (task) => task.id !== taskId,
            );

            if (toggled.completed) {
              return {
                ...tab,
                tasks: [...withoutTarget, toggled],
              };
            }

            const firstCompletedIndex = withoutTarget.findIndex(
              (task) => task.completed,
            );
            if (firstCompletedIndex === -1) {
              return {
                ...tab,
                tasks: [...withoutTarget, toggled],
              };
            }

            return {
              ...tab,
              tasks: [
                ...withoutTarget.slice(0, firstCompletedIndex),
                toggled,
                ...withoutTarget.slice(firstCompletedIndex),
              ],
            };
          }),
        })),

      moveTask: (tabId, fromIndex, toIndex) =>
        set((state) => ({
          tabs: state.tabs.map((tab) => {
            if (tab.id !== tabId) {
              return tab;
            }

            const movedTasks = moveArrayItem(tab.tasks, fromIndex, toIndex);
            const uncompletedTasks = movedTasks.filter(
              (task) => !task.completed,
            );
            const completedTasks = movedTasks.filter((task) => task.completed);

            return {
              ...tab,
              tasks: [...uncompletedTasks, ...completedTasks],
            };
          }),
        })),

      setThemeMode: (mode) => set(() => ({ themeMode: mode })),
      setAlwaysOnTop: (value) => set(() => ({ alwaysOnTop: value })),
    }),
    {
      name: "the-todo-storage",
      storage: createJSONStorage(() => tauriStoreStorage),
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId || state.tabs[0]?.id || "",
        themeMode: state.themeMode,
        alwaysOnTop: state.alwaysOnTop,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }
        if (!state.tabs.length) {
          state.tabs = [createInitialTab()];
        }
        if (!state.activeTabId) {
          state.activeTabId = state.tabs[0].id;
        }
      },
    },
  ),
);
