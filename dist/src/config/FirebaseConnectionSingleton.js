// src/config/FirebaseConnectionSingleton.ts
import admin from 'firebase-admin';
import { env } from './env.js';
/**
 * Singleton que garante uma única instância da conexão Firebase Admin.
 * Implementa o padrão Singleton do GoF.
 */
export class FirebaseConnectionSingleton {
    static instance;
    _app;
    _auth;
    _db;
    _bucket;
    constructor() {
        // Decodifica o JSON da service account (vindo do .env em Base64)
        const serviceAccountJson = Buffer.from(env.firebase.serviceAccountBase64, 'base64').toString('utf8');
        const serviceAccount = JSON.parse(serviceAccountJson);
        // Inicializa o Firebase Admin **uma única vez**
        if (!admin.apps.length) {
            this._app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: env.firebase.projectId,
                storageBucket: `${env.firebase.projectId}.appspot.com`,
            });
            // Firestore: ignora campos undefined em todos os sets/updates
            admin.firestore().settings({ ignoreUndefinedProperties: true });
        }
        else {
            // Se já existe uma app, reutiliza
            this._app = admin.app();
        }
        // Inicializa as instâncias de serviços
        this._auth = admin.auth();
        this._db = admin.firestore();
        this._bucket = admin.storage();
        console.log('✅ Firebase Connection Singleton inicializado');
    }
    /**
     * Retorna a instância única do Singleton.
     * Se não existir, cria uma nova instância.
     */
    static getInstance() {
        if (!FirebaseConnectionSingleton.instance) {
            FirebaseConnectionSingleton.instance = new FirebaseConnectionSingleton();
        }
        return FirebaseConnectionSingleton.instance;
    }
    /**
     * Getter para a instância do Firebase App
     */
    get app() {
        return this._app;
    }
    /**
     * Getter para o serviço de autenticação
     */
    get auth() {
        return this._auth;
    }
    /**
     * Getter para o Firestore Database
     */
    get db() {
        return this._db;
    }
    /**
     * Getter para o Storage Bucket
     */
    get bucket() {
        return this._bucket;
    }
    /**
     * Método para deletar a instância (útil em testes)
     */
    static reset() {
        FirebaseConnectionSingleton.instance = undefined;
    }
}
