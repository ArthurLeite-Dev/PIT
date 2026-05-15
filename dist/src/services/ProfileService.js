const ALLOWED_PLATFORMS = new Set(['pc', 'xbox', 'playstation', 'switch', 'mobile']);
function dedupe(arr) {
    return Array.from(new Set(arr));
}
function normStrings(input, toLower = false) {
    if (input == null)
        return undefined;
    const out = input
        .map((v) => String(v).trim())
        .filter((v) => v.length > 0)
        .map((v) => (toLower ? v.toLowerCase() : v));
    return dedupe(out);
}
function normPlatforms(input) {
    if (input == null)
        return undefined;
    const out = input
        .map((v) => String(v).trim().toLowerCase())
        .filter((v) => ALLOWED_PLATFORMS.has(v));
    return dedupe(out);
}
export class ProfileService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    /** Retorna o próprio perfil do usuário autenticado */
    async me(uid) {
        if (!uid)
            throw new Error('missing_uid');
        return this.repo.getByUid(uid);
    }
    /** Retorna o perfil de qualquer jogador (por UID) */
    async getByUid(uid) {
        if (!uid)
            throw new Error('missing_uid');
        return this.repo.getByUid(uid);
    }
    /** Atualiza campos do perfil com validações de negócio */
    async update(input) {
        if (!input?.uid)
            throw new Error('missing_uid');
        // Validações leves
        if (input.name && input.name.trim().length > 80) {
            throw new Error('name_too_long');
        }
        // Normalizações (não alteram o contrato do repositório, só limpam os dados)
        const payload = {
            uid: input.uid,
            name: input.name?.trim(),
            photoUrl: input.photoUrl, // pode ser null/undefined; repo ignora undefined
            languages: normStrings(input.languages), // mantém caixa original (ex.: pt-BR)
            platforms: normPlatforms(input.platforms), // valida contra lista permitida
            favoriteGameIds: normStrings(input.favoriteGameIds, true), // ids/flags em minúsculas
            favoriteGenres: normStrings(input.favoriteGenres, true), // gêneros em minúsculas
        };
        return this.repo.updateProfile(payload);
    }
}
