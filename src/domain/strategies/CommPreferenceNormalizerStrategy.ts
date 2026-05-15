// src/domain/strategies/CommPreferenceNormalizerStrategy.ts
import type { INormalizerStrategy } from './INormalizerStrategy.js';

export type CommPref = 'voice' | 'text' | 'both';

/**
 * Strategy para normalizar preferências de comunicação.
 * Implementa o padrão Strategy.
 */
export class CommPreferenceNormalizerStrategy implements INormalizerStrategy<CommPref> {
  private readonly allowedPrefs = new Set<CommPref>(['voice', 'text', 'both']);

  normalize(input: unknown): CommPref | undefined {
    if (!input) return undefined;
    const normalized = String(input).trim().toLowerCase();
    return this.allowedPrefs.has(normalized as CommPref) ? (normalized as CommPref) : undefined;
  }

  isValid(input: unknown): boolean {
    if (!input) return true; // Empty é válido
    const normalized = String(input).trim().toLowerCase();
    return this.allowedPrefs.has(normalized as CommPref);
  }
}

