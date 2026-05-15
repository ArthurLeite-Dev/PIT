function normStringArray(input) {
    if (!Array.isArray(input))
        return [];
    return input.map((v) => String(v).trim()).filter((v) => v.length > 0);
}
function normPlatforms(input) {
    const allowed = new Set(['pc', 'xbox', 'playstation', 'switch', 'mobile']);
    if (!Array.isArray(input))
        return [];
    return input
        .map((v) => String(v).trim().toLowerCase())
        .filter((v) => allowed.has(v));
}
export class OnboardingService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    /** Recupera o jogador atual (para pré-preencher formulário) */
    async getByUid(uid) {
        if (!uid)
            throw new Error('missing_uid');
        return this.repo.getByUid(uid);
    }
    /** Salva os dados do onboarding com validações básicas */
    async save(input) {
        if (!input.uid)
            throw new Error('missing_uid');
        if (!input.country)
            throw new Error('country_required');
        if (!input.languages?.length)
            throw new Error('languages_required');
        // Normalizações
        input.country = input.country.trim().toUpperCase();
        input.languages = normStringArray(input.languages);
        input.platforms = normPlatforms(input.platforms);
        input.favoriteGameIds = normStringArray(input.favoriteGameIds);
        return this.repo.saveOnboardingData(input);
    }
}
