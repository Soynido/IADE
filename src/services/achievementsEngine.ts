interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface UserStats {
  sessions: number;
  averageScore: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  streak: number;
  totalTimeSpent: number;
}

export function checkAchievements(stats: UserStats): Achievement[] {
  const newAchievements: Achievement[] = [];

  // Achievement: Premier pas
  if (stats.totalQuestionsAnswered === 1) {
    newAchievements.push({
      id: "first_step",
      title: "Premier pas",
      description: "Répondre à votre première question",
      icon: "🎯",
      unlocked: true
    });
  }

  // Achievement: 10 sessions
  if (stats.sessions >= 10) {
    newAchievements.push({
      id: "session_10",
      title: "10 sessions complétées",
      description: "Continue sur cette lancée !",
      icon: "🔥",
      unlocked: true
    });
  }

  // Achievement: Score supérieur à 80%
  if (stats.averageScore >= 80) {
    newAchievements.push({
      id: "score_80",
      title: "Perfectionniste",
      description: "Score moyen supérieur à 80%",
      icon: "⭐",
      unlocked: true
    });
  }

  // Achievement: 100 questions
  if (stats.totalQuestionsAnswered >= 100) {
    newAchievements.push({
      id: "centurion",
      title: "Centurion",
      description: "Répondre à 100 questions",
      icon: "💯",
      unlocked: true
    });
  }

  // Achievement: Streak de 7 jours
  if (stats.streak >= 7) {
    newAchievements.push({
      id: "streak_7",
      title: "Streak de feu",
      description: "7 jours consécutifs de pratique",
      icon: "🔥",
      unlocked: true
    });
  }

  // Achievement: 1000 questions
  if (stats.totalQuestionsAnswered >= 1000) {
    newAchievements.push({
      id: "master",
      title: "Maître IADE",
      description: "Répondre à 1000 questions",
      icon: "👑",
      unlocked: true
    });
  }

  return newAchievements;
}
