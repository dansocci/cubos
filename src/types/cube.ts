import { isVideoUri } from '../media/isVideoUri';

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type CubeMedia = {
  uri: string;
  name: string;
};

export type Cube = {
  id: string;
  name: string;
  photoUri: string | null;
  difficulty: Difficulty;
  notes: string | null;
  hasParity: boolean;
  parityMedia: CubeMedia[];
  solutionMedia: CubeMedia[];
  createdAt: number;
  updatedAt: number;
};

export type CubeInput = {
  name: string;
  photoUri: string | null;
  difficulty: Difficulty;
  notes: string | null;
  hasParity: boolean;
  parityMedia: CubeMedia[];
  solutionMedia: CubeMedia[];
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'Muito fácil',
  2: 'Fácil',
  3: 'Médio',
  4: 'Difícil',
  5: 'Super difícil',
};

export function defaultMediaName(uri: string, index: number): string {
  return isVideoUri(uri) ? `Vídeo ${index + 1}` : `Foto ${index + 1}`;
}
