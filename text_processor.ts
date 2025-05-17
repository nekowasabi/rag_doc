import { MeCab, TextCleaner } from "./deps.ts";

export class JapaneseTextProcessor {
  private mecab: MeCab;
  private cleaner: TextCleaner;

  constructor() {
    this.mecab = new MeCab(["mecab"]);
    this.cleaner = new TextCleaner({
      stripHtml: true,
      stripNewlines: true,
      normalizeWhiteSpaces: true,
    });
  }

  async cleanText(text: string): Promise<string> {
    return this.cleaner.clean(text);
  }

  async tokenize(text: string): Promise<string[]> {
    const cleanedText = await this.cleanText(text);
    const tokens = await this.mecab.parse(cleanedText);

    return tokens
      .filter((token) =>
        token.pos === "名詞" ||
        token.pos === "動詞" ||
        token.pos === "形容詞"
      )
      .map((token) => token.surface);
  }
}
