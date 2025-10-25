import crypto from 'crypto';

class GeminiError extends Error {
  constructor(message, code = 'GEMINI_ERROR', meta = {}) {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
    this.meta = meta;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      meta: this.meta
    };
  }
}

/**
 * Lightweight local placeholder for Gemini API integration.
 * - Designed to be safe to run in developer environments without API keys.
 * - Provides two primary methods used by the app: generateImage and analyzeImage.
 * - Returns consistent shapes so the rest of the app can function while a
 *   production Gemini integration is wired in later.
 */
class GeminiAPI {
  constructor() {
    this.initialized = true;
    this.provider = 'local-placeholder';
  }

  async withRetry(fn, attempts = 3, baseDelay = 300) {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
    throw new GeminiError(lastErr?.message || 'Operation failed', 'RETRY_FAILED', { cause: lastErr });
  }

  /**
   * Generate an image from a prompt. This placeholder returns a Picsum URL
   * and some metadata so the front-end can render it unchanged.
   */
  async generateImage(prompt = '', options = {}) {
    if (!prompt || typeof prompt !== 'string') {
      throw new GeminiError('Prompt must be a non-empty string', 'INVALID_INPUT');
    }

    return this.withRetry(async () => {
      const seed = crypto.createHash('md5').update(prompt + Date.now().toString()).digest('hex').slice(0, 8);
      const width = options.width || 768;
      const height = options.height || 512;
      const url = `https://picsum.photos/seed/${seed}/${width}/${height}`;

      return {
        images: [
          {
            url,
            width,
            height,
            seed,
            provider: this.provider
          }
        ],
        metadata: {
          provider: this.provider,
          model: 'local-placeholder-v1',
          prompt: prompt,
          createdAt: new Date().toISOString()
        }
      };
    });
  }

  /**
   * Analyze an image. Accepts a data URL or remote URL string. Returns a
   * normalized analysis object with description, tags, moderation, and metadata.
   */
  async analyzeImage(imageData, options = {}) {
    if (!imageData || typeof imageData !== 'string') {
      throw new GeminiError('imageData must be a string (data URL or URL)', 'INVALID_INPUT');
    }

    return this.withRetry(async () => {
      const prompt = String(options.prompt || '').trim();

      // Create a simple fingerprint/snippet of the image input for metadata
      const hash = crypto.createHash('sha256').update(imageData).digest('hex').slice(0, 16);
      const snippet = imageData.slice(0, 120);

      // Basic keyword extraction from prompt (best-effort)
      const promptTokens = prompt ? prompt.split(/\s+/).map(t => t.toLowerCase()) : [];
      const tags = Array.from(new Set([...(promptTokens.slice(0, 8)), 'photo', 'image'])).slice(0, 8);

      // Simple moderation heuristic
      const banned = ['nudity', 'porn', 'rape', 'sex', 'child', 'violence'];
      const reasons = banned.filter(b => (prompt + ' ' + imageData).toLowerCase().includes(b));
      const flagged = reasons.length > 0;

      const analysis = {
        description: prompt || 'Placeholder analysis — no vision model configured',
        tags,
        subjects: [],
        style: {},
        moderation: {
          flagged,
          confidence: flagged ? 0.95 : 0.02,
          reasons
        }
      };

      const metadata = {
        provider: this.provider,
        model: 'local-placeholder-v1',
        fingerprint: hash,
        snippet,
        analyzedAt: new Date().toISOString()
      };

      return { analysis, metadata };
    });
  }
}

const geminiAPI = new GeminiAPI();

export { GeminiError };
export default geminiAPI;
