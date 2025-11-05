# 💧 API - Sistema de Monitoramento da Qualidade da Água

Projeto desenvolvido como parte do Programa Trainee da **COMP Júnior - UFLA**.

## 📘 Descrição

A ideia desse sistema surgiu de uma conversa com a minha namorada, que é estudante de Engenharia Ambiental e Sanitária e está desenvolvendo uma pesquisa sobre a qualidade da água em bebedouros da UFLA. Percebi como o processo de monitoramento ainda é bem manual e trabalhoso.

A partir disso, pensei em desenvolver uma API que automatizasse a análise, tornando o acompanhamento da qualidade da água mais rápido, acessível e confiável.

Foi dai que defini que o conceito deste projeto seria de um monitoramento inteligente da qualidade da água, que junta a tecnologia e ciência.
O projeto busca desenvolver um sistema automatizado para monitorar a qualidade da água
em estações de coleta, gerenciadas por técnicos e pesquisadores.

Na primeira etapa, foi criada a estrutura inicial do projeto em Node.js,
configurado o banco de dados com Sequelize, via migrations e models e implementada a containerização com Docker (API + MySQL em containers separados).

Agora na segunda etapa, foi implementado o sistema de criação e atualização de usuário, autenticação via JWT, com middlewares para interceptar e garantir rotas seguras e adicionado Schemas JSON para validação dos dados nas requisições.

## 📝 Visão Geral da Etapa 2

Nesta segunda etapa, o sistema passou a gerenciar o ciclo de vida de um usuário dentro da aplicação desde a criação até a atualização segura de seus dados.

Agora é possível criar um usuário padrão, informando apenas os campos essenciais (`nome`, `email`, `password`), ou criar um usuário especializado, incluindo também os dados específicos de uma das subclasses (`Técnico` ou `Pesquisador`).

Durante a criação:

- O sistema identifica automaticamente o **tipo de usuário** com base nos campos enviados na requisição;
- Caso sejam enviados campos pertencentes a mais de um tipo (ex: dados de técnico e pesquisador juntos), a operação é bloqueada;
- Realiza a encriptação da senha por meio do bcryptjs.
- Essa validação é garantida por **JSON Schema** e pelas **transações do Sequelize**, que asseguram que nenhuma informação parcial seja salva em caso de erro.

Após criado, o usuário pode ser autenticado via **JWT**, obtendo um token de acesso para uso em rotas protegidas.

Foi adicionado também um sistema de atualização de dados, que:

- Exige que o usuário esteja autenticado (token válido);
- Permite alterar tanto os dados pessoais (nome, e-mail, telefone) quanto os específicos do seu tipo (técnico ou pesquisador);
- Para troca de senha, requer confirmação da senha atual, nova senha e confirmação da nova senha.

Com isso, o sistema passa a oferecer **um fluxo completo e seguro de cadastro, autenticação e atualização de usuários**, respeitando a integridade dos dados e a separação entre os diferentes perfis.

## 🧩 Estruturas adicionadas ao projeto

```env
src/
├── apps/
│     ├── controllers/
│     │       ├── AuthenticationController.js
│     │       └── UserControllers.js
│     └─── middlewares/
│             ├── authentication.js
│             └── schemaValidator.js
├──── utils/
│        ├── crypt.js
│        └── token.js
├── schema/
│       ├── auth.schema.json
│       ├── create.user.schema.json
│       └── update.user.schema.json
└── routes.js
```

## 🕹️ Controllers

### `AuthenticationController`

Responsável por autenticar usuários e gerar o **token JWT** de acesso.

**Fluxo de funcionamento:**

1. Recebe `email` e `password` via body.
2. Busca o usuário no banco (`Usuario.findOne`).
3. Verifica se o usuário existe e se a senha informada é válida (`checkPassword`).
4. Criptografa o `id_usuario` usando o utilitário `crypt.js` e o inclui no payload do JWT.
5. Gera um **token assinado** com tempo de expiração e retorna junto aos dados do usuário autenticado.
6. Caso o login falhe, retorna erro **401 (Unauthorized)**.

### `UserController`

Gerencia todas as operações relacionadas ao usuário:

- **Criação** (`create`)
- **Atualização de dados** (`update`)

**Na criação (`create`)**

1. Verifica se o e-mail informado já está cadastrado.
2. Cria o usuário principal (`Usuario`).
3. Identifica automaticamente o tipo de usuário (usuário, técnico ou pesquisador) com base nos campos enviados na request.
4. Cria registros em `Pesquisador` ou `Técnico` se houver campos correspondentes.
5. Cria um telefone relacionado (`TelefoneContato`), se enviado.
6. Utiliza **transações Sequelize**, garantindo rollback automático em caso de erro.

**Na atualização (`update`)**

1. A rota é protegida por JWT e validada pelo middleware `authentication`.
2. Busca o usuário autenticado com suas relações (`Pesquisador`, `Técnico`, `Telefones`).
3. Permite atualizar:
   - Nome, e-mail e senha (requer senha antiga válida);
   - Telefone (atualiza se `id_telefone` for informado ou cria um novo);
   - Campos específicos do tipo de usuário (somente técnico OU pesquisador).
4. Utiliza transações para manter a consistência dos dados.
5. Retorna mensagem de sucesso após o commit.

## ⛓️‍💥 Middlewares

