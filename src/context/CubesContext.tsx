import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as cubesRepository from '../data/cubesRepository';
import { copyMediaToAppStorage, deleteMediaFile, deleteMediaFiles } from '../media/copyToAppStorage';
import type { Cube, CubeInput } from '../types/cube';

type CubesContextValue = {
  cubes: Cube[];
  loading: boolean;
  refresh: () => Promise<void>;
  getCube: (id: string) => Cube | undefined;
  addCube: (input: CubeInput) => Promise<Cube>;
  editCube: (id: string, input: CubeInput) => Promise<Cube | null>;
  removeCube: (id: string) => Promise<void>;
};

const CubesContext = createContext<CubesContextValue | null>(null);

async function persistMedia(input: CubeInput): Promise<CubeInput> {
  const photoUri = input.photoUri
    ? await copyMediaToAppStorage(input.photoUri, 'photos')
    : null;

  const parityUris = await Promise.all(
    input.parityUris.map((uri) => copyMediaToAppStorage(uri, 'parity')),
  );

  const solutionUris = await Promise.all(
    input.solutionUris.map((uri) => copyMediaToAppStorage(uri, 'solutions')),
  );

  return {
    ...input,
    photoUri,
    parityUris,
    solutionUris,
  };
}

function collectRemovedUris(previous: Cube, next: CubeInput): string[] {
  const nextSet = new Set(
    [next.photoUri, ...next.parityUris, ...next.solutionUris].filter(Boolean) as string[],
  );
  const previousUris = [
    previous.photoUri,
    ...previous.parityUris,
    ...previous.solutionUris,
  ].filter(Boolean) as string[];

  return previousUris.filter((uri) => !nextSet.has(uri));
}

export function CubesProvider({ children }: { children: React.ReactNode }) {
  const [cubes, setCubes] = useState<Cube[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await cubesRepository.listCubes();
    setCubes(data);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const getCube = useCallback(
    (id: string) => cubes.find((cube) => cube.id === id),
    [cubes],
  );

  const addCube = useCallback(
    async (input: CubeInput) => {
      const persisted = await persistMedia(input);
      const cube = await cubesRepository.insertCube(persisted);
      await refresh();
      return cube;
    },
    [refresh],
  );

  const editCube = useCallback(
    async (id: string, input: CubeInput) => {
      const existing = await cubesRepository.getCubeById(id);
      if (!existing) {
        return null;
      }

      const persisted = await persistMedia(input);
      const removed = collectRemovedUris(existing, persisted);
      const updated = await cubesRepository.updateCube(id, persisted);
      await deleteMediaFiles(removed);
      await refresh();
      return updated;
    },
    [refresh],
  );

  const removeCube = useCallback(
    async (id: string) => {
      const removed = await cubesRepository.deleteCube(id);
      if (removed) {
        await deleteMediaFile(removed.photoUri);
        await deleteMediaFiles(removed.parityUris);
        await deleteMediaFiles(removed.solutionUris);
      }
      await refresh();
    },
    [refresh],
  );

  const value = useMemo(
    () => ({
      cubes,
      loading,
      refresh,
      getCube,
      addCube,
      editCube,
      removeCube,
    }),
    [cubes, loading, refresh, getCube, addCube, editCube, removeCube],
  );

  return <CubesContext.Provider value={value}>{children}</CubesContext.Provider>;
}

export function useCubes(): CubesContextValue {
  const ctx = useContext(CubesContext);
  if (!ctx) {
    throw new Error('useCubes deve ser usado dentro de CubesProvider');
  }
  return ctx;
}
