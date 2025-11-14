# Plano de Implementação - Design System FormBuilder

## Estratégia de Desenvolvimento

### Abordagem: Feature Branch + Iterações Incrementais

```bash
# Setup inicial
git checkout -b feature/design-system-v1
```

---

## Fase 1: Foundation (2-3 horas)

### 1.1 Design Tokens (30 min)

**Objetivo:** Atualizar `globals.css` com paleta branded e tokens.

```bash
# Arquivo a editar
frontend/src/app/globals.css
```

**Checklist:**
- [ ] Adicionar cores branded (primary blue, success green, warning amber, info blue)
- [ ] Criar tokens de animação (duration, easing)
- [ ] Adicionar z-index scale
- [ ] Criar shadow system completo
- [ ] Documentar tokens com comentários

**Commit:**
```bash
git add frontend/src/app/globals.css
git commit -m "feat: add design tokens - branded colors, animations, shadows"
```

---

### 1.2 Instalar Componentes shadcn (30 min)

```bash
# Componentes críticos para MVP
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add sheet
npx shadcn@latest add dropdown-menu
npx shadcn@latest add badge
npx shadcn@latest add toast
npx shadcn@latest add tabs
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add switch
npx shadcn@latest add tooltip
npx shadcn@latest add skeleton
npx shadcn@latest add table
```

**Commit:**
```bash
git add .
git commit -m "feat: install shadcn ui components (card, dialog, sheet, etc)"
```

---

### 1.3 Instalar Bibliotecas de Animação (15 min)

```bash
cd frontend
npm install framer-motion
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Commit:**
```bash
git add package.json package-lock.json
git commit -m "feat: install framer-motion and dnd-kit"
```

---

### 1.4 Criar Utilities e Constants (30 min)

**Arquivos a criar:**

**`frontend/src/lib/constants.ts`**
```typescript
export const FIELD_TYPES = {
  TEXT: 'TEXT',
  EMAIL: 'EMAIL',
  NUMBER: 'NUMBER',
  SELECT: 'SELECT',
  CHECKBOX: 'CHECKBOX',
  RADIO: 'RADIO',
  DATE: 'DATE',
  TIME: 'TIME',
  FILE: 'FILE',
  RATING: 'RATING',
  NPS: 'NPS',
} as const

export const FIELD_ICONS = {
  TEXT: 'Type',
  EMAIL: 'Mail',
  NUMBER: 'Hash',
  // ... etc
}

export const FIELD_LABELS = {
  TEXT: 'Texto',
  EMAIL: 'Email',
  NUMBER: 'Número',
  // ... etc
}
```

**`frontend/src/lib/motion.ts`**
```typescript
import { Variants } from 'framer-motion'

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const slideInRight: Variants = {
  initial: { x: 300, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 300, opacity: 0 },
}

export const scaleIn: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
}

