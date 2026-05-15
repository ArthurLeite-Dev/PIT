import { adminDb } from '../../config/firebaseAdmin.js';
/**
 * Implementação Firebase do repositório de presença.
 * Controla quem está online e busca jogadores semelhantes.
 */
export class PresenceRepositoryFirebase {
    col = adminDb.collection('presence');
    async setOnline(input) {
        const now = new Date();
        const record = {
            uid: input.uid,
            name: input.name,
            photoUrl: input.photoUrl,
            isOnline: true,
            lastActive: now,
            country: input.country,
            languages: input.languages,
            favoriteGameIds: input.favoriteGameIds,
            favoriteGenres: input.favoriteGenres,
            platforms: input.platforms,
        };
        await this.col.doc(input.uid).set(record, { merge: true });
    }
    async setOffline(uid) {
        const ref = this.col.doc(uid);
        await ref.set({ isOnline: false, lastActive: new Date() }, { merge: true });
    }
    async heartbeat(uid) {
        await this.col.doc(uid).update({ lastActive: new Date() });
    }
    async getByUid(uid) {
        const snap = await this.col.doc(uid).get();
        return snap.exists ? snap.data() : null;
    }
    async listOnline(limit = 20) {
        const snap = await this.col
            .where('isOnline', '==', true)
            .orderBy('lastActive', 'desc')
            .limit(limit)
            .get();
        return snap.docs.map((d) => d.data());
    }
    async listSimilarOnline(query) {
        const base = await this.getByUid(query.uid);
        if (!base)
            return [];
        const candidates = await this.listOnline(100); // busca até 100 onlines
        const intersect = (a, b) => !!a && !!b && a.some((v) => b.includes(v));
        const similar = candidates.filter((p) => {
            if (p.uid === base.uid)
                return false;
            const byGame = query.byGames !== false && intersect(base.favoriteGameIds, p.favoriteGameIds);
            const byGenre = query.byGenres !== false && intersect(base.favoriteGenres, p.favoriteGenres);
            const byPlatform = query.byPlatforms !== false && intersect(base.platforms, p.platforms);
            return byGame || byGenre || byPlatform;
        });
        const limit = query.limit ?? 10;
        return similar.slice(0, limit);
    }
}
