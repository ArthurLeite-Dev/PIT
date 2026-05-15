// src/routes.ts
import { Router } from 'express';
import multer from 'multer';
// Factory Method Pattern
import { RepositoryFactory } from './repositories/factory/RepositoryFactory.js';
// Services
import { AuthService } from './services/AuthService.js';
import { OnboardingService } from './services/OnboardingService.js';
import { EditProfileService } from './services/EditProfileService.js';
import { PresenceService } from './services/PresenceService.js';
import { CallService } from './services/CallService.js';
import { AmigoService } from './services/AmigoService.js';
import { NotificationService } from './services/NotificationService.js';
import { ProfileService } from './services/ProfileService.js';
import { BlockService } from './services/BlockService.js';
import { HomeService } from './services/HomeService.js';
// Controllers
import { AuthController } from './controllers/AuthController.js';
import { OnboardingController } from './controllers/OnboardingController.js';
import { EditProfileController } from './controllers/EditProfileController.js';
import { PresenceController } from './controllers/PresenceController.js';
import { CallController } from './controllers/CallController.js';
import { AmigoController } from './controllers/AmigoController.js';
import { NotificationController } from './controllers/NotificationController.js';
import { ProfileController } from './controllers/ProfileController.js';
import { BlockController } from './controllers/BlockController.js';
import { HomeController } from './controllers/HomeController.js';
import { ConsentController } from './controllers/ConsentController.js';
// Middlewares
import { requireAuth } from './web/middlewares/requireAuth.js';
import { validateBody } from './middlewares/validate.js';
// DTOs
import { signUpSchema, loginSchema, resetPasswordSchema, googleLoginSchema } from './dtos/auth.dto.js';
import { createCallSchema } from './dtos/call.dto.js';
import { addFriendSchema } from './dtos/friend.dto.js';
export const routes = Router();
/* ------------------------ Auth (Factory Method) ------------------------ */
const authRepo = RepositoryFactory.createAuthRepository();
const authSvc = new AuthService(authRepo);
const authCtrl = new AuthController(authSvc);
routes.post('/signup', validateBody(signUpSchema), authCtrl.signUp);
routes.post('/login', validateBody(loginSchema), authCtrl.login);
routes.post('/reset-password', validateBody(resetPasswordSchema), authCtrl.resetPassword);
routes.post('/google', validateBody(googleLoginSchema), authCtrl.googleLogin);
routes.get('/auth', (_req, res) => res.redirect(303, '/login'));
routes.get('/login', (req, res) => res.render('auth/login', {
    title: 'Login',
    subtitle: '',
    error: req.query.error || '',
    code: req.query.code || '',
}));
routes.get('/signup', (req, res) => res.render('auth/register', {
    title: 'Cadastro',
    subtitle: '',
    error: req.query.error || '',
    code: req.query.code || '',
}));
routes.get('/register', (req, res) => res.redirect(303, '/signup'));
/* ------------------------ Terms ------------------------ */
routes.get('/terms', (_req, res) => res.render('terms', {
    title: 'Termos de Uso',
    subtitle: '',
}));
/* ------------------------ Consent LGPD ------------------------ */
const consentCtrl = new ConsentController();
routes.get('/consent', requireAuth, consentCtrl.form);
routes.post('/consent', requireAuth, consentCtrl.save);
routes.post('/consent/revoke', requireAuth, consentCtrl.revoke);
/* ------------------------ Upload Config ------------------------ */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter(_req, file, cb) {
        const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype);
        if (ok)
            cb(null, true);
        else
            cb(new Error('unsupported_image_type'));
    },
});
/* ------------------------ Onboarding (MVC) - Factory Method ------------------------ */
const onboardingRepo = RepositoryFactory.createOnboardingRepository();
const onboardingSvc = new OnboardingService(onboardingRepo);
const onboardingCtrl = new OnboardingController(onboardingSvc);
routes.get('/onboarding', requireAuth, onboardingCtrl.form);
routes.post('/onboarding', requireAuth, upload.single('avatar'), onboardingCtrl.submit);
/* ------------------------ Edit Profile (MVC) - Factory Method ------------------------ */
const editProfileRepo = RepositoryFactory.createEditProfileRepository();
const editProfileSvc = new EditProfileService(editProfileRepo);
const editProfileCtrl = new EditProfileController(editProfileSvc);
routes.get('/profile/edit', requireAuth, editProfileCtrl.form);
routes.post('/profile/edit', requireAuth, upload.single('avatar'), editProfileCtrl.update);
routes.patch('/profile/edit/:field', requireAuth, editProfileCtrl.partialUpdate);
/* ------------------------ Block/Report (MVC) - Factory Method ------------------------ */
const blockRepo = RepositoryFactory.createBlockRepository();
const blockSvc = new BlockService(blockRepo);
const blockCtrl = new BlockController(blockSvc);
/* ------------------------ Presence (MVC) - Factory Method ------------------------ */
const presenceRepo = RepositoryFactory.createPresenceRepository();
const presenceSvc = new PresenceService(presenceRepo);
const presenceCtrl = new PresenceController(presenceSvc, blockSvc);
routes.post('/presence/online', requireAuth, presenceCtrl.online);
routes.post('/presence/offline', requireAuth, presenceCtrl.offline);
routes.post('/presence/ping', requireAuth, presenceCtrl.ping);
routes.get('/players/online', requireAuth, presenceCtrl.listOnline);
routes.get('/players/online/similar', requireAuth, presenceCtrl.listSimilar);
/* ------------------------ Notifications - Factory Method ------------------------ */
const notificationRepo = RepositoryFactory.createNotificationRepository();
const notificationSvc = new NotificationService(notificationRepo);
const notificationCtrl = new NotificationController(notificationSvc);
routes.get('/notifications', requireAuth, notificationCtrl.list); // Lista notificações
routes.post('/notifications/:id/read', requireAuth, notificationCtrl.markAsRead); // Marca como lida
routes.delete('/notifications/:id', requireAuth, notificationCtrl.delete); // Deleta notificação
/* ------------------------ Friends (Amigos) - Factory Method ------------------------ */
const amigoRepo = RepositoryFactory.createAmigoRepository();
const amigoSvc = new AmigoService(amigoRepo);
const amigoCtrl = new AmigoController(amigoSvc, blockSvc);
routes.get('/friends', requireAuth, amigoCtrl.list); // Lista amigos e solicitações
routes.post('/friends/add', requireAuth, validateBody(addFriendSchema), amigoCtrl.addFriend); // Adiciona amigo
routes.post('/friends/:friendUid/remove', requireAuth, amigoCtrl.removeFriend); // Remove amigo
routes.post('/friends/:friendUid/accept', requireAuth, amigoCtrl.acceptRequest); // Aceita solicitação
routes.post('/friends/:friendUid/reject', requireAuth, amigoCtrl.rejectRequest); // Rejeita solicitação
/* ------------------------ Call (Chamados) - Factory Method ------------------------ */
const callRepo = RepositoryFactory.createCallRepository();
const callSvc = new CallService(callRepo);
const callCtrl = new CallController(callSvc, notificationSvc, amigoSvc, blockSvc);
// Rotas de chamados
routes.get('/calls', requireAuth, callCtrl.listOpen); // Lista chamados (JSON para API)
routes.post('/calls', requireAuth, validateBody(createCallSchema), callCtrl.create); // Cria novo chamado
routes.post('/calls/:id/join', requireAuth, callCtrl.join); // Participa de um chamado
routes.post('/calls/:id/close', requireAuth, callCtrl.close); // Fecha um chamado
routes.post('/calls/:id/leave', requireAuth, callCtrl.leave); // Sai do chamado (não dono)
routes.get('/calls/:id', requireAuth, callCtrl.getById); // Detalhes do chamado
routes.post('/calls/:id/remove/:participantUid', requireAuth, callCtrl.removeParticipant); // Remove participante
/* ------------------------ Profile (Visualização) - Factory Method ------------------------ */
const profileRepo = RepositoryFactory.createProfileRepository();
const profileSvc = new ProfileService(profileRepo);
const profileCtrl = new ProfileController(profileSvc, amigoSvc, blockSvc);
routes.get('/profile/:uid', requireAuth, profileCtrl.view); // Visualizar perfil de outro jogador
routes.get('/profile/edit', requireAuth, profileCtrl.editForm); // Editar próprio perfil
routes.post('/profile/update', requireAuth, profileCtrl.update); // Atualizar próprio perfil
/* ------------------------ Block/Report (Denúncia e Bloqueio) ------------------------ */
routes.get('/block/report/:uid', requireAuth, blockCtrl.reportForm); // Página de denúncia
routes.post('/block/report', requireAuth, blockCtrl.report); // Processa denúncia com email
routes.post('/block/unblock/:uid', requireAuth, blockCtrl.unblock); // Desbloqueia usuário
routes.post('/block/:uid', requireAuth, blockCtrl.block); // Apenas bloqueia usuário (deve vir por último para não conflitar)
/* ------------------------ Home - Factory Method ------------------------ */
const homeSvc = new HomeService(callSvc, notificationSvc, profileSvc);
const homeCtrl = new HomeController(homeSvc);
routes.get('/home', requireAuth, homeCtrl.home);
/* ------------------------ Root (Opção A) ------------------------ */
routes.get('/', (_req, res) => res.redirect('/auth'));
/* ------------------------ Health ------------------------ */
routes.get('/health', (_req, res) => res.status(200).send('ok'));
export default routes;
