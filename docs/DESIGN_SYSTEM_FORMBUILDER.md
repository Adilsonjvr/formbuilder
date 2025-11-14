# Design System FormBuilder - Prompt Adaptado

## Contexto do Projeto

**Stack Tecnológico:**
- **Frontend:** Next.js 16.0.2 (App Router) + React 19.2.0 + TypeScript
- **Styling:** Tailwind CSS v4 + CSS Variables (OKLCH color space)
- **UI Base:** shadcn/ui (New York variant) + Radix UI primitives
- **Animação:** A ser definido (GSAP ou Framer Motion recomendados)
- **Drag & Drop:** dnd-kit (especificado no plano)
- **Formulários:** React Hook Form + Zod validation
- **Data Fetching:** SWR
- **Ícones:** lucide-react

**Arquitetura Atual:**
- Design tokens via CSS variables em `globals.css`
- Componentes base: Button, Input, Label, Form (shadcn/ui)
- Tema escuro: `bg-slate-950` com bordas `slate-800`
- Sem paleta de cores branded definida (apenas neutros)

---

## 1. IDENTIDADE VISUAL & PALETA CROMÁTICA

### Padrão 60-30-10 Adaptado para FormBuilder

**Objetivo:** Criar ambiente profissional, confiável e moderno que inspire confiança na criação de formulários.

#### Paleta Proposta

**60% - Base Neutral (Fundação Visual)**
```css
/* Modo Claro */
--background: oklch(0.98 0 0);        /* Branco suave */
--surface: oklch(1 0 0);              /* Branco puro para cards */
--surface-secondary: oklch(0.96 0 0); /* Cinza muito claro */

/* Modo Escuro */
--background-dark: oklch(0.15 0 0);   /* Quase preto */
--surface-dark: oklch(0.18 0 0);      /* Cinza escuro para cards */
--surface-secondary-dark: oklch(0.13 0 0);
```

**30% - Supporting Colors (Suporte Contextual)**
```css
/* Bordas e Estrutura */
--border: oklch(0.90 0 0);            /* Cinza claro */
--border-hover: oklch(0.80 0 0);      /* Cinza médio */

/* Texto Secundário */
--muted-foreground: oklch(0.55 0 0);  /* Cinza médio */
```

**10% - Accent Colors (Ação e Feedback)**
```css
/* Primary - Ação Principal (Azul Profissional) */
--primary: oklch(0.55 0.20 250);      /* Azul vibrante */
--primary-hover: oklch(0.48 0.22 250);
--primary-foreground: oklch(1 0 0);   /* Branco */

/* Success - Confirmações Positivas */
--success: oklch(0.65 0.18 145);      /* Verde moderno */
--success-foreground: oklch(1 0 0);

/* Warning - Estados de Atenção */
--warning: oklch(0.70 0.15 65);       /* Âmbar */
--warning-foreground: oklch(0.15 0 0);

/* Destructive - Ações Destrutivas (já existe) */
--destructive: oklch(0.577 0.245 27.325);
--destructive-foreground: oklch(1 0 0);

/* Info - Informações Auxiliares */
--info: oklch(0.60 0.15 230);         /* Azul claro */
--info-foreground: oklch(1 0 0);
```

#### Aplicação Contextual

**Dashboard:**
- Fundo: 60% neutral (background)
- Cards: 30% surface + bordas subtis
- CTAs ("Criar Formulário", "Editar"): 10% primary accent
- Status badges: 10% success/warning/info

**Form Builder:**
- Canvas central: 60% surface (destaque visual)
- Sidebar de campos: 30% surface-secondary
- Botões de ação: 10% primary
- Preview: border com primary em hover

**Public Form:**
- Fundo: 60% neutral clean
- Form container: 30% surface com shadow
- Submit button: 10% primary (máximo contraste)

---

## 2. HIERARQUIA VISUAL NO FORMBUILDER

### Princípios Específicos

**Prioridade 1 - Ação Primária (Sempre Visível):**
- Botão "Criar Formulário" no dashboard
- Botão "Salvar" no builder
- Botão "Enviar" no formulário público
- **Implementação:** Primary color, sombra médium, tamanho lg, peso font-semibold

