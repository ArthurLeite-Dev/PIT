/**
 * Strategy para normalizar plataformas de jogos.
 * Implementa o padrão Strategy.
 */
export class PlatformNormalizerStrategy {
    allowedPlatforms = new Set(['pc', 'xbox', 'playstation', 'switch', 'mobile']);
    normalize(input) {
        if (!input)
            return [];
        if (!Array.isArray(input))
            return [];
        return input
            .map((v) => String(v).trim().toLowerCase())
            .filter((p) => this.allowedPlatforms.has(p));
    }
    isValid(input) {
        if (!input)
            return true; // Empty é válido
        if (!Array.isArray(input))
            return false;
        return input.every((p) => this.allowedPlatforms.has(String(p).trim().toLowerCase()));
    }
}
