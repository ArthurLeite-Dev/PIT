import type { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService.js';

/**
 * Controller responsável pelas notificações do usuário.
 * Segue o padrão MVC → Controller → Service → Repository.
 */
export class NotificationController {
  constructor(private readonly svc: NotificationService) {}

  /** Lista as notificações do usuário */
  list = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const notifications = await this.svc.listByRecipient(uid);

      // Check if request accepts JSON
      if (req.headers.accept?.includes('application/json')) {
        return res.json({ notifications });
      }

      // Render HTML view
      res.render('notifications/list', {
        title: 'Notificações',
        subtitle: '',
        notifications,
      });
    } catch (e: any) {
      console.error('[notifications_list_error]', e?.message || e);
      if (req.headers.accept?.includes('application/json')) {
        return res.status(500).json({ error: 'Failed to load notifications' });
      }
      res.redirect('/home?error=notifications_load');
    }
  };

  /** Marca uma notificação como lida */
  markAsRead = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const { id } = req.params;

      await this.svc.markAsRead(id, uid);

      if (req.headers.accept?.includes('application/json')) {
        return res.json({ success: true });
      }

      res.redirect('/notifications');
    } catch (e: any) {
      console.error('[notifications_mark_read_error]', e?.message || e);
      if (req.headers.accept?.includes('application/json')) {
        return res.status(500).json({ error: 'Failed to mark notification as read' });
      }
      res.redirect('/notifications?error=mark_read_failed');
    }
  };

  /** Deleta uma notificação */
  delete = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const { id } = req.params;

      await this.svc.delete(id, uid);

      if (req.headers.accept?.includes('application/json')) {
        return res.json({ success: true });
      }

      res.redirect('/notifications');
    } catch (e: any) {
      console.error('[notifications_delete_error]', e?.message || e);
      if (req.headers.accept?.includes('application/json')) {
        return res.status(500).json({ error: 'Failed to delete notification' });
      }
      res.redirect('/notifications?error=delete_failed');
    }
  };
}
