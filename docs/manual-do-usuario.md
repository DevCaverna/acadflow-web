# Manual do Usuário — AcadFlow Web

Este guia descreve os fluxos disponíveis na interface web do **AcadFlow** para os perfis **Professor** e **Aluno**.

---

## 1. Acesso, Idioma, Tema e Avisos

### Entrar no sistema (`/login`)

- Informe seu **e-mail** e **senha** (use o botão do olho para conferir a senha digitada).
- Em caso de credenciais inválidas, é exibida uma mensagem genérica sem revelar se o e-mail existe.
- Se sua sessão JWT expirar durante o uso (`401`), você é redirecionado para `/login` com o aviso de **Sessão expirada** para entrar novamente.

### Barra lateral e preferências

- **Idioma:** alterne entre **Português (pt-BR)** e **Inglês (en)** no seletor da barra lateral; a escolha é salva no navegador e enviada no cabeçalho `Accept-Language` para a API.
- **Tema claro / escuro:** alterne pelo botão de sol/lua na barra lateral.
- **Sino de avisos:** exibe prazos de atividades nos próximos **7 dias** e (para alunos) notas atualizadas recentemente nos últimos **7 dias**.
- **Sair:** clique no ícone de saída ao lado do seu nome e perfil no rodapé da barra lateral.

---

## 2. Jornada do Professor

### Gerenciar Disciplinas (`/professor/disciplines` e `/professor/disciplines/:disciplineId`)

- **Listar e buscar:** filtre suas disciplinas por nome ou código e navegue pelas páginas quando houver mais de 20 itens.
- **Criar disciplina:** clique em **Nova disciplina**, informe **Código** (ex.: `BD-204`), **Semestre** (`YYYY.1` ou `YYYY.2`), **Nome** e **Descrição** (opcional). O par `(código, semestre)` não pode se repetir.
- **Editar / excluir:** na página da disciplina, você pode editar **Nome** e **Descrição** (código e semestre não mudam após a criação). A exclusão só é permitida se a disciplina não possuir alunos matriculados nem atividades.

### Gerenciar Atividades e Anexos (`/professor/disciplines/:disciplineId`)

- **Criar atividade:** informe **Título**, **Descrição** (opcional) e **Data limite** (opcional; na criação, não aceita data no passado). Ao salvar, a atividade fica **imediatamente visível** para os alunos matriculados.
- **Acompanhamento:** cada atividade mostra o badge de prazo (_Aberta_, _Vence em X dias_ ou _Prazo encerrado_) e uma barra de progresso com quantos alunos já possuem nota lançada.
- **Anexos de apoio:** clique para abrir os anexos da atividade e enviar arquivos **PDF, PNG ou JPG de até 10 MB**, baixar ou remover anexos. _(Requer branch `ACA-25` na API; atividades com notas ou anexos não podem ser excluídas.)_

### Gerenciar Matrículas (`/professor/disciplines/:disciplineId`)

- Na seção de alunos matriculados, clique para **Matricular aluno**, digite ao menos **3 caracteres** (nome ou e-mail) para buscar candidatos e adicione o aluno à turma.
- Para remover uma matrícula, o aluno **não** pode ter notas lançadas na disciplina. _(Requer branch `ACA-24` na API.)_

### Lançar Notas (`/professor/grades`)

- Selecione a disciplina nas pílulas no topo (ou acesse diretamente pelo link na página da disciplina).
- Filtre a tabela por **Todos**, **Em recuperação** ou **Sem notas**.
- Digite as notas de `0,0` a `10,0` (com até 1 casa decimal; vírgula ou ponto são aceitos). Células editadas e ainda não salvas ficam destacadas em âmbar.
- Não é possível apagar uma nota já salva deixando o campo vazio; deixe em branco apenas atividades que nunca tiveram nota lançada (nunca são contadas como `0`).
- Clique em **Salvar notas** para enviar apenas as células alteradas. Se alguma célula falhar no envio, as alterações pendentes permanecem preservadas para nova tentativa.

---

## 3. Jornada do Aluno

### Acompanhar Disciplinas e Atividades (`/student/disciplines` e `/student/disciplines/:disciplineId`)

- Você visualiza exclusivamente as disciplinas em que está matriculado.
- Ao abrir uma disciplina, vê a lista de atividades ordenadas pelo próximo prazo (atividades sem prazo aparecem ao final) e pode **baixar anexos** disponibilizados pelo professor.

### Consultar Notas e Média (`/student/grades`)

- Selecione a disciplina nas pílulas superiores para visualizar:
  - **Média** (exibida como _parcial_ enquanto houver atividades sem nota lançada, mostrando quantas já foram corrigidas) e **Situação** (`Aprovado` $\ge 7{,}0$, `Recuperação` $5{,}0\text{ a }6{,}9$, `Reprovado` $< 5{,}0$, ou `Sem notas`).
  - **Gráfico de barras por atividade** com a linha tracejada de referência em **`7,0`**.

---

## 4. Meu Perfil (`/profile`)

Disponível para professores e alunos _(depende dos endpoints de `ACA-24` / `ACA-25` na API)_:

- **Foto de perfil:** envie uma imagem **PNG, JPG ou WebP de até 2 MB** ou remova a foto atual (quando ausente, são exibidas suas iniciais).
- **Dados pessoais:** atualize **Nome** e **E-mail** (o perfil de acesso `PROFESSOR` / `ALUNO` é somente leitura).
- **Alterar senha:** informe a senha atual, a nova senha (8 a 72 bytes UTF-8) e a confirmação.
