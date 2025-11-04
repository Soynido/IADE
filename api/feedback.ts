/**
 * Vercel Edge Function pour collecter les feedbacks utilisateur
 * Stocke dans Vercel KV (Redis) de manière asynchrone
 */

import { kv } from '@vercel/kv';
import type { QuestionFeedback } from '../src/types/feedback';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Vérifier la méthode
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parser le feedback
    const feedback: QuestionFeedback = await req.json();

    // Validation basique
    if (!feedback.questionId || !feedback.rating || ![1, 2, 3].includes(feedback.rating)) {
      return new Response(
        JSON.stringify({ error: 'Invalid feedback data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stocker dans la liste des feedbacks (FIFO, max 10000)
    await kv.lpush('feedbacks:all', JSON.stringify(feedback));
    await kv.ltrim('feedbacks:all', 0, 9999); // Garder les 10000 derniers

    // Incrémenter les compteurs par question
    const questionKey = `question:${feedback.questionId}`;
    await kv.hincrby(questionKey, 'count', 1);
    await kv.hincrbyfloat(questionKey, 'sum', feedback.rating);

    // Mettre à jour le timestamp
    await kv.hset(questionKey, { lastUpdated: new Date().toISOString() });

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // CORS pour dev local
        } 
      }
    );
  } catch (error) {
    console.error('Feedback error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

