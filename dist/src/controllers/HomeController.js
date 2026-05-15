/**
 * Controller responsável pela página home.
 */
export class HomeController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    /** Renderiza a página home */
    home = async (req, res) => {
        try {
            const uid = req.uid;
            const data = await this.svc.getHomeData(uid);
            res.render('home', {
                title: 'Home',
                subtitle: '',
                player: data.player,
                calls: data.calls,
                activeCallId: data.activeCallId,
                unreadNotifications: data.unreadNotifications,
            });
        }
        catch (e) {
            console.error('[home_error]', e?.message || e);
            return res.status(500).render('error', {
                title: 'Erro',
                message: 'Erro ao carregar a home',
            });
        }
    };
}
