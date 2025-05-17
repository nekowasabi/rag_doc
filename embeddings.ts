import { OpenAI } from "./deps.ts";

export class EmbeddingGenerator {
  private openai: OpenAI;
  
  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }
  
  async generateEmbedding(text: string): Promise<Float32Array> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });
    
    return new Float32Array(response.data[0].embedding);
  }
  
  async generateBatchEmbeddings(texts: string[]): Promise<Float32Array[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
      encoding_format: "float",
    });
    
    return response.data.map(item => new Float32Array(item.embedding));
  }
}
