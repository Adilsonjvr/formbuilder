# FLUXOS UX + TÉCNICOS - FormBuilder

---

## 🎬 USER FLOWS

### Fluxo 1: Criar Novo Formulário

```
User (não autenticado)
    ↓
Landing page → "Create Form"
    ↓
Redireciona para Login/Signup
    ↓
Autentica com GitHub ou Email
    ↓
Dashboard (vazio, primeira vez)
    ↓
Clica "New Form"
    ↓
BUILDER PAGE (novo form em branco)
    ├─ Nome automático: "Untitled Form"
    ├─ Campo vazio: pode adicionar fields
    ├─ Preview ao lado mostrando vazio
    ├─ Autosave a cada 2 segundos
    └─ URL: /builder/form-{uuid}
```

**Dados:**
```json
{
  "formId": "form-abc123",
  "userId": "user-123",
  "name": "Untitled Form",
  "fields": [],
  "createdAt": "2024-01-01T10:00:00Z",
  "isPublic": false
}
```

---

### Fluxo 2: Construir Formulário (Drag-Drop)

```
Builder Page Aberta
    ↓
Visualiza painel lateral: "Add Fields"
    ├─ Campos disponíveis:
    │  ├─ Text (short text)
    │  ├─ Long Text (textarea)
    │  ├─ Email
    │  ├─ Number
    │  ├─ Select (dropdown)
    │  ├─ Multi-select
    │  ├─ Checkbox
    │  ├─ Radio
    │  ├─ Date
    │  ├─ Time
    │  ├─ File Upload
    │  ├─ Rating (1-5 stars)
    │  └─ NPS (0-10)
    │
    ↓
Clica em "Text" (exemplo)
    ↓
Field aparece na área principal (drag-drop-able)
    ├─ Label default: "Question"
    ├─ Field vazio
    ├─ 3 dots menu (delete, duplicate, settings)
    │
    ↓
Digita label: "What's your name?"
    ↓
Clica em "Settings"
    ├─ Required? Toggle
    ├─ Placeholder text
    ├─ Help text
    ├─ Validation (email, number range, etc)
    │
    ↓
Salva configuração
    ↓
Adiciona mais fields (repete)
    ├─ Drag-drop para reordenar
    ├─ Preview ao lado mostra em tempo real
    │
    ↓
Clica "Publish"
    ├─ Form fica público
    ├─ Gera link: https://formbuilder.app/public/{form-id}
    ├─ URL copiável para clipboard
    └─ Notificação: "Form published!"
```

**Eventos Importantes:**
- Autosave a cada field change (débounce 2s)
- Preview em tempo real
- Undo/Redo (últimas 10 ações)
- Indicador de mudanças não salvas

---

### Fluxo 3: Responder Formulário (Usuário Respondente)

```
User (qualquer pessoa, não precisa login)
    ↓
Clica link público: https://formbuilder.app/public/form-abc123
    ↓
Página carrega
    ├─ Título do form: "Contact Form"
    ├─ Descrição (se tiver)
    ├─ Campos renderizados
    ├─ Botão "Submit"
    └─ Responsivo (mobile-friendly)
    │
    ↓
Preenche campos
    ├─ Validação client-side em tempo real
    ├─ Erro se campo obrigatório vazio
    ├─ Erro se email inválido, etc
    │
    ↓
Clica "Submit"
    ↓
Request POST → Backend
    ├─ Backend valida novamente (nunca confia client)
    ├─ Salva em DB
    ├─ Envia email ao form creator (SendGrid)
    ├─ Dispara webhook (se configurado)
    └─ Retorna success
    │
    ↓
Página mostra: "Thank you! Response submitted"
    ├─ Opção de "Submit Another"
    ├─ Mostra confirmação por 3s depois redireciona
    └─ Analytics atualizado em tempo real
```

**Dados da Resposta:**
```json
{
  "responseId": "resp-xyz789",
  "formId": "form-abc123",
  "submittedAt": "2024-01-01T11:30:00Z",
  "ipAddress": "123.456.789.012",
  "userAgent": "Mozilla/5.0...",
  "fields": [
    {
      "fieldId": "field-1",
      "label": "What's your name?",
      "value": "João Silva"
    },
    {
      "fieldId": "field-2",
      "label": "Email",
      "value": "joao@example.com"
    }
  ]
}
```

---

### Fluxo 4: Ver Respostas no Dashboard

