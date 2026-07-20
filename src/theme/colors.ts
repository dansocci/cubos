import type { Difficulty } from '../types/cube';

export const colors = {
  background: '#F5F6F8',
  surface: '#FFFFFF',
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

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  1: '#22C55E',
  2: '#84CC16',
  3: '#EAB308',
  4: '#F97316',
  5: '#EF4444',
};
