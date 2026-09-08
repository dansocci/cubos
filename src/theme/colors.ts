import type { Difficulty } from '../types/cube';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  danger: string;
  placeholder: string;
  placeholderIcon: string;
  overlay: string;
  white: string;
};

export const lightColors: ThemeColors = {
  background: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceMuted: '#E8EAEE',
  text: '#1A1D23',
  textSecondary: '#6B7280',
  border: '#D8DCE3',
  primary: '#2563EB',
  danger: '#DC2626',
  placeholder: '#E5E7EB',
  placeholderIcon: '#9CA3AF',
  overlay: 'rgba(0,0,0,0.92)',
  white: '#FFFFFF',
};

export const darkColors: ThemeColors = {
  background: '#0F1115',
  surface: '#1A1D23',
  surfaceMuted: '#252A33',
  text: '#F3F4F6',
  textSecondary: '#9CA3AF',
  border: '#2E3440',
  primary: '#3B82F6',
  danger: '#F87171',
  placeholder: '#2A2F38',
  placeholderIcon: '#6B7280',
  overlay: 'rgba(0,0,0,0.92)',
  white: '#FFFFFF',
};

/** @deprecated Prefer useTheme().colors — mantido para compatibilidade gradual */
export const colors = lightColors;

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  1: '#22C55E',
  2: '#84CC16',
  3: '#EAB308',
  4: '#F97316',
  5: '#EF4444',
};
