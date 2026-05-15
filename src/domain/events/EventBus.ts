// src/domain/events/EventBus.ts
import type { Event } from './types.js';

/**
 * Tipo para um handler de evento
 */
export type EventHandler<T = any> = (data: T) => Promise<void> | void;

/**
 * EventBus implementa o padrão Observer.
 * Permite publicação de eventos e assinatura de handlers.
 */
export class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, Set<EventHandler>> = new Map();

  private constructor() {}

  /**
   * Retorna a instância única do EventBus (Singleton leve, não confundir com DB).
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Inscreve um handler para um tipo de evento específico.
   * @param eventName - Nome do evento
   * @param handler - Função a ser executada quando o evento for publicado
   */
  public subscribe(eventName: string, handler: EventHandler): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    this.handlers.get(eventName)!.add(handler);
  }

  /**
   * Remove um handler de um tipo de evento.
   * @param eventName - Nome do evento
   * @param handler - Função a ser removida
   */
  public unsubscribe(eventName: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Publica um evento, notificando todos os handlers inscritos.
   * @param eventName - Nome do evento
   * @param payload - Dados do evento
   */
  public async publish(eventName: string, payload: any): Promise<void> {
    const handlers = this.handlers.get(eventName);
    if (!handlers || handlers.size === 0) {
      return; // Nenhum handler, ignora
    }

    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(payload);
      } catch (error) {
        console.error(`[EventBus] Erro ao executar handler para evento ${eventName}:`, error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Limpa todos os handlers (útil em testes)
   */
  public clear(): void {
    this.handlers.clear();
  }

  /**
   * Retorna a quantidade de handlers inscritos para um evento
   */
  public getHandlerCount(eventName: string): number {
    return this.handlers.get(eventName)?.size || 0;
  }
}

// Exporta instância padrão
export const eventBus = EventBus.getInstance();

