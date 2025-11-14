# DEVELOPMENT PLAN - FormBuilder

## 📊 MVP Overview
- **Duration:** 4 semanas
- **Total Tasks:** 24
- **Fases:** 3 (Backend Setup → Core APIs → Frontend)
- **Delivery:** 1 tarefa por vez, validação entre cada uma

---

## 📦 PHASE 1: Backend Setup & Infrastructure (Semana 1)

### TASK-001: Setup Express.js + TypeScript + ESLint + Prettier
**Status:** Awaiting IA

**Description:**
Criar estrutura inicial do projeto backend com Express, TypeScript, ESLint, Prettier, environment setup e banco de dados.

**Acceptance Criteria:**
- [ ] Projeto Express 4.18+ com TypeScript configurado
- [ ] ESLint + Prettier configurado e rodando sem erros
- [ ] .env.example criado com TODAS as variáveis necessárias
- [ ] Scripts package.json: dev, build, start, test, lint
- [ ] README.md com instruções de setup
- [ ] .gitignore configurado (node_modules, .env, dist)
- [ ] Roda `npm run dev` sem erros
- [ ] Estrutura de pastas: src/controllers, src/services, src/repositories, src/middlewares, src/utils

**Dependencies:**
- Nenhuma

**Assigned to:** IA

**Estimated Tokens:** ~200

---

### TASK-002: Supabase Setup + Prisma Migrations
**Status:** Awaiting IA

**Description:**
Configurar Supabase (PostgreSQL com IPv6), Prisma ORM, e primeira migration (tabelas Users, Forms, FormFields, FormResponses).

**Acceptance Criteria:**
- [ ] Supabase project criado + connection string (com IPv6)
- [ ] Prisma instalado e configurado
- [ ] DATABASE_URL em .env aponta para Supabase
- [ ] Migration 001: Users table (id, email, name, password_hash, created_at, updated_at, deleted_at)
- [ ] Migration 002: Forms table (id, user_id, name, description, created_at, updated_at, deleted_at)
- [ ] Migration 003: FormFields table (id, form_id, type, label, required, order, created_at)
- [ ] Migration 004: FormResponses table (id, form_id, user_id/ip, data JSON, created_at)
- [ ] Índices criados em: (user_id), (form_id), (created_at), (deleted_at)
- [ ] `npm run migrate` roda sem erros

**Dependencies:**
- TASK-001

**Assigned to:** IA

**Estimated Tokens:** ~180

---

### TASK-003: Autenticação com Supabase + JWT
**Status:** Awaiting IA

**Description:**
Implementar autenticação (login/signup) com Supabase Auth + JWT tokens (access 15min, refresh 7d).

**Acceptance Criteria:**
- [ ] POST /auth/signup: valida email, hasheia senha (bcrypt salt 10), cria user
- [ ] POST /auth/login: valida credenciais, retorna accessToken + refreshToken
- [ ] POST /auth/refresh: valida refresh token, retorna novo access token
- [ ] Middleware auth: verifica JWT em Bearer token, injeta user em request
- [ ] POST /auth/logout: invalida refresh token
- [ ] Rate limiting: 5 req/5min em login/signup por IP
- [ ] Cookies httpOnly para tokens (seguro)
- [ ] Testes: 8+ casos (signup válido, email existe, login correto, senha errada, token expirado, refresh válido)

**Dependencies:**
- TASK-002

**Assigned to:** IA

**Estimated Tokens:** ~220

---

### TASK-004: Error Handling + Winston Logging
**Status:** Awaiting IA

**Description:**
Implementar classe AppError customizada e middleware de logging estruturado com Winston.

**Acceptance Criteria:**
- [ ] AppError class: { statusCode, code, message }
- [ ] Global error handler middleware
- [ ] Winston configurado com formato JSON + timestamps
- [ ] Log levels: info (ações), warn (anomalias), error (crashes)
- [ ] Contexto de logs: userId, requestId, endpoint, statusCode
- [ ] Logs estruturados (não plaintext)
- [ ] Testes: 5+ casos de erro diferentes

**Dependencies:**
- TASK-001

**Assigned to:** IA

**Estimated Tokens:** ~150

---

### TASK-005: AWS S3 Configuration + Upload Presigned URLs
**Status:** Awaiting IA

