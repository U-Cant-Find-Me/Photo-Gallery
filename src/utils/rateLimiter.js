class TokenBucket {
    constructor(capacity, fillPerSecond) {
        this.capacity = capacity;
        this.tokens = capacity;
        this.fillPerSecond = fillPerSecond;
        this.lastFill = Date.now();
    }

    async take(count = 1) {
        this._fill();
        if (this.tokens < count) {
            const waitTime = ((count - this.tokens) / this.fillPerSecond) * 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            this._fill();
        }
        this.tokens -= count;
        return true;
    }

    _fill() {
        const now = Date.now();
        const deltaSeconds = (now - this.lastFill) / 1000;
        this.tokens = Math.min(
            this.capacity,
            this.tokens + deltaSeconds * this.fillPerSecond
        );
        this.lastFill = now;
    }
}

// Gemini API free tier limits
export const rateLimiter = {
    // 60 requests per minute = 1 per second
    requestLimiter: new TokenBucket(60, 1),
    // 60k tokens per minute = 1000 per second
    tokenLimiter: new TokenBucket(60000, 1000),
};

export const isRateLimitError = (error) => {
    return error?.message?.includes('quota exceeded') ||
           error?.error?.code === 429 ||
           error?.code === 429;
};

export const handleRateLimit = async (error) => {
    if (!isRateLimitError(error)) {
        throw error;
    }

    // Extract retry delay from error if available
    let retryDelay = 30000; // default 30 seconds
    try {
        const match = error.message.match(/retry in (\d+\.?\d*)s/);
        if (match) {
            retryDelay = Math.ceil(parseFloat(match[1]) * 1000);
        }
    } catch (e) {
        console.warn('Could not parse retry delay:', e);
    }

    return new Promise((resolve) => setTimeout(resolve, retryDelay));
};