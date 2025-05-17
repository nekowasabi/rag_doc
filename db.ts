import { Database } from "./deps.ts";

export async function initDatabase(dbPath: string): Promise<Database> {
  const db = new Database(dbPath);
  
  
  db.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      tokens TEXT NOT NULL,
      embedding BLOB
    );
  `);
  
  db.query(`
    CREATE INDEX IF NOT EXISTS idx_documents_id ON documents(id);
  `);
  
  return db;
}
