// src/domain/strategies/StringArrayNormalizerStrategy.ts
import type { INormalizerStrategy } from './INormalizerStrategy.js';

/**
 * Strategy para normalizar arrays de strings genéricos.
 * Remove duplicatas, trim em cada item, remove vazios.
 * Implementa o padrão Strategy.
 */
export class StringArrayNormalizerStrategy implements INormalizerStrategy<string[]> {
  normalize(input: unknown): string[] {
    if (!input) return [];
    if (!Array.isArray(input)) return [];

    return Array.from(
      new Set(
        input
          .map((v) => String(v).trim())
          .filter(Boolean)
      )
    );
  }

  isValid(input: unknown): boolean {
    if (!input) return true; // Empty é válido
    return Array.isArray(input);
  }
}

