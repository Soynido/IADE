/**
 * Storage Service MVP - Minimal localStorage management
 */

export interface SessionData {
  date: string;
  score: number;
  total: number;
  mode: 'revision' | 'training' | 'exam';
}

export class StorageService {
  private static STORAGE_PREFIX = 'iade_';

  static isOnboarded(): boolean {
    return localStorage.getItem(`${this.STORAGE_PREFIX}onboarded`) === 'true';
  }

  static setOnboarded(value: boolean): void {
    localStorage.setItem(`${this.STORAGE_PREFIX}onboarded`, value.toString());
  }

  static addSession(session: SessionData): void {
    const sessions = this.getSessions();
    sessions.push(session);
    localStorage.setItem(`${this.STORAGE_PREFIX}sessions`, JSON.stringify(sessions));
  }

  static getSessions(): SessionData[] {
    const data = localStorage.getItem(`${this.STORAGE_PREFIX}sessions`);
    return data ? JSON.parse(data) : [];
  }

  static clearAll(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
}

