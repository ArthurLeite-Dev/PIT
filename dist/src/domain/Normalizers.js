import { PlatformNormalizerStrategy } from './strategies/PlatformNormalizerStrategy.js';
import { PlayStyleNormalizerStrategy } from './strategies/PlayStyleNormalizerStrategy.js';
import { CommPreferenceNormalizerStrategy } from './strategies/CommPreferenceNormalizerStrategy.js';
import { StringArrayNormalizerStrategy } from './strategies/StringArrayNormalizerStrategy.js';
/**
 * Seletor de estratégias de normalização.
 * Implementa Factory Method para Strategies.
 */
export class Normalizers {
    static strategies = new Map([
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
    static getStrategy(type) {
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
    static normalize(type, input) {
        const strategy = Normalizers.getStrategy(type);
        return strategy.normalize(input);
    }
    /**
     * Valida um dado usando a estratégia especificada.
     * @param type - Tipo da estratégia
     * @param input - Dado a ser validado
     * @returns true se válido
     */
    static isValid(type, input) {
        const strategy = Normalizers.getStrategy(type);
        return strategy.isValid(input);
    }
}
