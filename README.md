# 💧 API - Sistema de Monitoramento da Qualidade da Água

Projeto desenvolvido como parte do Programa Trainee da **COMP Júnior - UFLA**.

## 📘 Descrição

A ideia desse sistema surgiu de uma conversa com a minha namorada, que é estudante de Engenharia Ambiental e Sanitária e está desenvolvendo uma pesquisa sobre a qualidade da água em bebedouros da UFLA. Percebi como o processo de monitoramento ainda é bem manual e trabalhoso.

A partir disso, pensei em desenvolver uma API que automatizasse a análise, tornando o acompanhamento da qualidade da água mais rápido, acessível e confiável.

Foi dai que defini que o conceito deste projeto seria de um monitoramento inteligente da qualidade da água, que junta a tecnologia e ciência.
O projeto busca desenvolver um sistema automatizado para monitorar a qualidade da água
em estações de coleta, gerenciadas por técnicos e pesquisadores.

Nesta primeira etapa, foi criada a estrutura inicial do projeto em Node.js,
configurado o banco de dados com Sequelize, via migrations e models e implementada a containerização com Docker (API + MySQL em containers separados).

## ⚙️ Configuração do Sequelize

O Sequelize foi configurado para gerenciar a comunicação entre a API e o banco de dados MySQL, permitindo o uso de migrations e models para estruturar o banco de forma controlada.

As credenciais estão armazenadas em um arquivo `.env`, para garantir a segurança.

## 🧠 Modelagem e Relacionamentos

O sistema representa um ambiente em que técnicos e pesquisadores atuam em estações de monitoramento equipadas com sensores automáticos.
Esses sensores registram leituras periódicas e emitem alertas quando algum parâmetro ultrapassa limites aceitáveis.
Técnicos realizam calibrações e ações corretivas, enquanto pesquisadores analisam os alertas e produzem relatórios técnicos com recomendações de solução.

As funções administrativas serão implementadas na camada de aplicação e não como entidade no banco de dados.

<p align="center">
  <img src="./assets/diagrama-er.png" alt="Diagrama ER" width="1500">
</p>

## 🗄️ Estrutura do Banco de Dados 

### 🗃️ Migrations
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

### 🧩 Models
Após a criação das migrations, implementei todos os **models** do sistema no Sequelize, refletindo as tabelas existentes no banco de dados relacional.  
Tambem defini as **relações** entre as entidades utilizando os métodos `hasOne`, `belongsTo`, `hasMany` e `belongsToMany`, espelhando as chaves estrangeiras e associações da modelagem original.

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
DB_USER=root
DB_PASSWORD=root
DB_NAME=db_monitoramento
DB_HOST=mysqlcontainer
DB_PORT=3306
DB_DIALECT=mysql
```

### 🚀 Subindo os containers

Para iniciar o sistema completo (API + Banco de Dados), execute o comando abaixo na raiz do projeto:

```env
docker compose up --build
```

Esse comando, constrói a imagem da API, inicia o container do Node.js e o container do MySQL. Alem de criar automaticamente o banco de dados, aplicar todas as migrations e iniciar o servidor na porta 3000.

Não é necessário rodar manualmente os comandos yarn sequelize db:create nem yarn sequelize db:migrate.
Todo o processo é automatizado quando os containers sobem.

### 🧑‍💻 Comandos úteis do Docker para rodar e gerenciar o projeto

```env
docker compose up -d             # Sobe os containers em segundo plano (modo detached)
```
```env
docker ps                        # Lista containers ativos
```
```env
docker ps -a                     # Lista todos os containers (inclusive os parados)
```
```env
docker compose logs -f           # Mostra logs em tempo real de todos os containers
```
```env
docker compose logs -f apicontainer   # Mostra apenas os logs da API
```
```env
docker exec -it apicontainer sh       # Acessa o terminal dentro do container da API
```
```env
docker exec -it mysqlcontainer sh     # Acessa o terminal dentro do container do MySQL
```
```env
docker compose down              # Para e remove os containers (mantém volumes/dados)
```
```env
```env
docker images                    # Lista as imagens salvas localmente
```
### ♻️ Reconstruir tudo do zero
```env
docker compose down -v           # Para tudo e apaga também os volumes e o banco de dados
docker compose build --no-cache  # Reconstrói as imagens do zero, ignorando cache
docker system prune -af          # Limpa imagens, volumes e containers não usados
```

## 🌐 Acesso à API

Após subir os containers, o sistema ficará disponível em: http://localhost:3000

A API já possui **rotas prontas** para verificar se o servidor e o banco estão funcionando corretamente:

**GET** `/health` Retorna o status da API 

**GET** `/users` Retorna a lista de usuários cadastrados no banco de dados


## 👤 Desenvolvido por

**Pedro Henrique Fonseca Resende** – Trainee COMP Júnior (UFLA)
