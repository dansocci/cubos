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
          has_parity INTEGER NOT NULL DEFAULT 0,
          parity_uris TEXT NOT NULL DEFAULT '[]',
          solution_uris TEXT NOT NULL DEFAULT '[]',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `);

      // Migração para bancos criados antes de has_parity
      const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(cubes)');
      const hasParityColumn = columns.some((column) => column.name === 'has_parity');
      if (!hasParityColumn) {
        await db.execAsync(`
          ALTER TABLE cubes ADD COLUMN has_parity INTEGER NOT NULL DEFAULT 0;
          UPDATE cubes
          SET has_parity = 1
          WHERE parity_uris IS NOT NULL
            AND parity_uris != '[]'
            AND parity_uris != '';
        `);
      }

      return db;
    })();
  }
  return dbPromise;
}
