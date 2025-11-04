/**
 * API Edge Function pour collecter les feedbacks utilisateurs
 * 
 * Endpoint: POST /api/feedback
 * Body: { questionId, rating, timestamp, userId, sessionId, wasCorrect, responseTime }
 * 
 * Storage: Upstash Redis
 */

import { Redis } from "@upstash/redis";

// Initialiser connexion Upstash Redis depuis .env
const redis = Redis.fromEnv();

interface QuestionFeedback {
  questionId: string;
  rating: 1 | 2 | 3;
  timestamp: number;
  userId: string;
  sessionId: string;
  wasCorrect: boolean;
  responseTime?: number;
}

/**
 * POST - Enregistrer un nouveau feedback
 */
export async function POST(req: Request) {
  try {
    const feedback: QuestionFeedback = await req.json();

    // Validation basique
    if (!feedback.questionId || !feedback.rating || !feedback.userId) {
      return new Response(
        JSON.stringify({ error: "Champs manquants" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (![1, 2, 3].includes(feedback.rating)) {
      return new Response(
        JSON.stringify({ error: "Rating invalide (1-3)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stocker dans Redis (liste globale)
    await redis.lpush("feedbacks:all", JSON.stringify(feedback));

    // Stocker aussi par question (hash map pour stats rapides)
    const questionKey = `question:${feedback.questionId}`;
    await redis.hincrby(questionKey, "totalFeedbacks", 1);
    await redis.hincrby(questionKey, "totalRating", feedback.rating);

    // Timestamp de dernière mise à jour
    await redis.hset(questionKey, "lastUpdated", new Date().toISOString());

    return new Response(
      JSON.stringify({ success: true, message: "Feedback enregistré" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Erreur POST /api/feedback:", error);
    return new Response(
      JSON.stringify({ error: "Erreur serveur", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * GET - Récupérer tous les feedbacks (pour debug)
 * Query: ?limit=100
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "100");

    // Récupérer les N derniers feedbacks
    const feedbacks = await redis.lrange("feedbacks:all", 0, limit - 1);

    const parsed = feedbacks.map((f: any) => {
      try {
        return typeof f === "string" ? JSON.parse(f) : f;
      } catch {
        return null;
      }
    }).filter(Boolean);

    return new Response(
      JSON.stringify({
        total: parsed.length,
        feedbacks: parsed
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Erreur GET /api/feedback:", error);
    return new Response(
      JSON.stringify({ error: "Erreur serveur", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Export pour Vercel Edge Runtime
export const config = {
  runtime: "edge",
};
