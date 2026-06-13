# 💧 API - Sistema de Monitoramento da Qualidade da Água

Projeto desenvolvido no ecossistema da **COMP Júnior - UFLA**.

## 📘 Contexto da API

A ideia deste sistema surgiu da necessidade de automatizar a análise da qualidade da água em bebedouros da universidade, substituindo processos manuais de coleta e checagem. O projeto consiste em uma API estruturada em Node.js (Express + Sequelize) que simula e gerencia um ambiente onde técnicos e pesquisadores monitoram estações equipadas com sensores automáticos. 

Esses sensores registram leituras periódicas no banco de dados relacional e emitem alertas quando parâmetros físico-químicos ultrapassam limites aceitáveis.

> **⚠️ Nota sobre as Versões (Branches):**
> - A branch **`etapa-3`** contém a versão final e original da API, totalmente funcional e com a modelagem de dados completa, **antes** da adição de qualquer ferramenta de telemetria.
> - A branch **atual** (que você está visualizando) contém a evolução tecnológica do projeto: a **Prova de Conceito (PoC) do OpenTelemetry**.

---

## 🚀 Prova de Conceito (PoC) - OpenTelemetry & Jaeger

**Atividade:** Prospecção Teórica e Tecnológica - Engenharia de Software

Esta ramificação integra o **OpenTelemetry (OTel)** à API Aquasense. O objetivo direto é demonstrar a coleta de traces distribuídos e métricas de execução (abrangendo rotas HTTP e queries SQL) **sem a necessidade de alterar o código de negócio da aplicação**, utilizando a técnica de Auto-instrumentação em tempo de execução.

### 🛠️ Tecnologias Utilizadas na PoC
* **OpenTelemetry SDK Node.js:** Injeção e auto-instrumentação do roteador Express e das consultas do banco via Sequelize.
* **Protocolo OTLP:** Exportação de dados de telemetria através da rede interna do Docker via HTTP.
* **Jaeger (All-in-One):** Ferramenta de observabilidade visual instanciada via Docker para análise gráfica dos rastros.

### 📂 Arquivos Modificados/Criados para a PoC
* `instrumentation.js`: Novo arquivo raiz contendo a inicialização e os provedores do NodeSDK do OpenTelemetry.
* `docker-compose.yml`: Modificado para incluir os serviços `jaeger` e `sensor-simulator`, e para injetar o arquivo de instrumentação no container principal (`NODE_OPTIONS='--require ./instrumentation.js'`).
* `package.json`: Inclusão do ecossistema de bibliotecas `@opentelemetry`.

---

## ⚙️ Como Executar o Projeto Completo

A aplicação inteira está containerizada. Um único comando roda API, o banco de dados MySQL, o simulador de sensores e a interface de observabilidade.

### 1. Pré-requisitos
- Docker e Docker Compose instalados na máquina.

### 2. Configuração das Variáveis de Ambiente
Crie dois arquivos `.env` baseados nas configurações abaixo:

**Na raiz do projeto (crie o arquivo `/.env`):**
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
**Na pasta do simulador (crie o arquivo `/sensor-simulator/.env`):**

```env
API_BASE_URL=http://apicontainer:3000
INTERVAL_MS=300000
```

### 3. Subindo a Infraestrutura
No seu terminal, dentro da raiz do projeto, execute o comando:

```bash
docker compose up --build -d
```
*Este comando irá: construir a imagem da API injetando o OTel, subir o banco de dados (aplicando as migrations via CLI automaticamente), instanciar a interface do Jaeger e iniciar o envio de tráfego pelo simulador.*

---

## 📊 Validando a Prova de Conceito (Análise de Traces)

1. **Geração de Tráfego Automático:** Assim que os containers estiverem ativos e o *healthcheck* do MySQL passar, o serviço `sensor-simulator` começará a disparar requisições em background para a API, gerando a telemetria.
2. **Acesso ao Dashboard do Jaeger:**
   Abra o navegador e acesse: [http://localhost:16686](http://localhost:16686)
3. **Mapeamento e Inspeção:**
   * No menu lateral esquerdo, no campo **Service**, selecione `aquasense-api`.
   * Clique no botão azul **Find Traces**.
   * Ao clicar em qualquer um dos rastros listados (ex: `POST /auth`), o sistema exibirá a cascata de execução (*Waterfall*). Nela é possível auditar milissegundo a milissegundo o roteamento feito pelo Express, lado a lado com o tempo estrito que o banco de dados demorou para processar as queries SQL (`SELECT`, `INSERT`), validando a visibilidade distribuída do sistema.