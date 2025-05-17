import { Database, sqlite_vss } from "./deps.ts";

export async function initDatabase(dbPath: string): Promise<Database> {
  const db = new Database(dbPath);
  
  db.enableLoadExtension = true;
  await sqlite_vss.load(db);
  
  db.execute(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      tokens TEXT NOT NULL,
      embedding BLOB
    );
  `);
  
  db.execute(`
    CREATE VIRTUAL TABLE IF NOT EXISTS documents_vss USING vss0(
      embedding(1536),
      id INT,
      content TEXT
    );
  `);
  
  return db;
}
