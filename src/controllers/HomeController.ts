// src/controllers/HomeController.ts
import type { Request, Response } from 'express';
import { HomeService } from '../services/HomeService.js';

/**
 * Controller responsável pela página home.
 */
export class HomeController {
  constructor(private readonly svc: HomeService) {}

  /** Renderiza a página home */
  home = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const data = await this.svc.getHomeData(uid);

      res.render('home', {
        title: 'Home',
        subtitle: '',
        player: data.player,
        calls: data.calls,
        activeCallId: data.activeCallId,
        unreadNotifications: data.unreadNotifications,
      });
    } catch (e: any) {
      console.error('[home_error]', e?.message || e);
      return res.status(500).render('error', {
        title: 'Erro',
        message: 'Erro ao carregar a home',
      });
    }
  };
}

