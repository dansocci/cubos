import type { Cube } from '../types/cube';

export type SortField = 'createdAt' | 'name' | 'difficulty';
export type SortDirection = 'asc' | 'desc';

export type CubeSort = {
  field: SortField;
  direction: SortDirection;
};

export const DEFAULT_CUBE_SORT: CubeSort = {
  field: 'createdAt',
  direction: 'desc',
};

export const SORT_FIELD_LABELS: Record<SortField, string> = {
  createdAt: 'Data de inserção',
  name: 'Nome',
  difficulty: 'Dificuldade',
};

export const DEFAULT_DIRECTION_BY_FIELD: Record<SortField, SortDirection> = {
  createdAt: 'desc',
  name: 'asc',
  difficulty: 'asc',
};

function compareCubes(a: Cube, b: Cube, field: SortField): number {
  switch (field) {
    case 'name':
      return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
    case 'difficulty':
      return a.difficulty - b.difficulty;
    case 'createdAt':
      return a.createdAt - b.createdAt;
  }
}

export function sortCubes(cubes: Cube[], sort: CubeSort): Cube[] {
  const factor = sort.direction === 'asc' ? 1 : -1;
  return [...cubes].sort((a, b) => {
    const result = compareCubes(a, b, sort.field);
    if (result !== 0) {
      return result * factor;
    }
    return b.createdAt - a.createdAt;
  });
}

export function nextSort(current: CubeSort, field: SortField): CubeSort {
  if (current.field === field) {
    return {
      field,
      direction: current.direction === 'asc' ? 'desc' : 'asc',
    };
  }

  return {
    field,
    direction: DEFAULT_DIRECTION_BY_FIELD[field],
  };
}
