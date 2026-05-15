// src/repositories/firebase/EditProfileRepositoryFirebase.ts
import { IEditProfileRepository, EditProfileInput } from '../../interfaces/IEditProfileRepository.js';
import { adminDb } from '../../config/firebaseAdmin.js';
import { Player, PLAYERS_COLLECTION } from '../../models/Player.js';

/** Remove undefined (Firestore não aceita) */
function clean<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

/** Normaliza arrays de strings simples */
function normStringArray(input?: string[] | null): string[] | undefined {
  if (input == null) return undefined;
  const out = input.map((v) => String(v).trim()).filter((v) => v.length > 0);
  return out.length ? Array.from(new Set(out)) : undefined;
}

/** Normaliza plataformas válidas */
function normPlatforms(input?: string[] | null): Player['platforms'] | undefined {
  if (input == null) return undefined;
  const allowed = new Set(['pc', 'xbox', 'playstation', 'switch', 'mobile']);
  const out = input
    .map((v) => String(v).trim().toLowerCase())
    .filter((v) => allowed.has(v));
  return out.length ? (Array.from(new Set(out)) as Player['platforms']) : undefined;
}

/** Repositório Firebase (Firestore) para edição de perfil */
export class EditProfileRepositoryFirebase implements IEditProfileRepository {
  async getByUid(uid: string): Promise<Player | null> {
    const snap = await adminDb.collection(PLAYERS_COLLECTION).doc(uid).get();
    return snap.exists ? (snap.data() as Player) : null;
  }

  async updateProfile(input: EditProfileInput): Promise<Player> {
    const { uid } = input;
    if (!uid) throw new Error('missing_uid');

    const ref = adminDb.collection(PLAYERS_COLLECTION).doc(uid);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('player_not_found');

    // Build updates object explicitly to allow empty arrays
    const updates: any = {
      updatedAt: new Date(),
    };

    // Add fields only if they are explicitly provided (not undefined)
    if (input.name !== undefined) updates.name = input.name?.trim() || '';
    if (input.country !== undefined) updates.country = input.country;
    if (input.photoUrl !== undefined) updates.photoUrl = input.photoUrl;
    if (input.avatar !== undefined) updates.avatar = input.avatar;
    if (input.languages !== undefined) updates.languages = normStringArray(input.languages) || [];
    if (input.platforms !== undefined) updates.platforms = normPlatforms(input.platforms) || [];
    if (input.favoriteGameIds !== undefined) updates.favoriteGameIds = normStringArray(input.favoriteGameIds) || [];
    if (input.favoriteGenres !== undefined) updates.favoriteGenres = normStringArray(input.favoriteGenres) || [];
    if (input.styles !== undefined) updates.styles = normStringArray(input.styles) || [];

    console.log('[EditProfileRepository] Saving updates:', updates);

    await ref.set(updates, { merge: true });
    const after = await ref.get();
    return after.data() as Player;
  }

  async partialUpdateProfile(input: Partial<EditProfileInput> & { uid: string }): Promise<void> {
    const { uid } = input;
    if (!uid) throw new Error('missing_uid');

    const ref = adminDb.collection(PLAYERS_COLLECTION).doc(uid);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('player_not_found');

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
