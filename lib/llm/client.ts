/**
 * FLock LLM API client (OpenAI-compatible)
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Create a chat completion using FLock's LLM API
 */
export async function createChatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const apiKey = process.env.FLOCK_API_KEY;
  const baseUrl = process.env.FLOCK_API_BASE_URL || "https://api.flock.io/v1";
  
  if (!apiKey) {
    throw new Error("FLOCK_API_KEY is not configured");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FLock API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Create a streaming chat completion
 */
export async function createStreamingChatCompletion(
  request: ChatCompletionRequest
): Promise<ReadableStream> {
  const apiKey = process.env.FLOCK_API_KEY;
  const baseUrl = process.env.FLOCK_API_BASE_URL || "https://api.flock.io/v1";
  
  if (!apiKey) {
    throw new Error("FLOCK_API_KEY is not configured");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ ...request, stream: true }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FLock API error: ${response.status} - ${error}`);
  }

  return response.body!;
}

/**
 * Compute cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

