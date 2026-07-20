import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('cubos.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS cubes (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          photo_uri TEXT,
          difficulty INTEGER NOT NULL,
          notes TEXT,
          parity_uris TEXT NOT NULL DEFAULT '[]',
          solution_uris TEXT NOT NULL DEFAULT '[]',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}
