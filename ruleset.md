# DEVELOPMENT RULESET - FormBuilder

Padrões que TODA tarefa deve seguir. Nenhuma exceção!

---

## 📐 Architecture Patterns

### MVC Pattern (Express Backend)
```
Controllers     → Recebem request, validam, chamam service
Services        → Business logic (não toca DB)
Repositories    → Database queries (CRUD, queries complexas)
DTOs            → Request/Response types (Zod)
Middleware      → Auth, logging, error handling
```

### Clean Code Principles
- [ ] Funções < 30 linhas (quebra em menores)
- [ ] Sem lógica de negócio em Controllers
- [ ] Sem queries SQL em Services
- [ ] Sem side-effects fora de Services
- [ ] Errors: sempre lançar exceção customizada
- [ ] Comments: apenas "por quê", não "o quê"

### Dependency Injection (Manual)
```typescript
// ✅ CORRETO
class FormService {
  constructor(private formRepository: FormRepository) {}
  
  async createForm(data: CreateFormDTO) {
    return this.formRepository.create(data);
  }
}

// ❌ ERRADO
class FormService {
  async createForm(data: CreateFormDTO) {
    const db = new Database(); // ❌ Acoplado
  }
}
```

### No Lógica no Controller
```typescript
// ✅ CORRETO
@Post('/forms')
async createForm(@Body() dto: CreateFormDTO) {
  const form = await this.formService.create(dto);
  return { id: form.id, name: form.name };
}

// ❌ ERRADO
@Post('/forms')
async createForm(@Body() dto: CreateFormDTO) {
  if (!dto.name) throw Error(...); // ❌ Validation aqui
  const form = new Form(dto); // ❌ Creation aqui
  await db.insert(form); // ❌ Query aqui
}
```

---

## 🔌 Backend (Express + TypeScript)

### Error Handling
```typescript
// Classe customizada
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Uso
throw new AppError(404, 'FORM_NOT_FOUND', 'Formulário não encontrado');

// Global middleware captura
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
    });
  }
  // Unknown error
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Erro interno' });
});
```

### Validation (Zod)
```typescript
// ✅ SEMPRE validar com Zod no DTO layer

export const CreateFormDTOSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  fields: z.array(FormFieldSchema).min(1),
  settings: z.object({
    isPublic: z.boolean().default(false),
    collectEmail: z.boolean().default(false),
  }).optional(),
});

export type CreateFormDTO = z.infer<typeof CreateFormDTOSchema>;

// No controller
@Post('/forms')
async createForm(@Body() body: unknown) {
  const dto = CreateFormDTOSchema.parse(body); // ❌ Se inválido, zod lança erro
  // ... resto
}
```

### Logging (Winston)
```typescript
// Estruturado, sempre JSON
logger.info('Form created', {
  userId: user.id,
  formId: form.id,
  fieldCount: form.fields.length,
  timestamp: new Date(),
});

logger.error('S3 upload failed', {
  userId: user.id,
  fileName: file.name,
  error: err.message,
  stack: err.stack,
});

// Níveis
logger.info()    // Ações normais
logger.warn()    // Anomalias (retry, deprecated)
logger.error()   // Erros (falhou operação)
```

### Rate Limiting
```typescript
// Endpoints públicos: 10 req/min por IP
app.get('/public/*', rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 10,
  message: 'Too many requests',
}));

// Endpoints autenticados: 30 req/min por user
app.use(authenticate);
app.use(rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user.id,
}));

// Upload: 5 files/min por user
app.post('/upload', uploadRateLimit({
  max: 5,
  windowMs: 1 * 60 * 1000,
}));
```

### Authentication (Supabase)
```typescript
// Middleware de autenticação
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Token não fornecido');
  }
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new AppError(401, 'INVALID_TOKEN', 'Token inválido');
    }
    req.user = data.user; // Attach user
    next();
  } catch (err) {
    throw new AppError(401, 'AUTH_FAILED', err.message);
  }
}

// Uso
@Get('/forms/:id')
@UseGuard(authenticate)
async getForm(req) {
  // req.user já está disponível
  return formService.getForm(req.params.id, req.user.id);
}
```

### Async Operations (Bull/BullMQ)
```typescript
// Não fazer email/upload bloqueador no controller
// ❌ ERRADO
@Post('/forms/:id/submit')
async submitForm(req) {
  const response = await formService.submit(req.body);
  await emailService.sendNotification(response); // ❌ Bloqueador
  return response;
}

// ✅ CORRETO
@Post('/forms/:id/submit')
async submitForm(req) {
  const response = await formService.submit(req.body);
  await emailQueue.add('send-notification', response); // ✅ Async job
  return response;
}

// Job worker (rodando separado)
emailQueue.process('send-notification', async (job) => {
  await emailService.sendNotification(job.data);
});
```

