export class AuthService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async signUp(dto) {
        if (!dto.email || !dto.password || !dto.name)
            throw new Error('missing_required_fields');
        dto.country = (dto.country ?? 'BR').toUpperCase();
        dto.languages = Array.isArray(dto.languages) && dto.languages.length
            ? dto.languages
            : ['pt-BR'];
        dto.favoriteGameIds = Array.isArray(dto.favoriteGameIds) ? dto.favoriteGameIds : [];
        dto.platforms = Array.isArray(dto.platforms) ? dto.platforms : [];
        return this.repo.signUpEmailPassword(dto);
    }
    async loginWithEmail(email, password) {
        if (!email || !password)
            throw new Error('missing_credentials');
        return this.repo.signInWithEmail(email, password);
    }
    async sendResetEmail(email) {
        if (!email)
            throw new Error('missing_email');
        return this.repo.sendPasswordReset(email);
    }
    async loginWithGoogleIdToken(idToken) {
        if (!this.repo.signInWithGoogleIdToken)
            throw new Error('google_login_not_supported');
        if (!idToken)
            throw new Error('missing_id_token');
        return this.repo.signInWithGoogleIdToken(idToken);
    }
}
