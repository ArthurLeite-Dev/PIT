// src/repositories/factory/RepositoryFactory.ts
import { FirebaseConnectionSingleton } from '../../config/FirebaseConnectionSingleton.js';

// Importar interfaces
import type { IAuthRepository } from '../../interfaces/IAuthRepository.js';
import type { IAmigoRepository } from '../../interfaces/IAmigoRepository.js';
import type { ICallRepository } from '../../interfaces/ICallRepository.js';
import type { INotificationRepository } from '../../interfaces/INotificationRepository.js';
import type { IPresenceRepository } from '../../interfaces/IPresenceRepository.js';
import type { IProfileRepository } from '../../interfaces/IProfileRepository.js';
import type { IBlockRepository } from '../../interfaces/IBlockRepository.js';
import type { IOnboardingRepository } from '../../interfaces/IOnboardingRepository.js';
import type { IEditProfileRepository } from '../../interfaces/IEditProfileRepository.js';

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
  private static firebase = FirebaseConnectionSingleton.getInstance();

  /**
   * Factory Method para criar AuthRepository
   */
  public static createAuthRepository(): IAuthRepository {
    return new AuthRepository();
  }

  /**
   * Factory Method para criar AmigoRepository
   */
  public static createAmigoRepository(): IAmigoRepository {
    return new AmigoRepositoryFirebase();
  }

  /**
   * Factory Method para criar CallRepository
   */
  public static createCallRepository(): ICallRepository {
    return new CallRepositoryFirebase();
  }

  /**
   * Factory Method para criar NotificationRepository
   */
  public static createNotificationRepository(): INotificationRepository {
    return new NotificationRepositoryFirebase();
  }

  /**
   * Factory Method para criar PresenceRepository
   */
  public static createPresenceRepository(): IPresenceRepository {
    return new PresenceRepositoryFirebase();
  }

  /**
   * Factory Method para criar ProfileRepository
   */
  public static createProfileRepository(): IProfileRepository {
    return new ProfileRepositoryFirebase();
  }

  /**
   * Factory Method para criar BlockRepository
   */
  public static createBlockRepository(): IBlockRepository {
    return new BlockRepositoryFirebase();
  }

  /**
   * Factory Method para criar OnboardingRepository
   */
  public static createOnboardingRepository(): IOnboardingRepository {
    return new OnboardingRepositoryFirebase();
  }

  /**
   * Factory Method para criar EditProfileRepository
   */
  public static createEditProfileRepository(): IEditProfileRepository {
    return new EditProfileRepositoryFirebase();
  }

  /**
   * Getter para obter a instância Firebase (útil em casos especiais)
   */
  public static getFirebase(): FirebaseConnectionSingleton {
    return RepositoryFactory.firebase;
  }
}

