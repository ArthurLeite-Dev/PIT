import { adminDb } from '../config/firebaseAdmin.js';
import { PLAYERS_COLLECTION } from '../models/Player.js';
export class PresenceController {
    svc;
    blockSvc;
    constructor(svc, blockSvc) {
        this.svc = svc;
        this.blockSvc = blockSvc;
    }
    /** Detecta se a resposta esperada é HTML (para particionar entre render e JSON). */
    wantsHTML(req) {
        return !!req.accepts(['html', 'json']) && req.accepts(['html', 'json']) === 'html';
    }
    /** Converte campo que pode vir como string "a,b,c" OU array ["a","b","c"] em array normalizado. */
    coerceList(v) {
        if (Array.isArray(v))
            return v.map((s) => String(s).trim()).filter(Boolean);
        if (typeof v === 'string') {
            return v
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
        }
        return undefined;
    }
    /** Marca o usuário autenticado como ONLINE (merge das afinidades). */
    online = async (req, res) => {
        try {
            const uid = req.uid;
            // Se o cliente não enviar afinidades, tentamos puxar do perfil salvo (fallback útil).
            let name = req.body?.name;
            let photoUrl = req.body?.photoUrl;
            let country = req.body?.country;
            let languages = this.coerceList(req.body?.languages);
            let favoriteGameIds = this.coerceList(req.body?.favoriteGameIds);
            let favoriteGenres = this.coerceList(req.body?.favoriteGenres);
            let platforms = this.coerceList(req.body?.platforms);
            if (!name && !country && !languages && !favoriteGameIds && !favoriteGenres && !platforms && !photoUrl) {
                const snap = await adminDb.collection(PLAYERS_COLLECTION).doc(uid).get();
                if (snap.exists) {
                    const p = snap.data();
                    name = p?.name ?? name;
                    photoUrl = p?.photoUrl ?? photoUrl;
                    country = p?.country ?? country;
                    languages = p?.languages ?? languages;
                    favoriteGameIds = p?.favoriteGameIds ?? favoriteGameIds;
                    favoriteGenres = p?.favoriteGenres ?? favoriteGenres;
                    platforms = p?.platforms ?? platforms;
                }
            }
            await this.svc.setOnline({
                uid,
                name,
                photoUrl,
                country,
                languages,
                favoriteGameIds,
                favoriteGenres,
                platforms,
            });
            // Para chamadas de página, pode ser útil redirecionar de volta à home
            if (this.wantsHTML(req))
                return res.redirect(303, '/home');
            return res.status(204).send();
        }
        catch (e) {
            console.error('[presence_online_error]', e?.message || e);
            return res.status(400).json({ error: e?.message || 'presence_online_error' });
        }
    };
    /** Marca o usuário autenticado como OFFLINE. */
    offline = async (req, res) => {
        try {
            const uid = req.uid;
            await this.svc.setOffline(uid);
            if (this.wantsHTML(req))
                return res.redirect(303, '/auth');
            return res.status(204).send();
        }
        catch (e) {
            console.error('[presence_offline_error]', e?.message || e);
            return res.status(400).json({ error: e?.message || 'presence_offline_error' });
        }
    };
    /** Heartbeat para manter o lastActive atualizado. */
    ping = async (req, res) => {
        try {
            const uid = req.uid;
            await this.svc.heartbeat(uid);
            return res.status(204).send();
        }
        catch (e) {
            console.error('[presence_ping_error]', e?.message || e);
            return res.status(400).json({ error: e?.message || 'presence_ping_error' });
        }
    };
    /** Lista usuários online (JSON por padrão; render opcional de partial EJS). */
    listOnline = async (req, res) => {
        try {
            const uid = req.uid;
            const limit = Number(req.query.limit ?? 20);
            let records = await this.svc.listOnline(limit);
            // Filtra usuários bloqueados
            if (this.blockSvc) {
                const blockedUids = await this.blockSvc.listBlockedBy(uid);
                const blockedSet = new Set(blockedUids);
                records = records.filter(r => r.uid && !blockedSet.has(r.uid));
            }
            if (this.wantsHTML(req)) {
                return res.render('presence/online-list', {
                    title: 'Jogadores online',
                    players: records,
                });
            }
            return res.status(200).json(records);
        }
        catch (e) {
            console.error('[presence_listOnline_error]', e?.message || e);
            return res.status(400).json({ error: e?.message || 'presence_list_error' });
        }
    };
    /** Lista usuários online com gostos semelhantes ao autenticado. */
    listSimilar = async (req, res) => {
        try {
            const uid = req.uid;
            const limit = Number(req.query.limit ?? 12);
            let records = await this.svc.listSimilarOnline({
                uid,
                limit,
                byGames: req.query.byGames !== 'false',
                byGenres: req.query.byGenres !== 'false',
                byPlatforms: req.query.byPlatforms !== 'false',
                byCountry: req.query.byCountry === 'true',
                byLanguages: req.query.byLanguages === 'true',
            });
            // Filtra usuários bloqueados
            if (this.blockSvc) {
                const blockedUids = await this.blockSvc.listBlockedBy(uid);
                const blockedSet = new Set(blockedUids);
                records = records.filter(r => r.uid && !blockedSet.has(r.uid));
            }
            if (this.wantsHTML(req)) {
                return res.render('presence/similar-list', {
                    title: 'Jogadores parecidos (online)',
                    players: records,
                });
            }
            return res.status(200).json(records);
        }
        catch (e) {
            console.error('[presence_listSimilar_error]', e?.message || e);
            return res.status(400).json({ error: e?.message || 'presence_similar_error' });
        }
    };
}
