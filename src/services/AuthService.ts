import { IAuthRepository } from '../interfaces/IAuthRepository.js';
import { GoogleLoginDTO, LoginDTO, LoginResult, ResetPasswordDTO, SignUpDTO } from '../interfaces/dtos.js';
import type { Player } from '../models/Player.js';

export class AuthService {
  constructor(private readonly repo: IAuthRepository) {}

  async signUp(dto: SignUpDTO) {
  if (!dto.email || !dto.password || !dto.name) throw new Error('missing_required_fields');

  dto.country = (dto.country ?? 'BR').toUpperCase();
  dto.languages = Array.isArray(dto.languages) && dto.languages.length
    ? dto.languages
    : ['pt-BR'];
  dto.favoriteGameIds = Array.isArray(dto.favoriteGameIds) ? dto.favoriteGameIds : [];
  dto.platforms = Array.isArray(dto.platforms) ? dto.platforms : [];

  return this.repo.signUpEmailPassword(dto);
}


  async loginWithEmail(email: LoginDTO['email'], password: LoginDTO['password']): Promise<LoginResult> {
    if (!email || !password) throw new Error('missing_credentials');
    return this.repo.signInWithEmail(email, password);
  }

  async sendResetEmail(email: ResetPasswordDTO['email']): Promise<void> {
    if (!email) throw new Error('missing_email');
    return this.repo.sendPasswordReset(email);
  }

  async loginWithGoogleIdToken(idToken: GoogleLoginDTO['idToken']) {
    if (!this.repo.signInWithGoogleIdToken) throw new Error('google_login_not_supported');
    if (!idToken) throw new Error('missing_id_token');
    return this.repo.signInWithGoogleIdToken(idToken);
  }
}