**Description:**
Configurar AWS S3, gerar presigned URLs para upload seguro direto (client → S3).

**Acceptance Criteria:**
- [ ] AWS credentials em .env (access key, secret, region)
- [ ] S3 bucket criado (public read para arquivos)
- [ ] POST /api/upload/presigned-url: retorna presigned URL (15min expiry)
- [ ] Validação: file size < 5MB, tipo permitido
- [ ] Presigned URL válida para PUT direto no S3
- [ ] S3 CORS configurado para seu domínio
- [ ] Logs: upload initiated, completed, failed
- [ ] Testes: upload presigned URL, download arquivo

**Dependencies:**
- TASK-001

**Assigned to:** IA

**Estimated Tokens:** ~160

---

## 📦 PHASE 2: Core APIs (Semana 2-3)

### TASK-006: DTO Validation com Zod
**Status:** Awaiting IA

**Description:**
Criar DTOs (Data Transfer Objects) para todos os endpoints com validação Zod.

**Acceptance Criteria:**
- [ ] DTO: CreateFormDTO (name: 1-100, description: optional, fields: optional)
- [ ] DTO: UpdateFormDTO (name, description, fields, isPublic)
- [ ] DTO: AddFormFieldDTO (type, label, required, order, settings)
- [ ] DTO: SubmitResponseDTO (fields: array com fieldId + value)
- [ ] DTO: UpdateResponseDTO (não pode, read-only)
- [ ] Middleware de validação que usa DTOs
- [ ] Mensagens de erro claras (Zod customizadas)
- [ ] Testes: 5+ casos de validação

**Dependencies:**
- TASK-001

**Assigned to:** IA

**Estimated Tokens:** ~140

---

### TASK-007: API POST /forms - Criar Formulário
**Status:** Awaiting IA

**Description:**
Endpoint para criar novo formulário (usuário autenticado).

**Acceptance Criteria:**
- [ ] POST /forms requer autenticação
- [ ] Body: { name, description }
- [ ] Validação com Zod
- [ ] Cria em DB + retorna form object (id, name, createdAt)
- [ ] isPublic default: false
- [ ] fields: [] vazio inicialmente
- [ ] Logs: "Form created" (userId, formId, name)
- [ ] Testes: 4 casos (válido, sem auth, nome inválido, request inválido)

**Dependencies:**
- TASK-006, TASK-003

**Assigned to:** IA

**Estimated Tokens:** ~120

---

### TASK-008: API GET /forms - Listar Formulários do User
**Status:** Awaiting IA

**Description:**
Endpoint para listar todos os forms do usuário autenticado com paginação.

**Acceptance Criteria:**
- [ ] GET /forms?page=1&limit=10 requer autenticação
- [ ] Retorna: { items: [...], total, page, limit, hasMore }
- [ ] Ordenado por createdAt DESC
- [ ] Apenas forms do user (não outros)
- [ ] Ignora deleted_at IS NOT NULL
- [ ] Paginação funciona (page 1, 2, inválido)
- [ ] Testes: 4 casos

**Dependencies:**
- TASK-007, TASK-003

**Assigned to:** IA

**Estimated Tokens:** ~110

---

### TASK-009: API GET /forms/:id - Detalhes do Formulário
**Status:** Awaiting IA

**Description:**
Endpoint para obter detalhes completos de um formulário (com fields).

**Acceptance Criteria:**
- [ ] GET /forms/:id requer autenticação + ownership check
- [ ] Retorna: { id, name, description, fields: [...], isPublic, createdAt, stats: { responses: count } }
- [ ] Se não é owner: 403 Forbidden
- [ ] Se form não existe: 404
- [ ] Fields ordenados por order ASC
- [ ] Testes: 5 casos

**Dependencies:**
- TASK-008

**Assigned to:** IA

**Estimated Tokens:** ~100

---

### TASK-010: API PUT /forms/:id - Atualizar Formulário
**Status:** Awaiting IA

**Description:**
Endpoint para atualizar form (nome, descrição, fields).

**Acceptance Criteria:**
- [ ] PUT /forms/:id requer autenticação + ownership
- [ ] Body: { name, description, fields: [...], isPublic }
- [ ] Atualiza em DB (UPDATE forms SET ...)
- [ ] Valida cada field
- [ ] Retorna form atualizado
- [ ] Se field deletado: remover em DB
- [ ] Se field adicionado: INSERT
- [ ] Se field modificado: UPDATE
- [ ] Testes: 6 casos

