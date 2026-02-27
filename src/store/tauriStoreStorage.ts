import { Store } from "@tauri-apps/plugin-store";

let storePromise: Promise<Store> | null = null;

const getStore = () => {
  if (!storePromise) {
    storePromise = Store.load("todo-store.json");
  }
  return storePromise;
};

const isTauriRuntime = () => {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
};

export const tauriStoreStorage = {
  async getItem(name: string): Promise<string | null> {
    if (!isTauriRuntime()) {
      return localStorage.getItem(name);
    }

    try {
      const store = await getStore();
      const value = await store.get<string>(name);
      return value ?? null;
    } catch {
      return null;
    }
  },

  async setItem(name: string, value: string): Promise<void> {
    if (!isTauriRuntime()) {
      localStorage.setItem(name, value);
      return;
    }

    const store = await getStore();
    await store.set(name, value);
    await store.save();
  },

  async removeItem(name: string): Promise<void> {
    if (!isTauriRuntime()) {
      localStorage.removeItem(name);
      return;
    }

    const store = await getStore();
    await store.delete(name);
    await store.save();
  },
};
