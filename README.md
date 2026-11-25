<div align="center">
  <img src="docs/assets/icon.svg" width="110" alt="Ícone do AcadFlow" />

# AcadFlow — Web

Aplicação web para professores e alunos organizarem disciplinas, atividades e notas.

[Documentação no Linear](https://linear.app/acadflow/document/acadflow-inicio-e-documentacao-9f01545a3125)
</div>

## Sobre

O professor gerencia disciplinas, atividades e notas, e o aluno acompanha atividades, notas, média e situação acadêmica. A aplicação consome a [AcadFlow API](https://github.com/DevCaverna/acadflow-api), com autenticação JWT e acesso por perfil.

**Tecnologias:** `React` · `Vite` · `TypeScript` · `TanStack Query` · `Vitest` · `Testing Library` · `pnpm` · `GitHub Actions`

## Demonstração

A aplicação contempla as jornadas completas de **Professor** (gestão de disciplinas, atividades, anexos, matrículas e grade editável de notas) e **Aluno** (acompanhamento de prazos, download de materiais e cálculo de média parcial com meta `7,0`), com suporte a tema claro/escuro e idiomas `pt-BR` / `en`.

Consulte o [Manual do Usuário](docs/manual-do-usuario.md) para o passo a passo das telas e [acadflow-design](https://github.com/DevCaverna/acadflow-design) para as pranchas visuais de referência.

## Como executar

```bash
cp .env.example .env
pnpm install
pnpm dev
```

> Veja [docs/execucao](docs/execucao/README.md) para rodar com Docker.

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
