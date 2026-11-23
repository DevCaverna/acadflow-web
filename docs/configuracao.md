# Configuração local (preparação)

1. Instalar Node.js LTS e pnpm.
2. Copiar `.env.example` para `.env`.
3. Configurar `VITE_API_BASE_URL` e `VITE_DEFAULT_LOCALE`.
4. Após criar o bootstrap Vite/React e package.json, executar `pnpm install` e `pnpm dev`.

**Nota:** variáveis `VITE_*` são expostas no bundle do navegador. Não colocar segredos, chaves R2 ou JWT secrets nesse arquivo.

O projeto ainda está em scaffolding. O framework e as dependências serão inicializados pela issue de estrutura do frontend.
