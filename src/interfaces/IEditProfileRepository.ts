// src/interfaces/IEditProfileRepository.ts
import { Player } from '../models/Player.js';

/**
 * Dados que podem ser atualizados no perfil do usuário.
 * Todos os campos são opcionais, pois o Firestore fará merge.
 */
export interface EditProfileInput {
  uid: string;                    // UID do usuário autenticado
  name?: string;
  country?: string;
  languages?: string[];
  platforms?: string[];
  favoriteGameIds?: string[];
  favoriteGenres?: string[];
  styles?: string[];
  photoUrl?: string;
  avatar?: string;                // Nome do arquivo de avatar, ex.: 'avatar1.png'
}

/**
 * Interface que define o contrato da camada de persistência
 * para edição de perfil (Repository).
 */
export interface IEditProfileRepository {
  /** Busca o perfil completo pelo UID. */
  getByUid(uid: string): Promise<Player | null>;

  /** Atualiza parcialmente o documento do jogador e retorna o Player atualizado. */
  updateProfile(input: EditProfileInput): Promise<Player>;

  /** Partial update for individual fields */
  partialUpdateProfile(input: Partial<EditProfileInput> & { uid: string }): Promise<void>;
}