// ... etc
```

**Commit:**
```bash
git add frontend/src/lib/constants.ts frontend/src/lib/motion.ts
git commit -m "feat: add constants and motion variants"
```

---

### 1.5 Criar FormCard Component (45 min)

**Arquivo:** `frontend/src/components/forms/form-card.tsx`

Componente customizado que usa `Card` do shadcn + lógica específica.

**Features:**
- Variante interactive com hover
- Dropdown de ações
- Badges para status e response count
- Click para navegar ao builder

**Commit:**
```bash
git add frontend/src/components/forms/
git commit -m "feat: create FormCard component for dashboard"
```

---

### 1.6 Atualizar Dashboard Page (30 min)

**Arquivo:** `frontend/src/app/dashboard/page.tsx`

**Mudanças:**
- Usar grid de FormCard em vez de lista simples
- Adicionar estado de loading com Skeleton
- Adicionar empty state (nenhum formulário)
- Botão "Criar Formulário" destacado

**Commit:**
```bash
git add frontend/src/app/dashboard/page.tsx
git commit -m "feat: redesign dashboard with FormCard grid and skeletons"
```

---

## Checkpoint 1: Validação Visual

```bash
npm run dev
# Navegar para /dashboard
# Validar:
# - Cores branded aplicadas
# - Cards com hover effect
# - Layout responsivo
# - Skeleton loaders funcionando
```

**Se satisfeito:**
```bash
git push origin feature/design-system-v1
# Criar PR para revisão
```

**Se insatisfeito:**
```bash
# Reverter último commit e ajustar
git reset --soft HEAD~1
# Fazer alterações
git add .
git commit -m "feat: ajuste em FormCard"
```

---

## Fase 2: Form Builder Core (4-6 horas)

### 2.1 Criar BuilderLayout (1h)

**Arquivo:** `frontend/src/components/layouts/builder-layout.tsx`

**Estrutura:**
```
┌─────────────────────────────────────────┐
│ Header: [Form Name] [Save] [Preview]   │
├───────┬─────────────────────┬───────────┤
│ Field │ Canvas              │ Settings  │
│ Palette                     │ (Sheet)   │
│ (280px)│ (flex-1)           │ (320px)   │
│        │                    │           │
│ [Text] │ ┌───────────────┐  │ Selected  │
│ [Email]│ │ Form Preview  │  │ Field     │
│ [#]    │ │               │  │ Config    │
│ ...    │ │ [Field 1]     │  │           │
│        │ │ [Field 2]     │  │ [Label]   │
│        │ └───────────────┘  │ [Required]│
└───────┴─────────────────────┴───────────┘
```

**Responsivo:**
- Desktop: 3 colunas
- Tablet: 2 colunas (canvas + sheet)
- Mobile: 1 coluna (tabs)

---

### 2.2 Criar FieldPalette (1h)

**Arquivo:** `frontend/src/components/forms/field-palette.tsx`

**Features:**
- Lista todos os 11 tipos de campo
- Ícone + Label
- Draggable (dnd-kit)
- Categorias: Básico, Avançado, Especial

---

### 2.3 Implementar FieldBuilder Canvas (2h)

**Arquivo:** `frontend/src/components/forms/field-builder.tsx`

**Features:**
- Drop zone (dnd-kit)
- Sortable fields (reordenação)
- Visual feedback durante drag
- Empty state
- Click em field abre FieldSettings

---

### 2.4 Criar FieldSettings Panel (1h)

**Arquivo:** `frontend/src/components/forms/field-settings.tsx`

**Implementação:**
- Sheet (drawer) do lado direito
- Form com React Hook Form
- Campos: Label, Placeholder, Help Text, Required, Validation
- Botão Delete field

---

### 2.5 Criar Field Renderers (1h)

**Pasta:** `frontend/src/components/forms/field-renderers/`

Componentes para cada tipo de campo:
- `text-field.tsx`
- `email-field.tsx`
- `number-field.tsx`
- `select-field.tsx`
- etc.

**Commit após cada milestone:**
```bash
git add .
git commit -m "feat: implement field builder with dnd-kit"
```

---

## Checkpoint 2: Builder Funcional

```bash
npm run dev
# Criar nova rota: /builder/new
# Validar:
# - Drag field from palette to canvas
# - Reorder fields
# - Open settings panel
# - Edit field config
# - Delete field
```

---

## Fase 3: Preview & Public Form (2-3 horas)

### 3.1 Criar FormPreview Component (1h)

**Arquivo:** `frontend/src/components/forms/form-preview.tsx`

**Features:**
- Renderiza fields em read-only
- Botão "Preview Mode" no header
- Split view (canvas | preview)

---

### 3.2 Criar Public Form Page (1h)

**Arquivo:** `frontend/src/app/forms/[formId]/page.tsx`

**Features:**
- Layout limpo (sem dashboard header)
- Renderiza fields
- Submit form
- Success animation (Framer Motion)
- Error handling

---

### 3.3 Implementar Submit & Validation (1h)

**Lógica:**
- React Hook Form
- Zod schema gerado dinamicamente baseado nos fields
- POST para `/public/forms/:id/responses`
- Toast de sucesso/erro

**Commit:**
```bash
git add .
git commit -m "feat: implement public form submission with validation"
```

---

## Checkpoint 3: Form Submission

```bash
# Publicar um form de teste
# Abrir /forms/[id] (public)
# Preencher e enviar
# Validar:
# - Validation funcionando
# - Submit success
# - Toast notification
# - Success animation
```

---

## Fase 4: Responses & Analytics (2-3 horas)

### 4.1 Criar ResponseTable (1.5h)

**Arquivo:** `frontend/src/components/dashboard/response-table.tsx`

**Features:**
- shadcn Table component
- Sortable columns
- Pagination
- Selectable rows
- Export button

---

### 4.2 Criar Response Detail Modal (1h)

**Arquivo:** `frontend/src/components/dashboard/response-detail.tsx`

**Features:**
- Dialog component
- Renderiza todas as respostas
- Botão para deletar
- Timestamp e IP

---

### 4.3 Criar StatsCard (30 min)

**Arquivo:** `frontend/src/components/dashboard/stats-card.tsx`

**Features:**
- Total responses
- Response rate (respostas/dia)
- Last response date
- Animated numbers (count-up)

**Commit:**
```bash
git add .
git commit -m "feat: implement response table and stats dashboard"
```

---

## Checkpoint 4: Full Flow

```bash
# Fluxo completo:
# 1. Login
# 2. Dashboard → Ver forms
# 3. Criar novo form no builder
# 4. Adicionar fields
# 5. Preview
# 6. Salvar
# 7. Copiar link público
# 8. Abrir em aba anônima
# 9. Preencher e enviar
# 10. Voltar ao dashboard
# 11. Ver responses
# 12. Exportar (CSV/JSON)
```

---

## Fase 5: Polish & Optimization (2-3 horas)

### 5.1 Refinar Animações (1h)

**Checklist:**
- [ ] Card hover suave (200ms ease-out)
- [ ] Modal transitions (scale + fade)
- [ ] Toast slide-in
- [ ] Drag visual feedback
- [ ] Button interactions (whileTap)
- [ ] Page transitions (AnimatePresence)

---

### 5.2 Implementar Reduced Motion (30 min)

**Arquivo:** `frontend/src/lib/motion.ts`

```typescript
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  return prefersReducedMotion
}
```

---

### 5.3 Acessibilidade Audit (1h)

**Ferramentas:**
```bash
# Instalar axe-core
npm install --save-dev @axe-core/react