### Security Headers
```typescript
// CORS: nunca * (inseguro)
app.use(cors({
  origin: process.env.FRONTEND_URL, // apenas frontend
  credentials: true,
}));

// Helmet: security headers automáticos
app.use(helmet());

// Sanitização de inputs
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeInputs()); // Custom middleware para remover HTML/scripts
```

---

## 🗄 Database (PostgreSQL + Prisma)

### Migrations
```typescript
// Criar nova migration
npx prisma migrate dev --name create_forms_table

// Arquivo: prisma/migrations/[timestamp]_create_forms_table/migration.sql
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL -- soft delete
);

// Rollback se precisar
npx prisma migrate resolve --rolled-back [migration-name]
```

### Schema (Prisma)
```prisma
model Form {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name      String
  description String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? // soft delete
  
  fields    FormField[]
  responses FormResponse[]
  
  @@index([userId])
  @@index([createdAt])
}

model FormField {
  id      String @id @default(cuid())
  formId  String
  form    Form   @relation(fields: [formId], references: [id], onDelete: Cascade)
  
  type    FieldType // TEXT, EMAIL, SELECT, FILE, etc
  label   String
  required Boolean @default(false)
  order   Int
  
  @@unique([formId, order])
  @@index([formId])
}
```

### Timestamps Automáticos
```typescript
// TODA tabela tem created_at, updated_at
// ✅ Padrão SEMPRE

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

// Trigger para auto-update
CREATE TRIGGER update_forms_updated_at
BEFORE UPDATE ON forms
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
```

### Soft Deletes
```typescript
// Nunca deletar de verdade, soft delete é padrão
// ✅ CORRETO
deleted_at TIMESTAMP NULL;

// Query que ignora deletados
const forms = await prisma.form.findMany({
  where: { 
    userId: userId,
    deletedAt: null, // sempre filtrar
  },
});

// Quando user delete
await prisma.form.update({
  where: { id: formId },
  data: { deletedAt: new Date() },
});
```

### Índices
```typescript
// Criados automaticamente em:
// - Primary keys (id)
// - Foreign keys (userId)
// - Campos frequentemente filtrados (createdAt, status)
// - Campos de busca (name, email)

form {
  id UUID PRIMARY KEY // ✅ Index automático
  userId UUID INDEX // ✅ Foreign key index
  createdAt TIMESTAMP INDEX // ✅ Range queries
  name VARCHAR INDEX // ✅ Busca
}
```

---

## 🎨 Frontend (Next.js + React)

### Components
```typescript
// ✅ Função + Hooks (ZERO class components)
export function FormBuilder({ formId }: { formId: string }) {
  const [fields, setFields] = useState<FormField[]>([]);
  
  return (
    <div className="builder">
      {fields.map((field) => (
        <FieldComponent key={field.id} field={field} />
      ))}
    </div>
  );
}

// ❌ Nunca class components
class FormBuilder extends React.Component { }
```

### Props & TypeScript
```typescript
// ✅ Props SEMPRE tipadas (never any)
interface FormBuilderProps {
  formId: string;
  onSave: (fields: FormField[]) => Promise<void>;
  isLoading?: boolean;
}

export function FormBuilder({ formId, onSave, isLoading }: FormBuilderProps) {
  // ...
}

// ❌ ERRADO
export function FormBuilder(props: any) { }
```

### Custom Hooks
```typescript
// Reutilização de lógica via custom hooks
export function useFormBuilder(formId: string) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);
  
  const addField = useCallback((field: FormField) => {
    setFields((prev) => [...prev, field]);
  }, []);
  
  return { fields, loading, addField };
}

// Uso
function FormBuilderPage() {
  const { fields, addField } = useFormBuilder(formId);
  return <FormBuilder fields={fields} onAddField={addField} />;
}
```

### API Calls (Axios)
```typescript
// Centralizado com interceptors
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Auto-refresh token expirado
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token
      const newToken = await refreshToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return api(error.config);
    }
    return Promise.reject(error);
  }
);

// Uso
export async function getForm(id: string) {
  const { data } = await api.get(`/forms/${id}`);
  return data;
}
```

### Loading & Error States
```typescript
// ✅ SEMPRE mostrar loading/error
function FormBuilder({ formId }: { formId: string }) {
  const { data: form, isLoading, error } = useForm(formId);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;
  
  return <Builder form={form} />;
}
```