**Dependencies:**
- TASK-009, TASK-006

**Assigned to:** IA

**Estimated Tokens:** ~130

---

### TASK-011: API DELETE /forms/:id - Deletar Formulário
**Status:** Awaiting IA

**Description:**
Endpoint para deletar form (soft delete).

**Acceptance Criteria:**
- [ ] DELETE /forms/:id requer autenticação + ownership
- [ ] Soft delete: UPDATE forms SET deleted_at = NOW()
- [ ] Retorna 204 No Content
- [ ] Se não é owner: 403
- [ ] Se form não existe: 404
- [ ] Cascade delete? Não (responses ficam para análise)
- [ ] Testes: 4 casos

**Dependencies:**
- TASK-009

**Assigned to:** IA

**Estimated Tokens:** ~90

---

### TASK-012: API POST /forms/:id/fields - Adicionar Field
**Status:** Awaiting IA

**Description:**
Endpoint para adicionar field a um form.

**Acceptance Criteria:**
- [ ] POST /forms/:id/fields requer autenticação
- [ ] Body: { type, label, required, order, settings }
- [ ] Tipos permitidos: TEXT, EMAIL, NUMBER, SELECT, CHECKBOX, RADIO, DATE, TIME, FILE, RATING, NPS
- [ ] Label: 1-200 chars
- [ ] Retorna field criado com ID
- [ ] Se form não é seu: 403
- [ ] Testes: 5 casos

**Dependencies:**
- TASK-010

**Assigned to:** IA

**Estimated Tokens:** ~120

---

### TASK-013: API POST /public/forms/:id/responses - Submeter Resposta
**Status:** Awaiting IA

**Description:**
Endpoint PÚBLICO (sem autenticação) para submeter resposta a um form.

**Acceptance Criteria:**
- [ ] POST /public/forms/:id/responses
- [ ] Body: { fields: [{ fieldId, value }] }
- [ ] Form deve ser isPublic = true
- [ ] Valida cada field (required, type, etc)
- [ ] Sanitiza inputs (remove HTML)
- [ ] Rate limit: 10 respostas por IP por minuto
- [ ] Salva em DB com: formId, responseData, submittedAt, ipAddress, userAgent
- [ ] Retorna 201 + responseId
- [ ] Enfileira job para enviar email (Bull)
- [ ] Dispara webhook (se configurado)
- [ ] Testes: 6 casos (válido, validação failed, rate limited, field inválido)

**Dependencies:**
- TASK-002, TASK-012

**Assigned to:** IA

**Estimated Tokens:** ~180

---

### TASK-014: API GET /forms/:id/responses - Listar Respostas
**Status:** Awaiting IA

**Description:**
Endpoint para listar respostas de um form (só owner).

**Acceptance Criteria:**
- [ ] GET /forms/:id/responses?page=1&limit=25&search=&filter= requer autenticação + ownership
- [ ] Retorna: { items: [...], total, page, limit }
- [ ] Fields: responseId, submittedAt, data, ipAddress
- [ ] Sorting: por submittedAt DESC
- [ ] Filtro: por date range (startDate, endDate)
- [ ] Search: busca em fields
- [ ] Paginação funciona
- [ ] Testes: 4 casos

**Dependencies:**
- TASK-013

**Assigned to:** IA

**Estimated Tokens:** ~140

---

### TASK-015: API GET /forms/:id/responses/:responseId - Detalhes Resposta
**Status:** Awaiting IA

**Description:**
Endpoint para obter resposta completa (só owner).

**Acceptance Criteria:**
- [ ] GET /forms/:id/responses/:responseId requer autenticação + ownership
- [ ] Retorna: { responseId, formId, data: {...}, submittedAt, ipAddress }
- [ ] Se não é owner: 403
- [ ] Se response não existe: 404
- [ ] Testes: 3 casos

**Dependencies:**
- TASK-014

**Assigned to:** IA

**Estimated Tokens:** ~90

---

### TASK-016: API DELETE /forms/:id/responses/:responseId - Deletar Resposta
**Status:** Awaiting IA

