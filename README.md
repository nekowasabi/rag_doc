# 日本語テキストファイルのRAG実装 (Deno + SQLite)

このプロジェクトは、日本語テキストファイルを対象に、高速なRAG（Retrieval Augmented Generation）システムをDenoとSQLiteで実装するためのコードです。

## 特徴

- 日本語形態素解析を使用した適切なテキスト分割
- SQLiteとベクトル検索拡張機能による高速な検索
- OpenAI APIを使用した高品質な埋め込み生成
- パフォーマンスを最適化するための各種テクニック

## 必要条件

- Deno 1.x 以上
- MeCab（日本語形態素解析エンジン）
- OpenAI API キー

## インストール方法

1. MeCabをインストール:

```bash
# Ubuntuの場合
sudo apt-get install mecab libmecab-dev mecab-ipadic-utf8

# macOSの場合
brew install mecab mecab-ipadic
```

2. 環境変数の設定:

```bash
export OPENAI_API_KEY="your-api-key"
```

## 使用方法

### ファイルのインデックス作成

```bash
deno run --allow-read --allow-write --allow-env --allow-run --unstable-fs main.ts index your_file.txt
```

### 検索の実行

```bash
deno run --allow-read --allow-write --allow-env --allow-run --unstable-fs main.ts search "検索クエリ"
```

## ファイル構成

- `deps.ts` - 依存関係
- `db.ts` - データベース初期化
- `text_processor.ts` - 日本語テキスト処理
- `embeddings.ts` - ベクトル埋め込み生成
- `file_processor.ts` - ファイル読み込みと分割
- `rag_system.ts` - RAGシステムの実装
- `main.ts` - 使用例

## パフォーマンス最適化のポイント

1. **バッチ処理**
   - 複数のテキストチャンクを一度にベクトル化することでAPI呼び出しを減らす
   - トランザクションを使用してデータベース操作を高速化

2. **効率的なインデックス作成**
   - SQLite VSSを使用して高速なベクトル検索を実現
   - 重要な品詞のみを抽出して埋め込みの質を向上

3. **メモリ使用の最適化**
   - 大きなファイルを適切なサイズのチャンクに分割
   - 必要に応じてメモリ内データベースを使用

4. **並列処理**
   - 複数のファイルを同時に処理する場合は並列処理を検討

## ライセンス

MIT
