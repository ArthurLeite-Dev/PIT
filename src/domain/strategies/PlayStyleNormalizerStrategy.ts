// src/domain/strategies/PlayStyleNormalizerStrategy.ts
import type { INormalizerStrategy } from './INormalizerStrategy.js';

export type PlayStyle = 'casual' | 'ranked' | 'competitive';

/**
 * Strategy para normalizar estilos de jogo.
 * Implementa o padrão Strategy.
 */
export class PlayStyleNormalizerStrategy implements INormalizerStrategy<PlayStyle[]> {
  private readonly allowedStyles = new Set<PlayStyle>(['casual', 'ranked', 'competitive']);

  normalize(input: unknown): PlayStyle[] {
    if (!input) return [];
    if (!Array.isArray(input)) return [];

    return input
      .map((v) => String(v).trim().toLowerCase())
      .filter((style): style is PlayStyle => this.allowedStyles.has(style as PlayStyle));
  }

  isValid(input: unknown): boolean {
    if (!input) return true; // Empty é válido
    if (!Array.isArray(input)) return false;
    return input.every((style) => this.allowedStyles.has(String(style).trim().toLowerCase() as PlayStyle));
  }
}

