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

Será adicionada quando as primeiras telas estiverem prontas. As telas projetadas estão em [acadflow-design](https://github.com/DevCaverna/acadflow-design).

## Como executar

```bash
cp .env.example .env
pnpm install
pnpm dev
```

> Veja [docs/execucao](docs/execucao/README.md) para rodar com Docker.

## Documentação

| Página                                                                                     | O que tem                                |
| ------------------------------------------------------------------------------------------ | ---------------------------------------- |
| [Linear](https://linear.app/acadflow/document/acadflow-inicio-e-documentacao-9f01545a3125) | Início e documentação do projeto         |
| [Execução](docs/execucao/README.md)                                                        | Como rodar, testar e resolver problemas  |
| [Arquitetura](docs/arquitetura.md)                                                         | Organização e decisões                   |
| [Configuração](docs/configuracao.md)                                                       | Variáveis de ambiente                    |
| [Testes](docs/testes.md)                                                                   | Tipos de teste e comandos                |
| [CI](docs/CI.md)                                                                           | Pipeline e branches                      |
| [Qualidade e editores](docs/qualidade-e-editores.md)                                       | Oxlint, Oxfmt, TypeScript, VS Code e Zed |
| [Contratos para mocks](docs/contratos-mock.md)                                             | Tipos e rotas da API                     |
| [AGENTS.md](AGENTS.md)                                                                     | Diretrizes para colaboradores e agentes  |

## Repositórios

- [acadflow-api](https://github.com/DevCaverna/acadflow-api)
- [acadflow-design](https://github.com/DevCaverna/acadflow-design)

## Referências

- [React — Documentação](https://react.dev/learn)
- [Vite — Documentação](https://vite.dev/guide/)
- [TypeScript — Documentação](https://www.typescriptlang.org/docs/)
