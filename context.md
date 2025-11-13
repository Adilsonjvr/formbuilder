# PROJECT CONTEXT - FormBuilder

## 🎯 Visão
Uma plataforma moderna de construção de formulários sem código (no-code) com drag-drop intuitivo, múltiplas integrações e recursos avançados. 

Permite que qualquer pessoa (agências, coaches, estudantes, pesquisadores) crie formulários profissionais, colete respostas em tempo real, e exporte dados em múltiplos formatos sem escrever uma linha de código.

**Proposta de Valor:** Typeform/JotForm, mas mais simples, mais rápido, com melhor UX e open-source ready.

---

## 👥 Usuários-Alvo
1. **Agências de marketing** - criam forms para clientes
2. **Coaches/Consultores** - leads, pesquisas, feedback
3. **Estudantes** - pesquisas acadêmicas
4. **Pesquisadores** - coleta de dados científica
5. **Pequenos negócios** - formulários gerais
6. **Comunidades** - registros, feedback

---

## 📊 Escopo MVP
✅ **ENTRA NO MVP:**
- Drag-drop builder (campos básicos + avançados)
- Criar/editar/deletar formulários
- Preview em tempo real
- Link público para responder
- Coleta de respostas em DB
- Dashboard com respostas
- Filtros/busca em respostas
- Export: CSV, JSON, PDF
- Notificação por email (SendGrid)
- Integração webhook (POST respostas)
- Login/autenticação (Supabase Auth)
- Responsivo (mobile-first)
- Upload de arquivos (AWS S3)

⏳ **NICE TO HAVE (v1.1):**
- Conditional logic (if/then)
- Payment field (Stripe)
- Multi-page forms
- Integração Zapier/Make
- Custom CSS/branding
- Multi-idioma
- Integração Slack
- Pré-preenchimento (URL params)

❌ **NÃO ENTRA:**
- Colaboração em tempo real (primeira versão)
- Temas customizados demais
- AI-generated questions
- Video embed em formulários

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI:** React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Drag-Drop:** dnd-kit (leve, moderno)
- **Form State:** React Hook Form (simples)
- **HTTP:** Axios com interceptors
- **Charts:** Recharts (análise de respostas)
- **Export:** 
  - CSV: papaparse
  - JSON: nativo
  - PDF: pdfkit ou similar

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js (simples, rápido)
- **Language:** TypeScript
- **API:** REST (não GraphQL, MVP)
- **Validation:** Zod
- **Job Queue:** Bull/BullMQ (enviar emails async)
- **Logging:** Winston (estruturado)

### Database & Auth
- **Database:** Supabase (PostgreSQL + IPv6)
- **Auth:** Supabase Auth (OAuth GitHub/Google)
- **ORM:** Prisma (type-safe)
- **Migrations:** Prisma migrations

### File Storage
- **Storage:** AWS S3 (aprender neste projeto)
- **SDK:** @aws-sdk/client-s3 v3
- **Upload:** S3 presigned URLs (seguro)
- **CDN:** CloudFront (futuro, S3 nativo agora)

### Email
- **Service:** SendGrid
- **SDK:** @sendgrid/mail
- **Templates:** HTML customizadas
- **Triggers:** Nova resposta, link do form

### Deployment
- **Frontend:** Vercel (Next.js native)
- **Backend:** Railway (€5/mês, melhor que Heroku)
- **Database:** Supabase Cloud
- **Secrets:** Environment variables (Vercel + Railway)

### Monitoring & Analytics
- **Logging:** Winston + Papertrail (logging as a service)
- **Uptime:** Ping checks (Railway/Vercel têm native)
- **Performance:** Vercel Analytics (next/analytics)

---

## 🏗 Decisões Arquiteturais (ADR)

### ADR-001: Por que Express.js e não NestJS?
**Decisão:** Express.js
**Motivo:** MVP rápido, NestJS overhead desnecessário agora, refatorar depois se precisar.
**Trade-off:** Menos structure, mais velocidade.

### ADR-002: Por que Supabase e não Firebase?
**Decisão:** Supabase
**Motivo:** PostgreSQL real (melhor para formulários com muitas relações), IPv6 nativo, open-source, não temos lock-in.
**Trade-off:** Supabase é menor que Firebase, mas suficiente para MVP.

### ADR-003: Por que AWS S3 e não Cloudinary?
**Decisão:** AWS S3
**Motivo:** Você quer aprender S3, é skill valiosa, custo baixo, mais controle.
**Trade-off:** Mais complexo que Cloudinary, mas melhor learning.

