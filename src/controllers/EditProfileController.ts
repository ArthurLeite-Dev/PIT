// src/controllers/EditProfileController.ts
import type { Request, Response } from 'express';
import { EditProfileService } from '../services/EditProfileService.js';

/**
 * Controller responsável pela edição de perfil do usuário.
 * Segue o padrão MVC → Controller → Service → Repository.
 */
export class EditProfileController {
  constructor(private readonly svc: EditProfileService) {}

  /** Renderiza o formulário com os dados atuais do perfil */
  form = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const player = await this.svc.me(uid);
      if (!player) return res.redirect('/auth?error=not_found');

      res.render('profile-edit', { title: 'Editar perfil', subtitle: '', player });
    } catch (e: any) {
      console.error('[editProfile_form_error]', e?.message || e);
      res.redirect('/home?error=profile_load');
    }
  };

  /** Recebe as alterações do formulário e salva no Firestore */
  update = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;

      console.log('[editProfile_update] Recebendo dados:', {
        name: req.body.name,
        country: req.body.country,
        languages: req.body.languages,
        platforms: req.body.platforms,
        games: req.body.games,
        genres: req.body.genres,
        styles: req.body.styles,
        avatar: req.body.avatar,
      });

      // Helper para processar arrays de strings (trata strings vazias)
      const parseArray = (str?: string): string[] | undefined => {
        if (!str || str.trim() === '') return [];
        const parsed = str.split(',').map((s: string) => s.trim()).filter(s => s.length > 0);
        return parsed.length > 0 ? parsed : [];
      };

      const payload = {
        uid,
        name: req.body.name?.trim() || '',
        country: req.body.country?.trim() || '',
        languages: parseArray(req.body.languages),
        platforms: parseArray(req.body.platforms),
        favoriteGameIds: parseArray(req.body.games),
        favoriteGenres: parseArray(req.body.genres),
        styles: parseArray(req.body.styles),
        avatar: req.body.avatar?.trim() || '',
        photoUrl: req.body.avatar && req.body.avatar.trim() !== '' 
          ? `/images/avatares_players/${req.body.avatar}` 
          : undefined,
      };

      console.log('[editProfile_update] Payload processado:', payload);

      await this.svc.update(payload);
      return res.redirect(303, '/home');
    } catch (e: any) {
      console.error('[editProfile_update_error]', e?.message || e);
      return res.redirect(303, '/profile/edit?error=update_failed');
    }
  };

  /** Partial update for individual fields */
  partialUpdate = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const { field } = req.params;
      const { value } = req.body;

      if (!field || value === undefined) {
        return res.status(400).json({ error: 'Field and value are required' });
      }

      let processedValue: any = value;

      // Process array fields
      if (['languages', 'platforms', 'favoriteGameIds', 'favoriteGenres', 'styles'].includes(field)) {
        processedValue = Array.isArray(value) ? value : value.split(',').map((s: string) => s.trim());
      }

      // Process avatar field
      if (field === 'avatar') {
        processedValue = value; // filename like 'Ariel.png'
      }

      const payload = {
        uid,
        [field]: processedValue,
        ...(field === 'avatar' && { photoUrl: value ? `/images/avatares_players/${value}` : undefined }),
      };

      await this.svc.partialUpdate(payload);
      return res.json({ success: true });
    } catch (e: any) {
      console.error('[editProfile_partialUpdate_error]', e?.message || e);
      return res.status(500).json({ error: 'Update failed' });
    }
  };
}
