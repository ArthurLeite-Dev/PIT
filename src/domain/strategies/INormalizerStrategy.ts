// src/domain/strategies/INormalizerStrategy.ts

/**
 * Interface Strategy Pattern para normalização e validação de dados.
 * Permite intercambiar estratégias de normalização em runtime.
 */
export interface INormalizerStrategy<T> {
  /**
   * Normaliza e valida um input, retornando o tipo esperado.
   * @param input - Dado a ser normalizado
   * @returns Dado normalizado ou undefined se inválido
   */
  normalize(input: unknown): T | undefined;

  /**
   * Valida se o input está no formato esperado.
   * @param input - Dado a ser validado
   * @returns true se válido, false caso contrário
   */
  isValid(input: unknown): boolean;
}