```
Form Creator no Dashboard
    ↓
Clica em um formulário
    ↓
Página "Responses"
    ├─ Total de respostas: "127"
    ├─ Taxa de submissão: "24%"
    ├─ Respostas por dia (gráfico)
    │
    ├─ Tabela de respostas
    │  ├─ Colunas: Data, Name, Email, [outros campos]
    │  ├─ Sorting: clica coluna para ordenar
    │  ├─ Filtros: por campo, data range, status
    │  ├─ Search: buscar por texto
    │  └─ Paginação: 25 respostas por página
    │
    ├─ Clica em uma resposta
    │  └─ Abre modal com resposta completa
    │     ├─ Todos os campos preenchidos
    │     ├─ Data/hora de submissão
    │     ├─ IP do respondente
    │     └─ Opção para deletar resposta
    │
    ├─ Export
    │  ├─ CSV (abre em Excel)
    │  ├─ JSON (para APIs)
    │  └─ PDF (report bonito)
    │
    └─ Filtros por range de data
        ├─ Last 7 days
        ├─ Last 30 days
        ├─ Custom range
        └─ Export filtrado
```

**View Tipos:**
1. Table view (default)
2. Chart view (gráficos por campo)
3. Individual response view

---

### Fluxo 5: Configurar Integrações

```
Form Creator
    ↓
Clica "Settings" no formulário
    ↓
Aba "Integrations"
    │
    ├─ Email Notifications
    │  ├─ Toggle: "Send email on new response"
    │  ├─ Email address: (seu email)
    │  └─ Template preview
    │
    ├─ Webhook
    │  ├─ URL do seu endpoint: https://seu-app.com/webhook
    │  ├─ Method: POST
    │  ├─ Headers customizadas (optional)
    │  ├─ Test webhook button
    │  └─ Retry policy: 3x em 1 hora
    │
    └─ Slack (futuro nice-to-have)
        ├─ Connect Slack
        ├─ Select channel
        └─ Notificação ao novo response
```

---

## 🔧 TECHNICAL FLOWS

### Flow 1: Autenticação (Login)

```
Frontend
    ↓ POST /auth/login
Backend (Express)
    ├─ Recebe: { email, password }
    ├─ Valida com Zod
    ├─ Busca user em DB (Supabase)
    ├─ Compara password com bcrypt
    ├─ Se válido:
    │  ├─ Gera JWT (15min expiry)
    │  ├─ Gera Refresh Token (7d expiry)
    │  ├─ Retorna ambos
    │  └─ Logs: "User logged in" (userId, email)
    │
    └─ Se inválido: 401 + error message
         │
         ↓ Frontend
         ├─ Salva tokens em httpOnly cookies (seguro)
         ├─ Redireciona para dashboard
         └─ API subsequent requests attacham Authorization header
```

**Request:**
```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "senhaforte123"
}
```

**Response (201 Created):**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "João"
  }
}
```

---

### Flow 2: Criar Formulário

```
Frontend (Next.js)
    ↓ POST /api/forms
Backend
    ├─ Middleware authenticate (verifica JWT)
    ├─ Body: { name, description }
    ├─ Valida com Zod (name: 1-100 chars)
    ├─ Cria em DB:
    │  ├─ INSERT INTO forms (id, user_id, name, created_at, ...)
    │  ├─ VALUES (uuid(), user.id, name, NOW(), ...)
    │  └─ Retorna form object
    │
    ├─ Logs: "Form created" (userId, formId, name)
    ├─ Response 201 + form object
    │
    └─ Frontend
        ├─ Recebe form
        ├─ Redireciona para /builder/form-{id}
        └─ Carrega builder page
```

**Flow Completo com Autosave:**

```
Builder Page Aberta (POLLING via WebSocket seria ideal, mas MVP é HTTP)
    ↓
User adiciona field
    ↓
Frontend faz debounce (2s)
    ↓
PUT /api/forms/{formId}
    ├─ Body: { fields: [...] }
    ├─ Backend valida
    ├─ Atualiza em DB
    ├─ Response 200
    └─ Frontend mostra "Saved" indicator por 1s
```

---

### Flow 3: Upload de Arquivo (S3)

```
Frontend (File Input)
    ↓
User seleciona arquivo (max 5MB)
    ↓
Frontend valida
    ├─ Tipo de arquivo allowed
    ├─ Tamanho < 5MB
    └─ Se inválido: erro no UI
    │
    ↓
