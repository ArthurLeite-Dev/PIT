// src/interfaces/IProfileRepository.ts
import { Player } from '../models/Player.js';

/**
 * Tipagem dos dados que podem ser atualizados no perfil do usuário.
 * Todos os campos são opcionais (merge no Firestore).
 */
export interface ProfileUpdateInput {
  uid: string;
  name?: string;
  languages?: string[];
  platforms?: string[];
  favoriteGameIds?: string[];
  favoriteGenres?: string[];
  photoUrl?: string;
}

/**
 * Contrato da camada de persistência de perfis (Firestore, etc.)
 * Mantém o padrão Repository do projeto.
 */
export interface IProfileRepository {
  /** Retorna o documento do jogador pelo UID (ou null se não existir). */
  getByUid(uid: string): Promise<Player | null>;

  /** Atualiza campos do perfil (merge). Retorna o objeto Player atualizado. */
  updateProfile(input: ProfileUpdateInput): Promise<Player>;
}
