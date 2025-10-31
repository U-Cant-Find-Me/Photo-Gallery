import geminiAPI from '@/backend/api/GeminiAPI';
import { AnalysisStorage } from '@/utils/analysisStorage';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { imageData, prompt } = await req.json();

    if (!imageData) {
      return new Response(JSON.stringify({ success: false, error: { message: 'imageData is required', code: 'INVALID_INPUT' } }), { status: 400 });
    }

    const result = await geminiAPI.analyzeImage(imageData, { prompt });
    
    // Server-side moderation check
    if (result.analysis.moderation.flagged) {
      // If confidence is high enough, block immediately
      if (result.analysis.moderation.confidence > 0.8) {
        return new Response(JSON.stringify({
          success: false,
          error: {
            code: 'CONTENT_BLOCKED',
            message: 'Content violates usage policies',
            reasons: result.analysis.moderation.reasons
          }
        }), { status: 403 });
      }
      
      // Otherwise attach warning flag for UI to handle
      result.warning = {
        type: 'MODERATION',
        message: 'This content may be inappropriate',
        reasons: result.analysis.moderation.reasons,
        requiresConfirmation: true
      };
    }

    // Generate unique ID for this analysis
    const analysisId = crypto.randomBytes(16).toString('hex');
    
    // Store analysis results
    await AnalysisStorage.save(analysisId, {
      ...result,
      metadata: {
        ...result.metadata,
        imageHash: crypto.createHash('sha256')
          .update(imageData)
          .digest('hex')
          .slice(0, 16) // Use first 16 chars as image fingerprint
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      result,
      analysisId 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('API /api/analyze error:', err);
    const errorPayload = {
      message: err?.message || 'Internal error',
      code: err?.code || 'INTERNAL_ERROR'
    };
    return new Response(JSON.stringify({ success: false, error: errorPayload }), { status: 500 });
  }
}
