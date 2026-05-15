export type Platform = 'pc' | 'xbox' | 'playstation' | 'switch' | 'mobile';
export type CommPref = 'voice' | 'text' | 'both';
export type PlayStyle = 'casual' | 'ranked' | 'competitive';

export interface Availability {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  start: string; // '18:00'
  end: string;   // '22:00'
}

export interface Player {
  id: string;            // docId em /players (pode = uid do Auth)
  authUid: string;       // UID do Firebase Auth
  name: string;
  email: string;
  photoUrl?: string;
  avatar?: string;       // Nome do arquivo de avatar, ex.: 'avatar1.png'
  country: string;       // ISO-3166, ex.: 'BR'
  languages: string[];   // ex.: ['pt-BR','en']
  platforms: Platform[];
  favoriteGameIds: string[];
  favoriteGenres: string[]; // ex.: ['Ação', 'RPG']
  styles: string[];      // ex.: ['Competitivo 🏆', 'FPS 🔫']
  skillLevel?: number;   // 1..5
  playStyle?: PlayStyle;
  commPreference?: CommPref;
  availability?: Availability[];
  rating?: { avg: number; count: number };
  verified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export const PLAYERS_COLLECTION = 'players' as const;
