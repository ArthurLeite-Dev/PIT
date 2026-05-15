/**
 * Strategy para normalizar preferências de comunicação.
 * Implementa o padrão Strategy.
 */
export class CommPreferenceNormalizerStrategy {
    allowedPrefs = new Set(['voice', 'text', 'both']);
    normalize(input) {
        if (!input)
            return undefined;
        const normalized = String(input).trim().toLowerCase();
        return this.allowedPrefs.has(normalized) ? normalized : undefined;
    }
    isValid(input) {
        if (!input)
            return true; // Empty é válido
        const normalized = String(input).trim().toLowerCase();
        return this.allowedPrefs.has(normalized);
    }
}
