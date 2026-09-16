const EMBEDDING_DIMENSIONS = 64;

function hashToken(token: string): number {
  let hash = 2166136261;

  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(
    vector.reduce((sum, value) => sum + value * value, 0)
  );

  if (magnitude === 0) {
    return vector;
  }

  return vector.map((value) => value / magnitude);
}

export function generateLocalEmbedding(text: string): number[] {
  const vector = Array.from(
    { length: EMBEDDING_DIMENSIONS },
    () => 0
  );

  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0);

  for (const token of tokens) {
    const hash = hashToken(token);

    const index = hash % EMBEDDING_DIMENSIONS;
    const sign = hash % 2 === 0 ? 1 : -1;

    vector[index] += sign;
  }

  return normalizeVector(vector);
}

export function cosineSimilarity(
  first: number[],
  second: number[]
): number {
  if (first.length !== second.length || first.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let firstMagnitude = 0;
  let secondMagnitude = 0;

  for (let index = 0; index < first.length; index += 1) {
    dotProduct += first[index] * second[index];
    firstMagnitude += first[index] * first[index];
    secondMagnitude += second[index] * second[index];
  }

  if (firstMagnitude === 0 || secondMagnitude === 0) {
    return 0;
  }

  return (
    dotProduct /
    (Math.sqrt(firstMagnitude) * Math.sqrt(secondMagnitude))
  );
}