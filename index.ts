// index.ts
import './src/config/firebaseAdmin'; // Inicializa Firebase Admin antes de tudo
import { registerEventHandlers } from './src/bootstrap/events.js'; // Registra event handlers

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import crypto from 'node:crypto';

import ejsMate from 'ejs-mate';
import { env } from './src/config/env.js';
import routes from './src/routes.js';

const app = express();
const isProd = process.env.NODE_ENV === 'production';

/* ------------------------ Proxy & trust (p/ cookies secure em produção) ------------------------ */
if (isProd) {
  // Necessário se estiver atrás de Nginx/Cloudflare/Heroku etc. para que cookies `secure` funcionem
  app.set('trust proxy', 1);
}

/* ------------------------ View Engine (EJS + ejs-mate) ------------------------ */
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src', 'views'));
app.locals.subtitle = '';

/* ------------------------ Static Assets ------------------------ */
app.use(express.static(path.join(process.cwd(), 'public')));

/* ------------------------ Per-request CSP nonce ------------------------ */
app.use((req, res, next) => {
  // nonce para uso em <script nonce="<%= cspNonce %>"> nas views (quando for retirar inline)
  (res.locals as any).cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

/* ------------------------ Helmet (CSP pronto para produção) ------------------------ */
/**
 * Em desenvolvimento:
 *  - permite inline scripts e CDN do Tailwind
 * Em produção:
 *  - bloqueia inline por padrão; permite apenas scripts com nonce
 *  - (se precisar manter inline temporariamente, defina CSP_ALLOW_INLINE=true no .env)
 */
const allowInline = !isProd || process.env.CSP_ALLOW_INLINE === 'true';
const corsOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);

app.use(helmet({
  // CSP com diretivas diferenciadas por ambiente
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "base-uri": ["'self'"],
      "object-src": ["'none'"],
      "frame-ancestors": ["'self'"],
      "img-src": ["'self'", "data:"],
      "style-src": ["'self'", "'unsafe-inline'"], // Tailwind injeta <style>; para produção real, troque por CSS pré-compilado
      "connect-src": ["'self'"], // fetch/XHR para mesma origem
      "script-src": [
        "'self'",
        ...(allowInline ? ["'unsafe-inline'"] : []),
        // Em produção, permitir apenas scripts com nonce
        ...(!allowInline ? [ (req: any, res: any) => `'nonce-${res.locals.cspNonce}'` ] : []),
        // Em dev, permitir CDN do Tailwind
        ...(!isProd ? ["https://cdn.tailwindcss.com"] : []),
      ] as any
    }
  },
  // Alguns ambientes precisam disso desativado quando servindo estáticos locais
  crossOriginEmbedderPolicy: false,
}));

/* ------------------------ CORS (preparado p/ produção) ------------------------ */
app.use(cors({
  credentials: true,
  origin: (origin, cb) => {
    // Sem Origin (ex.: curl, apps nativas) → permite
    if (!origin) return cb(null, true);
    if (corsOrigins.length === 0 && !isProd) {
      // Em dev, se não configurar CORS_ORIGIN, permite qualquer origem local
      return cb(null, true);
    }
    if (corsOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS: origin not allowed'), false);
  },
}));

/* ------------------------ Parsers & cookies ------------------------ */
app.use(express.urlencoded({ limit: '1mb', extended: true } as any)); // TS: option cast para manter compat
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

/* ------------------------ Event Handlers ------------------------ */
registerEventHandlers();

/* ------------------------ Rotas ------------------------ */
app.use(routes);

/* ------------------------ Start ------------------------ */
app.listen(env.port, () => {
  console.log(`✅ API rodando em http://localhost:${env.port}`);
  console.log(`🔐 Mode: ${isProd ? 'production (CSP nonce enabled)' : 'development (CSP allows inline + Tailwind CDN)'}`);
  if (!isProd) {
    console.log('💡 Dev note: add default-avatar.png and favicon.ico under /public for 404-free assets.');
  } else if (allowInline) {
    console.log('⚠️ CSP_ALLOW_INLINE=true: inline scripts allowed in production. Consider migrating to nonce-based inline scripts.');
  } else {
    console.log('ℹ️ Add nonce to inline <script>: <script nonce="<%= cspNonce %>"> ... </script>');
  }
});
