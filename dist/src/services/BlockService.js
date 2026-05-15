import { EmailService } from './EmailService.js';
import { adminDb } from '../config/firebaseAdmin.js';
import { PLAYERS_COLLECTION } from '../models/Player.js';
export class BlockService {
    repo;
    emailService = new EmailService();
    constructor(repo) {
        this.repo = repo;
    }
    /**
     * Denuncia e bloqueia um usuário
     */
    async reportAndBlock(reporterUid, dto) {
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
            await this.emailService.sendReportEmail(reporter.name || 'Usuário sem nome', reporter.email || 'email@nao.informado', dto.reportedUid, reported.name || 'Usuário sem nome', dto.reason);
        }
        catch (error) {
            console.error('[BlockService] Erro ao enviar email de denúncia:', error);
            // Não falha o bloqueio se o email falhar
        }
    }
    /**
     * Verifica se um usuário bloqueou outro
     */
    async isBlocked(reporterUid, reportedUid) {
        return this.repo.isBlocked(reporterUid, reportedUid);
    }
    /**
     * Lista todos os UIDs bloqueados por um usuário
     */
    async listBlockedBy(reporterUid) {
        return this.repo.listBlockedBy(reporterUid);
    }
    /**
     * Apenas bloqueia um usuário (sem enviar email)
     */
    async block(reporterUid, reportedUid) {
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
    async unblock(reporterUid, reportedUid) {
        return this.repo.remove(reporterUid, reportedUid);
    }
}
