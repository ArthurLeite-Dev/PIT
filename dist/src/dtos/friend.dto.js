// src/dtos/friend.dto.ts
import { z } from 'zod';
/**
 * Schema Zod para adicionar amigo
 */
export const addFriendSchema = z.object({
    friendUid: z.string().min(1, 'UID do amigo é obrigatório'),
});
/**
 * Schema Zod para aceitar/rejeitar solicitação
 */
export const friendRequestSchema = z.object({
    friendUid: z.string().min(1, 'UID do amigo é obrigatório'),
});
