export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type Cube = {
  id: string;
  name: string;
  photoUri: string | null;
  difficulty: Difficulty;
  notes: string | null;
  parityUris: string[];
  solutionUris: string[];
  createdAt: number;
  updatedAt: number;
};

export type CubeInput = {
  name: string;
  photoUri: string | null;
  difficulty: Difficulty;
  notes: string | null;
  parityUris: string[];
  solutionUris: string[];
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'Muito fácil',
  2: 'Fácil',
  3: 'Médio',
  4: 'Difícil',
  5: 'Super difícil',
};