POST /api/upload/presigned-url
    ├─ Body: { fileName, fileType }
    ├─ Backend (Express)
    │  ├─ Valida file name/type
    │  ├─ Gera presigned URL (AWS S3)
    │  ├─ URL válida por 15 minutos
    │  └─ Retorna URL
    │
    └─ Frontend recebe presigned URL
        ↓
        ↓ PUT (presigned URL)
        ├─ Frontend faz upload direto para S3
        ├─ S3 valida CORS + signature
        ├─ S3 salva arquivo
        ├─ Response 200 (arquivo salvo)
        │
        └─ Frontend
            ├─ Mostra "Upload successful"
            ├─ Salva URL do arquivo no form
            └─ Mostra preview
```

**Fluxo Alternativo (se presigned URL complexo):**

```
Frontend
    ↓
POST /api/upload (multipart/form-data)
    ├─ Backend recebe arquivo
    ├─ Gera nome único: {userId}/{timestamp}-{originalName}
    ├─ Faz upload para S3
    ├─ Retorna URL público
    └─ Frontend usa URL
```

---

### Flow 4: Submeter Resposta (Respondente)

```
Respondente preenchendo form público
    ↓
Clica "Submit"
    ↓
Frontend valida
    ├─ Campos obrigatórios preenchidos?
    ├─ Email é válido?
    ├─ etc
    │
    ├─ Se inválido: mostra erro no campo
    └─ Se válido: continua
        │
        ↓
        ↓ POST /api/public/forms/{formId}/responses
        ├─ Body: { fields: [...] }
        ├─ Nota: sem autenticação (público)
        │
        ├─ Backend
        │  ├─ Valida formId existe e é público
        │  ├─ Valida cada field
        │  ├─ Sanitiza inputs (remove HTML)
        │  ├─ Rate limit: 10 respostas por IP por minuto
        │  ├─ Se arquivo:
        │  │  ├─ Cria presigned URL
        │  │  ├─ Frontend faz upload S3 separado
        │  │  └─ Salva URL em response
        │  │
        │  ├─ INSERT response em DB
        │  ├─ Enfileira job: enviar email (Bull queue)
        │  ├─ Dispara webhook (se configurado)
        │  ├─ Logs: "Response submitted" (formId, fields count)
        │  └─ Response 201
        │
        └─ Frontend
            ├─ Recebe sucesso
            ├─ Mostra "Thank you!" message
            ├─ Redireciona após 3s
            └─ (Opção de submeter outro)
```

**Response Object (após submit):**
```json
{
  "responseId": "resp-xyz789",
  "formId": "form-abc123",
  "submittedAt": "2024-01-01T11:30:00Z",
  "fields": [
    {
      "fieldId": "field-1",
      "value": "João"
    },
    {
      "fieldId": "field-2",
      "value": "joao@example.com"
    }
  ]
}
```

---

### Flow 5: Email Notification (SendGrid + Bull Queue)

```
Response submetida
    ↓
Backend enfileira job:
    emailQueue.add('send-notification', {
      responseId: 'resp-xyz',
      formId: 'form-abc',
      creatorEmail: 'creator@example.com',
      responseData: {...}
    })
    ↓
Job worker pega job da fila
    ├─ Gera email HTML template
    ├─ Adiciona dados da response
    ├─ Envia via SendGrid
    ├─ Se sucesso: marca job como completo
    └─ Se falha: retry automático (3x em 1 hora)
        │
        ↓
SendGrid
    ├─ Valida email
    ├─ Envia
    └─ Webhook callback (opcional): "Email delivered"
```

---

### Flow 6: Export para CSV/JSON/PDF

```
Form Creator clica "Export Respostas"
    ↓
Escolhe formato: CSV / JSON / PDF
    ├─ Se CSV:
    │  ├─ Frontend requisita: GET /api/forms/{formId}/export?format=csv
    │  ├─ Backend
    │  │  ├─ Busca todas respostas
    │  │  ├─ Converte para CSV (papaparse)
    │  │  ├─ Set header: Content-Type: text/csv
    │  │  └─ Retorna stream
    │  │
    │  └─ Frontend
    │     ├─ Browser baixa arquivo: responses.csv
    │     └─ Abre em Excel
    │
    ├─ Se JSON:
    │  └─ Similar ao CSV, mas JSON format
    │
    └─ Se PDF:
       ├─ Backend
       │  ├─ Gera HTML template (resposta formatada)
       │  ├─ Usa pdfkit para converter
       │  ├─ Set header: Content-Type: application/pdf
       │  └─ Retorna stream
       │
       └─ Frontend
           ├─ Browser abre/baixa: responses.pdf
           └─ User vê report formatado
