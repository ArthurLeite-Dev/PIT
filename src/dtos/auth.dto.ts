// src/dtos/auth.dto.ts
import { z } from 'zod';

/**
 * Schema Zod para SignUp
 */
export const signUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(1, 'Nome é obrigatório').max(80, 'Nome muito longo'),
  country: z.string().optional(),
  languages: z.array(z.string()).optional(),
  favoriteGameIds: z.array(z.string()).optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
  avatar: z.string().optional(),
  platforms: z.array(z.string()).optional(),
});

export type SignUpDTO = z.infer<typeof signUpSchema>;

/**
 * Schema Zod para Login
 */
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginDTO = z.infer<typeof loginSchema>;

/**
 * Schema Zod para Reset Password
 */
export const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;

/**
 * Schema Zod para Google Login
 */
export const googleLoginSchema = z.object({
  idToken: z.string().min(1, 'ID Token é obrigatório'),
});

export type GoogleLoginDTO = z.infer<typeof googleLoginSchema>;

