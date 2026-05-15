// src/config/FirebaseConnectionSingleton.ts
import admin from 'firebase-admin';
import { env } from './env.js';

/**
 * Singleton que garante uma única instância da conexão Firebase Admin.
 * Implementa o padrão Singleton do GoF.
 */
export class FirebaseConnectionSingleton {
  private static instance: FirebaseConnectionSingleton;
  private _app: admin.app.App;
  private _auth: admin.auth.Auth;
  private _db: admin.firestore.Firestore;
  private _bucket: admin.storage.Storage;

  private constructor() {
    // Decodifica o JSON da service account (vindo do .env em Base64)
    const serviceAccountJson = Buffer.from(
      env.firebase.serviceAccountBase64,
      'base64'
    ).toString('utf8');
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
    } else {
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
  public static getInstance(): FirebaseConnectionSingleton {
    if (!FirebaseConnectionSingleton.instance) {
      FirebaseConnectionSingleton.instance = new FirebaseConnectionSingleton();
    }
    return FirebaseConnectionSingleton.instance;
  }

  /**
   * Getter para a instância do Firebase App
   */
  public get app(): admin.app.App {
    return this._app;
  }

  /**
   * Getter para o serviço de autenticação
   */
  public get auth(): admin.auth.Auth {
    return this._auth;
  }

  /**
   * Getter para o Firestore Database
   */
  public get db(): admin.firestore.Firestore {
    return this._db;
  }

  /**
   * Getter para o Storage Bucket
   */
  public get bucket(): admin.storage.Storage {
    return this._bucket;
  }

  /**
   * Método para deletar a instância (útil em testes)
   */
  public static reset(): void {
    FirebaseConnectionSingleton.instance = undefined as any;
  }
}

