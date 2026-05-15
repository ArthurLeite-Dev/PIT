/**
 * Controller responsável pelo fluxo de onboarding (completar perfil).
 * Segue o padrão MVC: Controller → Service → Repository.
 */
export class OnboardingController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    /** Renderiza o formulário de onboarding */
    form = async (req, res) => {
        try {
            const uid = req.uid;
            const player = await this.svc.getByUid(uid);
            res.render('onboarding', {
                title: 'Completar perfil',
                subtitle: '',
                player,
                error: req.query.error || '',
            });
        }
        catch (e) {
            console.error('[onboarding_form_error]', e?.message || e);
            res.redirect('/home?error=load_onboarding');
        }
    };
    /** Recebe e processa o POST /onboarding */
    submit = async (req, res) => {
        try {
            const uid = req.uid;
            const payload = {
                uid,
                country: req.body.country,
                languages: req.body.languages?.split(',').map((s) => s.trim()),
                platforms: req.body.platforms?.split(',').map((s) => s.trim()),
                favoriteGameIds: req.body.games?.split(',').map((s) => s.trim()),
                avatar: req.body.avatar, // filename like 'Ariel.png'
                photoUrl: req.body.avatar ? `/images/avatares_players/${req.body.avatar}` : undefined,
            };
            await this.svc.save(payload);
            return res.redirect(303, '/home');
        }
        catch (e) {
            console.error('[onboarding_submit_error]', e?.message || e);
            return res.redirect(303, '/onboarding?error=save_failed');
        }
    };
}