### Responsivo
```typescript
// ✅ Tailwind mobile-first
export function FormPreview() {
  return (
    <div className="w-full md:w-1/2 lg:w-2/3">
      {/* Mobile: 100%, tablet 50%, desktop 66% */}
      <FormRenderer />
    </div>
  );
}

// ✅ Testado em:
// - Mobile: 375px (iPhone SE)
// - Tablet: 768px (iPad)
// - Desktop: 1920px (Monitor grande)
```

---

## 🧪 QA Standards

### Unit Tests
```typescript
// Tecnologia: Jest + React Testing Library
// Cobertura: Mínimo 80%
// Rodas com: npm run test

// Testa:
// - Controllers (endpoints)
// - Services (lógica)
// - Utilities (helpers)
// - Components (comportamento)

// Exemplo
describe('FormService', () => {
  it('should create form with valid data', async () => {
    const form = await formService.create({
      userId: 'user1',
      name: 'Test Form',
    });
    expect(form.id).toBeDefined();
    expect(form.name).toBe('Test Form');
  });
});
```

### Integration Tests
```typescript
// Testa fluxo completo:
// 1. Criar form
// 2. Adicionar field
// 3. Publicar
// 4. Responder
// 5. Ver resposta no dashboard

describe('Form Workflow', () => {
  it('should create and submit form end-to-end', async () => {
    const form = await createForm(...);
    await publishForm(form.id);
    const response = await submitForm(form.id, {...});
    expect(response.success).toBe(true);
  });
});
```

### Test Data
```typescript
// ✅ Sempre use fixtures reais
// ❌ Nunca use faker (dados irreal)

// fixtures/forms.ts
export const mockForm = {
  id: 'form-123',
  userId: 'user-123',
  name: 'Contact Form',
  fields: [
    {
      id: 'field-1',
      type: 'TEXT',
      label: 'Name',
      required: true,
    },
  ],
};
```

---

## 🔐 Security

### Authentication
```typescript
// JWT + Refresh tokens
// Access token: 15 minutos expiry
// Refresh token: 7 dias expiry

const accessToken = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

const refreshToken = jwt.sign(
  { userId: user.id },
  process.env.REFRESH_SECRET,
  { expiresIn: '7d' }
);
```

### CORS
```typescript
// ✅ NUNCA usar * (inseguro)
app.use(cors({
  origin: process.env.FRONTEND_URL, // apenas seu frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
```

### Secrets
```bash
# ✅ .env.local (NUNCA commit)
DATABASE_URL=postgresql://...
JWT_SECRET=seu_secret_aleatorio
AWS_ACCESS_KEY_ID=...
SENDGRID_API_KEY=...

# ❌ Nunca hardcode
const secret = "meu_secret"; // ❌ ERRADO
```

### Input Sanitization
```typescript
// Remover HTML tags, scripts
import DOMPurify from 'dompurify';

const sanitize = (input: string) => {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
};

// Trim whitespace
const formName = req.body.name.trim();

// Validação de tipo com Zod (já faz sanitização)
const FormNameSchema = z.string().min(1).trim();
```

### SQL Injection
```typescript
// ✅ SEMPRE usar parameterized queries (Prisma faz automático)
const form = await prisma.form.findUnique({
  where: { id: formId }, // ✅ Parameterizado
});

// ❌ NUNCA query strings
const form = await db.query(`SELECT * FROM forms WHERE id = '${formId}'`); // ❌
```

### Rate Limiting
```typescript
// Endpoints públicos: 10 req/min por IP
// Endpoints autenticados: 30 req/min por user
// Upload: 5 files/min por user
// Login: 5 tentativas/5 min por IP
```

### GDPR/LGPD Compliance
```typescript
// [ ] User pode ver seus dados
// [ ] User pode deletar conta + todos dados
// [ ] User pode exportar dados
// [ ] Consentimento antes de coletar
// [ ] Privacy policy clara

// Deletar user
await prisma.user.delete({ where: { id: userId } });
// Cascade delete: forms, responses, files tudo vai
```

---

## 📋 Checklist Antes de Commit

```bash
# [ ] Código segue padrões acima?
# [ ] Testes passam (npm run test)?
# [ ] Lint passa (npm run lint)?
# [ ] Sem console.log (use logger)?
# [ ] Tipo TypeScript correto (no any)?
# [ ] Sem secrets no código?
# [ ] Commit message descritivo?
# [ ] PR com descrição?
```

---

## 🚀 Deployment Checklist

```bash
# [ ] Migrations rodadas?
# [ ] Environment variables setadas?
# [ ] Secrets seguros no host?
# [ ] Database backup agendado?
# [ ] Logging configurado?
# [ ] Monitoring ativo?
# [ ] CORS configurado?
# [ ] Rate limiting ativo?
# [ ] Error tracking (Sentry) rodando?
```

---

**Estes padrões são OBRIGATÓRIOS. Nenhuma exceção!**