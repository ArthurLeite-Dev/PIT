export class AuthController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    /** Define cookie de sessão (HttpOnly) com o idToken do Firebase */
    setSessionCookie(res, idToken) {
        res.cookie('session', idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 5, // 5 dias
            path: '/',
        });
    }
    /** Detecta submit HTML (form) para decidir entre redirect e JSON */
    wantsHTML(req) {
        const ct = String(req.headers['content-type'] || '');
        const acc = String(req.headers['accept'] || '');
        return ct.includes('application/x-www-form-urlencoded') || acc.includes('text/html');
    }
    // POST /signup
    signUp = async (req, res) => {
        try {
            const player = await this.svc.signUp(req.body);
            // login automático para obter idToken e colocar cookie
            const session = await this.svc.loginWithEmail(req.body.email, req.body.password);
            this.setSessionCookie(res, session.idToken);
            // 🔄 redireciona para ONBOARDING em vez de /home
            if (this.wantsHTML(req))
                return res.redirect(303, '/onboarding');
            return res.status(201).json(player);
        }
        catch (e) {
            const code = e?.code || e?.message || 'signup_error';
            console.error('[signup_error]', code, e);
            if (this.wantsHTML(req))
                return res.redirect(303, `/register?error=signup&code=${encodeURIComponent(code)}`);
            return res.status(400).json({ error: code });
        }
    };
    // POST /login
    login = async (req, res) => {
        try {
            const { email, password } = req.body ?? {};
            const session = await this.svc.loginWithEmail(email, password);
            this.setSessionCookie(res, session.idToken);
            if (this.wantsHTML(req))
                return res.redirect(303, '/home'); // evita re-POST
            return res.status(200).json(session);
        }
        catch (e) {
            const code = e?.code || e?.message || 'invalid_credentials';
            console.error('[login_error]', code, e);
            if (this.wantsHTML(req))
                return res.redirect(303, `/login?error=login&code=${encodeURIComponent(code)}`);
            return res.status(401).json({ error: code });
        }
    };
    // POST /auth/reset-password
    resetPassword = async (req, res) => {
        try {
            await this.svc.sendResetEmail(req.body?.email);
            return res.status(204).send();
        }
        catch (e) {
            const code = e?.code || e?.message || 'reset_error';
            return res.status(400).json({ error: code });
        }
    };
    // POST /auth/google
    googleLogin = async (req, res) => {
        try {
            const { idToken } = req.body ?? {};
            const session = await this.svc.loginWithGoogleIdToken(idToken);
            // opcional: set cookie aqui também, se desejar sessão via Google
            this.setSessionCookie(res, session.idToken);
            if (this.wantsHTML(req))
                return res.redirect(303, '/home');
            return res.status(200).json(session);
        }
        catch (e) {
            const code = e?.code || e?.message || 'invalid_google_token';
            return res.status(401).json({ error: code });
        }
    };
}
