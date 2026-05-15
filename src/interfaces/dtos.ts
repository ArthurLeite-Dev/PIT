export interface SignUpDTO {
  email: string;
  password: string;
  name: string;
  country: string;
  languages: string[];
  favoriteGameIds?: string[];
  photoUrl?: string;
  avatar?: string; // Nome do arquivo de avatar, ex.: 'avatar1.png'
  platforms?: string[]; // validaremos p/ Platform no repo
}

export interface LoginDTO { email: string; password: string; }
export interface ResetPasswordDTO { email: string; }
export interface GoogleLoginDTO { idToken: string; }

export interface LoginResult {
  uid: string;
  email: string;
  displayName?: string;
  idToken: string;
}