**Prioridade 2 - Navegação e Contexto:**
- Header com navegação
- Tabs do builder (Design, Compartilhar, Respostas)
- Breadcrumbs
- **Implementação:** Neutral colors, bordas sutis, tamanho base

**Prioridade 3 - Conteúdo Principal:**
- Cards de formulário no dashboard
- Campos no builder
- Preview do formulário
- **Implementação:** Surface com elevation, spacing generoso

**Prioridade 4 - Informações Secundárias:**
- Descrições, datas, metadados
- Help text, tooltips
- **Implementação:** Muted colors, tamanho sm, peso font-normal

### Hierarquia no Form Builder

```
┌─────────────────────────────────────────────────┐
│ Header (Prioridade 2)                          │
│ [Nome do Form] [Salvar - Prioridade 1]        │
├─────────────────────────────────────────────────┤
│ Tabs: [Design] [Compartilhar] [Respostas]     │
├──────────┬──────────────────────┬──────────────┤
│ Sidebar  │ Canvas               │ Settings     │
│ (P2)     │ (Prioridade 3)       │ (P3)         │
│          │                      │              │
│ Campos   │ ┌──────────────────┐ │ Config do    │
│ [Text]   │ │ Form Preview     │ │ campo        │
│ [Email]  │ │ (Prioridade 3)   │ │ selecionado  │
│ [Number] │ │                  │ │              │
│ ...      │ │ [Campo Atual]    │ │ [Required]   │
│          │ │                  │ │ [Placeholder]│
│          │ └──────────────────┘ │              │
└──────────┴──────────────────────┴──────────────┘
```

---

## 3. COMPONENTES CRÍTICOS DO DESIGN SYSTEM

### Fase 1 - MVP Essencial (Implementar Primeiro)

#### 3.1 Card Component
**Uso:** Dashboard form cards, stats cards, response cards

**Variantes:**
- `default` - Card estático
- `interactive` - Com hover elevation e cursor pointer
- `selected` - Estado selecionado com border primary

**Especificação:**
```tsx
<Card variant="interactive">
  <CardHeader>
    <CardTitle>Nome do Formulário</CardTitle>
    <CardDescription>Criado em 13/11/2025</CardDescription>
  </CardHeader>
  <CardContent>
    <Badge variant="success">12 respostas</Badge>
  </CardContent>
  <CardFooter>
    <DropdownMenu /> {/* Ações */}
  </CardFooter>
</Card>
```

**Motion:**
- Hover: `translateY(-2px)` + shadow elevation (ease-out 200ms)
- Focus: ring com primary color

#### 3.2 Dialog/Modal
**Uso:** Field settings, confirmações de delete, preview modal

**Variantes:**
- `sm` - 400px (confirmações)
- `md` - 600px (settings)
- `lg` - 800px (preview)
- `fullscreen` - Mobile responsive

**Motion:**
- Entrada: fade-in overlay + scale(0.95 → 1) no conteúdo (ease-out 300ms)
- Saída: fade-out + scale(1 → 0.95) (ease-in 200ms)

#### 3.3 Sheet/Drawer
**Uso:** Field palette sidebar, settings panel

**Direções:**
- `left` - Field palette
- `right` - Settings panel
- `bottom` - Mobile drawer

**Motion:**
- Entrada: slide-in do lado + fade-in overlay (ease-out 300ms)
- Backdrop: blur(4px) durante animação

#### 3.4 Table Component
**Uso:** Response list com sorting, filtering, pagination

**Features:**
- Sortable columns (com ícone de seta)
- Selectable rows (checkbox)
- Pagination controls
- Empty state
- Loading skeleton

**Hierarchy:**
- Header: font-semibold, muted-foreground
- Rows: hover com background-secondary
- Selected: border-l-4 com primary

#### 3.5 DropdownMenu
**Uso:** Form actions (edit, delete, share), field actions, export

**Motion:**
- Entrada: fade-in + translateY(-4px → 0) (ease-out 150ms)
- Items: hover com background-secondary

#### 3.6 Badge Component
**Uso:** Field type, form status, response count

**Variantes:**
- `default` - Neutral
- `success` - Verde (publicado, ativo)
- `warning` - Âmbar (rascunho)
- `destructive` - Vermelho (erro)
- `info` - Azul (info)

