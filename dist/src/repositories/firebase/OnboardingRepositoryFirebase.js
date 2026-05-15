import { adminDb } from '../../config/firebaseAdmin.js';
import { PLAYERS_COLLECTION } from '../../models/Player.js';
/** Firestore não aceita undefined em documentos. */
function clean(o) {
    return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
}
function normStringArray(input) {
    if (input == null)
        return undefined;
    const out = input
        .map((v) => String(v).trim())
        .filter((v) => v.length > 0);
    return out.length ? Array.from(new Set(out)) : undefined;
}
function normPlatforms(input) {
    if (input == null)
        return undefined;
    const allowed = new Set(['pc', 'xbox', 'playstation', 'switch', 'mobile']);
    const out = input
        .map((v) => String(v).trim().toLowerCase())
        .filter((v) => allowed.has(v));
    return out.length ? Array.from(new Set(out)) : undefined;
}
export class OnboardingRepositoryFirebase {
    async getByUid(uid) {
        const snap = await adminDb.collection(PLAYERS_COLLECTION).doc(uid).get();
        return snap.exists ? snap.data() : null;
    }
    async saveOnboardingData(input) {
        const { uid } = input;
        if (!uid)
            throw new Error('missing_uid');
        const ref = adminDb.collection(PLAYERS_COLLECTION).doc(uid);
        const exists = await ref.get();
        if (!exists.exists) {
            // Mantemos a regra: o usuário precisa existir (signup) antes do onboarding
            throw new Error('player_not_found');
        }
        const updates = clean({
            country: String(input.country || '').toUpperCase(),
            languages: normStringArray(input.languages),
            platforms: normPlatforms(input.platforms),
            favoriteGameIds: normStringArray(input.favoriteGameIds),
            avatar: input.avatar, // filename like 'Ariel.png'
            photoUrl: input.photoUrl, // pode ser undefined; clean() remove
            updatedAt: new Date(),
        });
        await ref.set(updates, { merge: true });
        const after = await ref.get();
        return after.data();
    }
}
