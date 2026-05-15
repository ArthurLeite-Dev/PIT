// src/config/firebaseAdmin.ts
/**
 * @deprecated Este arquivo agora é um proxy para o Singleton.
 * Use FirebaseConnectionSingleton.getInstance() diretamente em novos códigos.
 */
import { FirebaseConnectionSingleton } from './FirebaseConnectionSingleton.js';

// Mantém compatibilidade com imports existentes
const firebase = FirebaseConnectionSingleton.getInstance();

export const adminAuth = firebase.auth;
export const adminDb = firebase.db;
export const adminBucket = firebase.bucket;

// Re-exporta o Singleton para uso direto
export { FirebaseConnectionSingleton };
