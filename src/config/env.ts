import 'dotenv/config';

// 🔒 Variáveis obrigatórias
const required = [
  'PORT',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_SERVICE_ACCOUNT_BASE64',
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
}

// ✅ Exporta valores tipados
export const env = {
  port: Number(process.env.PORT),
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    serviceAccountBase64: process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!,
  },
};
