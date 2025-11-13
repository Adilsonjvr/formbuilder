# Guia de Deployment - FormBuilder

Este documento descreve como fazer o deployment do FormBuilder na Vercel.

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Conta no [Supabase](https://supabase.com) (para banco de dados PostgreSQL)
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Node.js 20+ instalado localmente

## 🏗️ Arquitetura

O projeto está dividido em dois componentes principais:

### Frontend (Next.js)
- **Framework:** Next.js 16.0.2 com App Router
- **Localização:** `/frontend`
- **Porta de desenvolvimento:** 4000
- **Deploy:** Vercel

### Backend (Express.js)
- **Framework:** Express.js + Prisma ORM
- **Localização:** `/` (raiz do projeto)
- **Porta de desenvolvimento:** 3000
- **Database:** PostgreSQL (Supabase)
- **Deploy:** Vercel (com configuração específica)

---

## 🚀 Deploy do Frontend

### 1. Preparação

#### 1.1 Configurar variáveis de ambiente

Crie um arquivo `.env.local` na pasta `frontend/` baseado no `.env.example`:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
NEXT_PUBLIC_APP_URL=https://your-frontend-url.vercel.app
```

> **Nota:** Você obterá essas URLs após o primeiro deploy.

### 2. Deploy via Vercel Dashboard

#### 2.1 Conectar repositório

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New Project"**
3. Importe seu repositório Git
4. Selecione o repositório `formbuilder`

#### 2.2 Configurar projeto

**Framework Preset:** Next.js

**Root Directory:** `frontend` (IMPORTANTE!)

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```bash
.next
```

**Install Command:**
```bash
npm install
```

#### 2.3 Configurar Environment Variables

Adicione as seguintes variáveis no painel da Vercel:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.vercel.app` | URL do backend |
| `NEXT_PUBLIC_APP_URL` | `https://your-frontend-url.vercel.app` | URL do frontend |

#### 2.4 Deploy

1. Clique em **"Deploy"**
2. Aguarde o build e deploy (≈ 2-3 minutos)
3. Anote a URL gerada (ex: `formbuilder-frontend.vercel.app`)

---

## 🔧 Deploy do Backend

### 1. Preparação do Banco de Dados (Supabase)

#### 1.1 Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote as credenciais:
   - **Database URL**: Settings → Database → Connection String (URI)
   - **Supabase URL**: Settings → API → Project URL
   - **Anon Key**: Settings → API → anon public

#### 1.2 Executar migrations

No terminal local:

```bash
# Configure DATABASE_URL localmente
export DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Execute as migrations
npm run migrate

# Gere o Prisma Client
npm run prisma:generate
```

### 2. Deploy via Vercel

#### 2.1 Configurar projeto separado

1. Na Vercel, crie **outro projeto** (separado do frontend)
2. Importe o **mesmo repositório**
3. Configure:

**Framework Preset:** Other

**Root Directory:** `.` (raiz do projeto)

**Build Command:**
```bash
npm run build && npm run prisma:generate
```

**Output Directory:** `dist`

**Install Command:**
```bash
npm install
```

#### 2.2 Configurar Environment Variables

Adicione todas as variáveis do `.env.example`:

| Variable | Value | Required |
|----------|-------|----------|
| `PORT` | `3000` | Sim |
| `DATABASE_URL` | `postgresql://...` (do Supabase) | Sim |
| `SUPABASE_URL` | URL do projeto Supabase | Sim |
| `SUPABASE_ANON_KEY` | Anon key do Supabase | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key do Supabase | Sim |
| `JWT_ACCESS_TOKEN_SECRET` | String aleatória segura | Não |
| `JWT_REFRESH_TOKEN_SECRET` | String aleatória segura | Não |

> **Gerar secrets JWT:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
> ```

#### 2.3 Configurar vercel.json na raiz

Crie ou atualize `vercel.json` na raiz do projeto:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
```

#### 2.4 Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (≈ 3-5 minutos)
3. Anote a URL do backend (ex: `formbuilder-api.vercel.app`)

---

## 🔄 Atualizar URLs entre Frontend e Backend

### 1. Atualizar Frontend

1. Acesse o projeto frontend na Vercel
2. Settings → Environment Variables
3. Atualize `NEXT_PUBLIC_API_URL` com a URL do backend
4. Redeploy: Deployments → ⋯ → Redeploy

### 2. Atualizar Backend (CORS)

Verifique se o backend aceita requisições do frontend:

```typescript
// src/server.ts ou src/app.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4000',
  credentials: true
}));
```

Adicione variável no backend na Vercel:

| Variable | Value |
|----------|-------|
| `FRONTEND_URL` | URL do frontend (ex: `https://formbuilder.vercel.app`) |

---

## 🧪 Testar Deployment

### Checklist

- [ ] Frontend carrega corretamente
- [ ] Dashboard exibe formulários
- [ ] Criação de formulários funciona
- [ ] Drag and drop funciona
- [ ] Preview do formulário funciona
- [ ] Formulário público aceita respostas
- [ ] Analytics exibe dados
- [ ] Exportar CSV funciona
- [ ] File upload funciona

### Testes específicos

#### 1. Teste de API
```bash
curl https://your-backend-url.vercel.app/forms
```

#### 2. Teste de CORS
Abra o DevTools do browser no frontend e verifique se não há erros de CORS ao criar um formulário.

#### 3. Teste de File Upload
1. Crie um formulário com campo FILE
2. Abra o formulário público
3. Faça upload de um arquivo
4. Verifique se o upload completa sem erros

---

## 🔍 Troubleshooting

### Erro: "Failed to fetch forms"

**Causa:** Backend não está acessível ou CORS bloqueado

**Solução:**
1. Verifique se a URL do backend está correta em `NEXT_PUBLIC_API_URL`
2. Verifique se o CORS está configurado no backend com a URL do frontend
3. Verifique logs do backend na Vercel: Backend Project → Deployments → Click no deployment → View Function Logs

### Erro: "Database connection failed"

**Causa:** DATABASE_URL incorreta ou Prisma Client não gerado

**Solução:**
1. Verifique se a DATABASE_URL está correta nas Environment Variables do backend
2. Adicione `npm run prisma:generate` ao build command
3. Redeploy o backend

### Erro: File Upload não funciona

**Causa:** Endpoint /upload não configurado ou não acessível

**Solução:**
1. Verifique se o backend tem a rota `/upload` implementada
2. Verifique se a URL em `lib/upload.ts` está correta
3. Considere usar um serviço de upload como Cloudinary ou AWS S3 para produção

### Build do frontend falha

**Causa:** Dependências faltando ou erro de tipo

**Solução:**
1. Execute `npm run build` localmente para identificar o erro
2. Verifique se todas as dependências estão em `package.json`
3. Verifique os logs de build na Vercel

---

## 🔒 Segurança

### Checklist de Segurança

- [ ] Todas as secrets (JWT, API keys) estão em Environment Variables, não no código
- [ ] DATABASE_URL não está exposta no frontend
- [ ] CORS configurado apenas para o domínio do frontend
- [ ] Rate limiting configurado no backend
- [ ] Headers de segurança configurados (via `vercel.json`)
- [ ] HTTPS habilitado (automático na Vercel)

### Headers de Segurança (já configurado em frontend/vercel.json)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 📚 Recursos Adicionais

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Prisma](https://www.prisma.io/docs)

---

## 🆘 Suporte

Para problemas ou dúvidas:
1. Verifique os logs na Vercel (Deployments → View Function Logs)
2. Verifique o console do browser para erros no frontend
3. Teste as APIs diretamente com curl ou Postman
4. Consulte a documentação da Vercel e Next.js

---

**Última atualização:** $(date +%Y-%m-%d)
