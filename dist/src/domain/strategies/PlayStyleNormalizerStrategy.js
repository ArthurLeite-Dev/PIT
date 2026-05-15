/**
 * Strategy para normalizar estilos de jogo.
 * Implementa o padrão Strategy.
 */
export class PlayStyleNormalizerStrategy {
    allowedStyles = new Set(['casual', 'ranked', 'competitive']);
    normalize(input) {
        if (!input)
            return [];
        if (!Array.isArray(input))
            return [];
        return input
            .map((v) => String(v).trim().toLowerCase())
            .filter((style) => this.allowedStyles.has(style));
    }
    isValid(input) {
        if (!input)
            return true; // Empty é válido
        if (!Array.isArray(input))
            return false;
        return input.every((style) => this.allowedStyles.has(String(style).trim().toLowerCase()));
    }
}
