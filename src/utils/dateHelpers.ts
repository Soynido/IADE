import { formatDistanceToNow, format, differenceInDays, isToday, isYesterday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Utilitaires pour la gestion des dates
 */

/**
 * Formate une date en "il y a X temps"
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(parsedDate, { addSuffix: true, locale: fr });
  } catch {
    return 'Date invalide';
  }
}

/**
 * Formate une date en format court (ex: "23 oct. 2025")
 */
export function formatShortDate(date: string | Date): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, 'd MMM yyyy', { locale: fr });
  } catch {
    return 'Date invalide';
  }
}

/**
 * Formate une date en format long (ex: "23 octobre 2025 à 14h30")
 */
export function formatLongDate(date: string | Date): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, "d MMMM yyyy 'à' HH'h'mm", { locale: fr });
  } catch {
    return 'Date invalide';
  }
}

/**
 * Retourne le nombre de jours entre deux dates
 */
export function daysBetween(date1: string | Date, date2: string | Date): number {
  try {
    const parsed1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const parsed2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return Math.abs(differenceInDays(parsed1, parsed2));
  } catch {
    return 0;
  }
}

/**
 * Vérifie si une date est aujourd'hui
 */
export function isDateToday(date: string | Date): boolean {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return isToday(parsedDate);
  } catch {
    return false;
  }
}

/**
 * Vérifie si une date est hier
 */
export function isDateYesterday(date: string | Date): boolean {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return isYesterday(parsedDate);
  } catch {
    return false;
  }
}

/**
 * Formate une durée en secondes en format lisible
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 
      ? `${minutes}min ${remainingSeconds}s`
      : `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}min`
    : `${hours}h`;
}

/**
 * Retourne une description textuelle de la date
 */
export function getDateLabel(date: string | Date): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    
    if (isToday(parsedDate)) {
      return "Aujourd'hui";
    }
    
    if (isYesterday(parsedDate)) {
      return 'Hier';
    }
    
    const days = differenceInDays(new Date(), parsedDate);
    
    if (days <= 7) {
      return `Il y a ${days} jours`;
    }
    
    return formatShortDate(parsedDate);
  } catch {
    return 'Date invalide';
  }
}

/**
 * Vérifie si l'utilisateur a une activité récente (< 3 jours)
 */
export function hasRecentActivity(lastActivityDate: string | Date | null): boolean {
  if (!lastActivityDate) return false;
  
  try {
    const days = daysBetween(new Date(), lastActivityDate);
    return days < 3;
  } catch {
    return false;
  }
}

/**
 * Calcule le streak de jours consécutifs
 */
export function calculateStreak(activityDates: string[]): number {
  if (activityDates.length === 0) return 0;
  
  // Trier les dates par ordre décroissant
  const sortedDates = activityDates
    .map(d => parseISO(d))
    .sort((a, b) => b.getTime() - a.getTime());
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const date of sortedDates) {
    const activityDate = new Date(date);
    activityDate.setHours(0, 0, 0, 0);
    
    const diff = differenceInDays(currentDate, activityDate);
    
    if (diff === 0 || diff === 1) {
      streak++;
      currentDate = activityDate;
    } else {
      break;
    }
  }
  
  return streak;
}

