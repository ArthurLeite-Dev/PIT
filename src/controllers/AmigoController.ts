// src/controllers/AmigoController.ts
import type { Request, Response } from 'express';
import { AmigoService } from '../services/AmigoService.js';
import { BlockService } from '../services/BlockService.js';
import { adminDb } from '../config/firebaseAdmin.js';
import { PLAYERS_COLLECTION } from '../models/Player.js';

export class AmigoController {
  constructor(
    private readonly svc: AmigoService,
    private readonly blockSvc?: BlockService
  ) {}

  /** Adiciona um amigo (envia solicitação) */
  addFriend = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const { friendUid } = req.body;

      await this.svc.addFriend(uid, friendUid);

      if (req.headers.accept?.includes('application/json')) {
        return res.status(200).json({ message: 'Friend request sent' });
      }

      return res.redirect('/friends');
    } catch (e: any) {
      console.error('[amigo_addFriend_error]', e?.message || e);
      const code = e?.message || 'add_friend_error';
      return res.status(400).json({ error: code });
    }
  };

  /** Remove um amigo */
  removeFriend = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const { friendUid } = req.params;

      await this.svc.removeFriend(uid, friendUid);

      if (req.headers.accept?.includes('application/json')) {
        return res.status(200).json({ message: 'Friend removed' });
      }

      return res.redirect('/friends');
    } catch (e: any) {
      console.error('[amigo_removeFriend_error]', e?.message || e);
      const code = e?.message || 'remove_friend_error';
      return res.status(400).json({ error: code });
    }
  };

  /** Aceita uma solicitação de amizade */
  acceptRequest = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const { friendUid } = req.params;

      await this.svc.acceptRequest(uid, friendUid);

      if (req.headers.accept?.includes('application/json')) {
        return res.status(200).json({ message: 'Friend request accepted' });
      }

      return res.redirect('/friends');
    } catch (e: any) {
      console.error('[amigo_acceptRequest_error]', e?.message || e);
      const code = e?.message || 'accept_request_error';
      return res.status(400).json({ error: code });
    }
  };

  /** Rejeita uma solicitação de amizade */
  rejectRequest = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;
      const { friendUid } = req.params;

      await this.svc.rejectRequest(uid, friendUid);

      if (req.headers.accept?.includes('application/json')) {
        return res.status(200).json({ message: 'Friend request rejected' });
      }

      return res.redirect('/friends');
    } catch (e: any) {
      console.error('[amigo_rejectRequest_error]', e?.message || e);
      const code = e?.message || 'reject_request_error';
      return res.status(400).json({ error: code });
    }
  };

  /** Lista amigos e solicitações pendentes */
  list = async (req: Request, res: Response) => {
    try {
      const uid = (req as any).uid as string;

      const friendsUids = await this.svc.listFriends(uid);
      const pendingUids = await this.svc.listPendingRequests(uid);

      // Busca dados dos jogadores
      // Filtra UIDs bloqueados
      let filteredFriendsUids = friendsUids;
      let filteredPendingUids = pendingUids;
      
      if (this.blockSvc) {
        const blockedUids = await this.blockSvc.listBlockedBy(uid);
        const blockedSet = new Set(blockedUids);
        filteredFriendsUids = friendsUids.filter(fUid => !blockedSet.has(fUid));
        filteredPendingUids = pendingUids.filter(pUid => !blockedSet.has(pUid));
      }

      const friendsPromises = filteredFriendsUids.map(async (fUid) => {
        const doc = await adminDb.collection(PLAYERS_COLLECTION).doc(fUid).get();
        return doc.exists ? { uid: fUid, ...doc.data() } : null;
      });

      const pendingPromises = filteredPendingUids.map(async (pUid) => {
        const doc = await adminDb.collection(PLAYERS_COLLECTION).doc(pUid).get();
        return doc.exists ? { uid: pUid, ...doc.data() } : null;
      });

      const friends = (await Promise.all(friendsPromises)).filter(Boolean);
      const pending = (await Promise.all(pendingPromises)).filter(Boolean);

      // Obtem o player logado
      const playerDoc = await adminDb.collection(PLAYERS_COLLECTION).doc(uid).get();
      const player = playerDoc.exists ? playerDoc.data() : null;

      if (req.headers.accept?.includes('application/json')) {
        return res.status(200).json({ friends, pending });
      }

      res.render('friends/list', {
        title: 'Amigos',
        subtitle: 'Gerencie suas amizades',
        player,
        friends,
        pending,
      });
    } catch (e: any) {
      console.error('[amigo_list_error]', e?.message || e);
      return res.status(500).json({ error: e?.message || 'list_friends_error' });
    }
  };
}
