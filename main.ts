import { initDatabase } from "./db.ts";
import { RAGSystem } from "./rag_system.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY環境変数が設定されていません");
  Deno.exit(1);
}

async function main() {
  const db = await initDatabase("japanese_rag.db");
  
  const ragSystem = new RAGSystem(db, OPENAI_API_KEY);
  
  const args = Deno.args;
  
  if (args[0] === "index" && args[1]) {
    await ragSystem.indexFile(args[1]);
  } else if (args[0] === "search" && args[1]) {
    const results = await ragSystem.search(args[1]);
    console.log("検索結果:");
    for (const result of results) {
      console.log(`[スコア: ${result.distance.toFixed(4)}] ${result.content.substring(0, 150)}...`);
    }
  } else {
    console.log("使用方法:");
    console.log("  index <ファイルパス>: ファイルをインデックス化");
    console.log("  search <クエリ>: インデックスを検索");
  }
  
  db.close();
}

main();
