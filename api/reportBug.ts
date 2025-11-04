/**
 * API Edge Function pour recevoir les rapports de bugs
 * 
 * Endpoint: POST /api/reportBug
 * Body: { message, userAgent, url, timestamp, screenResolution }
 * 
 * Storage: Upstash Redis (liste "bugs")
 */

import { Redis } from "@upstash/redis";

// Initialiser connexion Upstash Redis depuis .env
const redis = Redis.fromEnv();

interface BugReport {
  message: string;
  userAgent: string;
  url: string;
  timestamp: number;
  screenResolution?: string;
}

/**
 * POST - Enregistrer un nouveau rapport de bug
 */
export async function POST(req: Request) {
  try {
    const data: BugReport = await req.json();

    // Validation basique
    if (!data.message || data.message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Message requis" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Enrichir avec metadata serveur
    const bugReport = {
      ...data,
      id: `bug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      receivedAt: new Date().toISOString(),
      message: data.message.trim(),
    };

    // Stocker dans Redis (liste des bugs)
    await redis.lpush("bugs:all", JSON.stringify(bugReport));

    // Incrémenter compteur total
    await redis.incr("bugs:count");

    console.log(`🪲 Bug reçu: ${bugReport.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        bugId: bugReport.id,
        message: "Bug report enregistré" 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Erreur POST /api/reportBug:", error);
    return new Response(
      JSON.stringify({ error: "Erreur serveur", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * GET - Récupérer le nombre total de bugs (pour stats)
 */
export async function GET() {
  try {
    const count = await redis.get("bugs:count") || 0;
    
    return new Response(
      JSON.stringify({ totalBugs: count }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Erreur GET /api/reportBug:", error);
    return new Response(
      JSON.stringify({ error: "Erreur serveur" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Export pour Vercel Edge Runtime
export const config = {
  runtime: "edge",
};

