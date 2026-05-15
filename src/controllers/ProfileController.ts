// src/controllers/ProfileController.ts
import type { Request, Response } from 'express';
import { ProfileService } from '../services/ProfileService.js';
import { AmigoService } from '../services/AmigoService.js';
import { BlockService } from '../services/BlockService.js';

/**
 * Controller responsável por exibir e atualizar o perfil do usuário autenticado.
 * Segue o padrão MVC do projeto: Controller -> Service -> Repository.
 */
export class ProfileController {
  constructor(
    private readonly svc: ProfileService,
    private readonly amigoSvc: AmigoService,
    private readonly blockSvc?: BlockService
  ) {}

  /** Renderiza o perfil de outro jogador (visualização) */
  view = async (req: Request, res: Response) => {
    try {
      const { uid: targetUid } = req.params;
      const currentUid = (req as any).uid as string;
      
      // Verifica se o usuário está bloqueado
      if (this.blockSvc) {
        const isBlocked = await this.blockSvc.isBlocked(currentUid, targetUid);
        if (isBlocked) {
          return res.status(403).render('error', {
            title: 'Acesso Negado',
            message: 'Você bloqueou este usuário e não pode visualizar o perfil dele.',
          });
        }
      }
      
      const targetPlayer = await this.svc.getByUid(targetUid);
      if (!targetPlayer) return res.status(404).send('Perfil não encontrado');
      
      // Verifica se já são amigos
      const currentFriends = await this.amigoSvc.listFriends(currentUid);
      const isAlreadyFriend = currentFriends.includes(targetUid);
      
      res.render('profile-view', { 
        title: targetPlayer.name || 'Perfil', 
        subtitle: '', 
        player: targetPlayer,
        currentPlayer: { 
          id: currentUid,
          authUid: currentUid 
        },
        isAlreadyFriend
      });
    } catch (e: any) {
      console.error('[profile_view_error]', e?.message || e);
      return res.redirect('/home?error=profile_load');
    }
  };

  /** Renderiza o formulário de edição com os dados atuais */
  editForm = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const player = await this.svc.me(uid);
      if (!player) return res.redirect('/auth?error=not_found');
      res.render('profile-edit', { title: 'Editar perfil', subtitle: '', player });
    } catch (e: any) {
      console.error('[profile_editForm_error]', e?.message || e);
      return res.redirect('/home?error=profile_load');
    }
  };

  /** Atualiza os dados enviados pelo formulário */
  update = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;

      const payload = {
        uid,
        name: req.body.name,
        languages: req.body.languages?.split(',').map((s: string) => s.trim()),
        platforms: req.body.platforms?.split(',').map((s: string) => s.trim()),
        favoriteGameIds: req.body.favoriteGameIds?.split(',').map((s: string) => s.trim()),
        favoriteGenres: req.body.favoriteGenres?.split(',').map((s: string) => s.trim()),
        // photoUrl é tratado no Repository se necessário
      };

      await this.svc.update(payload);
      return res.redirect(303, '/home');
    } catch (e: any) {
      console.error('[profile_update_error]', e?.message || e);
      return res.redirect(303, '/profile/edit?error=update_failed');
    }
  };
}
