# AGENTS.md — AcadFlow Web

> Diretrizes para agentes de IA e colaboradores que implementam tarefas neste repositório.

## 1. Contexto e fontes

- **Produto:** AcadFlow, interface acadêmica para `PROFESSOR` e `ALUNO`.
- **Repositório:** `DevCaverna/acadflow-web`. A API vive em `DevCaverna/acadflow-api`; o design oficial em `DevCaverna/acadflow-design`.
- **Fontes obrigatórias:** [projeto no Linear](https://linear.app/acadflow/project/acadflow-sistema-de-gestao-academica-11ce95e87805), [acadflow-design](https://github.com/DevCaverna/acadflow-design), `docs/arquitetura.md`, `docs/contratos-mock.md`, `docs/execucao/README.md`.
- **Stack-alvo:** Node.js 24, pnpm 12.4.2, React, Vite, TypeScript 6 (strict), TanStack Query, Axios, React Router, React Hook Form, Zod, Tailwind CSS, react-i18next, Vitest e Testing Library.
- **Idioma do código:** inglês. **Produto bilíngue:** `pt-BR` (padrão) e `en`.
- **Fonte de verdade visual:** tokens, ícones e fluxos do `acadflow-design`; não criar outra identidade ou mudar a regra da média por conveniência.

## 2. Organização por funcionalidades

```text
src/
  main.tsx
  app/{providers,router,store}/
  shared/{api,components,config,lib,types}/
  features/
    auth/{api,components,hooks,pages,schemas}/
    profile/{api,components,hooks,pages,schemas}/
    disciplines/{api,components,hooks,pages,schemas}/
    enrollments/{api,components,hooks}/
    activities/{api,components,hooks,pages,schemas}/
    grades/{api,components,hooks,pages,schemas}/
  i18n/{index.ts,locales/pt-BR/,locales/en/}
  styles/
public/{icons,images}/
docker/{Dockerfile,Dockerfile.dev,compose.dev.yml,nginx.conf}
docs/execucao/
test/
```

- A pasta `features/` é organizada **por domínio**, não como um único diretório global de hooks/pages/services.
- `shared/` recebe apenas componentes, utilitários e contratos realmente reutilizáveis.
- Utilizar componentes e ícones já definidos no repositório de design; respeitar estados skeleton, vazio, erro, sem conexão e sessão expirada.
- Evitar implementar lógica de segurança exclusivamente no navegador: o backend valida autorização real.

## 3. Imports, TypeScript, lint e formatação

- Usar alias `@/` para imports internos (`@/features/...`, `@/shared/...`), nunca caminhos relativos longos; exceções precisam ser justificadas.
- O alias precisa funcionar no Vite, `tsconfig.app.json`, configs de teste e IDE.
- TypeScript 6 com `strict`, `moduleResolution: Bundler`, `verbatimModuleSyntax` e sem `baseUrl` depreciado.
- Usar Oxlint (`pnpm lint`) e Oxfmt (`pnpm format`), **não** ESLint/Prettier.
- Nomes: `LoginPage.tsx`, `GradeCard.tsx`, `useGrades.ts`, `grades.service.ts`, `grades.schema.ts`, `time.constants.ts`.
- Componentes novos devem ter JSDoc no componente e nas props, quando fizer sentido; sem comentários repetindo o código, `console.log` ou código morto.
- Usar `cn()` para classes condicionais e constantes de duração de `src/shared/config/time.constants.ts`.
- Cores e espaçamentos vêm dos tokens CSS/Tailwind do design; não espalhar hex hardcoded pelos componentes.

## 4. Estado, API e formulários

- **TanStack Query** é a fonte de verdade para dados remotos: queries, mutações, cache, invalidação, loading e refetch.
- O acesso HTTP passa por **services Axios** (um cliente base em `shared/api`) e hooks por feature (`useDisciplines`, `useGrades`). Validar respostas externas em fronteiras com Zod.
- **Cliente HTTP único:** `ApiService` (`shared/api/api.service.ts`) é um singleton, acessado por `ApiService.getInstance()`. Só ele usa Axios; cuida de token, idioma, timeout, sessão expirada e validação Zod (`api.get({ url, schema })`).
- **Service por domínio:** classe que recebe `ApiService` no construtor e exporta uma instância única (`export const gradesService = new GradesService(apiService)`). Métodos com parâmetros nomeados recebem um objeto tipado e declaram o retorno.
- Componentes não chamam services direto: usam os hooks da feature.
- Redux Toolkit **somente se existir necessidade real de estado global da interface**; nunca RTK Query e nunca duplicar dados remotos no Redux.
- Reutilizar query keys estáveis e invalidar consultas após mutações.
- React Hook Form + Zod para formulários; erros devem ser legíveis, tipados e traduzidos.
- Enquanto endpoints estiverem em implementação, usar mocks aderentes a `docs/contratos-mock.md`. O trabalho Web deve poder começar sem esperar API pronta.

## 5. Idiomas e conteúdo

- `react-i18next` com `pt-BR` padrão e `en` alternativo, fallback para `pt-BR`.
- **Nenhum texto visível hardcoded** em página, componente, hook ou aviso: usar `t()` e chaves agrupadas por contexto (`common`, `auth`, `disciplines`, `activities`, `grades`, `errors`).
- Antes de criar chave, procurar texto equivalente. Preferir chaves genéricas para ações, campos, erros e validações reutilizados.
- Textos dinâmicos utilizam interpolação (`t('welcome', { name })`), nunca concatenação de traduções.
- Ao adicionar ou modificar texto, manter traduções em **`pt-BR` e `en`**. Datas e números por `Intl.DateTimeFormat`/`Intl.NumberFormat`; média e nota permanecem valores numéricos nos contratos da API.
- Axios envia `Accept-Language` de acordo com a preferência da Web.
- O checklist do template de PR cobra `pt-BR`; toda tradução nova da aplicação deve ser adicionada **também em `en`**.

## 6. Design, acessibilidade e regras acadêmicas

- Implementar as telas a partir do `acadflow-design`: professor, aluno, login, atividades, notas e estados de erro.
- A UI mostra **aprovado para média ≥ 7**, **recuperação para média 5 até < 7** e **reprovado para média < 5**. Sem notas deve mostrar estado próprio, nunca reprovação automática.
- Sem tela de cadastro no MVP: as contas vêm de seed da API. Dark mode, anexos, perfil completo e notificações são pós-MVP.
- Tratar loading, erro, sem dados, requisição rejeitada e sessão expirada antes de declarar uma página pronta.
- HTML semântico, foco visível, teclado, labels, alt text e contraste adequado.
- Conferir desktop e largura móvel.
- Não permitir ações de professor na UI do aluno, mas lembrar que regras de permissão também precisam existir na API.

## 7. Docker, execução e variáveis de ambiente

- Criar `docker/Dockerfile` para build de produção (Vite → servidor estático com fallback SPA), `docker/Dockerfile.dev` para desenvolvimento, `docker/compose.dev.yml` e `docker/nginx.conf`.
- Compose Web é **independente** do Compose API. O navegador usa `VITE_API_BASE_URL=http://localhost:3000` no desenvolvimento local (não nome interno de container).
- Expor Vite em `0.0.0.0:5173` dentro do container; definir CORS da API para a origem Web.
- **Toda variável `VITE_*` é pública no bundle**. Nunca colocar token R2, senha de banco, JWT secret ou secrets de servidor em `.env.example` da Web.
- Documentar requisitos, comandos, portas, troubleshooting e execução por Docker em `docs/execucao/README.md`.

## 8. Testes e qualidade

- Testes de componentes e hooks com Vitest + Testing Library, usando mocks HTTP e sem conexão com PostgreSQL.
- Testar login, redirecionamento por papel, estados de loading/erro/vazio, formulário e média exibida.
- O projeto Web não deve depender de servidor da API disponível para rodar testes automatizados.

```bash
pnpm install
pnpm dev
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:watch
pnpm build
pnpm pr
```

- CI em PR/push para `develop`, `staging` e `main` com Node 24/pnpm 12.4.2; validação antes do build, artefatos somente após sucesso. Não confundir artefato com deploy.

## 9. Git, Linear e Pull Requests

- Abrir issue `ACA-*`, descrever plano e desenvolver somente dentro do escopo aprovado.
- Branch: `feature/ACA-<numero>-slug` a partir de `develop`. Promoção `develop` → `staging` → `main`, com reviews.
- Conventional Commits em inglês, com mensagem curta no formato `<prefixo>: <descrição>`:

  | Prefixo     | Quando usar                |
  | ----------- | -------------------------- |
  | `feat:`     | Nova funcionalidade        |
  | `fix:`      | Correção de bug            |
  | `refactor:` | Refatoração                |
  | `test:`     | Adição ou ajuste de testes |
  | `docs:`     | Documentação               |
  | `chore:`    | Manutenção e configurações |
  | `ci:`       | Pipelines e GitHub Actions |

- PR usa `.github/PULL_REQUEST_TEMPLATE.md`, link do Linear, tela no design, evidências de responsividade e testes executados.
- Alteração de contrato HTTP exige alinhar `docs/contratos-mock.md` com `acadflow-api/docs/contratos-api.md` antes de integrar.
- Não editar o repositório da API ou design sem solicitação explícita; reportar dependências, sem bloquear trabalho com mocks.

## 10. Segurança, agentes e relatório de execução

- Não commitar `.env`, `.env.test`, tokens, cookies, credenciais ou dados pessoais reais.
- `.vscode/` e `.zed/` contêm apenas configurações compartilhadas para Oxc e scripts pnpm.
- Se a equipe usar `.agents/`: `.agents/memory/` para decisões duráveis, `.agents/prompts/` para instruções reutilizáveis revisadas e `.agents/artifacts/` para rascunhos/logs temporários ignorados no Git.
- Ao concluir tarefa, relatar arquivos criados/alterados, comandos realmente executados, evidências de teste e pendências. Nunca afirmar que testes, builds ou CI passaram sem verificar.