#### 3.7 Toast/Notification
**Uso:** Feedback de ações (salvo, publicado, erro)

**Variantes:**
- `success` - Verde com ícone de check
- `error` - Vermelho com ícone de X
- `info` - Azul com ícone de i
- `loading` - Spinner animado

**Motion:**
- Entrada: slide-in-right + fade-in (ease-out 300ms)
- Saída: fade-out + slide-out-right (ease-in 200ms)
- Duração: 3s (success), 5s (error), infinito (loading)

#### 3.8 Tabs Component
**Uso:** Builder sections (Design, Compartilhar, Respostas)

**Motion:**
- Active indicator: slide com spring animation (dnd-kit style)
- Content: fade-in novo tab (150ms)

---

### Fase 2 - Enhanced UX

#### 3.9 Switch/Toggle
**Uso:** Required field, form público/privado

**States:**
- Off: border + background-secondary
- On: background-primary
- Motion: switch circle slide (ease-out 200ms)

#### 3.10 Tooltip
**Uso:** Help icons, action button hints

**Spec:**
- Delay: 500ms
- Max-width: 240px
- Arrow indicator
- Motion: fade-in + translateY(4px → 0) (150ms)

#### 3.11 Skeleton Loaders
**Uso:** Dashboard loading, form loading

**Motion:**
- Shimmer animation: gradient moving (linear 1.5s infinite)

---

## 4. MOTION DESIGN STRATEGY

### Princípios para FormBuilder

**Propósito:** Motion deve **comunicar causalidade** e **confirmar ações** sem distrair da tarefa principal (criar formulários).

**Restrições:**
- Animações rápidas (150-300ms)
- Easing: ease-out para entradas, ease-in para saídas
- Respeitar `prefers-reduced-motion`
- 60fps em desktop, mínimo 45fps em mobile

### Bibliotecas Recomendadas

**Opção 1: Framer Motion (Recomendado)**
- Razão: Integração nativa com React, declarativo, menor bundle
- Uso: Transições de página, AnimatePresence para modals/toasts
- Trade-off: Menos controle granular que GSAP

**Opção 2: GSAP + dnd-kit**
- Razão: Máximo controle, performance extrema
- Uso: Drag-drop no builder, animações complexas de scroll
- Trade-off: Bundle maior, curva de aprendizado

**Recomendação Final:** Framer Motion para UI geral + dnd-kit para drag-drop.

### Animações Específicas do FormBuilder

#### Dashboard
**Cards hover:**
```tsx
<motion.div
  whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
```

**Create button:**
```tsx
<motion.button
  whileTap={{ scale: 0.98 }}
  whileHover={{ scale: 1.02 }}
>
```

#### Form Builder
**Drag & Drop Fields:**
- Uso: dnd-kit com `useSortable`
- Visual: Semi-transparência durante drag (opacity: 0.5)
- Drop indicator: Border pulsante com primary color
- Motion: Spring physics para reordering

**Sidebar slide-in:**
```tsx
<motion.aside
  initial={{ x: -300, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
```

**Field add to canvas:**
```tsx
// Quando campo é adicionado ao canvas
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.25, ease: "easeOut" }}
>
```

#### Form Preview
**Split-view reveal:**
```tsx
<motion.div
  initial={{ width: 0, opacity: 0 }}
  animate={{ width: "50%", opacity: 1 }}
  exit={{ width: 0, opacity: 0 }}
  transition={{ duration: 0.3 }}
>
```

