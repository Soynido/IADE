import { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import type { UserProfile } from '../types/user';

/**
 * Hook personnalisé pour gérer les statistiques utilisateur
 */
export function useUserStats() {
  const [userProfile, setUserProfile] = useState<UserProfile>(() => 
    StorageService.getUserProfile()
  );
  const [isLoading, setIsLoading] = useState(false);

  // Recharger le profil depuis localStorage
  const refreshProfile = () => {
    setIsLoading(true);
    const profile = StorageService.getUserProfile();
    setUserProfile(profile);
    setIsLoading(false);
  };

  // Mettre à jour une partie du profil
  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = StorageService.updateUserProfile(updates);
    setUserProfile(updated);
  };

  // Enregistrer une session complétée
  const recordSession = (theme: string, score: number, questionsAnswered: number) => {
    const updated = StorageService.updateSessionStats(theme, score, questionsAnswered);
    setUserProfile(updated);
  };

  // Marquer une question comme vue
  const markQuestionSeen = (questionId: string) => {
    StorageService.markQuestionAsSeen(questionId);
    refreshProfile();
  };

  // Réinitialiser le profil
  const resetProfile = () => {
    StorageService.resetProfile();
    refreshProfile();
  };

  // Synchroniser avec localStorage au montage
  useEffect(() => {
    refreshProfile();
  }, []);

  return {
    userProfile,
    isLoading,
    refreshProfile,
    updateProfile,
    recordSession,
    markQuestionSeen,
    resetProfile,
  };
}

