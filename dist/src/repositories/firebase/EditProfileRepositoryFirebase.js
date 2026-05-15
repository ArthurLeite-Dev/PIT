import { adminDb } from '../../config/firebaseAdmin.js';
import { PLAYERS_COLLECTION } from '../../models/Player.js';
/** Remove undefined (Firestore não aceita) */
function clean(o) {
    return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
}
/** Normaliza arrays de strings simples */
function normStringArray(input) {
    if (input == null)
        return undefined;
    const out = input.map((v) => String(v).trim()).filter((v) => v.length > 0);
    return out.length ? Array.from(new Set(out)) : undefined;
}
/** Normaliza plataformas válidas */
function normPlatforms(input) {
    if (input == null)
        return undefined;
    const allowed = new Set(['pc', 'xbox', 'playstation', 'switch', 'mobile']);
    const out = input
        .map((v) => String(v).trim().toLowerCase())
        .filter((v) => allowed.has(v));
    return out.length ? Array.from(new Set(out)) : undefined;
}
/** Repositório Firebase (Firestore) para edição de perfil */
export class EditProfileRepositoryFirebase {
    async getByUid(uid) {
        const snap = await adminDb.collection(PLAYERS_COLLECTION).doc(uid).get();
        return snap.exists ? snap.data() : null;
    }
    async updateProfile(input) {
        const { uid } = input;
        if (!uid)
            throw new Error('missing_uid');
        const ref = adminDb.collection(PLAYERS_COLLECTION).doc(uid);
        const snap = await ref.get();
        if (!snap.exists)
            throw new Error('player_not_found');
        // Build updates object explicitly to allow empty arrays
        const updates = {
            updatedAt: new Date(),
        };
        // Add fields only if they are explicitly provided (not undefined)
        if (input.name !== undefined)
            updates.name = input.name?.trim() || '';
        if (input.country !== undefined)
            updates.country = input.country;
        if (input.photoUrl !== undefined)
            updates.photoUrl = input.photoUrl;
        if (input.avatar !== undefined)
            updates.avatar = input.avatar;
        if (input.languages !== undefined)
            updates.languages = normStringArray(input.languages) || [];
        if (input.platforms !== undefined)
            updates.platforms = normPlatforms(input.platforms) || [];
        if (input.favoriteGameIds !== undefined)
            updates.favoriteGameIds = normStringArray(input.favoriteGameIds) || [];
        if (input.favoriteGenres !== undefined)
            updates.favoriteGenres = normStringArray(input.favoriteGenres) || [];
        if (input.styles !== undefined)
            updates.styles = normStringArray(input.styles) || [];
        console.log('[EditProfileRepository] Saving updates:', updates);
        await ref.set(updates, { merge: true });
        const after = await ref.get();
        return after.data();
    }
    async partialUpdateProfile(input) {
        const { uid } = input;
        if (!uid)
            throw new Error('missing_uid');
        const ref = adminDb.collection(PLAYERS_COLLECTION).doc(uid);
        const snap = await ref.get();
        if (!snap.exists)
            throw new Error('player_not_found');
        const updates = clean({
            ...(input.name !== undefined && { name: input.name?.trim() }),
            ...(input.photoUrl !== undefined && { photoUrl: input.photoUrl }),
            ...(input.avatar !== undefined && { avatar: input.avatar }),
            ...(input.languages !== undefined && { languages: normStringArray(input.languages) }),
            ...(input.platforms !== undefined && { platforms: normPlatforms(input.platforms) }),
            ...(input.favoriteGameIds !== undefined && { favoriteGameIds: normStringArray(input.favoriteGameIds) }),
            ...(input.favoriteGenres !== undefined && { favoriteGenres: normStringArray(input.favoriteGenres) }),
            ...(input.styles !== undefined && { styles: normStringArray(input.styles) }),
            ...(input.country !== undefined && { country: input.country }),
            updatedAt: new Date(),
        });
        await ref.set(updates, { merge: true });
    }
}
