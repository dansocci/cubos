import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { darkColors, lightColors, type ThemeColors } from '../theme/colors';

const STORAGE_KEY = '@cubos/theme-mode';

export type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        setMode(stored);
      }
    })().catch(() => undefined);
  }, []);

  const persist = useCallback(async (next: ThemeMode) => {
    setMode(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const setDarkMode = useCallback(
    (enabled: boolean) => {
      void persist(enabled ? 'dark' : 'light');
    },
    [persist],
  );

  const toggleDarkMode = useCallback(() => {
    void persist(mode === 'dark' ? 'light' : 'dark');
  }, [mode, persist]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      isDark: mode === 'dark',
      colors: mode === 'dark' ? darkColors : lightColors,
      setDarkMode,
      toggleDarkMode,
    }),
    [mode, setDarkMode, toggleDarkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return ctx;
}