```

---

### Flow 7: Webhook Integração

```
Nova resposta submetida
    ↓
Backend dispara webhook:
    POST https://seu-app.com/webhook
    
    Headers:
    {
      "Content-Type": "application/json",
      "X-FormBuilder-Signature": "sha256(...)" // Para validar origem
    }
    
    Body:
    {
      "event": "response.submitted",
      "timestamp": "2024-01-01T11:30:00Z",
      "data": {
        "responseId": "resp-xyz",
        "formId": "form-abc",
        "fields": [...]
      }
    }
    │
    ↓
Seu endpoint recebe webhook
    ├─ Valida signature
    ├─ Processa dados
    ├─ Responde 200
    │
    └─ Se inválido ou timeout:
        ├─ Backend backend retry
        ├─ 3 tentativas com backoff exponencial
        └─ Logs de falha
```

---

## 📱 Telas/Componentes

### Tela 1: Landing Page
```
┌─────────────────────────────────────────┐
│ FormBuilder                   [Login]   │
├─────────────────────────────────────────┤
│                                         │
│  Create beautiful forms                 │
│  in seconds                             │
│                                         │
│  [Get Started]                          │
│                                         │
│  ✨ Drag-drop builder                   │
│  📊 Real-time analytics                 │
│  🔗 Easy integrations                   │
│  💰 Forever free                        │
│                                         │
└─────────────────────────────────────────┘
```

### Tela 2: Builder (Drag-Drop)
```
┌──────────────────┬────────────────────────────┐
│ Back | Save      │ FormBuilder Title          │
├──────────────────┼────────────────────────────┤
│                  │                            │
│ Add Fields       │ Preview                    │
│ ├─ Text         │ ┌────────────────────────┐ │
│ ├─ Email        │ │ Question               │ │
│ ├─ Select       │ │ [Answer field]         │ │
│ ├─ File         │ │                        │ │
│ ├─ Date         │ │ Question 2             │ │
│ ├─ Rating       │ │ ☆☆☆☆☆                │ │
│ └─ ...           │ │                        │ │
│                  │ │ [Submit]               │ │
│ [Publish]        │ └────────────────────────┘ │
│                  │                            │
└──────────────────┴────────────────────────────┘
```

### Tela 3: Responder Form (Público)
```
┌─────────────────────────────────────┐
│ Contact Form                        │
│ Get in touch with us!               │
├─────────────────────────────────────┤
│                                     │
│ Name *                              │
│ [________________]                  │
│                                     │
│ Email *                             │
│ [________________]                  │
│                                     │
│ Message                             │
│ [_____________________]             │
│ [_____________________]             │
│ [_____________________]             │
│                                     │
│ [Submit]                            │
│                                     │
│ Powered by FormBuilder              │
└─────────────────────────────────────┘
```

### Tela 4: Dashboard (Respostas)
```
┌─────────────────────────────────────┐
│ Dashboard         [+ New Form]      │
├─────────────────────────────────────┤
│                                     │
│ Contact Form                        │
│ ├─ 127 responses                    │
│ ├─ Last: 2 hours ago                │
│ ├─ [View] [Settings]                │
│ └─ [▼]                              │
│    ├─ Responses (127)               │
│    ├─ Edit form                     │
│    ├─ Share link                    │
│    └─ Delete                        │
│                                     │
│ Survey Form                         │
│ ├─ 45 responses                     │
│ └─ ...                              │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎯 Sitemap

```
/
├── / (landing page)
├── /login
├── /signup
├── /dashboard (protegido)
│   └─ GET /forms (lista seus forms)
│   └─ POST /forms (criar novo)
├── /builder/:formId (protegido)
│   └─ Editor drag-drop
├── /forms/:formId/responses (protegido)
│   └─ Dashboard com respostas
├── /forms/:formId/settings (protegido)
│   └─ Configurações e integrações
├── /public/forms/:formId
│   └─ Form público (sem autenticação)
└── /auth/callback
    └─ GitHub OAuth callback
```

---

**Próximo:** plan.md com 20+ tarefas estruturadas!