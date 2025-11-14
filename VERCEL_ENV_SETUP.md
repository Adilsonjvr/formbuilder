# Configuração de Variáveis de Ambiente no Vercel

## ⚠️ IMPORTANTE

As seguintes variáveis de ambiente **DEVEM** estar configuradas no Vercel Dashboard para a aplicação funcionar corretamente em produção.

## 🔐 Variáveis Obrigatórias

### 1. DATABASE_URL
**Descrição:** String de conexão com PostgreSQL
**Ambiente:** Production, Preview, Development
**Valor Exemplo:**
```
postgresql://postgres.PROJECT:PASSWORD@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**⚠️ IMPORTANTE:** Use a **conexão via pooler** (porta 6543) em produção para ambientes serverless!

**Como obter:**
1. Acesse seu projeto no Supabase
2. Settings → Database
3. Copie a connection string com `pgbouncer=true`

---

### 2. JWT_ACCESS_TOKEN_SECRET
**Descrição:** Chave secreta para tokens JWT de acesso
**Ambiente:** Production, Preview, Development
**Valor:** String aleatória com pelo menos 32 caracteres

**Gerar valor:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 3. JWT_REFRESH_TOKEN_SECRET
**Descrição:** Chave secreta para tokens JWT de refresh
**Ambiente:** Production, Preview, Development
**Valor:** String aleatória com pelo menos 32 caracteres (diferente do ACCESS)

**Gerar valor:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔧 Variáveis Opcionais

### 4. SUPABASE_URL
**Descrição:** URL do projeto Supabase (para uploads de arquivos)
**Ambiente:** Production, Preview, Development
**Valor Exemplo:**
```
https://yourproject.supabase.co
```

**Como obter:**
1. Acesse seu projeto no Supabase
2. Settings → API
3. Copie a Project URL

---

### 5. SUPABASE_SERVICE_ROLE_KEY
**Descrição:** Chave de serviço do Supabase (para uploads)
**Ambiente:** Production, Preview, Development
**Valor Exemplo:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Como obter:**
1. Acesse seu projeto no Supabase
2. Settings → API
3. Copie a service_role key (secret!)

---

### 6. NEXT_PUBLIC_APP_URL
**Descrição:** URL pública da aplicação (para links de reset de senha)
**Ambiente:** Production, Preview, Development
**Valor Exemplo:**
- Development: `http://localhost:3000`
- Production: `https://your-app.vercel.app`

---

## 📋 Como Configurar no Vercel

### Via Dashboard:

1. Acesse [vercel.com](https://vercel.com)
2. Selecione seu projeto
3. Settings → Environment Variables
4. Adicione cada variável com os valores corretos
5. Selecione os ambientes: Production, Preview, Development
6. Clique em "Save"

### Via Vercel CLI:

```bash
cd frontend

# Adicionar variável para Production
vercel env add DATABASE_URL production

# Adicionar variável para todos os ambientes
vercel env add JWT_ACCESS_TOKEN_SECRET production preview development
```

---

## ✅ Checklist de Configuração

Antes de fazer deploy em produção, confirme que todas estão configuradas:

- [ ] `DATABASE_URL` (com pgbouncer=true)
- [ ] `JWT_ACCESS_TOKEN_SECRET` (32+ chars)
- [ ] `JWT_REFRESH_TOKEN_SECRET` (32+ chars)
- [ ] `SUPABASE_URL` (se usar uploads)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (se usar uploads)
- [ ] `NEXT_PUBLIC_APP_URL` (URL de produção)

---

## 🚨 Problemas Comuns

### 1. **APIs retornando 500 (Internal Server Error)**
**Causa:** `DATABASE_URL`, `JWT_ACCESS_TOKEN_SECRET` ou `JWT_REFRESH_TOKEN_SECRET` não configurados

**Solução:** Verifique se as 3 variáveis obrigatórias estão no Vercel

---

### 2. **Erro de conexão com banco de dados**
**Causa:** `DATABASE_URL` incorreta ou sem `pgbouncer=true`

**Solução:** Use a connection string com pooler (porta 6543)

---

### 3. **Tokens JWT inválidos**
**Causa:** Secrets diferentes entre ambientes ou muito curtos

**Solução:** Use o mesmo secret em todos os ambientes e com 32+ caracteres

---

### 4. **Upload de arquivos não funciona**
**Causa:** `SUPABASE_URL` ou `SUPABASE_SERVICE_ROLE_KEY` não configurados

**Solução:** Adicione as variáveis do Supabase

---

## 🔍 Verificar Configuração

Após configurar, verifique no Vercel Deployment Logs se as variáveis foram carregadas:

```
Detected Next.js version: 16.0.2
Running "npm run build"
✓ Prisma Client generated
```

Se aparecer erro do Prisma ou JWT, revise as variáveis.

---

## 📞 Suporte

Se continuar com problemas, verifique:
1. Logs do deployment no Vercel
2. Network tab no navegador (erros 500)
3. Sintaxe das variáveis (sem espaços extras)
