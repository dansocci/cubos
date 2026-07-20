import * as Crypto from 'expo-crypto';

import type { Cube, CubeInput, Difficulty } from '../types/cube';
import { getDatabase } from './db';

type CubeRow = {
  id: string;
  name: string;
  photo_uri: string | null;
  difficulty: number;
  notes: string | null;
  parity_uris: string;
  solution_uris: string;
  created_at: number;
  updated_at: number;
};

function parseUris(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function mapRow(row: CubeRow): Cube {
  return {
    id: row.id,
    name: row.name,
    photoUri: row.photo_uri,
    difficulty: row.difficulty as Difficulty,
    notes: row.notes,
    parityUris: parseUris(row.parity_uris),
    solutionUris: parseUris(row.solution_uris),
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
  const cube: Cube = {
    id: Crypto.randomUUID(),
    name: input.name.trim(),
    photoUri: input.photoUri,
    difficulty: input.difficulty,
    notes: input.notes?.trim() ? input.notes.trim() : null,
    parityUris: input.parityUris,
    solutionUris: input.solutionUris,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `INSERT INTO cubes (
      id, name, photo_uri, difficulty, notes, parity_uris, solution_uris, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      cube.id,
      cube.name,
      cube.photoUri,
      cube.difficulty,
      cube.notes,
      JSON.stringify(cube.parityUris),
      JSON.stringify(cube.solutionUris),
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

  const updated: Cube = {
    ...existing,
    name: input.name.trim(),
    photoUri: input.photoUri,
    difficulty: input.difficulty,
    notes: input.notes?.trim() ? input.notes.trim() : null,
    parityUris: input.parityUris,
    solutionUris: input.solutionUris,
    updatedAt: Date.now(),
  };

  await db.runAsync(
    `UPDATE cubes SET
      name = ?,
      photo_uri = ?,
      difficulty = ?,
      notes = ?,
      parity_uris = ?,
      solution_uris = ?,
      updated_at = ?
    WHERE id = ?`,
    [
      updated.name,
      updated.photoUri,
      updated.difficulty,
      updated.notes,
      JSON.stringify(updated.parityUris),
      JSON.stringify(updated.solutionUris),
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
