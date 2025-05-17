
/**
 * コサイン類似度を計算します
 * @param a 1つ目のベクトル（Float32Array）
 * @param b 2つ目のベクトル（Float32Array）
 * @returns 類似度（0〜1の値、1が最も類似）
 */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) {
    throw new Error("ベクトルの長さが一致しません");
  }

  let dotProduct = 0;
  let aMagnitude = 0;
  let bMagnitude = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    aMagnitude += a[i] * a[i];
    bMagnitude += b[i] * b[i];
  }

  const magnitude = Math.sqrt(aMagnitude) * Math.sqrt(bMagnitude);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}
