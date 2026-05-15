// src/interfaces/IOnboardingRepository.ts
import { Player } from '../models/Player.js';

/**
 * Dados fornecidos pelo usuário durante o onboarding.
 * Usado para completar o perfil após o cadastro inicial.
 */
export interface OnboardingInput {
  uid: string;                    // ID do usuário (Auth)
  country: string;                // País (ISO-2, ex.: "BR")
  languages: string[];            // Idiomas, ex.: ["pt-BR", "en"]
  platforms?: string[];           // Plataformas, ex.: ["pc", "playstation"]
  favoriteGameIds?: string[];     // Jogos favoritos, ex.: ["valorant","cs2"]
  avatar?: string;                // Nome do arquivo de avatar, ex.: 'Ariel.png'
  photoUrl?: string;              // URL da imagem de perfil (local ou storage)
}

/**
 * Interface que define o contrato do repositório de Onboarding.
 * Segue o padrão MVC do projeto.
 */
export interface IOnboardingRepository {
  /** 
   * Salva ou atualiza as informações do onboarding no Firestore.
   * Deve fazer merge no documento existente (players/{uid}).
   */
  saveOnboardingData(input: OnboardingInput): Promise<Player>;

  /** 
   * Retorna o jogador atual (útil para pré-preencher formulário, se necessário).
   */
  getByUid(uid: string): Promise<Player | null>;
}
