import { JapaneseTextProcessor } from "./text_processor.ts";

export class FileProcessor {
  private textProcessor: JapaneseTextProcessor;
  
  constructor() {
    this.textProcessor = new JapaneseTextProcessor();
  }
  
  async readFile(filePath: string): Promise<string> {
    const text = await Deno.readTextFile(filePath);
    return text;
  }
  
  async splitTextIntoChunks(text: string, chunkSize: number = 1000): Promise<string[]> {
    const paragraphs = text.split(/\n\s*\n/);
    
    const chunks: string[] = [];
    let currentChunk = "";
    
    for (const paragraph of paragraphs) {
      if (paragraph.length > chunkSize) {
        const sentences = paragraph.split(/[。．！？!?]/);
        for (const sentence of sentences) {
          if (sentence.trim() === "") continue;
          
          if ((currentChunk + sentence).length <= chunkSize) {
            currentChunk += sentence + "。";
          } else {
            if (currentChunk !== "") chunks.push(currentChunk);
            currentChunk = sentence + "。";
          }
        }
      } else {
        if ((currentChunk + paragraph).length <= chunkSize) {
          currentChunk += paragraph + "\n\n";
        } else {
          if (currentChunk !== "") chunks.push(currentChunk);
          currentChunk = paragraph + "\n\n";
        }
      }
    }
    
    if (currentChunk !== "") chunks.push(currentChunk);
    return chunks;
  }
}
