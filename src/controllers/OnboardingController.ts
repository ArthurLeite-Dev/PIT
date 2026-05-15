// src/controllers/OnboardingController.ts
import type { Request, Response } from 'express';
import { OnboardingService } from '../services/OnboardingService';

/**
 * Controller responsável pelo fluxo de onboarding (completar perfil).
 * Segue o padrão MVC: Controller → Service → Repository.
 */
export class OnboardingController {
  constructor(private readonly svc: OnboardingService) {}

  /** Renderiza o formulário de onboarding */
  form = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const player = await this.svc.getByUid(uid);
      res.render('onboarding', {
        title: 'Completar perfil',
        subtitle: '',
        player,
        error: req.query.error || '',
      });
    } catch (e: any) {
      console.error('[onboarding_form_error]', e?.message || e);
      res.redirect('/home?error=load_onboarding');
    }
  };

  /** Recebe e processa o POST /onboarding */
  submit = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;

      const payload = {
        uid,
        country: req.body.country,
        languages: req.body.languages?.split(',').map((s: string) => s.trim()),
        platforms: req.body.platforms?.split(',').map((s: string) => s.trim()),
        favoriteGameIds: req.body.games?.split(',').map((s: string) => s.trim()),
        avatar: req.body.avatar, // filename like 'Ariel.png'
        photoUrl: req.body.avatar ? `/images/avatares_players/${req.body.avatar}` : undefined,
      };

      await this.svc.save(payload);
      return res.redirect(303, '/home');
    } catch (e: any) {
      console.error('[onboarding_submit_error]', e?.message || e);
      return res.redirect(303, '/onboarding?error=save_failed');
    }
  };
}
