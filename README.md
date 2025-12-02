📄 README — Consulta de CNPJ (Node.js + MySQL + Docker)

Este projeto realiza consultas de CNPJ utilizando a API da Casa dos Dados e salva as informações no banco MySQL.
A aplicação funciona via linha de comando (CLI) e também possui configuração completa via Docker.

📦 Tecnologias utilizadas

Node.js (ESM)

Axios

MySQL + mysql2

Docker

Dotenv

📁 Estrutura do Projeto
desafio-tecnico/
├── index.js
├── package.json
├── Dockerfile
├── docker-compose.yml
├── schema.sql
├── cnpjs.txt
├── .env.example
└── .gitignore

⚙️ Configuração (Local)

1. Instalar dependências
   npm install

2. Criar e configurar o arquivo .env

Crie o arquivo baseado no .env.example:

CASADOSDADOS_API_KEY=SEU_TOKEN_AQUI
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=sua_senha
DB_NAME=casadosdados
REQUEST_DELAY_MS=500

⚠️ Observação: no Docker, DB_HOST será db.

▶️ Executando sem Docker
📌 Consultar um único CNPJ
node index.js 27865757000102

📌 Processar todos os CNPJs do arquivo cnpjs.txt
node index.js --txt

📌 Consultar dados salvos no MySQL
USE casadosdados;
SELECT _ FROM empresas;
SELECT _ FROM socios;

🐳 Executando com Docker

1. Ajustar .env para Docker:
   CASADOSDADOS_API_KEY=SEU_TOKEN_AQUI
   DB_HOST=db
   DB_USER=root
   DB_PASS=change_me
   DB_NAME=casadosdados
   REQUEST_DELAY_MS=500

2. Subir a aplicação
   docker-compose up --build

O Docker Compose vai:

Subir o MySQL

Aplicar o schema.sql automaticamente

Subir a aplicação

Processar o arquivo cnpjs.txt

3. Ver logs

Aplicação:

docker-compose logs -f app

MySQL:

docker-compose logs -f db

4. Executar consulta de um único CNPJ via Docker
   docker-compose run --rm app node index.js 27865757000102

5. Acessar o MySQL dentro do container
   docker exec -it desafio_db bash
   mysql -uroot -pchange_me casadosdados

6. Derrubar containers
   docker-compose down

Para apagar o banco:

docker-compose down -v

📄 Sobre o arquivo cnpjs.txt

Cada linha deve conter um único CNPJ:

12345678000195
27865757000102
34331903000177

Linhas vazias e CNPJs inválidos são ignorados automaticamente.

🧠 Funcionamento interno (Resumo)

O CLI verifica se deve processar um único CNPJ ou o arquivo inteiro

Cada CNPJ é validado

A API da Casa dos Dados é consultada

Os dados são salvos nas tabelas empresas e socios

Sócios antigos são removidos e substituídos pelos novos

Logs são exibidos no terminal para acompanhar o processo

✔️ Objetivo

Estruturação de CLI em Node.js

Integração com API externa

Persistência em banco relacional

Uso de transações no MySQL

Organização do ambiente via Docker

Documentação clara do funcionamento
