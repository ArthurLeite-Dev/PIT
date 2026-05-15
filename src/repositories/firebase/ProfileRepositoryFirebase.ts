// src/repositories/firebase/ProfileRepositoryFirebase.ts
import { IProfileRepository, ProfileUpdateInput } from '../../interfaces/IProfileRepository.js';
import { adminDb } from '../../config/firebaseAdmin.js';
import { Player, PLAYERS_COLLECTION } from '../../models/Player.js';

/** Remove campos com valor undefined (Firestore não aceita undefined). */
function clean<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

function normalizeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0);
}

function normalizePlatforms(input: unknown): Player['platforms'] {
  const allowed = new Set(['pc', 'xbox', 'playstation', 'switch', 'mobile']);
  return normalizeStringArray(input)
    .map((v) => v.toLowerCase())
    .filter((v) => allowed.has(v)) as Player['platforms'];
}

function normalizeGenres(input: unknown): string[] {
  // Mantemos em minúsculas para consistência (ex.: 'fps','moba','casual')
  return normalizeStringArray(input).map((v) => v.toLowerCase());
}

export class ProfileRepositoryFirebase implements IProfileRepository {
  async getByUid(uid: string): Promise<Player | null> {
    const snap = await adminDb.collection(PLAYERS_COLLECTION).doc(uid).get();
    return snap.exists ? (snap.data() as Player) : null;
  }

  async updateProfile(input: ProfileUpdateInput): Promise<Player> {
    const { uid } = input;
    if (!uid) throw new Error('missing_uid');

    const ref = adminDb.collection(PLAYERS_COLLECTION).doc(uid);
    const before = await ref.get();
    if (!before.exists) {
      // Mantém o padrão anterior do projeto: requer cadastro antes de editar
      throw new Error('player_not_found');
    }

    const updates = clean({
      // campos simples
      name: input.name?.trim(),
      photoUrl: input.photoUrl, // pode vir pronta (URL pública ou lógica)

      // arrays normalizados
      languages: normalizeStringArray(input.languages),
      platforms: normalizePlatforms(input.platforms),
      favoriteGameIds: normalizeStringArray(input.favoriteGameIds),
      favoriteGenres: normalizeGenres(input.favoriteGenres),

      updatedAt: new Date(),
    });

    await ref.set(updates, { merge: true });

    const after = await ref.get();
    return after.data() as Player;
  }
}
