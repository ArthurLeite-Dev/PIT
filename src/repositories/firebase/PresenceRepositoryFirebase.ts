// src/repositories/firebase/PresenceRepositoryFirebase.ts
import {
  IPresenceRepository,
  PresenceRecord,
  PresenceUpsertInput,
  SimilarPlayersQuery,
} from '../../interfaces/IPresenceRepository.js';
import { adminDb } from '../../config/firebaseAdmin.js';

/**
 * Implementação Firebase do repositório de presença.
 * Controla quem está online e busca jogadores semelhantes.
 */
export class PresenceRepositoryFirebase implements IPresenceRepository {
  private col = adminDb.collection('presence');

  async setOnline(input: PresenceUpsertInput): Promise<void> {
    const now = new Date();
    const record: PresenceRecord = {
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

  async setOffline(uid: string): Promise<void> {
    const ref = this.col.doc(uid);
    await ref.set({ isOnline: false, lastActive: new Date() }, { merge: true });
  }

  async heartbeat(uid: string): Promise<void> {
    await this.col.doc(uid).update({ lastActive: new Date() });
  }

  async getByUid(uid: string): Promise<PresenceRecord | null> {
    const snap = await this.col.doc(uid).get();
    return snap.exists ? (snap.data() as PresenceRecord) : null;
  }

  async listOnline(limit = 20): Promise<PresenceRecord[]> {
    const snap = await this.col
      .where('isOnline', '==', true)
      .orderBy('lastActive', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map((d) => d.data() as PresenceRecord);
  }

  async listSimilarOnline(query: SimilarPlayersQuery): Promise<PresenceRecord[]> {
    const base = await this.getByUid(query.uid);
    if (!base) return [];

    const candidates = await this.listOnline(100); // busca até 100 onlines

    const intersect = (a?: string[], b?: string[]) =>
      !!a && !!b && a.some((v) => b.includes(v));

    const similar = candidates.filter((p) => {
      if (p.uid === base.uid) return false;
      const byGame = query.byGames !== false && intersect(base.favoriteGameIds, p.favoriteGameIds);
      const byGenre = query.byGenres !== false && intersect(base.favoriteGenres, p.favoriteGenres);
      const byPlatform = query.byPlatforms !== false && intersect(base.platforms, p.platforms);
      return byGame || byGenre || byPlatform;
    });

    const limit = query.limit ?? 10;
    return similar.slice(0, limit);
  }
}
