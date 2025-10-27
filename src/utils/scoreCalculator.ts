/**
 * Utilitaires pour les calculs de score et progression
 */

/**
 * Calcule le score en pourcentage
 */
export function calculateScorePercentage(points: number, maxPoints: number): number {
  if (maxPoints === 0) return 0;
  return Math.round((points / maxPoints) * 100);
}

/**
 * Calcule la moyenne de scores
 */
export function calculateAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / scores.length);
}

/**
 * Calcule le niveau basé sur l'XP total
 */
export function calculateLevel(totalSessions: number, averageScore: number): {
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  levelNumber: number;
  progress: number;
  nextLevelSessions: number;
} {
  // XP = sessions * (average score / 100)
  const xp = totalSessions * (averageScore / 100);
  
  let level: 'bronze' | 'silver' | 'gold' | 'platinum';
  let levelNumber: number;
  let nextLevelSessions: number;
  
  if (xp < 10) {
    level = 'bronze';
    levelNumber = 1;
    nextLevelSessions = Math.ceil((10 - xp) / (averageScore / 100 || 0.5));
  } else if (xp < 30) {
    level = 'silver';
    levelNumber = 2;
    nextLevelSessions = Math.ceil((30 - xp) / (averageScore / 100 || 0.5));
  } else if (xp < 60) {
    level = 'gold';
    levelNumber = 3;
    nextLevelSessions = Math.ceil((60 - xp) / (averageScore / 100 || 0.5));
  } else {
    level = 'platinum';
    levelNumber = 4;
    nextLevelSessions = 0;
  }
  
  // Calcul progression vers prochain niveau
  const thresholds = [0, 10, 30, 60, Infinity];
  const currentThreshold = thresholds[levelNumber - 1];
  const nextThreshold = thresholds[levelNumber];
  const progress = nextThreshold === Infinity 
    ? 100 
    : Math.round(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
  
  return { level, levelNumber, progress, nextLevelSessions };
}

/**
 * Détermine la difficulté adaptée basée sur les performances
 */
export function suggestDifficulty(averageScore: number, lastScores: number[]): 'Facile' | 'Moyen' | 'Difficile' {
  // Si score moyen élevé et stable
  if (averageScore >= 80) {
    const recentAvg = calculateAverage(lastScores.slice(-3));
    if (recentAvg >= 75) {
      return 'Difficile';
    }
  }
  
  // Si score moyen bas
  if (averageScore < 60) {
    return 'Facile';
  }
  
  // Sinon moyen
  return 'Moyen';
}

/**
 * Calcule le taux de réussite par thème
 */
export function calculateThemeSuccessRate(
  sessions: Array<{ theme: string; score: number }>
): Record<string, { totalSessions: number; averageScore: number }> {
  const themeStats: Record<string, { scores: number[] }> = {};
  
  for (const session of sessions) {
    if (!themeStats[session.theme]) {
      themeStats[session.theme] = { scores: [] };
    }
    themeStats[session.theme].scores.push(session.score);
  }
  
  const result: Record<string, { totalSessions: number; averageScore: number }> = {};
  
  for (const [theme, stats] of Object.entries(themeStats)) {
    result[theme] = {
      totalSessions: stats.scores.length,
      averageScore: calculateAverage(stats.scores),
    };
  }
  
  return result;
}

/**
 * Identifie les zones faibles (score < 60%)
 */
export function identifyWeakAreas(
  sessions: Array<{ theme: string; score: number }>
): string[] {
  const themeStats = calculateThemeSuccessRate(sessions);
  
  return Object.entries(themeStats)
    .filter(([_, stats]) => stats.averageScore < 60)
    .map(([theme]) => theme);
}

/**
 * Calcule la progression (variation du score moyen sur les dernières sessions)
 */
export function calculateProgression(recentScores: number[]): number {
  if (recentScores.length < 2) return 0;
  
  const firstHalf = recentScores.slice(0, Math.floor(recentScores.length / 2));
  const secondHalf = recentScores.slice(Math.floor(recentScores.length / 2));
  
  const avgFirst = calculateAverage(firstHalf);
  const avgSecond = calculateAverage(secondHalf);
  
  return Math.round(((avgSecond - avgFirst) / avgFirst) * 100);
}

/**
 * Calcule le temps moyen par question
 */
export function calculateAverageTimePerQuestion(
  totalTime: number,
  questionsCount: number
): number {
  if (questionsCount === 0) return 0;
  return Math.round(totalTime / questionsCount);
}

/**
 * Détermine le badge de performance
 */
export function getPerformanceBadge(score: number): {
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'info';
  icon: string;
} {
  if (score >= 90) {
    return { label: 'Excellent', variant: 'success', icon: '🏆' };
  } else if (score >= 80) {
    return { label: 'Très bien', variant: 'success', icon: '⭐' };
  } else if (score >= 70) {
    return { label: 'Bien', variant: 'info', icon: '👍' };
  } else if (score >= 60) {
    return { label: 'Moyen', variant: 'warning', icon: '📈' };
  } else if (score >= 50) {
    return { label: 'À améliorer', variant: 'warning', icon: '💪' };
  } else {
    return { label: 'À revoir', variant: 'danger', icon: '📚' };
  }
}

/**
 * Calcule la vélocité d'apprentissage (sessions par semaine)
 */
export function calculateLearningVelocity(
  sessions: Array<{ date: string }>,
  weeks: number = 4
): number {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
  
  const recentSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    return sessionDate >= cutoffDate;
  });
  
  return Math.round((recentSessions.length / weeks) * 10) / 10;
}

