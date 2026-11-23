# AcadFlow Web — arquitetura inicial

**Stack:** React / Vite / TypeScript / pnpm / TanStack Query + Axios / React Router / react-i18next / Vitest.  
**API:** https://github.com/DevCaverna/acadflow-api · **Design:** https://github.com/DevCaverna/acadflow-design.  
**Linear:** https://linear.app/acadflow/document/acadflow-arquitetura-apiweb-i18n-tanstack-query-e-migrations-15ff46ed6d06

```text
src/
  app/{providers,router,store}/
  shared/{api,components,config,lib,types}/
  features/{auth,profile,disciplines,enrollments,activities,grades}/
  i18n/locales/{pt-BR,en}/
  styles/
public/{icons,images}/
test/
```

## Decisões

- Dividir por features; cada feature agrupa api/, hooks/, components/, pages/ e schemas/ conforme necessário.
- **TanStack Query** para estado remoto/caching/invalidations; Axios para HTTP. Redux Toolkit somente para UI global quando necessário, NÃO RTK Query.
- i18next e react-i18next: `pt-BR` padrão, `en` secundário; header Accept-Language em Axios.
- Design existente é a fonte das telas, assets, tokens e regra de notas.
- Telas podem começar com mocks baseados em [contratos-mock.md](contratos-mock.md) enquanto a API é criada. Não depender da conclusão do backend para implementar telas.
- Este PR fornece esqueleto de pastas/configuração, não a implementação completa do React.
