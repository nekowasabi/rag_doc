import { Database } from "./deps.ts";

export async function initDatabase(dbPath: string): Promise<Database> {
  const db = new Database(dbPath);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      tokens TEXT NOT NULL,
      embedding BLOB
    );
  `);
  
  db.function("cosine_similarity", (embeddingA, embeddingB) => {
    const a = new Float32Array(embeddingA.buffer);
    const b = new Float32Array(embeddingB.buffer);
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    
    return 1 - similarity;
  });
  
  return db;
}