#### Public Form
**Submit success:**
```tsx
<AnimatePresence>
  {submitted && (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <CheckCircle /> {/* Sucesso */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## 5. TÉCNICAS VISUAIS APLICADAS

### Fundos e Profundidade

**Dashboard:**
- Fundo: `background` (neutral)
- Cards: `surface` com shadow-md
- Hover: shadow-lg + translateY(-4px)
- Selected: border-l-4 com primary

**Builder Canvas:**
- Fundo: `surface-secondary` (distingue área de trabalho)
- Canvas: `surface` centralizado com shadow-lg (papel em branco)
- Fields: shadow-sm + border, hover → shadow-md

**Elevation Scale:**
```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--shadow-sm: 0 2px 4px rgba(0,0,0,0.06);
--shadow-md: 0 4px 12px rgba(0,0,0,0.08);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
--shadow-xl: 0 16px 48px rgba(0,0,0,0.16);
```

### Espaçamento Modular

**Base:** 4px (Tailwind default já usa)

**Aplicação:**
- Padding interno de cards: `p-6` (24px)
- Spacing entre cards: `gap-4` (16px)
- Margem entre seções: `mb-8` (32px)
- Padding do canvas: `p-8` (32px)

**Agrupamento Visual:**
- Campos relacionados: `gap-2` (8px)
- Seções diferentes: `gap-6` (24px)

---

## 6. ACESSIBILIDADE E PERFORMANCE

### Acessibilidade Obrigatória

#### Contraste (WCAG AA)
- Texto principal: mínimo 4.5:1
- Texto large (18px+): mínimo 3:1
- Elementos interativos: mínimo 3:1

**Validação:**
```bash
# Usar ferramenta para testar
npx @adobe/leonardo-cli contrast --bg "#f5f5f5" --fg "#1a1a1a"
```

#### Keyboard Navigation
- Tab order lógico
- Focus visible (ring-2 ring-primary)
- Esc fecha modals/dropdowns
- Enter ativa botões

#### Screen Readers
- Semantic HTML (button, nav, main, aside)
- aria-label em ícones
- aria-describedby em help text
- Live regions para toasts (aria-live="polite")

#### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx
// Framer Motion
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

<motion.div
  animate={prefersReducedMotion ? {} : { y: -4 }}
>
```

### Performance

#### Targets
- Dashboard: First Contentful Paint < 1.5s
- Builder: Time to Interactive < 3s
- Animações: 60fps desktop, 45fps+ mobile

#### Otimizações
- Code splitting: lazy load builder components
- Image optimization: Next.js Image component
- SVG icons: lucide-react (tree-shakeable)
- CSS: Tailwind purge unused classes
- Bundle analysis: `npm run build -- --analyze`

#### Monitoramento
```tsx
// Usar React Profiler
<Profiler id="FormBuilder" onRender={onRenderCallback}>
  <FormBuilder />
</Profiler>
```

---

## 7. DESIGN TOKENS COMPLETOS

### Typography Scale

