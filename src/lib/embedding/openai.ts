const MAX_TOKENS_PER_CHUNK = 8000;

// 暂时注释掉OpenAI相关代码，使用关键词搜索
// import OpenAI from 'openai';
//
// const openai = new OpenAI({
//   baseURL: process.env.OPENAI_BASE_URL,
//   apiKey: process.env.OPENAI_API_KEY,
// });
//
// const EMBEDDING_MODEL = 'text-embedding-ada-002';
//
// export async function generateEmbedding(text: string): Promise<number[]> {
//   try {
//     const response = await openai.embeddings.create({
//       model: EMBEDDING_MODEL,
//       input: text.replace(/\n/g, ' '),
//     });
//
//     return response.data[0].embedding;
//   } catch (error) {
//     console.error('Error generating embedding:', error);
//     throw error;
//   }
// }

export function splitTextIntoChunks(text: string, maxTokens: number = MAX_TOKENS_PER_CHUNK): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[。！？.!?])/g);
  let currentChunk = '';
  let currentTokenCount = 0;

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    // 简单估算token数：中文字符每个算1token，英文单词每个算1token
    const tokenCount = trimmedSentence.length + (trimmedSentence.match(/\s+/g)?.length || 0);

    if (currentTokenCount + tokenCount > maxTokens && currentChunk) {
      chunks.push(currentChunk);
      currentChunk = '';
      currentTokenCount = 0;
    }

    currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
    currentTokenCount += tokenCount;
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}
