import geminiAPI from '../../../backend/api/GeminiAPI';

export async function POST(req) {
  try {
    const { prompt, options } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ success: false, error: { message: 'Prompt is required', code: 'INVALID_INPUT' } }), { status: 400 });
    }

    // Call the Gemini service
    const result = await geminiAPI.generateImage(prompt, options || {});

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('API /api/generate error:', err);
    // If error has a code (GeminiError), return it for client handling
    const errorPayload = {
      message: err?.message || 'Internal error',
      code: err?.code || 'INTERNAL_ERROR'
    };
    return new Response(JSON.stringify({ success: false, error: errorPayload }), { status: 500 });
  }
}
