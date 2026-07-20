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
import type { Cube, CubeInput, CubeMedia } from '../types/cube';

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

async function persistMediaList(
  items: CubeMedia[],
  folder: 'parity' | 'solutions',
): Promise<CubeMedia[]> {
  return Promise.all(
    items.map(async (item) => ({
      uri: await copyMediaToAppStorage(item.uri, folder),
      name: item.name.trim() || item.name,
    })),
  );
}

async function persistMedia(input: CubeInput): Promise<CubeInput> {
  const photoUri = input.photoUri
    ? await copyMediaToAppStorage(input.photoUri, 'photos')
    : null;

  const parityMedia = await persistMediaList(input.parityMedia, 'parity');
  const solutionMedia = await persistMediaList(input.solutionMedia, 'solutions');

  return {
    ...input,
    photoUri,
    parityMedia,
    solutionMedia,
  };
}

function collectRemovedUris(previous: Cube, next: CubeInput): string[] {
  const nextSet = new Set(
    [
      next.photoUri,
      ...next.parityMedia.map((item) => item.uri),
      ...next.solutionMedia.map((item) => item.uri),
    ].filter(Boolean) as string[],
  );
  const previousUris = [
    previous.photoUri,
    ...previous.parityMedia.map((item) => item.uri),
    ...previous.solutionMedia.map((item) => item.uri),
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
        await deleteMediaFiles(removed.parityMedia.map((item) => item.uri));
        await deleteMediaFiles(removed.solutionMedia.map((item) => item.uri));
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
