import { Database } from "./deps.ts";
import { JapaneseTextProcessor } from "./text_processor.ts";
import { EmbeddingGenerator } from "./embeddings.ts";
import { FileProcessor } from "./file_processor.ts";

export class RAGSystem {
  private db: Database;
  private textProcessor: JapaneseTextProcessor;
  private embeddingGenerator: EmbeddingGenerator;
  private fileProcessor: FileProcessor;
  
  constructor(db: Database, openaiApiKey: string) {
    this.db = db;
    this.textProcessor = new JapaneseTextProcessor();
    this.embeddingGenerator = new EmbeddingGenerator(openaiApiKey);
    this.fileProcessor = new FileProcessor();
  }
  
  async indexFile(filePath: string): Promise<void> {
    console.log(`Indexing file: ${filePath}`);
    
    const text = await this.fileProcessor.readFile(filePath);
    
    const chunks = await this.fileProcessor.splitTextIntoChunks(text);
    console.log(`Split into ${chunks.length} chunks`);
    
    this.db.execute("BEGIN TRANSACTION");
    
    try {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        const tokens = await this.textProcessor.tokenize(chunk);
        const tokenText = tokens.join(" ");
        
        const embedding = await this.embeddingGenerator.generateEmbedding(tokenText);
        
        const stmt = this.db.prepare(`
          INSERT INTO documents (content, tokens, embedding)
          VALUES (?, ?, ?)
        `);
        
        const embeddingBlob = new Uint8Array(embedding.buffer);
        stmt.execute([chunk, tokenText, embeddingBlob]);
        
        const id = this.db.prepare("SELECT last_insert_rowid() as id").get().id;
        
        this.db.prepare(`
          INSERT INTO documents_vss (rowid, embedding, id, content)
          VALUES (?, ?, ?, ?)
        `).execute([id, embeddingBlob, id, chunk]);
        
        if (i % 10 === 0) {
          console.log(`Processed ${i + 1}/${chunks.length} chunks`);
        }
      }
      
      this.db.execute("COMMIT");
      console.log("Indexing completed successfully");
    } catch (error) {
      this.db.execute("ROLLBACK");
      console.error("Error during indexing:", error);
      throw error;
    }
  }
  
  async search(query: string, limit: number = 5): Promise<any[]> {
    const tokens = await this.textProcessor.tokenize(query);
    const tokenText = tokens.join(" ");
    
    const embedding = await this.embeddingGenerator.generateEmbedding(tokenText);
    const embeddingBlob = new Uint8Array(embedding.buffer);
    
    const results = this.db.prepare(`
      SELECT d.id, d.content, vss_distance(d.embedding, ?) as distance
      FROM documents d
      ORDER BY distance ASC
      LIMIT ?
    `).all([embeddingBlob, limit]);
    
    return results;
  }
}