# Usar no desenvolvimento
# frontend/src/app/layout.tsx
if (process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000)
  })
}
```

**Validar:**
- [ ] Contraste WCAG AA (usar DevTools)
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Screen reader (VoiceOver no Mac)
- [ ] Focus visible em todos os elementos
- [ ] aria-labels onde necessário

---

### 5.4 Performance Optimization (30 min)

**Checklist:**
- [ ] Code splitting (lazy load builder)
- [ ] Image optimization (Next.js Image)
- [ ] Bundle analysis (`npm run build`)
- [ ] Lighthouse audit (> 90 score)

```bash
# Analisar bundle
npm run build
# Ver output no terminal
```

---

## Fase 6: Testing & Documentation (2 horas)

### 6.1 Testes de Integração (1h)

**Cenários críticos:**
1. Criar form → Adicionar fields → Salvar
2. Editar form existente → Modificar fields → Salvar
3. Deletar field → Confirmar
4. Submit público → Validação → Sucesso
5. Ver responses → Exportar CSV

---

### 6.2 Documentação (1h)

**Arquivo:** `frontend/README.md`

Documentar:
- Setup e instalação
- Estrutura de componentes
- Como adicionar novos field types
- Como customizar tema
- Como adicionar novas animações

---

## Commits Finais e Merge

```bash
# Commit final de polish
git add .
git commit -m "polish: animations, a11y, performance optimizations"

# Push para revisão
git push origin feature/design-system-v1

# Criar Pull Request no GitHub
gh pr create --title "Design System Implementation v1" --body "$(cat <<EOF
## Summary
- ✅ Design tokens (branded colors, animations, shadows)
- ✅ 20+ UI components (shadcn)
- ✅ Form builder with drag-drop (dnd-kit)
- ✅ Public form submission
- ✅ Response table with export
- ✅ Framer Motion animations
- ✅ WCAG AA accessibility
- ✅ Performance optimized

## Screenshots
[Add screenshots]

## Test Plan
- [x] Dashboard displays form cards
- [x] Builder allows field creation via drag-drop
- [x] Preview shows form in real-time
- [x] Public form submission works
- [x] Responses display correctly
- [x] Export functionality works
- [x] Animations run at 60fps
- [x] Keyboard navigation functional
- [x] Lighthouse score > 90

## Breaking Changes
None - additive only

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

# Após aprovação, merge
git checkout main
git merge feature/design-system-v1
git push origin main
```

---

## Estratégia de Rollback

Se algo der muito errado em qualquer fase:

```bash
# Ver histórico de commits
git log --oneline

# Reverter para commit específico (soft = mantém mudanças)
git reset --soft abc1234

# Reverter completamente (hard = descarta mudanças)
git reset --hard abc1234

# Ou criar branch de backup antes de começar
git checkout main
git branch backup/pre-design-system
git checkout feature/design-system-v1
```

---

## Resumo de Tempo Estimado

| Fase | Tempo | Prioridade |
|------|-------|------------|
| 1. Foundation | 2-3h | 🔴 Crítica |
| 2. Builder Core | 4-6h | 🔴 Crítica |
| 3. Preview & Public | 2-3h | 🔴 Crítica |
| 4. Responses | 2-3h | 🟡 Alta |
| 5. Polish | 2-3h | 🟡 Alta |
| 6. Testing | 2h | 🟢 Média |
| **TOTAL** | **14-20h** | ~2-3 dias |

---

## Recomendação Final

**Não faça git clone.** Use feature branch:

```bash
git checkout -b feature/design-system-v1
# Trabalhe iterativamente
# Commit frequentemente
# Push para revisão
# Merge quando satisfeito
```

**Vantagens:**
- Histórico preservado
- Fácil comparação (git diff main)
- Pode criar múltiplas branches (design-v1, design-v2)
- Não duplica node_modules/.env/etc
- Melhor para colaboração

Boa sorte! 🚀