**Description:**
Endpoint para deletar resposta (soft delete).

**Acceptance Criteria:**
- [ ] DELETE /forms/:id/responses/:responseId requer autenticação + ownership
- [ ] Soft delete: UPDATE form_responses SET deleted_at = NOW()
- [ ] Retorna 204
- [ ] Se não é owner: 403
- [ ] Testes: 3 casos

**Dependencies:**
- TASK-015

**Assigned to:** IA

**Estimated Tokens:** ~80

---

### TASK-017: API GET /forms/:id/export?format=csv|json|pdf - Exportar Respostas
**Status:** Awaiting IA

**Description:**
Endpoint para exportar respostas em múltiplos formatos.

**Acceptance Criteria:**
- [ ] GET /forms/:id/export?format=csv requer autenticação + ownership
- [ ] CSV: usa papaparse, columns são fields, rows são responses
- [ ] JSON: array de objects
- [ ] PDF: usa pdfkit, formata em tabela
- [ ] Headers corretos: Content-Type, Content-Disposition (download)
- [ ] Se format inválido: 400
- [ ] Testes: 3 casos (csv, json, pdf)

**Dependencies:**
- TASK-014

**Assigned to:** IA

**Estimated Tokens:** ~150

---

### TASK-018: Email Notifications com SendGrid + Bull Queue
**Status:** Awaiting IA

**Description:**
Implementar fila de jobs (Bull/BullMQ) para enviar emails com SendGrid quando nova resposta.

**Acceptance Criteria:**
- [ ] Bull queue configurado com Redis
- [ ] Job: 'send-notification' enfileirado quando resposta submetida
- [ ] Email template com: form name, respondent data, link para dashboard
- [ ] SendGrid configurado + API key em .env
- [ ] Email vai para form creator
- [ ] Retry automático: 3x com backoff exponencial
- [ ] Logs de sucesso/falha
- [ ] Testes: 3 casos (envio sucesso, retry, falha permanente)

**Dependencies:**
- TASK-013, TASK-004

**Assigned to:** IA

**Estimated Tokens:** ~160

---

### TASK-019: Webhook Integration - Dispara POST para URL customizada
**Status:** Awaiting IA

**Description:**
Implementar webhook que dispara quando nova resposta (POST para URL do user).

**Acceptance Criteria:**
- [ ] Form pode ter webhook URL configurado (settings)
- [ ] PUT /forms/:id/settings: { webhookUrl, webhookEnabled }
- [ ] Quando resposta submetida: POST webhookUrl
- [ ] Payload: { event: 'response.submitted', timestamp, data: {...} }
- [ ] Header: X-FormBuilder-Signature (HMAC SHA256)
- [ ] Retry: 3x com backoff
- [ ] Timeout: 5s
- [ ] Logs
- [ ] Testes: 4 casos

**Dependencies:**
- TASK-013

**Assigned to:** IA

**Estimated Tokens:** ~140

---

## 📦 PHASE 3: Frontend (Semana 3-4)

### TASK-020: Next.js Setup + Tailwind + shadcn/ui
**Status:** Awaiting IA

**Description:**
Criar estrutura frontend com Next.js 14, TypeScript, Tailwind, shadcn/ui.

**Acceptance Criteria:**
- [ ] Next.js 14 com App Router
- [ ] TypeScript strict mode
- [ ] Tailwind CSS configurado
- [ ] shadcn/ui instalado (Button, Input, Form, Dialog, etc)
- [ ] .env.local com NEXT_PUBLIC_API_URL
- [ ] ESLint + Prettier
- [ ] Estrutura: app/, components/, lib/, hooks/
- [ ] Roda `npm run dev` sem erros

**Dependencies:**
- Nenhuma

**Assigned to:** IA

**Estimated Tokens:** ~180

---

### TASK-021: Autenticação Frontend + Supabase Client
**Status:** Awaiting IA

**Description:**
Implementar login/signup no frontend com Supabase.

**Acceptance Criteria:**
- [ ] Pages: /login, /signup
- [ ] Supabase client configurado
- [ ] Login: email + password → backend → tokens
- [ ] Signup: email + password + name → backend → auto login
- [ ] Tokens salvos em httpOnly cookies
- [ ] Middleware de rota (proteger /dashboard)
- [ ] Logout: limpa cookies
- [ ] Testes: 4 casos

