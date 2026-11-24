# Política de Segurança — AcadFlow Web

## Versões e Branches Suportadas

| Branch    | Estado                         | Suporte |
| --------- | ------------------------------ | ------- |
| `develop` | Linha ativa da aplicação React | Sim     |
| `staging` | Homologação                    | Sim     |
| `main`    | Produção                       | Sim     |

## Boas Práticas no Cliente

- **Tokens de sessão:** o JWT fica restrito a `sessionStorage['acadflow.accessToken']` e nunca é persistido em `localStorage` ou variáveis `VITE_*`.
- **Autorização real no backend:** nenhuma decisão crítica de segurança depende apenas do frontend; validações de papel e matrícula são aplicadas na `acadflow-api`.
- **Variáveis `VITE_*`:** todo valor `VITE_*` é embutido no bundle JavaScript público; nunca armazene segredos ou chaves privadas no frontend.

## Como Reportar uma Vulnerabilidade

**Não abra uma issue pública no GitHub** para vulnerabilidades de segurança (ex.: XSS, vazamento de token, bypass de fluxo de sessão ou exposição de arquivos).

1. Utilize **Private Vulnerability Reporting** (Security Advisories) no repositório `DevCaverna/acadflow-web` no GitHub, caso habilitado, ou notifique os mantenedores da equipe **DevCaverna** por canal privado.
2. Informe os passos de reprodução, o navegador/ambiente e o impacto observado, sem incluir credenciais ou dados reais de usuários.

## Compromisso de Resposta

- Confirmação inicial em até **48 horas úteis** e correção priorizada conforme severidade.
