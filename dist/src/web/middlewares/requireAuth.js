import { adminAuth } from '../../config/firebaseAdmin.js';
import { adminDb } from '../../config/firebaseAdmin.js';
import { PLAYERS_COLLECTION } from '../../models/Player.js';
export async function requireAuth(req, res, next) {
    try {
        const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
        const cookieTok = req.cookies?.session || '';
        const token = bearer || cookieTok;
        if (!token)
            return res.status(401).redirect('/auth?error=unauthenticated');
        const decoded = await adminAuth.verifyIdToken(token);
        req.uid = decoded.uid;
        // Recuperar o jogador logado do Firestore e colocar em req.player
        const playerDoc = await adminDb.collection(PLAYERS_COLLECTION).doc(decoded.uid).get();
        if (playerDoc.exists) {
            req.player = playerDoc.data();
        }
        next();
    }
    catch {
        return res.status(401).redirect('/auth?error=invalid_session');
    }
}