**Dependencies:**
- TASK-020, TASK-003

**Assigned to:** IA

**Estimated Tokens:** ~150

---

### TASK-022: Builder Page - Drag-Drop com dnd-kit
**Status:** Awaiting IA

**Description:**
Implementar página do builder com interface drag-drop (adicionar, reordenar, deletar fields).

**Acceptance Criteria:**
- [ ] Page: /builder/[formId]
- [ ] dnd-kit instalado + configurado
- [ ] Painel lateral: "Add Fields" (TEXT, EMAIL, SELECT, FILE, DATE, RATING, NPS)
- [ ] Clica field: adiciona na área principal (draggable)
- [ ] Drag-drop para reordenar
- [ ] 3-dots menu: delete, duplicate, settings
- [ ] Settings modal: label, required, placeholder, validation
- [ ] Preview ao lado (atualiza em tempo real)
- [ ] Autosave a cada 2s
- [ ] Undo/Redo (últimas 10 ações)
- [ ] Publish button
- [ ] Responsivo
- [ ] Testes: 5+ casos

**Dependencies:**
- TASK-020, TASK-021, TASK-010

**Assigned to:** IA

**Estimated Tokens:** ~250

---

### TASK-023: Página Pública para Responder Form
**Status:** Awaiting IA

**Description:**
Página pública onde respondentes preenchem e enviam formulário.

**Acceptance Criteria:**
- [ ] Page: /public/forms/[formId] (SEM autenticação)
- [ ] Carrega form pelo ID (GET /api/forms/:id/public)
- [ ] Renderiza fields dinamicamente
- [ ] Validação client-side em tempo real
- [ ] Submit button com loading state
- [ ] Após submit: "Thank you" message
- [ ] Responsivo
- [ ] Tratamento de erro se form não existe/não public
- [ ] Testes: 4 casos

**Dependencies:**
- TASK-020, TASK-013

**Assigned to:** IA

**Estimated Tokens:** ~180

---

### TASK-024: Dashboard - Listar Forms + Ver Respostas
**Status:** Awaiting IA

**Description:**
Página do dashboard onde user vê seus forms e respostas.

**Acceptance Criteria:**
- [ ] Page: /dashboard (protegido)
- [ ] GET /api/forms: lista seus forms
- [ ] Card por form: nome, respostas count, última resposta data
- [ ] Ações: Edit, Responses, Delete, Share link
- [ ] Click em form → /forms/[id]/responses
- [ ] Página de responses:
- [ ] Tabela: Data, Field1, Field2, ... (colunas dinâmicas)
- [ ] Sorting: click coluna
- [ ] Filtro: date range
- [ ] Search: busca em fields
- [ ] Paginação
- [ ] Export: CSV, JSON, PDF buttons
- [ ] Responsivo
- [ ] Testes: 5+ casos

**Dependencies:**
- TASK-020, TASK-021, TASK-008, TASK-014, TASK-017

**Assigned to:** IA

**Estimated Tokens:** ~200

---

## 📊 Summary

| Fase | Tasks | Semana | Esforço |
|------|-------|--------|---------|
| Setup | 1-5 | 1 | 40% |
| Core APIs | 6-19 | 2-3 | 45% |
| Frontend | 20-24 | 3-4 | 15% |

**Total:** 24 tarefas, ~3200 tokens, 4 semanas

---

## 🚀 Delivery Order

### Semana 1: Foundation
```
✅ TASK-001 → Validar
✅ TASK-002 → Validar
✅ TASK-003 → Validar
✅ TASK-004 → Validar
✅ TASK-005 → Validar
```

### Semana 2-3: APIs
```
✅ TASK-006 → TASK-007 → ... → TASK-019 (validar cada uma)
```

### Semana 4: Frontend
```
✅ TASK-020 → TASK-021 → TASK-022 → TASK-023 → TASK-024
```

**IMPORTANTE:** Não passe para próxima tarefa sem validar a anterior!

---

## ✅ Próximos Passos

1. Começar com **TASK-001** (Express setup)
2. Executar backend local
3. Validar funcionando
4. Proximar tarefa

**Pronto para começar?** 🚀

Qual é o primeiro passo?