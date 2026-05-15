// src/interfaces/IPresenceRepository.ts

/**
 * Registro de presença de um jogador.
 * Usado para saber quem está online e para matchmaking básico por afinidade.
 */
export interface PresenceRecord {
  uid: string;
  name?: string;
  photoUrl?: string;

  isOnline: boolean;
  lastActive: Date;

  // Sinais de afinidade
  country?: string;            // ISO-2
  languages?: string[];        // ex.: ["pt-BR","en"]
  favoriteGameIds?: string[];  // ex.: ["valorant","cs2"]
  favoriteGenres?: string[];   // ex.: ["fps","moba"]
  platforms?: string[];        // ex.: ["pc","playstation"]
}

/** Payload mínimo para anunciar presença/atualizar afinidades. */
export interface PresenceUpsertInput {
  uid: string;
  name?: string;
  photoUrl?: string;

  country?: string;
  languages?: string[];
  favoriteGameIds?: string[];
  favoriteGenres?: string[];
  platforms?: string[];
}

/** Filtro para buscar "jogadores parecidos" online. */
export interface SimilarPlayersQuery {
  uid: string;         // jogador de referência
  limit?: number;      // default: 12
  // Pesos/filtros (opcionais) — a implementação pode usar interseção simples
  byGames?: boolean;   // default: true
  byGenres?: boolean;  // default: true
  byPlatforms?: boolean; // default: true
  byCountry?: boolean; // default: false
  byLanguages?: boolean; // default: false
}

/**
 * Contrato do repositório de presença.
 * Implementação típica em Firestore/Realtime DB com TTL/heartbeats.
 */
export interface IPresenceRepository {
  /** Marca usuário como online e salva/atualiza afinidades (merge). */
  setOnline(input: PresenceUpsertInput): Promise<void>;

  /** Marca usuário como offline (isOnline=false, lastActive=now). */
  setOffline(uid: string): Promise<void>;

  /** Heartbeat para manter a sessão viva (atualiza lastActive). */
  heartbeat(uid: string): Promise<void>;

  /** Retorna o registro de presença do usuário. */
  getByUid(uid: string): Promise<PresenceRecord | null>;

  /** Lista jogadores online (ordem por lastActive desc). */
  listOnline(limit?: number): Promise<PresenceRecord[]>;

  /** Lista jogadores online com gostos parecidos com o usuário informado. */
  listSimilarOnline(query: SimilarPlayersQuery): Promise<PresenceRecord[]>;
}