### `authentication.js`

Middleware responsável por proteger rotas que exigem login.

**Como funciona:**

1. Lê o cabeçalho `Authorization` com o token JWT.
2. Valida o token usando a chave secreta do `.env`.
3. Descriptografa o `id_usuario` criptografado dentro do token usando `crypt.js`.
4. Injeta o `req.newId` (id real do usuário) para uso nas rotas protegidas.
5. Bloqueia o acesso se o token for inválido, retornando **401 (Unauthorized)**.

### `schemaValidator.js`

Middleware genérico de validação de corpo de requisição.

**Fluxo:**

1. Recebe o schema JSON adequado (auth, create ou update).
2. Valida o `req.body` contra o schema usando a biblioteca `jsonschema`.
3. Caso existam propriedades inválidas, retorna status **400** com a lista de erros.
4. Em caso de sucesso, passa o controle ao próximo middleware/controller.

## 🧱 Schema JSON

### `auth.schema.json`

Define a estrutura de login:

- Campos:
  - `email` → string obrigatória, formato de e-mail;
  - `password` → string obrigatória, entre 6 e 50 caracteres.
- Impede propriedades adicionais.
- Garante que a autenticação só ocorra com credenciais válidas.

### `create.user.schema.json`

Valida o corpo das requisições de criação de usuário:

- Campos obrigatórios:
  - `nome`, `email`, `password`.
- Permite campos opcionais:
  - `telefone`.
- Impede o envio de dados misturados de `técnico` e `pesquisador` (via `oneOf`).
- Garante que cada tipo de usuário seja criado de forma isolada.

### `update.user.schema.json`

Valida requisições de atualização:

- Permite atualização de:
  - `nome`, `email`, `telefone`, `senha`, e dados de técnico ou pesquisador.
- Exige senha antiga (`old_password`) e confirmação (`confirm_password`) para troca de senha.
- Impede o envio de campos não permitidos (`additionalProperties: false`).

## 🪛 Utils

### `crypt.js`

Responsável pela criptografia do ID de usuário.

- `encrypt(id)` → Gera `iv` aleatório e criptografa o ID do usuário.
- `decrypt(encrypted)` → Descriptografa o ID para uso interno.
- É utilizado no processo de autenticação para proteger o ID dentro do JWT.

### `token.js`

Gerencia a **validação do token JWT**.

- `verifyToken(token)` → Verifica se o token é válido e não expirou.
- Retorna o payload descriptografado (incluindo o `newId`).
- É usado pelo middleware `authentication` para garantir acesso seguro às rotas privadas.

## 🧠 Modelagem e Relacionamentos

O sistema representa um ambiente em que técnicos e pesquisadores atuam em estações de monitoramento equipadas com sensores automáticos.
Esses sensores registram leituras periódicas e emitem alertas quando algum parâmetro ultrapassa limites aceitáveis.
Técnicos realizam calibrações e ações corretivas, enquanto pesquisadores analisam os alertas e produzem relatórios técnicos com recomendações de solução.

As funções administrativas serão implementadas na camada de aplicação e não como entidade no banco de dados.

<p align="center">
  <img src="./assets/diagrama-er.png" alt="Diagrama ER" width="1500">
</p>

## 🗄️ Estrutura do Banco de Dados

As tabelas foram criadas a partir do mapeamento relacional do modelo entidade-relacionamento (ER) mostrado acima:

- Usuário
- Telefone de Contato
- Pesquisador
- Técnico
- Sensor
- Leitura
- Alerta
- Relatório
- Ação Corretiva
- Estação de Monitoramento
- Tabelas de associação: `Trabalha`, `Calibragem`, `Atuação`

Essas migrations implementam as relações e restrições de integridade descritas no diagrama ER.

## 🐳 Executando com Docker

Esta aplicação foi containerizada com **Docker Compose**, subindo **dois serviços**:

- `apicontainer` → container Node.js (Express + Sequelize)
- `mysqlcontainer` → container MySQL 8.0

### 🔧 Pré-requisitos

- Docker e Docker Compose instalados

### 🌱 Variáveis de ambiente para Docker

Quando for rodar com Docker, o host do banco deve ser **`DB_HOST=mysqlcontainer`** (nome do serviço do MySQL no `docker-compose.yml`).  
Exemplo de `.env` compatível com Docker:

```env
PORT=3000
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_HOST=mysqlcontainer
DB_PORT=3306
DB_DIALECT=mysql

JWT_SECRET=
HASH_BCRYPT=
EXPIRATION_TOKEN=
```

### 🚀 Subindo os containers

Para iniciar o sistema completo (API + Banco de Dados), execute o comando abaixo na raiz do projeto:

```env
docker compose up --build
```

Esse comando, constrói a imagem da API, inicia o container do Node.js e o container do MySQL. Alem de criar automaticamente o banco de dados, aplicar todas as migrations e iniciar o servidor na porta 3000.

Não é necessário rodar manualmente os comandos yarn sequelize db:create nem yarn sequelize db:migrate.
Todo o processo é automatizado quando os containers sobem.

## 🌐 Acesso à API

Após subir os containers, o sistema ficará disponível em: http://localhost:3000

## 👤 Desenvolvido por

**Pedro Henrique Fonseca Resende** – Trainee COMP Júnior (UFLA)
