// src/controllers/ConsentController.ts
import type { Request, Response } from 'express';
import { FirebaseConnectionSingleton } from '../config/FirebaseConnectionSingleton.js';

const CONSENTS_COLLECTION = 'consents';

export class ConsentController {
  /**
   * Renderiza a página de consentimento LGPD
   */
  form = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      
      // Busca consentimentos existentes
      const db = FirebaseConnectionSingleton.getInstance().db;
      const consentDoc = await db.collection(CONSENTS_COLLECTION).doc(uid).get();
      const existingConsents = consentDoc.exists ? consentDoc.data() : {};

      res.render('consent', {
        title: 'Consentimento LGPD',
        subtitle: '',
        existingConsents,
        error: req.query.error || '',
      });
    } catch (e: any) {
      console.error('[consent_form_error]', e?.message || e);
      return res.status(500).render('error', {
        title: 'Erro',
        message: 'Erro ao carregar página de consentimento',
      });
    }
  };

  /**
   * Salva os consentimentos do usuário
   */
  save = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const purposes = req.body.purposes || [];
      
      const consent = {
        uid,
        purposes,
        grantedAt: new Date(),
        updatedAt: new Date(),
      };

      const db = FirebaseConnectionSingleton.getInstance().db;
      await db.collection(CONSENTS_COLLECTION).doc(uid).set(consent, { merge: true });

      if (req.headers.accept?.includes('application/json')) {
        return res.status(200).json({ message: 'Consentimento salvo com sucesso' });
      }

      return res.redirect('/home?consent=saved');
    } catch (e: any) {
      console.error('[consent_save_error]', e?.message || e);
      return res.status(500).json({ error: 'Erro ao salvar consentimento' });
    }
  };

  /**
   * Revoga o consentimento do usuário
   */
  revoke = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      
      const consent = {
        uid,
        revokedAt: new Date(),
        purposes: [],
      };

      const db = FirebaseConnectionSingleton.getInstance().db;
      await db.collection(CONSENTS_COLLECTION).doc(uid).set(consent, { merge: true });

      if (req.headers.accept?.includes('application/json')) {
        return res.status(200).json({ message: 'Consentimento revogado com sucesso' });
      }

      return res.redirect('/home?consent=revoked');
    } catch (e: any) {
      console.error('[consent_revoke_error]', e?.message || e);
      return res.status(500).json({ error: 'Erro ao revogar consentimento' });
    }
  };
}

