import { Player } from '../models/Player.js';
import { GoogleLoginDTO, LoginResult, SignUpDTO } from './dtos.js';

export interface IAuthRepository {
  signUpEmailPassword(data: SignUpDTO): Promise<Player>;
  signInWithEmail(email: string, password: string): Promise<LoginResult>;
  sendPasswordReset(email: string): Promise<void>;
  signOut?(): Promise<void>;
  signInWithGoogleIdToken?(dto: GoogleLoginDTO['idToken']): Promise<LoginResult & { isNewUser?: boolean }>;
}
