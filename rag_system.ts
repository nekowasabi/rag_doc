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
    
    this.db.exec("BEGIN TRANSACTION");
    
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
        
        
        if (i % 10 === 0) {
          console.log(`Processed ${i + 1}/${chunks.length} chunks`);
        }
      }
      
      this.db.exec("COMMIT");
      console.log("Indexing completed successfully");
    } catch (error) {
      this.db.exec("ROLLBACK");
      console.error("Error during indexing:", error);
      throw error;
    }
  }
  
  async search(query: string, limit: number = 5): Promise<any[]> {
    const tokens = await this.textProcessor.tokenize(query);
    const tokenText = tokens.join(" ");
    
    const queryEmbedding = await this.embeddingGenerator.generateEmbedding(tokenText);
    
    const documents = this.db.prepare(`
      SELECT id, content, embedding
      FROM documents
    `).all();
    
    const { cosineSimilarity } = await import("./vector_utils.ts");
    
    const results = documents.map((doc) => {
      const embeddingData = doc.embedding;
      const docEmbedding = new Float32Array(embeddingData.buffer);
      
      const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
      
      return {
        id: doc.id,
        content: doc.content,
        distance: 1 - similarity, // 距離に変換（0が最も近い）
      };
    });
    
    results.sort((a, b) => a.distance - b.distance);
    return results.slice(0, limit);
  }
}
