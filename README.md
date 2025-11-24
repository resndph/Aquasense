# 💧 API – Sistema de Monitoramento da Qualidade da Água

### API REST para monitoramento da qualidade da água, permitindo gerenciar usuários, estações, sensores, leituras, alertas, relatórios, ações corretivas e calibrações.  
Foi construída em Node.js com Express, MySQL + Sequelize, autenticação JWT e containerização com Docker, integra também o Backblaze para armazenamento e fluxo de arquivos anexados (como documentos e evidências de análises).

---

## Índice

1. [Visão geral do sistema](#visão-geral-do-sistema)
2. [Modelagem e estrutura do banco de dados](#modelagem-e-estrutura-do-banco-de-dados)
3. [Arquitetura da aplicação](#arquitetura-da-aplicação)
4. [Como executar o projeto](#como-executar-o-projeto)
   - [Execução com Docker](#execução-com-docker)
5. [Estrutura de pastas](#estrutura-de-pastas)
6. [Fluxos principais do sistema](#fluxos-principais-do-sistema)
   - [Fluxo de autenticação e autorização](#fluxo-de-autenticação-e-autorização)
   - [Fluxo de leituras de sensores e alertas automáticos](#fluxo-de-leituras-de-sensores-e-alertas-automáticos)
   - [Fluxo de relatórios e ações corretivas](#fluxo-de-relatórios-e-ações-corretivas)
   - [Fluxo de estações, sensores e calibrações](#fluxo-de-estações-sensores-e-calibrações)
7. [Documentação da API (endpoints)](#documentação-da-api-endpoints)
   - [Auth](#auth)
   - [Users](#users)
   - [Stations](#stations)
   - [Sensors](#sensors)
   - [Readings](#readings)
   - [Alerts](#alerts)
   - [Reports](#reports)
   - [Corrective Actions](#corrective-actions)
   - [Calibrations](#calibrations)
   - [Sensor Service](#sensor-service)
   - [Upload de arquivos](#upload-de-arquivos)
8. [Controllers e regras de negócio](#controllers-e-regras-de-negócio)
9. [Middlewares](#middlewares)
10. [Simulador de sensores](#simulador-de-sensores)
11. [Coleções do Postman e testes](#coleções-do-postman-e-testes)
12. [Contexto e motivação](#contexto-e-motivação)
13. [Autor](#autor)

---

## Visão geral do sistema

O sistema modela uma situação real, na qual técnicos e pesquisadores atuam em estações de
monitoramento equipadas com sensores automáticos. Esses sensores realizam leituras periódicas
dos parâmetros de qualidade da água e geram alertas sempre que o valor de determinada
característica ultrapassa um limite previamente estabelecido.
Os técnicos podem estar vinculados a várias estações de monitoramento, sendo responsáveis pela
calibração dos sensores e pela execução de ações corretivas. Já os pesquisadores são
encarregados de analisar os alertas gerados pelos sensores e, por meio da emissão de relatórios
técnicos, propor soluções para os problemas identificados.

Todo o sistema é supervisionado por um administrador, que possui privilégios para gerenciar
usuários, cadastrar estações, registrar sensores e intervir em alertas, entre outras operações.
Um mesmo usuário pode exercer simultaneamente os papéis de pesquisador, técnico e/ou
administrador, conforme as necessidades do sistema.

---

## Modelagem e estrutura do banco de dados

O banco é relacional (MySQL) e foi pensado pra refletir bem o domínio de monitoramento:

- **Usuário**: base para todo mundo que entra no sistema.
- **Técnico** e **Pesquisador**: especializações de usuário, ligados à tabela de usuário por chave estrangeira. Um usuário pode ter múltiplos papéis.
- **Estação**: lugar físico de monitoramento, com endereço, cidade, estado, coordenadas, etc.
- **Técnicos por Estação**: tabela de ligação N:N entre técnicos e estações (um técnico pode atuar em várias estações e uma estação pode ter vários técnicos).
- **Sensor**: ligado a uma estação, com tipo, unidade, limite e status.
- **Leitura**: associada a um sensor, guarda o valor lido, data/hora e quem (qual sensor) gerou.
- **Alerta**: vinculado a leitura/sensor/estação, disparado quando o valor ultrapassa o limite.
- **Relatório**: ligado a um alerta e a um pesquisador, guardando análise, conclusão e (opcionalmente) referência de anexo.
- **Ação Corretiva**: ligada a um relatório, com descrição, status, data de execução, etc.
- **Técnicos por Ação Corretiva**: N:N entre técnicos e ações corretivas.
- **Calibração**: associada a um técnico e a um sensor, registrando quando o sensor foi calibrado.


<p align="center">
  <img src="./assets/diagrama-er.png" alt="Diagrama ER" width="1500">
</p>

---

## Arquitetura da aplicação

A aplicação foi desenvolvida em **Node.js** utilizando o framework **Express** para construção da API REST, organização de middlewares e definição das rotas.  
O **MySQL** é utilizado como banco de dados relacional, acessado por meio do **Sequelize**, que cuida do mapeamento objeto-relacional (ORM), definição de models, migrações e relacionamentos entre entidades como usuários, estações, sensores, leituras, alertas, relatórios, ações corretivas e calibrações.

Em operações mais complexas, que envolvem múltiplas tabelas (por exemplo, criação de relatórios com ações corretivas e associação de técnicos nessas ações), são utilizadas **transactions do Sequelize**, assim, ou todos os registros são passados com sucesso, ou nenhum é salvo. Isso evita estados quebrados do tipo “relatório criado pela metade” ou “ação corretiva sem estar vinculada ao relatório”.

A autenticação é feita em **JWT (JSON Web Token)**, com **middlewares** responsáveis por:

- autenticar o usuário via token;
- validar o papel (admin, técnico, pesquisador);
- validar requisições via  Schema;
- autenticar o serviço de sensores (token próprio).

As rotas da API são **modularizadas por domínio** (`auth`, `users`, `stations`, `sensors`, `readings`, `alerts`, `reports`, `corrective-actions`, `calibrations`, `sensor-service`, `upload`), o que facilita manutenção, leitura e evolução do código.  
Toda a solução é **containerizada com Docker Compose**, permitindo subir um ambiente completo de desenvolvimento/execução com um único comando.

### Tecnologias utilizadas e por que usei elas

- **Node.js + Express**: stack bem consolidada para APIs REST, simples de montar middlewares, fácil de integrar com JWT, Sequelize, etc. Também casa bem com o conteúdo do curso e com o que é cobrado no desafio.
- **MySQL + Sequelize**: o MySQL é um banco relacional com o qual tenho mais contato, ótimo para modelagem com várias entidades relacionadas. O Sequelize abstrai boa parte do SQL, mas ainda deixa espaço pra otimizações quando preciso, além de trazer migrações e transactions de forma bem direta.
- **Backblaze B2**: usado como storage de arquivos anexados nos relatórios (evidências, documentos). Também foi a API externa para esse fim apresentada no curso disponibiliziado
- **Postman**: usado pra testar e documentar as requisições de forma prática, incluindo payloads de exemplo dos JSON Schemas.

---

## Como executar o projeto

### Execução com Docker

Para executar o projeto com Docker é necessário ter instalado:

- **Docker**
- **Docker Compose**

Com isso, basta executar na raiz do projeto:

```bash
docker compose up --build
```

O Docker Compose sobe o ambiente completo com banco de dados, API e serviço de simulação de leituras funcionando em conjunto.

- `mysqlcontainer` → banco de dados **MySQL**
- `apicontainer` → **API Node.js/Express**
- `sensor-simulator` → **simulador de leituras de sensores**

Após o build, a API ficará acessível em: **http://localhost:3000**  
(A porta externa é 3000, mapeada para a porta 3000 interna do container da API.)

Caso queira acompanhar os logs da API:

```bash
docker logs -f apicontainer
```
Caso queira derrubar a aplicação: 

```bash
docker compose down
```

---

#### Arquivos `.env` da API

A API depende de um arquivo `.env` na pasta raiz do backend.  
Existe um arquivo de exemplo chamado **`.env.example`**, que pode ser copiado e ajustado:

```bash
cp .env.example .env
```

Exemplo de conteúdo do `.env` da API:

```env
PORT=3000
DB_USER=root
DB_PASSWORD=root
DB_NAME=db_monitoramento
DB_HOST=mysqlcontainer
DB_PORT=3306
DB_DIALECT=mysql

SECRET_CRYPTO=0396af3b73c5bfd97f420885d08aa211
HASH_BCRYPT=7533e5a70d00f31ba2a18c33a93b4913
EXPIRATION_TOKEN=7d

APPLICATION_KEY_ID=797b5b67ccfb
APPLICATION_KEY=0057e47253518521a1cf0071761f6fc7118fc29876
BUCKET_ID=5719976b05cba6e79cac0f1b
BASE_URL_BACKBLAZE=https://f005.backblazeb2.com/file/qualidade-agua/

SENSOR_SERVICE_SECRET=0057e47253518521a1cf0071761f6fc7118fc29876asdasdd1wdadahff12s
```

Essas variáveis configuram:

---
- **PORT**: porta em que a API vai subir (ex: `3000`).
- **DB_USER / DB_PASSWORD / DB_NAME / DB_HOST / DB_PORT / DB_DIALECT**: dados de conexão com o MySQL. No Docker, o host é `mysqlcontainer` e a porta interna é `3306`.
- **SECRET_CRYPTO / HASH_BCRYPT / EXPIRATION_TOKEN**: chaves e configs usadas na geração e validação de tokens JWT e hashes de senha.
- **APPLICATION_KEY_ID / APPLICATION_KEY / BUCKET_ID / BASE_URL_BACKBLAZE**: credenciais e URL base do bucket no Backblaze para armazenar arquivos anexados a relatórios.
- **SENSOR_SERVICE_SECRET**: segredo usado pelo serviço de sensores/simulador para autenticar nas rotas internas da API.
- **API_BASE_URL / INTERVAL_MS** (no simulador): URL da API vista de dentro da rede do Docker e intervalo entre as leituras simuladas.

---

#### Arquivos `.env` do simulador de sensores

O simulador (`sensor-simulator`) possui seu **próprio** arquivo `.env`, dentro da pasta `sensor-simulator`.  
Da mesma forma, existe um **`.env.example`** que deve ser copiado:

```bash
cp sensor-simulator/.env.example sensor-simulator/.env
```

Exemplo de conteúdo do `.env` do simulador:

```env
API_BASE_URL=http://apicontainer:3000
INTERVAL_MS=300000
```

Onde:

- `API_BASE_URL` aponta para o container da API dentro da rede do Docker (`apicontainer:3000`);
- `INTERVAL_MS` define o intervalo entre leituras simuladas em milissegundos  
  (no exemplo, `300000` = 5 minutos).

Com os `.env` configurados para a API e para o simulador, o comando:

```bash
docker compose up --build
```

sobe o ambiente completo com banco de dados, API e serviço de simulação de leituras funcionando em conjunto.

## Estrutura de pastas

```txt
.
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── package.json
├── yarn.lock
├── src
│   ├── apps
│   │   ├── controllers
│   │   │   ├── AuthenticationController.js
│   │   │   ├── UserControllers.js
│   │   │   ├── StationControllers.js
│   │   │   ├── RelatorioControllers.js
│   │   │   ├── AcaoCorretivaControllers.js
│   │   │   ├── SensorControllers.js
│   │   │   ├── LeituraControllers.js
│   │   │   ├── AlertaControllers.js
│   │   │   ├── CalibragemControllers.js
│   │   │   └── FileController.js
│   │   ├── middlewares
│   │   │   ├── authentication.js
│   │   │   ├── optionalAuth.js
│   │   │   ├── typeVerifyMiddleware.js
│   │   │   ├── sensorAuth.js
│   │   │   └── schemaValidator.js
│   │   └── models
│   │       └── ... (models Sequelize)
│   ├── configs
│   │   ├── db.js
│   │   └── multer.js
│   ├── routes
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── stations.routes.js
│   │   ├── reports.routes.js
│   │   ├── correctiveActions.routes.js
│   │   ├── sensors.routes.js
│   │   ├── readings.routes.js
│   │   ├── alerts.routes.js
│   │   ├── calibrations.routes.js
│   │   ├── sensorService.routes.js
│   │   └── file.routes.js
│   ├── schema
│   │   ├── auth.schema.json
│   │   ├── create.user.schema.json
│   │   ├── update.user.schema.json
│   │   ├── create.station.schema.json
│   │   ├── update.station.schema.json
│   │   ├── add.worker.schema.json
│   │   ├── create.sensor.schema.json
│   │   ├── update.sensor.schema.json
│   │   ├── create.reading.schema.json
│   │   ├── create.report.schema.json
│   │   ├── update.report.schema.json
│   │   ├── update.acao.schema.json
│   │   ├── add.worker.acao.schema.json
│   │   ├── update.alerta.schema.json
│   │   └── create.calibragem.schema.json
│   ├── server.js
│   └── database
│       ├── index.js
│       ├── migrations
│       └── seeders
└── sensor-simulator
    ├── Dockerfile
    ├── .env.example
    └── main.js
```
---

## Fluxos principais do sistema

### Fluxo de autenticação e autorização

1. Um usuário é criado via `POST /users` com ou sem autenticação. Quando se tenta passar **"role"** na requisição o sistema identifica por meio do `optionalAuth` e só permite a criação de um admin caso o token passado seja de admin. Logo somente admins podem criar admin, (O primeiro admin do sistema deve ser setado manualmente no banco de dados).
2. Para acessar rotas protegidas, ele faz login em `POST /auth`, enviando `email` e `password`.
3. A API valida as credenciais, gera um **JWT** e devolve pro cliente.
4. Nas rotas autenticadas, o middleware `authentication` lê o token do header `Authorization: Bearer <token>`, valida a assinatura e injeta, por exemplo, `req.newId` e o papel (`req.userRole`).
5. Para rotas que só podem ser acessadas por certos papéis (ex: admin, pesquisador, técnico), entra o `typeVerifyMiddleware`, que consulta as tabelas ligadas a `Usuario` (Técnico, Pesquisador) e garante que o usuário realmente possui aquele papel.


### Fluxo de leituras de sensores e alertas automáticos

1. O sistema assume que existe um serviço externo (ou o próprio `sensor-simulator`) que faz leituras em sensores e envia essas leituras para a API.
2. Em modo desenvolvimento, é possível gerar um token de serviço em `GET /dev/generate-sensor-token` para que o sistema de simulação de leiruras funcione,(faz isso de forma automática na inicialização).
3. O serviço de sensores chama `POST /sensor-service/readings`, enviando `id_sensor_autor` e `valor` no corpo da requisição.
4. O `sensorAuthMiddleware` valida se o token do serviço de sensores é válido (segredo próprio, separado do JWT de usuário).
5. A leitura é salva pela `LeituraController.create`.
6. Dentro da lógica de leitura, a API verifica o limite configurado no sensor.  
   - Se o valor ultrapassar esse limite, é criado um **alerta** amarrado ao sensor/estação correspondente.
7. Técnicos associados àquela estação conseguem ver esses alertas em `GET /alerts`, que já vem filtrado pela relação de trabalho do técnico com as estações.
8. Ou seja: leitura automática → verificação de limite → possível alerta → técnico enxerga só o que realmente é da estação onde ele atua.

### Fluxo de relatórios e ações corretivas

1. Diante de um alerta, um **pesquisador** acessa a API e busca o alerta que quer analisar.
2. Ele cria um relatório em `POST /reports`, passando:
   - qual alerta está sendo analisado;
   - título, descrição;
   - lista de ações corretivas sugeridas;
   - opcionalmente, arquivo anexo que será enviado em outro fluxo (upload).
3. A criação de relatório + ações corretivas associadas é feita usando **transaction do Sequelize**.  
   Se qualquer parte falhar, tudo é revertido (rollback).
4. Cada ação corretiva pode ter técnicos adicionados depois via `POST /corrective-actions/:id/workers`.
5. Pesquisadores e admins podem atualizar e remover relatórios em:
   - `PUT /reports/:id`
   - `DELETE /reports/:id`
6. Técnicos, por sua vez, conseguem atualizar o status das ações corretivas em `PUT /corrective-actions/:id`, marcando como “Pendente”, “Em andamento” ou “Concluída”.

### Fluxo de estações, sensores e calibrações

1. **Admin** cadastra estações de monitoramento via rotas `/admin/stations`, incluindo dados de endereço, localização e etc.
2. Admin também pode associar técnicos às estações com `POST /admin/stations/:id/workers`.
3. Em seguida, admin cadastra os sensores conectados às estações via `/admin/sensors`, definindo:
   - tipo (ex: temperatura, pH, etc);
   - unidade de medida;
   - limite de alerta;
   - status do sensor.
4. Leituras passam a ser feitas para esses sensores. Quando for necessário garantir que os sensores estão medindo certo, admin ou técnico registra uma **calibração** em `POST /calibrations`.
5. Cada calibração liga o sensor e o técnico, com informações de quando foi feita e qual contexto.

---

## Documentação da API (endpoints)

### Auth

- `POST /auth`  
  - **Descrição**: autentica um usuário pelo `email` e `password` e retorna um JWT.  
  - **Body**: `auth.schema.json`  
  - **Autenticação**: pública (sem token pra entrar, mas gera o token).

### Users

- `POST /users`  
  - **Descrição**: cria um novo usuário (pode ser usuário comum, técnico ou pesquisador dependendo dos campos enviados).  
  - **Body**: `create.user.schema.json`  
  - **Autenticação**: usa `optionalAuth` (não obriga token, mas se tiver ptrata o caso de criação de ADMIN).

- `GET /users/me`  
  - **Descrição**: retorna os dados do usuário logado.  
  - **Autenticação**: JWT obrigatório.

- `PUT /users/me`  
  - **Descrição**: atualiza dados do usuário logado (nome, email, senha, campos específicos de técnico/pesquisador etc).  
  - **Body**: `update.user.schema.json`  
  - **Autenticação**: JWT obrigatório.

- `GET /admin/users`  
  - **Descrição**: lista todos os usuários do sistema.  
  - **Autenticação**: JWT + papel `admin`.

- `GET /admin/users/:id`  
  - **Descrição**: busca um usuário específico.  
  - **Autenticação**: JWT + papel `admin`.

- `PUT /admin/users/:id`  
  - **Descrição**: atualiza dados de um usuário específico.  
  - **Body**: `update.user.schema.json`  
  - **Autenticação**: JWT + papel `admin`.

- `DELETE /admin/users/:id`  
  - **Descrição**: remove um usuário do sistema.  
  - **Autenticação**: JWT + papel `admin`.

### Stations

- `GET /stations`  
  - **Descrição**: lista todas as estações de monitoramento cadastradas.  
  - **Autenticação**: JWT.

- `GET /stations/:id`  
  - **Descrição**: busca detalhes de uma estação específica.  
  - **Autenticação**: JWT.

- `POST /admin/stations`  
  - **Descrição**: cria uma nova estação de monitoramento.  
  - **Body**: `create.station.schema.json`  
  - **Autenticação**: JWT + papel `admin`.

- `PUT /admin/stations/:id`  
  - **Descrição**: atualiza dados de uma estação.  
  - **Body**: `update.station.schema.json`  
  - **Autenticação**: JWT + papel `admin`.

- `DELETE /admin/stations/:id`  
  - **Descrição**: remove uma estação.  
  - **Autenticação**: JWT + papel `admin`.

- `POST /admin/stations/:id/workers`  
  - **Descrição**: associa um técnico à estação.  
  - **Body**: `add.worker.schema.json`  
  - **Autenticação**: JWT + papel `admin`.

- `DELETE /admin/stations/:id/workers/:id_tecnico`  
  - **Descrição**: remove um técnico de uma estação.  
  - **Autenticação**: JWT + papel `admin`.

### Sensors

- `GET /sensors`  
  - **Descrição**: lista todos os sensores cadastrados.
  - **Autenticação**: JWT.

- `GET /sensors/:id`  
  - **Descrição**: detalhes de um sensor específico.
  - **Autenticação**: JWT.

- `POST /admin/sensors`  
  - **Descrição**: cria um novo sensor em uma estação.  
  - **Body**: `create.sensor.schema.json`  
  - **Autenticação**: JWT + papel `admin`.

- `PUT /admin/sensors/:id`  
  - **Descrição**: atualiza dados de um sensor (tipo, unidade, limite, status).  
  - **Body**: `update.sensor.schema.json`  
  - **Autenticação**: JWT + papel `admin`.

- `DELETE /admin/sensors/:id`  
  - **Descrição**: remove um sensor.  
  - **Autenticação**: JWT + papel `admin`.

### Readings

- `POST /sensor-service/readings`  
  - **Descrição**: cria uma nova leitura de sensor enviada pelo serviço de sensores (simulador ou serviço real).  
  - **Body**: `create.reading.schema.json`  
  - **Autenticação**: `sensorAuthMiddleware` (token do serviço, não do usuário).

- `GET /sensor/readings`  
  - **Descrição**: lista leituras de sensores.  
  - **Autenticação**: JWT.

- `GET /sensor/readings/:id`  
  - **Descrição**: retorna uma leitura específica.  
  - **Autenticação**: JWT.

- `DELETE /admin/sensor/readings/:id`  
  - **Descrição**: remove uma leitura de sensor.  
  - **Autenticação**: JWT + papel `admin`.

### Alerts

- `GET /alerts`  
  - **Descrição**: lista alertas gerados para as estações em que o técnico logado trabalha.  
  - **Autenticação**: JWT (regra de negócio filtra por estações do técnico).

- `GET /alerts/:id`  
  - **Descrição**: retorna um alerta específico, se o técnico realmente estiver associado à estação desse alerta.  
  - **Autenticação**: JWT.

- `PUT /admin/alerts/:id`  
  - **Descrição**: atualiza dados do alerta (tipo, severidade, descrição).  
  - **Body**: `update.alerta.schema.json`  
  - **Autenticação**: JWT + papel `admin`.

- `DELETE /admin/alerts/:id`  
  - **Descrição**: remove um alerta.  
  - **Autenticação**: JWT + papel `admin`.

### Reports

- `POST /reports`  
  - **Descrição**: cria um novo relatório vinculado a um alerta, com opção de cadastrar ações corretivas na mesma operação.  
  - **Body**: `create.report.schema.json`  
  - **Autenticação**: JWT + papel `pesquisador`.

- `GET /reports`  
  - **Descrição**: lista relatórios, ações corretivas e pesquisadores associados, retornando apenas relatórios das estações em que o técnico logado trabalha.  
  - **Autenticação**: JWT.

- `GET /reports/:id`  
  - **Descrição**: retorna um relatório específico com suas ações corretivas e técnicos associados, respeitando as regras de visibilidade.  
  - **Autenticação**: JWT.

- `PUT /reports/:id`  
  - **Descrição**: atualiza dados de um relatório.  
  - **Body**: `update.report.schema.json`  
  - **Autenticação**: JWT + papel `pesquisador` ou `admin`.

- `DELETE /reports/:id`  
  - **Descrição**: remove um relatório.  
  - **Autenticação**: JWT + papel `pesquisador` ou `admin`.

### Corrective Actions

- `GET /corrective-actions`  
  - **Descrição**: lista ações corretivas que estão associadas ao técnico logado.  
  - **Autenticação**: JWT.

- `GET /corrective-actions/:id`  
  - **Descrição**: busca uma ação corretiva específica, desde que o técnico esteja vinculado a ela.  
  - **Autenticação**: JWT.

- `PUT /corrective-actions/:id`  
  - **Descrição**: atualiza dados da ação corretiva (descrição, status, data de execução).  
  - **Body**: `update.acao.schema.json`  
  - **Autenticação**: JWT + papel `pesquisador` ou `admin`.

- `DELETE /corrective-actions/:id`  
  - **Descrição**: remove uma ação corretiva.  
  - **Autenticação**: JWT + papel `pesquisador` ou `admin`.

- `POST /corrective-actions/:id/workers`  
  - **Descrição**: adiciona um técnico a uma ação corretiva.  
  - **Body**: `add.worker.acao.schema.json`  
  - **Autenticação**: JWT + papel `pesquisador` ou `admin`.

- `DELETE /corrective-actions/:id/workers/:id_tecnico`  
  - **Descrição**: remove um técnico de uma ação corretiva.  
  - **Autenticação**: JWT + papel `pesquisador` ou `admin`.

### Calibrations

- `POST /calibrations`  
  - **Descrição**: registra uma calibração de sensor, feita por técnico.  
  - **Body**: `create.calibragem.schema.json`  
  - **Autenticação**: JWT + papel `admin` ou `tecnico`.

- `GET /calibrations`  
  - **Descrição**: lista calibrações registradas.  
  - **Autenticação**: JWT + papel `admin` ou `tecnico`.

- `GET /calibrations/:id_tecnico/:id_sensor`  
  - **Descrição**: detalhes da calibração de um sensor feita por um técnico específico.  
  - **Autenticação**: JWT + papel `admin` ou `tecnico`.

- `DELETE /calibrations/:id_tecnico/:id_sensor`  
  - **Descrição**: remove o registro de calibração.  
  - **Autenticação**: JWT + papel `admin` ou `tecnico`.

### Sensor Service

- `GET /dev/generate-sensor-token` (somente em desenvolvimento)  
  - **Descrição**: gera um token para o serviço de sensores poder chamar as rotas internas.  
  - **Autenticação**: pública, mas habilitada só quando `NODE_ENV !== "production"`.

- `GET /sensor-service/sensors`  
  - **Descrição**: lista sensores para o serviço de sensores/simulador, usando o `sensorAuthMiddleware`.  
  - **Autenticação**: token de serviço (não JWT de usuário).

### Upload de arquivos

- `POST /upload`  
  - **Descrição**: faz upload de arquivo usando `multer` e envia o arquivo para o Backblaze B2.  
  - **Autenticação**: JWT (pensando em anexos de relatórios).

---

## Controllers e regras de negócio

### AuthenticationController

- **`authenticate`**:  
  Recebe `email` e `password`, valida credenciais no banco, compara hash de senha, e caso dê tudo certo, gera um JWT contendo o id do usuário e informações que serão usadas depois na autorização (como role). Em caso de erro, responde com status apropriado (401/400).

### UserControllers

- **`create`**:  
  Cria um usuário com base no `create.user.schema.json`.  
  Dependendo do payload, pode já ser criado como “usuário comum” ou ter dados de técnico/pesquisador. A senha é hasheada antes de ir pro banco.
- **`show`**:  
  Retorna os dados do usuário logado (`/users/me`) ou do usuário alvo (`/admin/users/:id`), sempre respeitando o papel de quem está chamando a rota.
- **`update`**:  
  Atualiza os dados do usuário. Se for troca de senha, exige `old_password`, compara com a senha atual e só então permite gravar a nova.
- **`index`**:  
  Lista usuários. Exposta apenas para admin.
- **`delete`**:  
  Remove um usuário específico. Também só admin.

### StationController

- **`index` / `show`**:  
  Listam e exibem estações.  
- **`create` / `update` / `delete`**:  
  CRUD completo de estações, travado em rotas `/admin`.
- **`addWorker` / `removeWorker`**:  
  Gerenciam o vínculo entre técnicos e estações. Essa relação é usada em vários pontos da regra de negócio (por exemplo, para filtrar alertas/relatórios que um técnico consegue ver).

### RelatorioController

- **`create`**:  
  Cria relatório vinculado a um alerta, com direito a cadastrar ações corretivas na mesma transaction.  
  Se alguma parte do fluxo falhar, nada é persistido.
- **`index`**:  
  Lista relatórios, mas com filtro: um técnico só vê relatórios das estações onde ele trabalha.
- **`show`**:  
  Retorna um relatório com suas ações corretivas e técnicos ligados. Também respeita a regra de visibilidade por estação.
- **`update` / `delete`**:  
  Só podem ser feitas por pesquisador ou admin.

### AcaoCorretivaController

- **`index` / `show`**:  
  Listam ações corretivas associadas ao técnico logado.
- **`update`**:  
  Permite alteração dos campos de ação corretiva (descrição, status, data_execucao), respeitando as regras de papel.
- **`delete`**:  
  Remove uma ação corretiva.
- **`addWorker` / `removeWorker`**:  
  Gerenciam quais técnicos estão ligados a qual ação corretiva.

### SensorController

- **`index` / `show`**:  
  Leitura dos sensores cadastrados.
- **`create` / `update` / `delete`**:  
  CRUD travado pra admin, já que mexer em sensor impacta diretamente o monitoramento.

### LeituraController

- **`create`**:  
  Criação de leitura a partir da rota de serviço de sensores (`/sensor-service/readings`). Aqui rola a verificação do limite do sensor para decidir se precisa abrir um alerta.
- **`index` / `show`**:  
  Permitem consultar as leituras registradas.
- **`delete`**:  
  Admin pode apagar leituras (por exemplo, leituras de teste ou claramente erradas).

### AlertaController

- **`index`**:  
  Lista alertas, mas filtrando por estações onde o técnico logado trabalha.
- **`show`**:  
  Retorna detalhes de um alerta se o técnico tiver permissão de ver aquela estação.
- **`update` / `delete`**:  
  Rotas administrativas para gerenciar/manualmente corrigir algum alerta.

### CalibragemController

- **`create` / `index` / `show` / `delete`**:  
  CRUD de calibrações, ligando técnico e sensor. A ideia aqui é registrar ações de calibração para manter histórico de confiabilidade dos sensores.

### FileController

- **`upload`**:  
  Recebe um arquivo (via `multer`), sobe pro Backblaze B2 e retorna os dados necessários (ex: URL pública) para vincular o arquivo a um relatório ou outro recurso da aplicação.

---

## Middlewares

### `authentication`

- Lê o token JWT do header `Authorization`.
- Valida assinatura e expiração.
- Se estiver ok, injeta no `req` informações do usuário (id, role, etc).
- Se falhar, responde com 401.

### `optionalAuth`

- Tenta autenticar via JWT, mas se não conseguir, apenas segue o fluxo sem travar a requisição.
- Útil em rotas como `POST /users`, onde tanto anônimo quanto autenticado podem chamar.

### `typeVerifyMiddleware` (hasRole)

- Recebe uma lista de papéis permitidos, exemplo: `("admin")`, `("pesquisador", "admin")`, `("admin", "tecnico")`.
- Consulta os vínculos do usuário com entidades como Técnico ou Pesquisador pra descobrir o papel real.
- Se o usuário não tiver pelo menos um dos papéis permitidos, retorna 403.

### `sensorAuthMiddleware`

- Lê um token específico de serviço (diferente do JWT).
- Compara com `SENSOR_SERVICE_SECRET`.
- Só deixa o serviço de sensores acessar rotas como `/sensor-service/readings` e `/sensor-service/sensors`.

### `schemaValidator`

- Recebe um JSON Schema correspondente ao endpoint.
- Valida o `req.body` contra esse schema.
- Em caso de erro, retorna 400 com detalhes do que está inválido (campo faltando, tipo errado, etc).

---



## Simulador de sensores

O diretório `sensor-simulator` representa um serviço separado, também containerizado, responsável por simular leituras periódicas de sensores.

- Ele lê o `.env` próprio, onde estão:
  - `API_BASE_URL`: onde está a API vista de dentro da rede Docker (`http://apicontainer:3000`).
  - `INTERVAL_MS`: intervalo entre disparos de leituras (no projeto, 5 minutos).
- O simulador:
  1. Obtém (ou recebe) um token de serviço.
  2. Consulta sensores disponíveis (via `/sensor-service/sensors`).
  3. Monta leituras aleatórias dentro de algum intervalo.
  4. Chama a rota `POST /sensor-service/readings` com essas leituras.

Isso ajuda a aproximar o cenário real em que um hardware externo estaria empurrando dados de tempos em tempos para a API, sem eu precisar sair montando sensor físico na bancada.

---

## Coleções do Postman e testes

Para facilitar os testes e também cumprir o requisito de que todos os endpoints sejam testáveis, foi criada uma **collection do Postman** com:

- todas as principais rotas da API, organizadas por pasta (Auth, Users, Stations, Sensors, Readings, Alerts, Reports, Corrective Actions, Calibrations, Sensor Service, Upload);
- exemplos de payload já prontos, batendo com os JSON Schemas;
- variáveis de ambiente para a base URL da API e token de autenticação.

---

## Contexto e motivação

A ideia deste sistema surgiu a partir de um problema real, inspirado em uma conversa com minha namorada, estudante de Engenharia Ambiental. Ela participa de uma iniciação científica na área de monitoramento da qualidade da água em bebedouros da UFLA, o que trouxe à tona desafios práticos de coleta, análise e acompanhamento dos dados. A partir dessa experiência, tive a ideia de construir uma API para um sistema automatizado de monitoramento da qualidade da água.

O sistema modela uma situação em que técnicos e pesquisadores atuam em estações de monitoramento equipadas com sensores automáticos. Esses sensores realizam leituras periódicas dos parâmetros de qualidade da água e, sempre que um valor ultrapassa um limite previamente definido, o sistema gera alertas. Pesquisadores analisam esses alertas e emitem relatórios técnicos com propostas de solução, enquanto técnicos executam ações corretivas em campo, calibram sensores e garantem a confiabilidade das medições ao longo do tempo. Todo o fluxo é supervisionado por um administrador, responsável por gerenciar usuários, estações e intervenções, permitindo que um mesmo usuário acumule, se necessário, os papéis de pesquisador, técnico e/ou administrador. Além disso, o sistema integra-se ao Backblaze para armazenamento de arquivos anexados aos relatórios, como documentos ou evidências coletadas em campo.

Na prática, foi uma forma de pegar um problema que realmente existe, trazer pro contexto do desafio, cuidando de papéis, regras de visibilidade, fluxo de dados e alguma integração externa.

---

## Autor

  Pedro Henrique Fonseca Resende – Trainee COMP Júnior (UFLA) 