// src/services/HomeService.ts
import { CallService } from './CallService.js';
import { NotificationService } from './NotificationService.js';
import { ProfileService } from './ProfileService.js';
import { FirebaseConnectionSingleton } from '../config/FirebaseConnectionSingleton.js';
import { PLAYERS_COLLECTION } from '../models/Player.js';

export interface HomeData {
  player: any;
  calls: any[];
  activeCallId: string | null;
  unreadNotifications: number;
}

/**
 * Service responsável por agregar dados para a página home.
 * Evita mistura de lógica de negócio nas rotas.
 */
export class HomeService {
  constructor(
    private readonly callService: CallService,
    private readonly notificationService: NotificationService,
    private readonly profileService: ProfileService
  ) {}

  /**
   * Agrega todos os dados necessários para renderizar a home
   */
  async getHomeData(uid: string): Promise<HomeData> {
    // Obtém o player logado
    const db = FirebaseConnectionSingleton.getInstance().db;
    const playerDoc = await db.collection(PLAYERS_COLLECTION).doc(uid).get();
    const player = playerDoc.exists ? playerDoc.data() : null;

    // Recupera os chamados abertos
    const calls = await this.callService.listOpen(30);

    // Busca o chamado ativo do usuário
    const activeCall = await this.callService.getActiveCallByUser(uid);
    const activeCallId = activeCall?.id || null;

    // Reordena os chamados: o chamado ativo primeiro
    let callsToRender = calls;
    if (activeCallId && calls.length > 0) {
      const activeCallIndex = calls.findIndex((c) => c.id === activeCallId);
      if (activeCallIndex !== -1) {
        const [activeCallObj] = calls.splice(activeCallIndex, 1);
        callsToRender = [activeCallObj, ...calls];
      }
    }

    // Recupera notificações não lidas
    const notifications = await this.notificationService.listByRecipient(uid);
    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
      player,
      calls: callsToRender,
      activeCallId,
      unreadNotifications: unreadCount,
    };
  }
}

