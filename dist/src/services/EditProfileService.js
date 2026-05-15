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
    return out.length ? dedupe(out) : undefined;
}
function normPlatforms(input) {
    if (input == null)
        return undefined;
    // Map user-friendly names to normalized keys
    const platformMap = {
        'pc': 'pc',
        'playstation': 'playstation',
        'ps': 'playstation',
        'xbox': 'xbox',
        'switch': 'switch',
        'nintendo switch': 'switch',
        'mobile': 'mobile',
        // Handle case variations
        'PC': 'pc',
        'PlayStation': 'playstation',
        'PS': 'playstation',
        'Xbox': 'xbox',
        'Switch': 'switch',
        'Nintendo Switch': 'switch',
        'Mobile': 'mobile',
    };
    const out = input
        .map((v) => {
        const normalized = String(v).trim().toLowerCase();
        // Try exact match first, then check the map
        if (platformMap[normalized])
            return platformMap[normalized];
        // Try the original string
        if (platformMap[v])
            return platformMap[v];
        // Return normalized if it's allowed, otherwise undefined
        return ALLOWED_PLATFORMS.has(normalized) ? normalized : undefined;
    })
        .filter((v) => v !== undefined);
    return out.length ? dedupe(out) : undefined;
}
function normCountry(input) {
    if (input == null)
        return undefined;
    const trimmed = input.trim().toUpperCase();
    return trimmed.length === 2 ? trimmed : undefined;
}
/**
 * Service de edição de perfil.
 * Realiza validações e normalizações antes de atualizar o Firestore.
 */
export class EditProfileService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    /** Retorna o perfil atual do usuário logado */
    async me(uid) {
        if (!uid)
            throw new Error('missing_uid');
        return this.repo.getByUid(uid);
    }
    /** Atualiza campos do perfil com validações */
    async update(input) {
        if (!input?.uid)
            throw new Error('missing_uid');
        if (input.name && input.name.trim().length > 80) {
            throw new Error('name_too_long');
        }
        // Helper para normalizar arrays (permitindo arrays vazios)
        const normArray = (arr) => {
            if (arr == null || arr.length === 0)
                return [];
            const out = arr
                .map((v) => String(v).trim())
                .filter((v) => v.length > 0);
            return dedupe(out);
        };
        const payload = {
            uid: input.uid,
            name: input.name?.trim() || undefined,
            country: normCountry(input.country),
            photoUrl: input.photoUrl,
            languages: input.languages !== undefined ? normArray(input.languages) : undefined,
            platforms: input.platforms !== undefined ? normPlatforms(input.platforms) : undefined,
            favoriteGameIds: input.favoriteGameIds !== undefined ? normArray(input.favoriteGameIds) : undefined,
            favoriteGenres: input.favoriteGenres !== undefined ? normArray(input.favoriteGenres) : undefined,
            styles: input.styles !== undefined ? normArray(input.styles) : undefined,
            avatar: input.avatar,
        };
        return this.repo.updateProfile(payload);
    }
    /** Partial update for individual fields */
    async partialUpdate(input) {
        if (!input?.uid)
            throw new Error('missing_uid');
        // Validate individual fields
        if (input.name && input.name.trim().length > 80) {
            throw new Error('name_too_long');
        }
        const payload = {
            uid: input.uid,
        };
        if (input.name !== undefined)
            payload.name = input.name?.trim();
        if (input.country !== undefined)
            payload.country = normCountry(input.country);
        if (input.photoUrl !== undefined)
            payload.photoUrl = input.photoUrl;
        if (input.languages !== undefined)
            payload.languages = normStrings(input.languages);
        if (input.platforms !== undefined)
            payload.platforms = normPlatforms(input.platforms);
        if (input.favoriteGameIds !== undefined)
            payload.favoriteGameIds = normStrings(input.favoriteGameIds, true);
        if (input.favoriteGenres !== undefined)
            payload.favoriteGenres = normStrings(input.favoriteGenres, true);
        if (input.styles !== undefined)
            payload.styles = normStrings(input.styles);
        return this.repo.partialUpdateProfile(payload);
    }
}
