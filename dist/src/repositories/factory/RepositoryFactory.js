// src/repositories/factory/RepositoryFactory.ts
import { FirebaseConnectionSingleton } from '../../config/FirebaseConnectionSingleton.js';
// Importar implementações
import { AuthRepository } from '../firebase/AuthRepository.js';
import { AmigoRepositoryFirebase } from '../firebase/AmigoRepositoryFirebase.js';
import { CallRepositoryFirebase } from '../firebase/CallRepositoryFirebase.js';
import { NotificationRepositoryFirebase } from '../firebase/NotificationRepositoryFirebase.js';
import { PresenceRepositoryFirebase } from '../firebase/PresenceRepositoryFirebase.js';
import { ProfileRepositoryFirebase } from '../firebase/ProfileRepositoryFirebase.js';
import { BlockRepositoryFirebase } from '../firebase/BlockRepositoryFirebase.js';
import { OnboardingRepositoryFirebase } from '../firebase/OnboardingRepositoryFirebase.js';
import { EditProfileRepositoryFirebase } from '../firebase/EditProfileRepositoryFirebase.js';
/**
 * Factory Method Pattern: Centraliza a criação de repositórios.
 * Benefícios:
 * - Inversão de controle (IoC)
 * - Facilita testes (mock dos repositórios)
 * - Ponto único de configuração de dependências
 */
export class RepositoryFactory {
    static firebase = FirebaseConnectionSingleton.getInstance();
    /**
     * Factory Method para criar AuthRepository
     */
    static createAuthRepository() {
        return new AuthRepository();
    }
    /**
     * Factory Method para criar AmigoRepository
     */
    static createAmigoRepository() {
        return new AmigoRepositoryFirebase();
    }
    /**
     * Factory Method para criar CallRepository
     */
    static createCallRepository() {
        return new CallRepositoryFirebase();
    }
    /**
     * Factory Method para criar NotificationRepository
     */
    static createNotificationRepository() {
        return new NotificationRepositoryFirebase();
    }
    /**
     * Factory Method para criar PresenceRepository
     */
    static createPresenceRepository() {
        return new PresenceRepositoryFirebase();
    }
    /**
     * Factory Method para criar ProfileRepository
     */
    static createProfileRepository() {
        return new ProfileRepositoryFirebase();
    }
    /**
     * Factory Method para criar BlockRepository
     */
    static createBlockRepository() {
        return new BlockRepositoryFirebase();
    }
    /**
     * Factory Method para criar OnboardingRepository
     */
    static createOnboardingRepository() {
        return new OnboardingRepositoryFirebase();
    }
    /**
     * Factory Method para criar EditProfileRepository
     */
    static createEditProfileRepository() {
        return new EditProfileRepositoryFirebase();
    }
    /**
     * Getter para obter a instância Firebase (útil em casos especiais)
     */
    static getFirebase() {
        return RepositoryFactory.firebase;
    }
}
