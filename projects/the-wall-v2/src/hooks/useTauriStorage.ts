import { useState, useEffect } from 'react';
import { BaseDirectory, readTextFile, writeTextFile, mkdir } from '@tauri-apps/plugin-fs';

export function useTauriStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  async function loadValue() {
    if (!('__TAURI_INTERNALS__' in window)) { setIsLoaded(true); return; }
    try {
      const contents = await readTextFile(`${key}.json`, { baseDir: BaseDirectory.AppData });
      setStoredValue(JSON.parse(contents));
    } catch (error) {
      // File not found, use initial value
      try {
        await mkdir('', { baseDir: BaseDirectory.AppData, recursive: true }).catch(() => {});
        await writeTextFile(`${key}.json`, JSON.stringify(initialValue), { baseDir: BaseDirectory.AppData });
      } catch(e) {}
    } finally {
      setIsLoaded(true);
    }
  }

  useEffect(() => {
    loadValue();
  }, [key]);

  const setValue = async (value: T | ((val: T) => T)) => {
    if (!('__TAURI_INTERNALS__' in window)) { setStoredValue(value instanceof Function ? value(storedValue) : value); return; }
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      try {
        await mkdir('', { baseDir: BaseDirectory.AppData, recursive: true });
      } catch (e) {
        // Ignore mkdir errors
      }
      await writeTextFile(`${key}.json`, JSON.stringify(valueToStore), { baseDir: BaseDirectory.AppData });
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue, isLoaded];
}
