# 🎮 Co-Up: Play Better, Play Together

> Plataforma online voltada para o público gamer, oferecendo um ambiente digital onde os usuários possam se conectar, interagir e formar comunidades. O site funciona como um ponto de encontro virtual, permitindo que jogadores de diferentes perfis e regiões se encontrem, conversem, compartilhem experiências e desenvolvam relações sociais em torno de interesses comuns relacionados a jogos eletrônicos.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Integrantes](#-integrantes)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Executando o Projeto](#-executando-o-projeto)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [API e Rotas](#-api-e-rotas)
- [Contribuindo](#-contribuindo)

---

## 🎯 Sobre o Projeto

O **Co-Up** é uma plataforma web completa que promove engajamento social, troca de informações e networking entre gamers. A plataforma não se limita apenas à interação casual, mas também fortalece a comunidade e incentiva a colaboração e o entretenimento dentro do universo dos games.

### Principais Características

- ✅ Sistema de autenticação com e-mail e senha
- ✅ Perfis de jogadores personalizáveis com jogos favoritos, gêneros e estilos
- ✅ Sistema de chamados (LFG - Looking for Group) para encontrar jogadores
- ✅ Sistema de presença online em tempo quase real
- ✅ Sugestões automáticas de jogadores compatíveis
- ✅ Sistema de amizades e solicitações
- ✅ Bloqueio e denúncia de usuários
- ✅ Interface responsiva e moderna
- 🚧 Login com Google (planejado, **não implementado**)
- 🚧 Sistema de notificações (planejado, **não implementado**)

---

## 👥 Integrantes

| Nome                                | Matrícula |
|-------------------------------------|-----------|
| André Sette Camara Pereira          | 22300201  |
| Ariel Calebe Carneiro Martins       | 22300066  |
| Arthur da Silva Leite               | 22301976  |
| João Vitor Padilha Ferreira         | 22300503  |
| João Vitor Feliciano Pires          | 22402837  |
| Laura Ormy Santos Di Francesco      | 22301763  |

**Turma:** 3A2

---

## 🛠️ Tecnologias

### Backend

- **Node.js** + **TypeScript** (ES2022)
- **Express.js** 5.1.0 (Framework web)
- **Firebase Admin SDK** (Firestore Database)
- **Nodemailer** (Envio de emails para denúncias)

### Frontend

- **EJS** + **ejs-mate** (Templating engine)
- **CSS3** (Estilização customizada)
- **JavaScript** (Vanilla)

### Ferramentas de Desenvolvimento

- **ESLint** + **Prettier** (Code quality)
- **tsx** (TypeScript execution)
- **Multer** (Upload de arquivos)

### Banco de Dados

- **Firebase Firestore** (NoSQL database)

---

## 📦 Pré-requisitos

- **Node.js** >= 18.x
- **npm** >= 9.x (ou yarn/pnpm)
- Conta **Firebase** com projeto configurado
- Credenciais do **Firebase Admin SDK** (arquivo de service account)

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/Ariel-Calebe/Pit.git
cd Pit-main
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Firebase
FIREBASE_PROJECT_ID=seu-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-project.iam.gserviceaccount.com
FIREBASE_WEB_API_KEY=sua-web-api-key

# Servidor
PORT=3000
NODE_ENV=development

# Email (Opcional - para denúncias)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
```

**Nota:** Para obter as credenciais do Firebase:
1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Configurações do Projeto** → **Contas de serviço**
4. Clique em **Gerar nova chave privada**

---

## ⚙️ Configuração

### Firebase Setup

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o **Firestore Database**
3. Configure as regras de segurança (exemplo básico para desenvolvimento):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Ative a **Authentication** com o provedor:
   - Email/Password
   - (Google pode ser configurado depois, mas o login com Google ainda não foi implementado no sistema)

### Estrutura de Coleções no Firestore

O projeto utiliza as seguintes coleções:

- `players` – Perfis de jogadores
- `calls` – Chamados (LFG)
- `friendships` – Amizades e solicitações
- `presence` – Presença online
- `blocks` – Bloqueios e denúncias
- (coleções de notificações podem existir como estrutura, mas não há fluxo funcional para RF19)

---

## 🎮 Executando o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

O servidor iniciará em `http://localhost:3000`.

### Modo Produção

```bash
# Compilar TypeScript
npm run build

# Executar build
npm run start
```

### Scripts Disponíveis

```bash
npm run dev          # Inicia em modo desenvolvimento (hot reload)
npm run build        # Compila TypeScript para JavaScript
npm run start        # Executa o build em produção
npm run lint         # Executa ESLint
npm run lint:fix     # Corrige problemas do ESLint automaticamente
npm run format       # Formata código com Prettier
npm run format:check # Verifica formatação sem modificar
```

---

## 📁 Estrutura do Projeto

```
Pit-main/
├── src/
│   ├── config/           # Configurações (Firebase, env)
│   ├── controllers/      # Controllers (MVC)
│   ├── interfaces/       # Interfaces e contratos
│   ├── models/           # Modelos de dados
│   ├── repositories/     # Camada de acesso a dados
│   │   └── firebase/     # Implementações Firebase
│   ├── services/         # Lógica de negócio
│   ├── views/            # Templates EJS
│   │   ├── auth/         # Páginas de autenticação
│   │   ├── block/        # Páginas de bloqueio/denúncia
│   │   ├── calls/        # Páginas de chamados
│   │   ├── friends/      # Páginas de amigos
│   │   └── presence/     # Widgets de presença
│   ├── web/              # Middlewares e utilities web
│   └── types/            # Definições de tipos TypeScript
├── public/               # Arquivos estáticos
│   ├── images/           # Imagens
│   ├── css/              # Estilos CSS
│   └── js/               # Scripts JavaScript
├── dist/                 # Build compilado (gerado)
├── .trash/               # Arquivos removidos (backup)
├── docs/                 # Documentação
├── index.ts              # Ponto de entrada
├── package.json          # Dependências e scripts
├── tsconfig.json         # Configuração TypeScript
├── eslint.config.js      # Configuração ESLint
└── .prettierrc           # Configuração Prettier
```

---

## ✨ Funcionalidades Implementadas

**Status por RF:**
✔️ Implementado · ⚠️ Parcialmente implementado · ❌ Não implementado

### 🧱 Bloco Base: Autenticação e Perfil

- ✔️ **RF01** — Criar conta
  - Sistema completo de cadastro com validação
  - Integração com onboarding após cadastro

- ✔️ **RF09** — Login com e-mail e senha
  - Autenticação via Firebase Auth
  - Sessão via cookies

- ✔️ **RF10** — Recuperação de senha
  - Envio de e-mail de redefinição via Firebase
  - Endpoint: `POST /reset-password`

- ✔️ **RF02** — Configurar perfil com nome, foto e jogos favoritos
  - Onboarding completo na primeira entrada
  - Upload de avatar
  - Seleção de jogos, plataformas, idiomas, gêneros e estilos

- ✔️ **RF17** — Editar perfil
  - Edição completa do perfil
  - Atualização de todas as informações
  - Endpoints: `GET /profile/edit`, `POST /profile/edit`

- ❌ **RF11** — Login com Google (extra)
  - Planejado para o futuro
  - Endpoint `POST /google` ainda não implementado

---

### 🔍 Bloco de Busca e Matchmaking

- ✔️ **RF05** — Sistema de chamados (publicar convites)
  - Criação de chamados LFG (Looking for Group)
  - Filtros por jogo, plataforma, tipo (friendly/competitive), estilos
  - Visualização e gerenciamento de chamados
  - Participação em chamados
  - Endpoints:
    - `GET /calls`
    - `POST /calls`
    - `POST /calls/:id/join`

- ⚠️ **RF03** — Buscar jogadores por jogo e plataforma
  - **Parcialmente implementado**
  - Busca via listagem de chamados e presença online
  - Filtros incluem `gameId` e `platform` nos chamados

- ⚠️ **RF07** — Filtros de busca (nível, objetivo, idioma, região, etc.)
  - **Parcialmente implementado** via filtros em chamados:
    - `gameId`
    - `callFriendly` (friendly/competitive)
    - `playstyles`
    - `search`
  - Filtros avançados de perfil (nível, região etc.) ainda não implementados

- ✔️ **RF16** — Sugestões automáticas de jogadores compatíveis
  - Sistema de jogadores semelhantes baseado em:
    - Jogos favoritos em comum
    - Gêneros favoritos em comum
    - Plataformas em comum
  - Endpoint: `GET /players/online/similar`
  - Widget na home mostrando jogadores compatíveis

---

### 👥 Bloco de Interações e Conexões

- ✔️ **RF06** — Visualizar perfil de outros usuários
  - Página completa de perfil
  - Exibição de informações públicas
  - Ações: adicionar amigo, denunciar/bloquear
  - Endpoint: `GET /profile/:uid`

- ✔️ **RF04** — Adicionar jogador aos favoritos
  - Sistema completo de amizades
  - Envio e recebimento de solicitações
  - Aceitar/rejeitar solicitações
  - Lista de amigos
  - Endpoints:
    - `POST /friends/add`
    - `POST /friends/:uid/accept`
    - `POST /friends/:uid/reject`

- ❌ **RF19** — Notificações de chamados aceitos
  - **Não implementado**
  - Não há fluxo funcional de notificação para eventos de chamados

- ❌ **RF08** — Chat básico entre usuários
  - **Não implementado**

---

### 🛡️ Bloco de Segurança e Controle

- ✔️ **RF13** — Bloquear jogadores
  - Bloqueio completo de usuários
  - Usuários bloqueados não aparecem nas listas
  - Não é possível visualizar perfil de bloqueados
  - Endpoint: `POST /block/:uid`

- ✔️ **RF14** — Denunciar comportamento inadequado
  - Página de denúncia completa
  - Instruções para envio de e-mail manual
  - Bloqueio automático após denúncia
  - Endpoints:
    - `GET /block/report/:uid`
    - `POST /block/report`

- ❌ **RF20** — Avaliação pós-partida (nota + comentário)
  - **Não implementado**

- ❌ **RF18** — Chat restrito a jogadores verificados
  - **Não implementado**

---

### 🧹 Bloco de Gestão da Conta

- ❌ **RF12** — Excluir conta e dados permanentemente
  - **Não implementado**
  - Requer fluxo via Firebase Admin SDK (ainda não desenvolvido)

- ❌ **RF15** — Histórico de partidas jogadas
  - **Não implementado**
  - Estrutura de dados `Call` existe, mas não há visualização de histórico

---

## 🔌 API e Rotas

*Algumas rotas podem estar planejadas, mas não implementadas (especialmente login com Google e notificações).*

### Autenticação
```
POST   /signup              # Criar conta
POST   /login               # Login com email/senha
POST   /reset-password      # Solicitar redefinição de senha
# POST /google              # (planejado) Login com Google - ainda não implementado
GET    /login               # Página de login
GET    /signup              # Página de cadastro
```

### Perfil
```
GET    /profile/:uid         # Visualizar perfil de outro jogador
GET    /profile/edit         # Editar próprio perfil
POST   /profile/edit         # Atualizar perfil
POST   /onboarding           # Completar onboarding
```

### Chamados (LFG)
```
GET    /calls                # Listar chamados abertos
POST   /calls                # Criar chamado
GET    /calls/:id            # Detalhes do chamado
POST   /calls/:id/join       # Participar de chamado
POST   /calls/:id/close     # Fechar chamado
POST   /calls/:id/leave     # Sair do chamado
```

### Amigos
```
GET    /friends              # Listar amigos e solicitações
POST   /friends/add         # Enviar solicitação de amizade
POST   /friends/:uid/accept # Aceitar solicitação
POST   /friends/:uid/reject # Rejeitar solicitação
POST   /friends/:uid/remove # Remover amigo
```

### Presença
```
POST   /presence/online           # Marcar como online
POST   /presence/offline          # Marcar como offline
POST   /presence/ping             # Heartbeat de presença
GET    /players/online            # Listar jogadores online
GET    /players/online/similar    # Jogadores similares
```

### Notificações (planejado, não implementado)
```
# GET    /notifications            # (planejado) Listar notificações
# POST   /notifications/:id/read   # (planejado) Marcar como lida
# DELETE /notifications/:id        # (planejado) Deletar notificação
```

### Bloqueio/Denúncia
```
GET    /block/report/:uid    # Página de denúncia
POST   /block/report         # Enviar denúncia
POST   /block/:uid           # Bloquear usuário
POST   /block/unblock/:uid   # Desbloquear usuário
```

### Outras
```
GET    /home                 # Página inicial
GET    /terms                # Termos de uso
GET    /health               # Health check
GET    /                     # Redireciona para /home ou /login
```

---

## 🎨 Interface

A interface foi desenvolvida com foco em:

- **Design moderno**: UI/UX inspirada em aplicativos gaming
- **Responsividade**: Totalmente responsivo para mobile, tablet e desktop
- **Tema escuro**: Design dark theme focado em conforto visual para gamers
- **Acessibilidade**: Estrutura semântica e contraste adequado

---

## 📝 Checklist Geral de Funcionalidades

*Consolidação final dos RFs*

- ✔️ Cadastro de usuários
- ✔️ Login com autenticação (e-mail/senha)
- ✔️ Perfil de usuário com jogos favoritos (onboarding + edição)
- ⚠️ Busca por jogadores com filtros (parcial — via chamados/presença)
- ✔️ Sistema de chamados para partidas
- ✔️ Visualização de perfil de outros jogadores
- ✔️ Adição de favoritos (amizades)
- ❌ Chat interno entre jogadores
- ✔️ Redefinição de senha
- ❌ Login com Google
- ❌ Exclusão de conta e dados
- ✔️ Bloqueio de usuários
- ✔️ Denúncia de comportamento
- ❌ Histórico de partidas
- ✔️ Sugestão automática de jogadores compatíveis

---

## 🚧 Funcionalidades Pendentes

### Alta Prioridade
- ❌ Sistema de chat entre usuários (RF08)
- ❌ Histórico de partidas jogadas (RF15)
- ❌ Avaliação pós-partida (RF20)

### Média Prioridade
- ❌ Busca avançada de jogadores fora dos chamados (RF03/RF07 completos)
- ❌ Verificação de usuários (para chat restrito — RF18)
- ❌ Sistema de notificações funcional (RF19)

### Baixa Prioridade
- ❌ Login com Google (RF11)
- ❌ Notificações push
- ❌ Integração com Discord
- ❌ Sistema de grupos/clãs
- ❌ Sistema de badges e conquistas

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NomeDaFeature`)
3. Commit suas mudanças (`git commit -m 'Add feature X'`)
4. Push para a branch (`git push origin feature/NomeDaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto foi desenvolvido como trabalho acadêmico para a turma 3A2.

---

## 📧 Contato

Para dúvidas ou sugestões sobre o projeto, entre em contato através do email de suporte:

**suporte.coup@gmail.com**

---

**Desenvolvido com ❤️ pela equipe Co-Up**
