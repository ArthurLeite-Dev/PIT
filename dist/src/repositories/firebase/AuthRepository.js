import { PLAYERS_COLLECTION } from '../../models/Player.js';
import { adminAuth, adminDb } from '../../config/firebaseAdmin.js';
import { fromDoc, now } from './_firestoreConverter.js';
const API_KEY = process.env.FIREBASE_WEB_API_KEY;
if (!API_KEY) {
    console.warn('⚠️ FIREBASE_WEB_API_KEY ausente. Login e reset por email não funcionarão.');
}
export class AuthRepository {
    async signUpEmailPassword(data) {
        const { email, password, name, photoUrl, avatar, country, languages, favoriteGameIds = [], platforms = [] } = data;
        const user = await adminAuth.createUser({
            email,
            password,
            displayName: name,
            photoURL: photoUrl,
            emailVerified: false,
            disabled: false,
        });
        const player = {
            id: user.uid,
            authUid: user.uid,
            name: name,
            email: email,
            photoUrl: photoUrl,
            avatar: avatar,
            country,
            languages,
            platforms: normalizePlatforms(platforms),
            favoriteGameIds,
            favoriteGenres: [],
            styles: [],
            verified: false,
            createdAt: now(),
            updatedAt: now(),
        };
        await adminDb.collection(PLAYERS_COLLECTION).doc(player.id).set(player);
        return player;
    }
    async signInWithEmail(email, password) {
        if (!API_KEY)
            throw new Error('missing_FIREBASE_WEB_API_KEY');
        const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, password, returnSecureToken: true }),
        });
        const json = await resp.json();
        if (!resp.ok) {
            const code = json?.error?.message ?? 'auth/unknown';
            throw new Error(String(code));
        }
        const result = {
            uid: json.localId,
            email: json.email,
            displayName: json.displayName ?? undefined,
            idToken: json.idToken,
        };
        return result;
    }
    async sendPasswordReset(email) {
        if (!API_KEY)
            throw new Error('missing_FIREBASE_WEB_API_KEY');
        const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
        });
        if (!resp.ok) {
            const json = await resp.json().catch(() => ({}));
            const code = json?.error?.message ?? 'auth/unknown';
            throw new Error(String(code));
        }
    }
    async signInWithGoogleIdToken(idToken) {
        if (!idToken)
            throw new Error('missing_id_token');
        const decoded = await adminAuth.verifyIdToken(idToken);
        const uid = decoded.uid;
        const email = decoded.email ?? '';
        const displayName = decoded.name;
        const photoUrl = decoded.picture;
        const ref = adminDb.collection(PLAYERS_COLLECTION).doc(uid);
        const snap = await ref.get();
        let isNewUser = false;
        if (!snap.exists) {
            const player = {
                id: uid,
                authUid: uid,
                name: displayName || (email ? email.split('@')[0] : uid),
                email,
                photoUrl,
                country: 'BR',
                languages: ['pt'],
                platforms: [],
                favoriteGameIds: [],
                favoriteGenres: [],
                styles: [],
                verified: false,
                createdAt: now(),
                updatedAt: now(),
            };
            await ref.set(player);
            isNewUser = true;
        }
        else {
            const prev = fromDoc(snap.data());
            await ref.update({
                ...(displayName && { name: displayName }),
                ...(photoUrl && { photoUrl }),
                updatedAt: now(),
                createdAt: prev.createdAt ?? now(),
            });
        }
        return { uid, email, displayName, idToken, isNewUser };
    }
}
function normalizePlatforms(input) {
    const allowed = new Set(['pc', 'xbox', 'playstation', 'switch', 'mobile']);
    if (!Array.isArray(input))
        return [];
    return input
        .map((v) => String(v).trim().toLowerCase())
        .filter((p) => allowed.has(p));
}
