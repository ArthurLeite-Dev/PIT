// src/interfaces/ICallRepository.ts
import { Call } from '../models/Call';

/**
 * Entrada para criar um novo chamado.
 */
export interface CreateCallInput {
  ownerUid: string;    // ID do criador do chamado
  title: string;       // Título do chamado
  description?: string; // Descrição opcional do chamado
  gameId: string;      // ID do jogo (ex: "valorant")
  platform: string;    // Plataforma (ex: "pc", "playstation")
  callFriendly: 'friendly' | 'competitive'; // Tipo de chamado (amigável ou competitivo)
  playstyles: string[]; // Estilos de jogo (ex: ["competitive", "fps"])
}

/**
 * Filtros para listagem de chamados abertos.
 */
export interface ListOpenFilters {
  gameId?: string;
  callFriendly?: 'friendly' | 'competitive';
  playstyles?: string[];
  search?: string;
}

/**
 * Contrato do repositório de chamados (LFG).
 * Define as operações de CRUD.
 */
export interface ICallRepository {
  /** Cria um novo chamado. */
  create(data: CreateCallInput): Promise<Call>;

  /** Lista chamados abertos (ordem decrescente de criação). */
  listOpen(limit?: number, filters?: ListOpenFilters): Promise<Call[]>;

  /** Busca um chamado pelo ID. */
  getById(id: string): Promise<Call | null>;

  /** Busca o chamado ativo de um usuário (se está participando). */
  getActiveCallByUser(uid: string): Promise<Call | null>;

  /** Adiciona um jogador a um chamado. */
  join(callId: string, uid: string): Promise<Call>;

  /** Fecha um chamado (somente o dono do chamado pode fechar). */
  close(callId: string, ownerUid: string): Promise<Call>;

  /** Remove um participante do chamado. */
  removeParticipant(callId: string, participantUid: string): Promise<Call>;
}
