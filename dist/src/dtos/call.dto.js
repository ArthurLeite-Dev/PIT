// src/dtos/call.dto.ts
import { z } from 'zod';
/**
 * Schema Zod para criar chamado LFG
 */
export const createCallSchema = z.object({
    title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').max(100, 'Título muito longo'),
    description: z.string().max(500, 'Descrição muito longa').optional(),
    gameId: z.string().min(1, 'ID do jogo é obrigatório'),
    platform: z.string().min(1, 'Plataforma é obrigatória'),
    callFriendly: z.enum(['friendly', 'competitive'], {
        errorMap: () => ({ message: 'Tipo deve ser friendly ou competitive' }),
    }),
    playstyles: z.array(z.string()).optional(),
});
/**
 * Schema Zod para join em chamado
 */
export const joinCallSchema = z.object({
    id: z.string().min(1, 'ID do chamado é obrigatório'),
});
