/**
 * Vercel Edge Function pour récupérer les stats de feedback
 * Retourne la moyenne et le nombre total de feedbacks pour une question
 */

import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Vérifier la méthode
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(req.url);
    const questionId = url.searchParams.get('questionId');

    if (!questionId) {
      return new Response(
        JSON.stringify({ error: 'Missing questionId parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les stats depuis KV
    const questionKey = `question:${questionId}`;
    const count = await kv.hget(questionKey, 'count') as number || 0;
    const sum = await kv.hget(questionKey, 'sum') as number || 0;
    const lastUpdated = await kv.hget(questionKey, 'lastUpdated') as string || new Date().toISOString();

    const averageRating = count > 0 ? sum / count : 0;

    return new Response(
      JSON.stringify({
        questionId,
        averageRating,
        totalFeedbacks: count,
        lastUpdated
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // CORS pour dev local
          'Cache-Control': 'public, s-maxage=60' // Cache 1 minute
        } 
      }
    );
  } catch (error) {
    console.error('Stats error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        averageRating: 0,
        totalFeedbacks: 0
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

