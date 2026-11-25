<div align="center">
  <img src="docs/assets/icon.svg" width="110" alt="Ícone do AcadFlow" />

# AcadFlow — Web

Aplicação web para professores e alunos organizarem disciplinas, atividades e notas.

[Documentação no Linear](https://linear.app/acadflow/document/acadflow-inicio-e-documentacao-9f01545a3125)
</div>

## Sobre

O professor gerencia disciplinas, atividades e notas, e o aluno acompanha atividades, notas, média e situação acadêmica. A aplicação consome a [AcadFlow API](https://github.com/DevCaverna/acadflow-api), com autenticação JWT e acesso por perfil.

O AcadFlow reúne em um só lugar os prazos, os materiais e as notas de cada turma, reduzindo a necessidade de consultar planilhas e mensagens separadas. A versão de referência da atividade **Operação Deploy**, da disciplina de Gerência de Configuração e Manutenção de Software (Engenharia de Software, UTFPR-CP), é a [v1.1.0](https://github.com/DevCaverna/acadflow-web/releases/tag/v1.1.0).

**Tecnologias:** `React` · `Vite` · `TypeScript` · `TanStack Query` · `Vitest` · `Testing Library` · `pnpm` · `Docker` · `Nginx` · `GitHub Actions`

## Equipe

DevCaverna é a organização no GitHub; a equipe não tem nome próprio.

- Mauricio Alves de Aquino ([@aqu1no1](https://github.com/aqu1no1)): implementação da maior parte das funcionalidades.
- Otávio Luiz Gonzaga ([@OtavioGonzaga](https://github.com/OtavioGonzaga)): entrega contínua, releases, deploy e configuração.
- Vinícius Antônio de Oliveira ([@Vinicius-Antonio](https://github.com/Vinicius-Antonio)): integração contínua e elaboração do relatório técnico.

## Ambientes publicados

| Ambiente        | Front-End                                              | API                                                                |
| --------------- | ------------------------------------------------------ | ------------------------------------------------------------------ |
| Produção        | [Aplicação](https://acadflow.duckdns.org/)             | [API — saúde](https://acadflow-api.duckdns.org/health)             |
| Homologação     | [Aplicação](https://acadflow-staging.duckdns.org/)     | [API — saúde](https://acadflow-api-staging.duckdns.org/health)     |
| Desenvolvimento | [Aplicação](https://acadflow-development.duckdns.org/) | [API — saúde](https://acadflow-api-development.duckdns.org/health) |

## Demonstração

A aplicação contempla as jornadas de **Professor** (gestão de disciplinas, atividades, anexos, matrículas e grade editável de notas) e **Aluno** (acompanhamento de prazos, download de materiais e consulta da média parcial, calculada pela API), com suporte a tema claro/escuro e idiomas `pt-BR` / `en`.

Consulte o [Manual do Usuário](docs/manual-do-usuario.md) para o passo a passo das telas e [acadflow-design](https://github.com/DevCaverna/acadflow-design) para as pranchas visuais de referência.

## Como executar

Use Node.js 24 e pnpm 12.4.2. Para testar o fluxo real, [inicie a API](https://github.com/DevCaverna/acadflow-api/blob/main/docs/execucao/README.md), use `VITE_API_BASE_URL=http://localhost:3000` no `.env` da Web e permita `http://localhost:5173` no CORS da API.

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Abra `http://localhost:5173`. Veja o [guia de execução](docs/execucao/README.md) para Docker e configuração local.

## Testes e qualidade

| Comando                                                          | O que executa                                                                                                  |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `pnpm test`                                                      | Testes unitários e de componentes com Vitest e Testing Library; usam mocks HTTP, sem API ou banco em execução. |
| `pnpm test:watch` / `pnpm test:cov`                              | Modo de observação / relatório de cobertura.                                                                   |
| `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm build` | Lint, formatação, tipos e compilação. `pnpm lint:fix` e `pnpm format` aplicam correções.                       |
| `pnpm pr`                                                        | Lint, formatação, tipos, testes e build.                                                                       |

## Pipeline de CI/CD

O projeto pratica **entrega contínua (Continuous Delivery)**, não **implantação contínua (Continuous Deployment)**: a CI é automática, mas publicar uma imagem ou implantar requer acionamento manual. O `dist` gerado pela CI não é um deploy.

| Workflow                                                       | O que faz                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`ci.yml`](.github/workflows/ci.yml)                           | Em PRs para `main` e pushes em `main` (também pode ser manual), **Validate** verifica lint, formatação, tipos, testes da Web e política de entrega com mocks. **Build** só roda após Validate passar, compila a Web e publica `dist` como artefato da CI.                     |
| [`deploy-snapshot.yml`](.github/workflows/deploy-snapshot.yml) | Exige commit de `main` com CI bem-sucedida nessa branch. Reutiliza a imagem assinada do SHA ou constrói e publica no GHCR, executa Trivy, gera o SBOM SPDX e assina a imagem e atesta o SBOM com Cosign.                                                                      |
| [`deploy-image.yml`](.github/workflows/deploy-image.yml)       | Workflow reutilizável: implanta por digest na VPS via SSH, fornece a URL pública da API ao Nginx em runtime, verifica a página inicial e `/runtime-config.js` e registra o resultado.                                                                                         |
| [`create-release.yml`](.github/workflows/create-release.yml)   | Exige CI bem-sucedida no commit de origem em `main`, versão crescente `X.Y.Z` e notas em `[Unreleased]`. Atualiza `package.json` e `CHANGELOG.md`, constrói e assina a imagem do commit de versionamento e publica o commit, a tag `vX.Y.Z` e a GitHub Release. Não implanta. |
| [`deploy.yml`](.github/workflows/deploy.yml)                   | Verifica a imagem assinada associada à release e implanta o digest em produção sem rebuild. Aprovação é exigida apenas se configurada no GitHub Environment.                                                                                                                  |

Desenvolvimento e homologação recebem snapshots independentemente. Criar release não requer deploy anterior, e produção não depende de homologação. Veja [CI](docs/CI.md) e [deploy e releases](docs/execucao/deploy.md).

## Limitações conhecidas

- O aluno consulta os materiais e as notas, mas não envia trabalhos pela plataforma. O cadastro não verifica e-mail nem gera matrícula; não há recuperação de senha por e-mail.
- Os fluxos reais dependem da API do ambiente. Avatares e anexos dependem do Cloudflare R2 configurado na API; essa configuração não é feita no Front-End.
- O deploy depende da VPS e de DNS, proxy e HTTPS externos. O rollback de contêiner é manual e só está disponível se o contêiner anterior tiver sido preservado.

## Documentação

| Página                                                                                     | O que tem                                         |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| [Linear](https://linear.app/acadflow/document/acadflow-inicio-e-documentacao-9f01545a3125) | Início e documentação do projeto                  |
| [Execução](docs/execucao/README.md)                                                        | Como rodar, testar e resolver problemas           |
| [Deploy](docs/execucao/deploy.md)                                                          | Releases e deploy (GHCR, Docker/Nginx e VPS)      |
| [Manual do Usuário](docs/manual-do-usuario.md)                                             | Guia funcional para Professor e Aluno             |
| [Arquitetura](docs/arquitetura.md)                                                         | Camadas, gestão de estado e fluxos Mermaid        |
| [Rotas](docs/rotas.md)                                                                     | Mapa de rotas, acesso e telas do design sem uso   |
| [Design System](docs/design-system.md)                                                     | Tokens light/dark e catálogo de componentes       |
| [Rastreabilidade](docs/rastreabilidade.md)                                                 | Mapa Design × Web × API                           |
| [ADRs](docs/adr/README.md)                                                                 | Registros de decisões arquiteturais               |
| [Configuração](docs/configuracao.md)                                                       | Variáveis de ambiente                             |
| [Testes](docs/testes.md)                                                                   | Tipos de teste e comandos                         |
| [CI](docs/CI.md)                                                                           | Pipeline e branches                               |
| [Gerência de Configuração](docs/gerencia-de-configuracao.md)                               | Plano GCS (IEEE 828), baselines, hotfix e FCA/PCA |
| [Qualidade e editores](docs/qualidade-e-editores.md)                                       | Oxlint, Oxfmt, TypeScript, VS Code e Zed          |
| [Contratos para mocks](docs/contratos-mock.md)                                             | Tipos e rotas da API                              |
| [AGENTS.md](AGENTS.md)                                                                     | Diretrizes para colaboradores e agentes           |
| [Changelog](CHANGELOG.md)                                                                  | Histórico de entregas                             |
| [Segurança](SECURITY.md)                                                                   | Política de segurança e reporte                   |

## Repositórios

- [acadflow-api](https://github.com/DevCaverna/acadflow-api)
- [acadflow-design](https://github.com/DevCaverna/acadflow-design)

## Referências

- [React — Documentação](https://react.dev/learn)
- [Vite — Documentação](https://vite.dev/guide/)
- [TypeScript — Documentação](https://www.typescriptlang.org/docs/)
