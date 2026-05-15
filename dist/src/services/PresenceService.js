const ALLOWED_PLATFORMS = new Set(['pc', 'xbox', 'playstation', 'switch', 'mobile']);
function dedupe(arr) {
    if (!arr)
        return undefined;
    return Array.from(new Set(arr.map((s) => String(s).trim()).filter(Boolean)));
}
function normPlatforms(arr) {
    if (!arr)
        return undefined;
    const out = arr
        .map((s) => String(s).trim().toLowerCase())
        .filter((v) => ALLOWED_PLATFORMS.has(v));
    return out.length ? Array.from(new Set(out)) : undefined;
}
export class PresenceService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    /** Retorna o registro de presença de um usuário. */
    async me(uid) {
        if (!uid)
            throw new Error('missing_uid');
        return this.repo.getByUid(uid);
    }
    /** Marca o usuário como online e atualiza afinidades (merge). */
    async setOnline(input) {
        if (!input?.uid)
            throw new Error('missing_uid');
        const payload = {
            uid: input.uid,
            name: input.name?.trim(),
            photoUrl: input.photoUrl,
            country: input.country?.toUpperCase(),
            languages: dedupe(input.languages),
            favoriteGameIds: dedupe(input.favoriteGameIds?.map((s) => s.toLowerCase())),
            favoriteGenres: dedupe(input.favoriteGenres?.map((s) => s.toLowerCase())),
            platforms: normPlatforms(input.platforms),
        };
        await this.repo.setOnline(payload);
    }
    /** Marca o usuário como offline. */
    async setOffline(uid) {
        if (!uid)
            throw new Error('missing_uid');
        await this.repo.setOffline(uid);
    }
    /** Atualiza o lastActive (heartbeat). */
    async heartbeat(uid) {
        if (!uid)
            throw new Error('missing_uid');
        await this.repo.heartbeat(uid);
    }
    /** Lista usuários online (ordenados por atividade recente). */
    async listOnline(limit = 20) {
        if (limit <= 0)
            limit = 20;
        if (limit > 100)
            limit = 100;
        return this.repo.listOnline(limit);
    }
    /**
     * Lista jogadores onlines com gostos parecidos.
     * Por padrão considera games, genres e platforms.
     */
    async listSimilarOnline(query) {
        if (!query?.uid)
            throw new Error('missing_uid');
        const normalized = {
            uid: query.uid,
            limit: query.limit ?? 12,
            byGames: query.byGames !== false,
            byGenres: query.byGenres !== false,
            byPlatforms: query.byPlatforms !== false,
            byCountry: !!query.byCountry,
            byLanguages: !!query.byLanguages,
        };
        return this.repo.listSimilarOnline(normalized);
    }
}
