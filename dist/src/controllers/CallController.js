export class CallController {
    svc;
    notificationSvc;
    amigoSvc;
    blockSvc;
    constructor(svc, notificationSvc, amigoSvc, blockSvc) {
        this.svc = svc;
        this.notificationSvc = notificationSvc;
        this.amigoSvc = amigoSvc;
        this.blockSvc = blockSvc;
    }
    /** Lista todos os chamados abertos e renderiza na home (ou endpoint JSON) */
    listOpen = async (req, res) => {
        try {
            // Parse query parameters for filters
            const filters = {};
            if (req.query.gameId && typeof req.query.gameId === 'string') {
                filters.gameId = req.query.gameId.trim().toLowerCase();
            }
            if (req.query.callFriendly && (req.query.callFriendly === 'friendly' || req.query.callFriendly === 'competitive')) {
                filters.callFriendly = req.query.callFriendly;
            }
            if (req.query.playstyles && typeof req.query.playstyles === 'string') {
                filters.playstyles = req.query.playstyles.split(',').map(s => s.trim());
            }
            if (req.query.search && typeof req.query.search === 'string') {
                filters.search = req.query.search.trim().toLowerCase();
            }
            const calls = await this.svc.listOpen(30, filters); // Ou o número que você deseja
            // Busca o chamado ativo do usuário
            const uid = req.uid;
            const activeCall = await this.svc.getActiveCallByUser(uid);
            const activeCallId = activeCall?.id || null;
            // Reordena os chamados: o chamado ativo primeiro, depois os outros
            let callsToRender = [];
            if (calls.length > 0) {
                if (activeCallId) {
                    const activeCallIndex = calls.findIndex(c => c.id === activeCallId);
                    if (activeCallIndex !== -1) {
                        // Remove o chamado ativo da posição original
                        const [activeCall] = calls.splice(activeCallIndex, 1);
                        // Coloca no início da lista
                        callsToRender = [activeCall, ...calls];
                    }
                    else {
                        callsToRender = calls;
                    }
                }
                else {
                    callsToRender = calls;
                }
            }
            // Compute unique filter options from calls (use original calls for filter options)
            const uniqueGames = new Set();
            const uniqueCallFriendly = new Set();
            const uniquePlaystyles = new Set();
            calls.forEach(call => {
                uniqueGames.add(call.gameId.toLowerCase());
                uniqueCallFriendly.add(call.callFriendly);
                call.playstyles.forEach(style => uniquePlaystyles.add(style));
            });
            // Se for API (Accept: application/json), retorna JSON com chamados reordenados
            if (req.headers.accept?.includes('application/json')) {
                return res.status(200).json({
                    calls: callsToRender, // Retorna os chamados reordenados
                    activeCallId,
                    filterOptions: {
                        games: Array.from(uniqueGames),
                        callFriendly: Array.from(uniqueCallFriendly),
                        playstyles: Array.from(uniquePlaystyles)
                    }
                });
            }
            // Recupera notificações não lidas para o badge
            const notifications = await this.notificationSvc.listByRecipient(uid);
            const unreadCount = notifications.filter(n => !n.read).length;
            // Se for EJS, renderiza a home com os chamados e opções de filtro
            res.render('home', {
                title: 'Home',
                subtitle: '',
                player: req.player, // Passando as informações do jogador
                calls: callsToRender, // Passando os chamados (ou array vazio)
                activeCallId, // Passando o ID do chamado ativo do usuário
                unreadNotifications: unreadCount, // Passando contagem de notificações não lidas
                filterOptions: {
                    games: Array.from(uniqueGames),
                    callFriendly: Array.from(uniqueCallFriendly),
                    playstyles: Array.from(uniquePlaystyles)
                }
            });
        }
        catch (e) {
            console.error('[call_listOpen_error]', e?.message || e);
            return res.status(500).json({ error: e?.message || 'list_calls_error' });
        }
    };
    /** Cria um novo chamado */
    create = async (req, res) => {
        try {
            const uid = req.uid;
            const { title, description, gameId, platform, callFriendly, playstyles } = req.body;
            const call = await this.svc.create({ ownerUid: uid, title, description, gameId, platform, callFriendly, playstyles });
            // Sempre retorna JSON para requisições AJAX/fetch
            if (req.headers.accept?.includes('application/json') || req.xhr || req.headers['content-type']?.includes('application/json')) {
                return res.status(200).json(call);
            }
            // Redireciona para a página de detalhes do chamado após a criação
            return res.redirect(`/calls/${call.id}`); // Redirecionando para a página do chamado
        }
        catch (e) {
            console.error('[call_create_error]', e?.message || e);
            return res.status(400).json({ error: e?.message || 'create_call_error' });
        }
    };
    /** Entra em um chamado existente */
    join = async (req, res) => {
        try {
            const uid = req.uid;
            const { id } = req.params;
            const call = await this.svc.join(id, uid);
            if (req.headers.accept?.includes('application/json')) {
                return res.status(200).json(call);
            }
            return res.redirect(`/calls/${id}`);
        }
        catch (e) {
            console.error('[call_join_error]', e?.message || e);
            const code = e?.message || 'join_error';
            return res.status(400).json({ error: code });
        }
    };
    /** Fecha um chamado (somente o dono) */
    close = async (req, res) => {
        try {
            const ownerUid = req.uid;
            const { id } = req.params;
            const call = await this.svc.close(id, ownerUid);
            if (req.headers.accept?.includes('application/json')) {
                return res.status(200).json(call);
            }
            return res.redirect('/home');
        }
        catch (e) {
            console.error('[call_close_error]', e?.message || e);
            const code = e?.message || 'close_error';
            return res.status(400).json({ error: code });
        }
    };
    /** Remove um participante do chamado (somente o dono) */
    removeParticipant = async (req, res) => {
        try {
            const ownerUid = req.uid;
            const { id, participantUid } = req.params;
            // Verifica se o usuário logado é o dono
            const call = await this.svc.getById(id);
            if (!call || call.ownerUid !== ownerUid) {
                return res.status(403).json({ error: 'forbidden' });
            }
            // Remove o participante
            const updatedCall = await this.svc.removeParticipant(id, participantUid);
            if (req.headers.accept?.includes('application/json')) {
                return res.status(200).json(updatedCall);
            }
            return res.redirect(`/calls/${id}`);
        }
        catch (e) {
            console.error('[call_removeParticipant_error]', e?.message || e);
            const code = e?.message || 'remove_participant_error';
            return res.status(400).json({ error: code });
        }
    };
    /** Usuário sai do chamado */
    leave = async (req, res) => {
        try {
            const uid = req.uid;
            const { id } = req.params;
            // Verifica se o usuário é o dono
            const call = await this.svc.getById(id);
            if (!call)
                return res.status(404).json({ error: 'call_not_found' });
            // Se for o dono, não pode sair, deve fechar o chamado
            if (call.ownerUid === uid) {
                return res.status(400).json({ error: 'owner_cannot_leave' });
            }
            // Remove o usuário
            await this.svc.leave(id, uid);
            if (req.headers.accept?.includes('application/json')) {
                return res.status(200).json({ success: true });
            }
            return res.redirect('/home');
        }
        catch (e) {
            console.error('[call_leave_error]', e?.message || e);
            const code = e?.message || 'leave_error';
            return res.status(400).json({ error: code });
        }
    };
    /** Exibe os detalhes de um chamado (participantes, chat etc.) */
    getById = async (req, res) => {
        try {
            const { id } = req.params;
            const call = await this.svc.getById(id);
            if (!call)
                return res.status(404).send('Chamado não encontrado');
            // Obtem o player (usuário logado) do `req`
            const player = req.player;
            const currentUid = req.uid;
            // Busca dados dos participantes
            const { FirebaseConnectionSingleton } = await import('../config/FirebaseConnectionSingleton.js');
            const { PLAYERS_COLLECTION } = await import('../models/Player.js');
            const adminDb = FirebaseConnectionSingleton.getInstance().db;
            // Busca lista de amigos do usuário atual
            const currentFriends = await this.amigoSvc.listFriends(currentUid);
            // Filtra participantes bloqueados
            let filteredParticipants = call.participants;
            if (this.blockSvc) {
                const blockedUids = await this.blockSvc.listBlockedBy(currentUid);
                const blockedSet = new Set(blockedUids);
                filteredParticipants = call.participants.filter(uid => !blockedSet.has(uid));
            }
            const participantsData = await Promise.all(filteredParticipants.map(async (uid) => {
                const doc = await adminDb.collection(PLAYERS_COLLECTION).doc(uid).get();
                const data = doc.exists ? { uid, ...doc.data() } : { uid, name: 'Unknown', photoUrl: null };
                return {
                    ...data,
                    isFriend: currentFriends.includes(uid)
                };
            }));
            // Passa o player junto com o chamado para a view
            res.render('calls/detail', {
                title: call.title,
                subtitle: `Jogo: ${call.gameId}`,
                call,
                player, // Passando as informações do jogador (para verificar dono)
                participantsData, // Dados dos participantes
            });
        }
        catch (e) {
            console.error('[call_getById_error]', e?.message || e);
            return res.status(400).json({ error: e?.message || 'get_call_error' });
        }
    };
}
