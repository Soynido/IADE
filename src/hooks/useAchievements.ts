import { useState, useEffect } from 'react';
import { AchievementsEngine } from '../services/achievementsEngine';
import { StorageService } from '../services/storageService';
import type { Achievement } from '../types/user';

/**
 * Hook personnalisé pour gérer les achievements
 */
export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  // Charger les achievements au montage
  useEffect(() => {
    const userProfile = StorageService.getUserProfile();
    setAchievements(userProfile.achievements || []);
  }, []);

  // Vérifier les nouveaux achievements après une session
  const checkAchievements = () => {
    const userProfile = StorageService.getUserProfile();
    const newAchievements = AchievementsEngine.checkAndUnlockAchievements(userProfile);

    if (newAchievements.length > 0) {
      setNewlyUnlocked(newAchievements);
      
      // Recharger le profil mis à jour
      const updated = StorageService.getUserProfile();
      setAchievements(updated.achievements);

      // Clear newly unlocked après 5 secondes
      setTimeout(() => {
        setNewlyUnlocked([]);
      }, 5000);
    }
  };

  // Obtenir tous les achievements disponibles avec progression
  const getAllAchievements = () => {
    const userProfile = StorageService.getUserProfile();
    return AchievementsEngine.getAllAchievementsProgress(userProfile);
  };

  // Obtenir le prochain achievement à débloquer
  const getNextAchievement = () => {
    const userProfile = StorageService.getUserProfile();
    return AchievementsEngine.getNextAchievement(userProfile);
  };

  return {
    achievements,
    newlyUnlocked,
    checkAchievements,
    getAllAchievements,
    getNextAchievement,
  };
}

