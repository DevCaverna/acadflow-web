# Releases e deploy do AcadFlow Web

O GitHub Actions publica uma imagem Linux `amd64` no GHCR e promove o **mesmo digest** por
`development`, `staging` e `production`. A imagem serve a SPA com Nginx não privilegiado. Na
VPS, o Docker roda diretamente, sem Compose, checkout ou arquivo `.env`. O proxy reverso, os
domínios e o provisionamento do host são externos a este repositório.

## GitHub Environments

Em **Settings → Environments**, crie `development`, `staging` e `production`. Permita
execuções somente da branch `main`. Em `production`, configure **Required reviewers**,
**Prevent self-review** e desabilite bypass administrativo. O deploy recusa produção sem
revisores ou com autoaprovação habilitada. Proteja também as branches por PR com CI e
impeça alteração ou exclusão de tags `v*`, preservando sua criação pelo workflow.

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

1. **Deploy Snapshot**: selecione `environment=development` e `branch=develop`. Deixe
   `commit` vazio para usar o HEAD da branch, ou informe o SHA completo. É necessário CI
   verde de push para esse commit. A imagem já implantada para o mesmo conteúdo pode ser
   reutilizada; se não houver, o build publica no GHCR, bloqueia vulnerabilidades críticas
   com Trivy e assina a imagem e o SBOM SPDX com Cosign/OIDC.
2. Depois do PR `develop → staging` e CI verde, rode **Deploy Snapshot** para `staging`
   com `branch=staging`. Ele reutiliza o digest implantado em `development` quando a
   árvore Git coincide, mesmo se o SHA de merge for diferente. Sem candidata correspondente,
   não há deploy nem rebuild.
3. Após o PR `staging → main` e CI verde, rode **Create Release** com `vX.Y.Z`. Sem
   `candidate`, ele usa o deploy homologado mais recente compatível com o HEAD da `main`.
   `candidate` opcional aceita `COMMIT@sha256:DIGEST`. Tag e release registram o digest
   verificado. Em caso de falha parcial, reexecute os jobs para a mesma versão e commit.
4. Rode **Deploy Release** com `vX.Y.Z` e aguarde a aprovação de `production`. Ele verifica
   a imagem, a homologação e a assinatura e implanta o digest publicado sem reconstrução.

O histórico de deployments registra versão, digest e resultado. O deploy verifica a página
inicial e o conteúdo de `/runtime-config.js` na porta local. Depois do deploy, verifique a
URL pública, uma rota interna com recarregamento e a comunicação do navegador com a API.

Para rollback manual, pause os deploys do ambiente. Se houver `acadflow-web-<ambiente>-previous`,
remova o contêiner atual, renomeie o anterior para `acadflow-web-<ambiente>`, inicie-o e valide
o site. Isso restaura também a configuração pública de API da versão anterior.
