// src/services/BlockService.ts
import { IBlockRepository } from '../interfaces/IBlockRepository.js';
import { EmailService } from './EmailService.js';
import { adminDb } from '../config/firebaseAdmin.js';
import { PLAYERS_COLLECTION } from '../models/Player.js';

export interface ReportUserDTO {
  reportedUid: string;
  reason: string;
}

export class BlockService {
  private emailService = new EmailService();

  constructor(private readonly repo: IBlockRepository) {}

  /**
   * Denuncia e bloqueia um usuário
   */
  async reportAndBlock(reporterUid: string, dto: ReportUserDTO): Promise<void> {
    if (reporterUid === dto.reportedUid) {
      throw new Error('cannot_report_self');
    }

    // Verifica se já está bloqueado
    const alreadyBlocked = await this.repo.isBlocked(reporterUid, dto.reportedUid);
    if (alreadyBlocked) {
      throw new Error('user_already_blocked');
    }

    // Busca informações dos usuários
    const [reporterDoc, reportedDoc] = await Promise.all([
      adminDb.collection(PLAYERS_COLLECTION).doc(reporterUid).get(),
      adminDb.collection(PLAYERS_COLLECTION).doc(dto.reportedUid).get(),
    ]);

    const reporter = reporterDoc.exists ? reporterDoc.data() : null;
    const reported = reportedDoc.exists ? reportedDoc.data() : null;

    if (!reporter) {
      throw new Error('reporter_not_found');
    }

    if (!reported) {
      throw new Error('reported_user_not_found');
    }

    // Cria o bloqueio
    await this.repo.create({
      reporterUid,
      reportedUid: dto.reportedUid,
      reason: dto.reason,
      reportedAt: new Date(),
    });

    // Envia email de denúncia
    try {
      await this.emailService.sendReportEmail(
        reporter.name || 'Usuário sem nome',
        reporter.email || 'email@nao.informado',
        dto.reportedUid,
        reported.name || 'Usuário sem nome',
        dto.reason
      );
    } catch (error) {
      console.error('[BlockService] Erro ao enviar email de denúncia:', error);
      // Não falha o bloqueio se o email falhar
    }
  }

  /**
   * Verifica se um usuário bloqueou outro
   */
  async isBlocked(reporterUid: string, reportedUid: string): Promise<boolean> {
    return this.repo.isBlocked(reporterUid, reportedUid);
  }

  /**
   * Lista todos os UIDs bloqueados por um usuário
   */
  async listBlockedBy(reporterUid: string): Promise<string[]> {
    return this.repo.listBlockedBy(reporterUid);
  }

  /**
   * Apenas bloqueia um usuário (sem enviar email)
   */
  async block(reporterUid: string, reportedUid: string): Promise<void> {
    if (reporterUid === reportedUid) {
      throw new Error('cannot_block_self');
    }

    // Verifica se já está bloqueado
    const alreadyBlocked = await this.repo.isBlocked(reporterUid, reportedUid);
    if (alreadyBlocked) {
      throw new Error('user_already_blocked');
    }

    // Busca informações do usuário reportado
    const reportedDoc = await adminDb.collection(PLAYERS_COLLECTION).doc(reportedUid).get();
    const reported = reportedDoc.exists ? reportedDoc.data() : null;

    if (!reported) {
      throw new Error('reported_user_not_found');
    }

    // Cria o bloqueio sem enviar email
    await this.repo.create({
      reporterUid,
      reportedUid,
      reason: 'Usuário bloqueado manualmente',
      reportedAt: new Date(),
    });
  }

  /**
   * Remove um bloqueio (desbloqueio)
   */
  async unblock(reporterUid: string, reportedUid: string): Promise<void> {
    return this.repo.remove(reporterUid, reportedUid);
  }
}
