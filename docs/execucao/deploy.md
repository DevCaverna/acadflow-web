# Releases e deploy do AcadFlow Web

O GitHub Actions publica imagens Linux `amd64` no GHCR. Os deploys em `development`, `staging`
e `production` são independentes. A imagem serve a SPA com Nginx não privilegiado. Na
VPS, o Docker roda diretamente, sem Compose, checkout ou arquivo `.env`. O proxy reverso, os
domínios e o provisionamento do host são externos a este repositório.

## GitHub Environments

Em **Settings → Environments**, crie `development`, `staging` e `production`. Permita
execuções somente da branch `main`. Em `production`, configure **Required reviewers**,
**Prevent self-review** e desabilite bypass administrativo. O deploy recusa produção sem
revisores ou com autoaprovação habilitada. Proteja também as branches por PR com CI e
impeça alteração ou exclusão de tags `v*`, preservando sua criação pelo workflow.
Se um ruleset bloquear o push de release em `main`, configure a autorização da automação de
release sem desativar a proteção para alterações comuns.

| Tipo     | Nome                 | Valor                                                                            |
| -------- | -------------------- | -------------------------------------------------------------------------------- |
| Variable | `DEPLOY_HOST`        | DNS ou IPv4 da VPS.                                                              |
| Variable | `DEPLOY_PORT`        | Porta SSH; padrão `22`.                                                          |
| Variable | `DEPLOY_SSH_USER`    | Usuário SSH; padrão `admin`.                                                     |
| Variable | `WEB_HOST_PORT`      | Porta HTTP local da Web; use uma diferente por ambiente.                         |
| Variable | `VITE_API_BASE_URL`  | Origem HTTPS pública da API do ambiente, sem caminho.                            |
| Secret   | `DEPLOY_SSH_KEY`     | Chave privada SSH dedicada ao ambiente, sem passphrase.                          |
| Secret   | `DEPLOY_KNOWN_HOSTS` | Entrada `known_hosts` verificada; use `[host]:porta` para portas SSH não padrão. |

Exemplo para a VPS compartilhada com a API:

| Ambiente      | Destino do proxy Web | `VITE_API_BASE_URL`                            |
| ------------- | -------------------- | ---------------------------------------------- |
| `development` | `127.0.0.1:4100`     | `https://acadflow-api-development.duckdns.org` |
| `staging`     | `127.0.0.1:4200`     | `https://acadflow-api-staging.duckdns.org`     |
| `production`  | `127.0.0.1:4300`     | `https://acadflow-api.duckdns.org`             |

O navegador carrega a origem de `/runtime-config.js` a cada visita, sem cache do arquivo. O
valor é público e não deve conter credenciais. No Vite local, continua valendo
`VITE_API_BASE_URL` de `.env`. Na API, configure `CORS_ORIGIN` com a origem pública da Web
de cada ambiente. O CD da Web não acessa banco nem executa migrations.

## VPS e GHCR

- Host Linux `amd64` com Bash, Docker Engine, `curl`, `base64` (GNU coreutils) e `flock`.
- Cadastre cada chave pública em `~/.ssh/authorized_keys` do usuário SSH do ambiente. O
  workflow executa `sudo -n` sem TTY e envia o script do checkout da `main`. A opção
  `restrict` desabilita encaminhamento e TTY, mas a chave ainda permite comandos com os
  privilégios da conta. Não configure `ForceCommand` nem habilite autenticação de `root`.
- A imagem escuta na porta interna `8080`; só a porta local `WEB_HOST_PORT` é publicada.
  A configuração do proxy TLS deve apontar para essa porta no host.
- O GHCR precisa permitir leitura e publicação pelo Actions deste repositório. A VPS usa
  `GITHUB_TOKEN` com permissão `packages: read` somente para o pull; a configuração do
  Docker é temporária. Não cadastre PAT nem credencial de banco/JWT na Web.

## Operação

Os workflows manuais precisam chegar à branch padrão `main` para aparecerem no Actions.
Execute todos a partir de `main`. Um push executa CI, mas não dispara publicação nem deploy.

1. **Deploy Snapshot**: selecione `development` ou `staging`. Deixe `commit` vazio para usar
   o commit da execução ou informe o SHA completo de outro commit de `main`. É necessário
   CI verde em `main` para esse SHA. O workflow reutiliza uma imagem assinada para o mesmo
   SHA ou constrói uma, executa o Trivy e assina a imagem e o SBOM SPDX. Não precisa de deploy prévio.
2. **Create Release**: informe `X.Y.Z`, por exemplo `0.2.0`. O workflow exige CI verde
   para o commit de origem, versão crescente e notas em `[Unreleased]`. Atualiza `package.json`,
   move as notas para a seção datada no `CHANGELOG.md` e constrói e assina a imagem do
   commit de release. Depois, publica o commit em `main`, a tag `vX.Y.Z` e a release com
   as notas. Não consulta deploys nem aciona um deploy. Em caso de falha parcial, use
   **Re-run failed jobs** na mesma execução. Não mova uma tag publicada.
3. **Deploy Release**: informe `X.Y.Z` e aguarde a aprovação de `production`. O workflow
   verifica o digest assinado da release e o implanta sem rebuild ou deploy anterior em staging.

O histórico de deployments registra versão, digest e resultado. O deploy verifica a página
inicial e o conteúdo de `/runtime-config.js` na porta local. Depois do deploy, verifique a
URL pública, uma rota interna com recarregamento e a comunicação do navegador com a API.

Para rollback manual, pause os deploys do ambiente. Se houver `acadflow-web-<ambiente>-previous`,
remova o contêiner atual, renomeie o anterior para `acadflow-web-<ambiente>`, inicie-o e valide
o site. Isso restaura também a configuração pública de API da versão anterior.
