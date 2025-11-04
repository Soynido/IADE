/**
 * API Edge Function pour récupérer les statistiques de feedback
 * 
 * Endpoint: GET /api/feedback/stats?questionId=xxx
 * 
 * Response: { questionId, averageRating, totalFeedbacks, lastUpdated }
 */

import { Redis } from "@upstash/redis";

// Initialiser connexion Upstash Redis depuis .env
const redis = Redis.fromEnv();

interface FeedbackStats {
  questionId: string;
  averageRating: number;
  totalFeedbacks: number;
  lastUpdated: string;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const questionId = url.searchParams.get("questionId");

    if (!questionId) {
      return new Response(
        JSON.stringify({ error: "questionId requis" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const questionKey = `question:${questionId}`;

    // Récupérer stats depuis Redis
    const stats = await redis.hgetall(questionKey);

    if (!stats || !stats.totalFeedbacks) {
      // Aucun feedback pour cette question
      const emptyStats: FeedbackStats = {
        questionId,
        averageRating: 0,
        totalFeedbacks: 0,
        lastUpdated: new Date().toISOString()
      };

      return new Response(
        JSON.stringify(emptyStats),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Calculer moyenne
    const totalFeedbacks = parseInt(stats.totalFeedbacks as string);
    const totalRating = parseInt(stats.totalRating as string);
    const averageRating = totalRating / totalFeedbacks;

    const result: FeedbackStats = {
      questionId,
      averageRating: Math.round(averageRating * 100) / 100,
      totalFeedbacks,
      lastUpdated: (stats.lastUpdated as string) || new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Erreur GET /api/feedback/stats:", error);
    return new Response(
      JSON.stringify({ error: "Erreur serveur", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export const config = {
  runtime: "edge",
};
