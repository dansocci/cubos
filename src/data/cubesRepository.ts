import * as Crypto from 'expo-crypto';

import type { Cube, CubeInput, CubeMedia, Difficulty } from '../types/cube';
import { defaultMediaName } from '../types/cube';
import { getDatabase } from './db';

type CubeRow = {
  id: string;
  name: string;
  photo_uri: string | null;
  difficulty: number;
  notes: string | null;
  has_parity: number | null;
  parity_uris: string;
  solution_uris: string;
  created_at: number;
  updated_at: number;
};

function parseMediaItems(value: string): CubeMedia[] {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item, index) => {
        if (typeof item === 'string') {
          return { uri: item, name: defaultMediaName(item, index) };
        }

        if (item && typeof item === 'object' && typeof item.uri === 'string') {
          const customName =
            typeof item.name === 'string' && item.name.trim()
              ? item.name.trim()
              : defaultMediaName(item.uri, index);
          return { uri: item.uri, name: customName };
        }

        return null;
      })
      .filter((item): item is CubeMedia => item != null);
  } catch {
    return [];
  }
}

function mapRow(row: CubeRow): Cube {
  const parityMedia = parseMediaItems(row.parity_uris);
  const hasParity =
    row.has_parity == null ? parityMedia.length > 0 : Boolean(row.has_parity);

  return {
    id: row.id,
    name: row.name,
    photoUri: row.photo_uri,
    difficulty: row.difficulty as Difficulty,
    notes: row.notes,
    hasParity,
    parityMedia,
    solutionMedia: parseMediaItems(row.solution_uris),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCubes(): Promise<Cube[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CubeRow>(
    'SELECT * FROM cubes ORDER BY created_at DESC',
  );
  return rows.map(mapRow);
}

export async function getCubeById(id: string): Promise<Cube | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<CubeRow>('SELECT * FROM cubes WHERE id = ?', [id]);
  return row ? mapRow(row) : null;
}

export async function insertCube(input: CubeInput): Promise<Cube> {
  const db = await getDatabase();
  const now = Date.now();
  const parityMedia = input.hasParity ? input.parityMedia : [];
  const cube: Cube = {
    id: Crypto.randomUUID(),
    name: input.name.trim(),
    photoUri: input.photoUri,
    difficulty: input.difficulty,
    notes: input.notes?.trim() ? input.notes.trim() : null,
    hasParity: input.hasParity,
    parityMedia,
    solutionMedia: input.solutionMedia,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `INSERT INTO cubes (
      id, name, photo_uri, difficulty, notes, has_parity, parity_uris, solution_uris, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      cube.id,
      cube.name,
      cube.photoUri,
      cube.difficulty,
      cube.notes,
      cube.hasParity ? 1 : 0,
      JSON.stringify(cube.parityMedia),
      JSON.stringify(cube.solutionMedia),
      cube.createdAt,
      cube.updatedAt,
    ],
  );

  return cube;
}

export async function updateCube(id: string, input: CubeInput): Promise<Cube | null> {
  const db = await getDatabase();
  const existing = await getCubeById(id);
  if (!existing) {
    return null;
  }

  const parityMedia = input.hasParity ? input.parityMedia : [];
  const updated: Cube = {
    ...existing,
    name: input.name.trim(),
    photoUri: input.photoUri,
    difficulty: input.difficulty,
    notes: input.notes?.trim() ? input.notes.trim() : null,
    hasParity: input.hasParity,
    parityMedia,
    solutionMedia: input.solutionMedia,
    updatedAt: Date.now(),
  };

  await db.runAsync(
    `UPDATE cubes SET
      name = ?,
      photo_uri = ?,
      difficulty = ?,
      notes = ?,
      has_parity = ?,
      parity_uris = ?,
      solution_uris = ?,
      updated_at = ?
    WHERE id = ?`,
    [
      updated.name,
      updated.photoUri,
      updated.difficulty,
      updated.notes,
      updated.hasParity ? 1 : 0,
      JSON.stringify(updated.parityMedia),
      JSON.stringify(updated.solutionMedia),
      updated.updatedAt,
      id,
    ],
  );

  return updated;
}

export async function deleteCube(id: string): Promise<Cube | null> {
  const db = await getDatabase();
  const existing = await getCubeById(id);
  if (!existing) {
    return null;
  }
  await db.runAsync('DELETE FROM cubes WHERE id = ?', [id]);
  return existing;
}