```css
/* globals.css - adicionar */
:root {
  /* Font Sizes */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */

  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

### Animation Tokens

```css
:root {
  /* Durations */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;

  /* Easings */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Z-Index Scale

```css
:root {
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-sheet: 1200;
  --z-modal: 1300;
  --z-toast: 1400;
  --z-tooltip: 1500;
}
```

---

## 8. ESTRUTURA DE ARQUIVOS PROPOSTA

```
frontend/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css (UPDATE: adicionar tokens)
│   ├── login/
│   ├── signup/
│   ├── dashboard/
│   │   └── page.tsx (UPDATE: usar novos componentes)
│   ├── builder/
│   │   └── [formId]/
│   │       └── page.tsx (NEW: form builder)
│   └── forms/
│       └── [formId]/
│           ├── page.tsx (NEW: public form view)
│           └── responses/page.tsx (NEW: responses list)
├── components/
│   ├── ui/ (shadcn components - EXPAND)
│   │   ├── button.tsx ✓
│   │   ├── input.tsx ✓
│   │   ├── label.tsx ✓
│   │   ├── form.tsx ✓
│   │   ├── card.tsx (NEW)
│   │   ├── dialog.tsx (NEW)
│   │   ├── sheet.tsx (NEW)
│   │   ├── table.tsx (NEW)
│   │   ├── dropdown-menu.tsx (NEW)
│   │   ├── tabs.tsx (NEW)
│   │   ├── badge.tsx (NEW)
│   │   ├── toast.tsx (NEW)
│   │   ├── textarea.tsx (NEW)
│   │   ├── select.tsx (NEW)
│   │   ├── switch.tsx (NEW)
│   │   ├── tooltip.tsx (NEW)
│   │   ├── skeleton.tsx (NEW)
│   │   └── ... (outros conforme necessário)
│   ├── forms/ (NEW: form-specific)
│   │   ├── field-builder.tsx (drag-drop canvas)
│   │   ├── field-palette.tsx (sidebar com tipos)
│   │   ├── field-settings.tsx (painel de config)
│   │   ├── form-preview.tsx (preview ao vivo)
│   │   ├── form-card.tsx (card do dashboard)
│   │   └── field-renderers/ (componentes para cada tipo)
│   │       ├── text-field.tsx
│   │       ├── email-field.tsx
│   │       ├── number-field.tsx
│   │       └── ...
│   ├── dashboard/ (NEW)
│   │   ├── response-table.tsx
│   │   ├── stats-card.tsx
│   │   └── export-button.tsx
│   └── layouts/ (NEW)
│       ├── builder-layout.tsx (2-col ou 3-col)
│       ├── dashboard-layout.tsx
│       └── public-form-layout.tsx
├── lib/
│   ├── utils.ts ✓
│   ├── api.ts ✓
│   ├── theme.ts (NEW: theme utilities)
│   ├── constants.ts (NEW: field types, etc.)
│   └── motion.ts (NEW: motion variants)
└── hooks/ (NEW)
    ├── use-form-builder.ts (builder state)
    ├── use-toast.ts (toast management)
    └── use-media-query.ts (responsive)
```

---

## 9. ROADMAP DE IMPLEMENTAÇÃO

### Sprint 1: Foundation (Semana 1)
1. ✅ Instalar componentes shadcn necessários
2. ✅ Atualizar `globals.css` com tokens de cores branded
3. ✅ Criar tokens de animação e z-index
4. ✅ Implementar Card, Badge, Button variants
5. ✅ Criar FormCard component para dashboard
6. ✅ Atualizar Dashboard page com novos componentes

### Sprint 2: Builder Core (Semana 2)
1. ✅ Instalar dnd-kit
2. ✅ Criar FieldPalette sidebar
3. ✅ Implementar FieldBuilder canvas com drag-drop
4. ✅ Criar FieldSettings panel (Sheet)
5. ✅ Implementar field renderers básicos
6. ✅ Criar BuilderLayout

### Sprint 3: Preview & Responses (Semana 3)
1. ✅ Implementar FormPreview component
2. ✅ Criar public form page
3. ✅ Implementar ResponseTable
4. ✅ Adicionar Export functionality
5. ✅ Criar StatsCard para métricas

### Sprint 4: Polish & Motion (Semana 4)
1. ✅ Adicionar Framer Motion em transições
2. ✅ Implementar Toast notifications
3. ✅ Adicionar Skeleton loaders
4. ✅ Refinar animações de drag-drop
5. ✅ Teste de acessibilidade e performance
6. ✅ Documentar componentes

---

## 10. COMPONENTES PRIORITÁRIOS - ESPECIFICAÇÕES DETALHADAS

### Card Component

**Arquivo:** `components/ui/card.tsx`

```tsx
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default: "shadow-sm",
        interactive: "shadow-sm hover:shadow-md hover:-translate-y-1 cursor-pointer",
        selected: "shadow-md border-l-4 border-l-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
)

// CardHeader, CardTitle, CardDescription, CardContent, CardFooter...
```

**Uso:**
```tsx
<Card variant="interactive" onClick={() => router.push(`/builder/${form.id}`)}>
  <CardHeader>
    <CardTitle>{form.name}</CardTitle>
    <CardDescription>{form.description}</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex gap-2">
      <Badge variant="success">{form.responseCount} respostas</Badge>
      <Badge variant="default">{form.status}</Badge>
    </div>
  </CardContent>
  <CardFooter>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Editar</DropdownMenuItem>
        <DropdownMenuItem>Ver Respostas</DropdownMenuItem>
        <DropdownMenuItem>Compartilhar</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          Deletar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </CardFooter>
</Card>
```

---

### Badge Component

**Arquivo:** `components/ui/badge.tsx`

```tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        info: "border-transparent bg-info text-info-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

**Uso:**
```tsx
<Badge variant="success">Publicado</Badge>
<Badge variant="warning">Rascunho</Badge>
<Badge variant="info">12 respostas</Badge>
```

---

### Toast System

**Arquivo:** `components/ui/toast.tsx` + `hooks/use-toast.ts`

**Features:**
- Auto-dismiss (3s success, 5s error)
- Queue de múltiplos toasts
- Ações customizadas (Desfazer, Ver detalhes)
- Variantes: success, error, info, loading

**Implementação via shadcn:**
```bash
npx shadcn@latest add toast
```

**Uso:**
```tsx
import { useToast } from "@/hooks/use-toast"

const { toast } = useToast()

// Success
toast({
  title: "Formulário salvo!",
  description: "Suas alterações foram salvas com sucesso.",
  variant: "success",
})

// Error
toast({
  title: "Erro ao salvar",
  description: "Tente novamente em alguns instantes.",
  variant: "destructive",
})

// Com ação
toast({
  title: "Formulário deletado",
  description: "O formulário foi removido.",
  action: <ToastAction altText="Desfazer">Desfazer</ToastAction>,
})
```

---

## 11. CHECKLIST DE VALIDAÇÃO

### Design Tokens ✓
- [ ] Cores branded definidas (primary, success, warning, info)
- [ ] Paleta 60-30-10 aplicada
- [ ] Dark mode implementado
- [ ] Typography scale consistente
- [ ] Spacing modular (base 4px)
- [ ] Shadow system definido
- [ ] Animation tokens (duration, easing)
- [ ] Z-index scale

### Componentes UI ✓
- [ ] Card (default, interactive, selected)
- [ ] Dialog/Modal (sm, md, lg)
- [ ] Sheet/Drawer (left, right, bottom)
- [ ] Table (sortable, selectable, pagination)
- [ ] DropdownMenu
- [ ] Tabs
- [ ] Badge (5 variantes)
- [ ] Toast (4 variantes)
- [ ] Textarea
- [ ] Select
- [ ] Switch
- [ ] Tooltip
- [ ] Skeleton

### Form Builder ✓
- [ ] FieldPalette sidebar
- [ ] FieldBuilder canvas (drag-drop)
- [ ] FieldSettings panel
- [ ] FormPreview component
- [ ] Field renderers (11 tipos)
- [ ] BuilderLayout (responsive)

### Motion & Animations ✓
- [ ] Framer Motion instalado
- [ ] dnd-kit instalado e configurado
- [ ] Card hover animations
- [ ] Modal transitions
- [ ] Toast slide-in/out
- [ ] Drag-drop visual feedback
- [ ] prefers-reduced-motion implementado
- [ ] 60fps em desktop validado

### Acessibilidade ✓
- [ ] Contraste WCAG AA validado
- [ ] Keyboard navigation funcional
- [ ] Focus visible em todos os interativos
- [ ] aria-labels em ícones
- [ ] Screen reader testado
- [ ] Semantic HTML

### Performance ✓
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Code splitting implementado
- [ ] Images otimizadas
- [ ] Bundle size < 200kb (gzipped)

---

## 12. RECURSOS E REFERÊNCIAS

### Design System Inspirations
- **Vercel Design**: Minimalismo, espaçamento generoso
- **Linear**: Motion fluido, hierarquia clara
- **Stripe**: Profissionalismo, paleta neutral
- **Typeform**: Interatividade, preview em tempo real

### Bibliotecas Recomendadas
- **shadcn/ui**: Base de componentes (já instalado)
- **Framer Motion**: Animações (a instalar)
- **dnd-kit**: Drag & drop (especificado)
- **react-hook-form**: Formulários (já instalado)
- **zod**: Validação (já instalado)
- **lucide-react**: Ícones (já instalado)

### Ferramentas de Design
- **Figma**: Protótipos e design mockups
- **Coolors**: Geração de paletas
- **Contrast Checker**: WCAG validation
- **VisBug**: Inspecionar designs no browser

### Documentação
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [dnd-kit](https://docs.dndkit.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## CONCLUSÃO

Este design system foi adaptado especificamente para o FormBuilder com foco em:

1. **Hierarquia Clara**: Usuário sabe exatamente onde criar, editar e visualizar
2. **Paleta 60-30-10**: Neutral base + supporting grays + accent primary
3. **Motion Propositado**: Drag-drop fluido, feedback visual, sem distrações
4. **Performance**: 60fps, code splitting, otimizações mobile
5. **Acessibilidade**: WCAG AA, keyboard navigation, reduced motion

**Próximo Passo:** Implementar Sprint 1 (Foundation) começando pelos tokens e componentes base.
