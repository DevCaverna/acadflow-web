# Configuração local (preparação)

1. Instalar Node.js 24 e pnpm.
2. Copiar `.env.example` para `.env`.
3. Configurar `VITE_API_BASE_URL` e `VITE_DEFAULT_LOCALE`.
4. Executar `pnpm install` e `pnpm dev`.

**Nota:** variáveis `VITE_*` são expostas no bundle do navegador. Não colocar segredos, chaves R2 ou JWT secrets nesse arquivo.
