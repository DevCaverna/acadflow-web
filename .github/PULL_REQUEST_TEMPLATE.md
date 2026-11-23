# Pull Request — AcadFlow Web

## 📌 Descrição

<!-- Descreva resumidamente o que esta PR implementa e quais telas/fluxos do AcadFlow altera. -->

---

## 🏷 Tipo de PR

- [ ] 🐛 Bugfix
- [ ] ✨ Feature
- [ ] ♻️ Refactor
- [ ] ⚡ Performance
- [ ] 🧪 Testes
- [ ] 📚 Documentação
- [ ] 🔧 Chore
- [ ] 🚨 Hotfix

---

## 🔗 Links Relacionados

- **Task no Linear:** ACA-...
- **Página/tela de referência:** https://github.com/DevCaverna/acadflow-design
- **Contrato da API:** https://github.com/DevCaverna/acadflow-api/blob/main/docs/contratos-api.md

---

## 🧠 Contexto

<!-- Qual problema resolve? Qual perfil é impactado: PROFESSOR, ALUNO ou ambos? -->

---

## 📋 Checklist

### Código e arquitetura

- [ ] Código segue organização `src/features/`, nomes em inglês e imports por alias `@/`
- [ ] Não há `console.log` ou código comentado desnecessário
- [ ] Componentes novos têm JSDoc no componente e nas props; demais comentários apenas quando indispensáveis
- [ ] Textos de interface passam por `t()` com traduções em `pt-BR`, `en` e `es` (fallback `pt-BR`)
- [ ] Cores e espaçamentos seguem tokens definidos pelo design AcadFlow; sem valores hexadecimais fixos nos componentes
- [ ] Classes condicionais são montadas usando `cn()`
- [ ] Consultas usam service Axios + hook TanStack Query; respostas externas são validadas com Zod nas fronteiras
- [ ] Redux Toolkit, se necessário, guarda apenas estado global do cliente; não replica cache TanStack Query
- [ ] Tempos e durações recorrentes usam `src/shared/config/time.constants.ts`
- [ ] Permissões de PROFESSOR/ALUNO são respeitadas na UI (a autorização real fica na API)

### Qualidade

- [ ] `pnpm lint`
- [ ] `pnpm format` (ou `pnpm format:check` no CI)
- [ ] `pnpm typecheck`
- [ ] `pnpm test` (Vitest)
- [ ] Testes adicionados ou atualizados
- [ ] Conferência de layout desktop/mobile
- [ ] Conferência do tema claro e do escuro **quando ambos estiverem implementados**
- [ ] `CHANGELOG.md` em `[Unreleased]` atualizado quando afetar usuário
- [ ] README/docs atualizados se necessário

### Acessibilidade

- [ ] HTML semântico e `aria-label` quando necessário
- [ ] Navegação por teclado com foco visível
- [ ] Imagens informativas com `alt`
- [ ] Contraste visual verificado no tema implementado

### Variáveis de ambiente

- [ ] Variáveis novas documentadas em `.env.example` e `src/types/env.d.ts`
- [ ] Nenhum segredo em `VITE_*`

---

## 📸 Evidências

<!-- Inclua prints, vídeos, teste no navegador e links de workflows quando se aplicar. -->

| Antes | Depois |
| --- | --- |
| | |

---

## 🚀 Observações adicionais

<!-- Pendências, contratos alterados, impactos de integração e riscos. -->
