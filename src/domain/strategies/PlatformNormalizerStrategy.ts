// src/domain/strategies/PlatformNormalizerStrategy.ts
import type { INormalizerStrategy } from './INormalizerStrategy.js';

export type Platform = 'pc' | 'xbox' | 'playstation' | 'switch' | 'mobile';

/**
 * Strategy para normalizar plataformas de jogos.
 * Implementa o padrão Strategy.
 */
export class PlatformNormalizerStrategy implements INormalizerStrategy<Platform[]> {
  private readonly allowedPlatforms = new Set<Platform>(['pc', 'xbox', 'playstation', 'switch', 'mobile']);

  normalize(input: unknown): Platform[] {
    if (!input) return [];
    if (!Array.isArray(input)) return [];

    return input
      .map((v) => String(v).trim().toLowerCase())
      .filter((p): p is Platform => this.allowedPlatforms.has(p as Platform));
  }

  isValid(input: unknown): boolean {
    if (!input) return true; // Empty é válido
    if (!Array.isArray(input)) return false;
    return input.every((p) => this.allowedPlatforms.has(String(p).trim().toLowerCase() as Platform));
  }
}