### ADR-004: Por que dnd-kit vs react-beautiful-dnd?
**Decisão:** dnd-kit
**Motivo:** Mais leve (melhor performance), mais moderno, sem dependencies desnecessárias.
**Trade-off:** Um pouco menos polido visually, mas funcional.

### ADR-005: Por que Prisma e não Knex?
**Decisão:** Prisma
**Motivo:** Type-safe, migrations automáticas, dev experience melhor, PostgreSQL perfeito com Prisma.
**Trade-off:** Deps adicionais, mas worth it.

### ADR-006: Integração Webhook
**Decisão:** POST endpoint que recebe respostas
**Motivo:** Simples, sem infraestrutura complexa, funciona com Zapier depois.
**Trade-off:** Sem retry automático no MVP (adicionar depois).

### ADR-007: Export formats
**Decisão:** CSV, JSON, PDF (todos 3)
**Motivo:** CSV para Excel, JSON para APIs/integrações, PDF para report bonito.
**Trade-off:** Mais tarefas, mas market-demanded.

---

## ⚠️ Constraints

### Técnicos
- **Performance:** P95 < 200ms (responsivo)
- **Storage:** Free tier S3 = ~5GB (monitora uso)
- **Database:** Supabase free = 500MB (monitora)
- **Uptime:** 99.9% (Vercel + Railway nativo)

### Negócio
- **Prazo:** 3-4 semanas até MVP
- **Usuários iniciais:** 0 → 100 (primeiros 3 meses)
- **Monetização:** Implementar freemium na semana 3-4

### Compliance
- **GDPR/LGPD:** User pode deletar dados
- **Segurança:** CORS restrito, rate limiting, sanitização
- **Permissões:** User só vê seus forms/respostas

### Infraestrutura
- **Backend downtime:** Aceitável se < 1h/mês
- **Data backups:** Supabase automático (daily)
- **Secrets:** Nunca hardcoded (.env always)

---

## 🎯 Roadmap MVP → v1.0

### MVP (Semanas 1-4)
```
[ ] Drag-drop builder
[ ] Create/read/update/delete forms
[ ] Link público para responder
[ ] Coleta + storage de respostas
[ ] Dashboard simples
[ ] Export (CSV, JSON, PDF)
[ ] Email notifications
[ ] Webhook integration
[ ] Responsivo
[ ] Deploy Vercel + Railway
[ ] Autenticação básica
```

### v1.0 (Semanas 5-8)
```
[ ] Freemium monetização
[ ] Analytics avançado
[ ] Conditional logic
[ ] Multi-page forms
[ ] Integração Slack
[ ] Admin dashboard
[ ] Support básico
```

### v1.1+ (Depois)
```
[ ] Payment field (Stripe)
[ ] Colaboração real-time
[ ] Custom domain
[ ] Temas customizados
[ ] AI suggestions
[ ] Mobile app (React Native)
```

---

## 🔗 Dependências Externas

| Serviço | Motivo | Alternativa |
|---------|--------|------------|
| Supabase | Database + Auth | Firebase, Railway Postgres |
| AWS S3 | File storage | Cloudinary, DigitalOcean Spaces |
| SendGrid | Email | Mailgun, Resend, Nodemailer |
| Vercel | Frontend deploy | Netlify, Railway, Render |
| Railway | Backend deploy | Heroku (pago), Render, Fly.io |

---

## 📊 Estimativa de Esforço

- **Backend:** 40% (arquitetura, auth, S3, email)
- **Frontend:** 45% (drag-drop, builder UX, export)
- **DevOps:** 10% (deploy, secrets, monitoring)
- **Testing:** 5% (testes principais)

**Total:** ~3-4 semanas (trabalho time 1-2 devs)

---

## ✅ Success Metrics

- [ ] MVP deploy em 4 semanas
- [ ] 10 usuários teste na semana 4
- [ ] 99.9% uptime primeira semana
- [ ] < 200ms P95 response time
- [ ] < 500MB database storage used
- [ ] < $20/mês custo total
- [ ] Feedback positivo (NPS > 50)

---

## 📝 Próximas Etapas

1. ✅ CONTEXT.md (este documento)
2. → RULESET.md (padrões de desenvolvimento)
3. → FLUXOGRAM.md (fluxos UX e técnicos)
4. → plan.md (tarefas estruturadas)
5. → Começar TASK-001