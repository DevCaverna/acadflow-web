# Build de Produção e Deploy — AcadFlow Web

O **AcadFlow Web** é uma Single Page Application (SPA) empacotada pelo **Vite** em arquivos estáticos (`dist/`), servida via **Nginx** (`docker/Dockerfile` + `docker/nginx.conf`) ou qualquer hospedagem estática com fallback de rotas para `index.html`.

---

## 1. Variáveis de Ambiente em Build-Time

Por ser uma aplicação Vite estática, variáveis `VITE_*` são **incorporadas no JavaScript durante o `pnpm build`** (não em runtime do container):

| Variável            | Exemplo                               | Uso                                                               |
| ------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `https://api.acadflow.seudominio.com` | URL pública da `acadflow-api` acessível pelo navegador do usuário |
| `VITE_APP_NAME`     | `AcadFlow`                            | Nome exibido no título/layout                                     |

> **Regra de segurança:** nunca coloque segredos, chaves privadas ou tokens em variáveis `VITE_*`, pois todo valor fica público no bundle servido ao navegador.

---

## 2. Verificação Pré-Deploy

Antes de construir ou publicar um artefato, execute o pipeline completo de qualidade:

```bash
pnpm install --frozen-lockfile
pnpm pr   # executa: lint, format:check, typecheck, test e build
```

---

## 3. Build e Execução com Docker + Nginx

O arquivo `docker/Dockerfile` realiza build multi-stage (Node 24 → `nginx:1.28-alpine`) expondo a porta `80`:

```bash
docker build \
  -f docker/Dockerfile \
  --build-arg VITE_API_BASE_URL=https://api.acadflow.seudominio.com \
  --build-arg VITE_APP_NAME=AcadFlow \
  -t acadflow-web:latest .

docker run -d --name acadflow-web -p 8080:80 acadflow-web:latest
```

### Fallback de Rotas SPA (`docker/nginx.conf`)

O Nginx está configurado com:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

Isso evita erros `404` quando o usuário recarrega o navegador ou acessa diretamente rotas internas como `/disciplines`, `/grades` ou `/profile`.

---

## 4. Integração com `acadflow-api` e Proxy Reverso

1. **CORS na API:** configure `CORS_ORIGIN` na `acadflow-api` com a origem exata do frontend (ex.: `https://acadflow.seudominio.com`, sem barra final).
2. **HTTPS:** termine TLS/HTTPS no proxy reverso externo (Nginx/Caddy/Cloudflare) antes de servir tanto o frontend quanto a API.
3. **Storage R2 (quando habilitado em `ACA-25`):** garanta que o bucket Cloudflare R2 permita downloads diretos a partir da origem do frontend caso utilize fetch/visualização cruzada.

---

## 5. Promoção entre Ambientes Git

- Fluxo padrão: `feature/*` → `develop` → `staging` → `main` via PR revisado e com os checks **Web / Validate** e **Web / Build** verdes no GitHub Actions (`.github/workflows/ci.yml`).
- O workflow atual gera e publica o artefato `dist/` no GitHub Actions; não há deploy automático por push.
