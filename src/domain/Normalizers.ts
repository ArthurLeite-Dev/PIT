// src/domain/Normalizers.ts
import type { INormalizerStrategy } from './strategies/INormalizerStrategy.js';
import { PlatformNormalizerStrategy } from './strategies/PlatformNormalizerStrategy.js';
import { PlayStyleNormalizerStrategy } from './strategies/PlayStyleNormalizerStrategy.js';
import { CommPreferenceNormalizerStrategy } from './strategies/CommPreferenceNormalizerStrategy.js';
import { StringArrayNormalizerStrategy } from './strategies/StringArrayNormalizerStrategy.js';

export type NormalizerType = 'platform' | 'playStyle' | 'commPref' | 'stringArray';

/**
 * Seletor de estratégias de normalização.
 * Implementa Factory Method para Strategies.
 */
export class Normalizers {
  private static strategies = new Map<NormalizerType, INormalizerStrategy<any>>([
    ['platform', new PlatformNormalizerStrategy()],
    ['playStyle', new PlayStyleNormalizerStrategy()],
    ['commPref', new CommPreferenceNormalizerStrategy()],
    ['stringArray', new StringArrayNormalizerStrategy()],
  ]);

  /**
   * Obtém a estratégia de normalização apropriada.
   * @param type - Tipo da estratégia
   * @returns Instância da estratégia
   */
  public static getStrategy<T>(type: NormalizerType): INormalizerStrategy<T> {
    const strategy = Normalizers.strategies.get(type);
    if (!strategy) {
      throw new Error(`Normalizer strategy not found: ${type}`);
    }
    return strategy;
  }

  /**
   * Normaliza um dado usando a estratégia especificada.
   * @param type - Tipo da estratégia
   * @param input - Dado a ser normalizado
   * @returns Dado normalizado
   */
  public static normalize<T>(type: NormalizerType, input: unknown): T {
    const strategy = Normalizers.getStrategy<T>(type);
    return strategy.normalize(input) as T;
  }

  /**
   * Valida um dado usando a estratégia especificada.
   * @param type - Tipo da estratégia
   * @param input - Dado a ser validado
   * @returns true se válido
   */
  public static isValid(type: NormalizerType, input: unknown): boolean {
    const strategy = Normalizers.getStrategy(type);
    return strategy.isValid(input);
  }
}

