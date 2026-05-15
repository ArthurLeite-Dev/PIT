// src/controllers/BlockController.ts
import { Request, Response } from 'express';
import { BlockService } from '../services/BlockService.js';

export class BlockController {
  constructor(private readonly svc: BlockService) {}

  private wantsHTML(req: Request): boolean {
    const accept = req.headers.accept || '';
    return accept.includes('text/html');
  }

  /**
   * GET /block/report/:uid - Mostra formulário de denúncia
   */
  reportForm = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const reportedUid = req.params.uid;

      if (!reportedUid) {
        return res.status(400).json({ error: 'missing_reported_uid' });
      }

      if (uid === reportedUid) {
        return res.status(400).json({ error: 'cannot_report_self' });
      }

      // Busca informações do usuário denunciado
      const { adminDb } = await import('../config/firebaseAdmin.js');
      const { PLAYERS_COLLECTION } = await import('../models/Player.js');
      
      const reportedDoc = await adminDb.collection(PLAYERS_COLLECTION).doc(reportedUid).get();
      const reported = reportedDoc.exists ? reportedDoc.data() : null;

      if (!reported) {
        return res.status(404).render('error', {
          title: 'Erro',
          message: 'Usuário não encontrado',
        });
      }

      return res.render('block/report', {
        title: 'Denunciar Usuário',
        subtitle: '',
        reportedUid,
        reportedName: reported.name || 'Usuário',
        reportedPhotoUrl: reported.photoUrl || '/default-avatar.png',
      });
    } catch (e: any) {
      console.error('[block_reportForm_error]', e?.message || e);
      return res.status(500).json({ error: e?.message || 'internal_error' });
    }
  };

  /**
   * POST /block/report - Processa denúncia e bloqueio
   */
  report = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const { reportedUid, reason } = req.body;

      if (!reportedUid || !reason) {
        if (this.wantsHTML(req)) {
          return res.status(400).render('error', {
            title: 'Erro',
            message: 'Campos obrigatórios faltando',
          });
        }
        return res.status(400).json({ error: 'missing_required_fields' });
      }

      await this.svc.reportAndBlock(uid, { reportedUid, reason });

      if (this.wantsHTML(req)) {
        return res.render('block/success', {
          title: 'Denúncia Enviada',
          subtitle: '',
          message: 'Usuário denunciado e bloqueado com sucesso! Você não verá mais este usuário.',
        });
      }

      return res.status(201).json({ success: true, message: 'user_blocked_and_reported' });
    } catch (e: any) {
      console.error('[block_report_error]', e?.message || e);
      
      const errorMessage = e?.message || 'internal_error';
      
      if (this.wantsHTML(req)) {
        return res.status(400).render('block/report', {
          title: 'Erro',
          subtitle: '',
          error: errorMessage,
          reportedUid: req.body?.reportedUid || '',
          reportedName: '',
          reportedPhotoUrl: '/default-avatar.png',
        });
      }

      return res.status(400).json({ error: errorMessage });
    }
  };

  /**
   * POST /block/:uid - Apenas bloqueia o usuário (sem denúncia via email)
   */
  block = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const reportedUid = req.params.uid;

      if (!reportedUid) {
        return res.status(400).json({ error: 'missing_reported_uid' });
      }

      if (uid === reportedUid) {
        return res.status(400).json({ error: 'cannot_block_self' });
      }

      await this.svc.block(uid, reportedUid);

      if (this.wantsHTML(req)) {
        return res.render('block/success', {
          title: 'Usuário bloqueado com sucesso',
          subtitle: '',
          message: 'Você não verá mais este usuário em nenhuma parte do sistema.',
        });
      }

      return res.status(201).json({ success: true, message: 'user_blocked' });
    } catch (e: any) {
      console.error('[block_block_error]', e?.message || e);
      
      const errorMessage = e?.message || 'block_failed';
      
      if (this.wantsHTML(req)) {
        return res.status(400).render('error', {
          title: 'Erro ao Bloquear',
          message: errorMessage === 'user_already_blocked' ? 'Este usuário já está bloqueado.' : 'Não foi possível bloquear o usuário.',
        });
      }

      return res.status(400).json({ error: errorMessage });
    }
  };

  /**
   * POST /block/unblock/:uid - Remove bloqueio (desbloqueio)
   */
  unblock = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const reportedUid = req.params.uid;

      await this.svc.unblock(uid, reportedUid);

      if (this.wantsHTML(req)) {
        return res.redirect(303, '/friends');
      }

      return res.status(204).send();
    } catch (e: any) {
      console.error('[block_unblock_error]', e?.message || e);
      return res.status(400).json({ error: e?.message || 'unblock_failed' });
    }
  };
}
