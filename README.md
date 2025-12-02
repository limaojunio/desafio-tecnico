📄 README — Desafio Técnico (Consulta de CNPJ com Node.js + MySQL + Docker)

Este projeto foi desenvolvido para consultar informações de empresas a partir da API da Casa dos Dados, processar os resultados e salvar as informações em um banco MySQL.
A aplicação funciona via linha de comando (CLI) e permite trabalhar tanto com um único CNPJ quanto com uma lista completa presente no arquivo cnpjs.txt.

Também preparei suporte completo a Docker, para subir o banco + aplicação com um único comando.

🚀 Tecnologias usadas

Node.js (ESM)

Axios

MySQL 8 + mysql2

Docker e Docker Compose

Dotenv

📁 Estrutura principal do projeto
desafio-tecnico/
 ├── index.js
 ├── package.json
 ├── Dockerfile
 ├── docker-compose.yml
 ├── schema.sql
 ├── cnpjs.txt
 ├── .env.example
 └── .gitignore

⚙️ Configuração do Ambiente
1. Instalar dependências
npm install

2. Criar o arquivo .env

Copie o .env.example:

cp .env.example .env


Preencha os valores, por exemplo:

CASADOSDADOS_API_KEY=SEU_TOKEN_AQUI
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=sua_senha
DB_NAME=casadosdados
REQUEST_DELAY_MS=500


Obs: quando rodar com Docker, o DB_HOST deve ser db.

▶️ Como usar (sem Docker)
Consultar um único CNPJ
node index.js 27865757000102

Processar todos os CNPJs do arquivo cnpjs.txt
node index.js --txt

Consultar depois no MySQL
USE casadosdados;
SELECT * FROM empresas;
SELECT * FROM socios;

🐳 Como usar com Docker

O Docker Compose sobe automaticamente:

o MySQL

o app Node

aplica o schema.sql na primeira execução

e processa os CNPJs do arquivo

1. Ajustar .env para Docker
DB_HOST=db
DB_USER=root
DB_PASS=change_me
DB_NAME=casadosdados
CASADOSDADOS_API_KEY=SEU_TOKEN

2. Subir tudo com Docker Compose
docker-compose up --build

3. Logs

Aplicação:

docker-compose logs -f app


Banco:

docker-compose logs -f db

4. Rodar um único CNPJ via Docker
docker-compose run --rm app node index.js 27865757000102

5. Acessar o MySQL do container
docker exec -it desafio_db bash
mysql -uroot -pchange_me casadosdados

6. Parar containers
docker-compose down


Para apagar o volume (resetar o banco):

docker-compose down -v

📝 Sobre o arquivo cnpjs.txt

Coloque um CNPJ por linha:

12345678000195
27865757000102
34331903000177


Entradas inválidas são ignoradas automaticamente.

🧠 Como o código funciona (resumo)

O usuário passa um CNPJ ou usa --txt

O código valida o formato

Faz a requisição para a API da Casa dos Dados

Salva as informações da empresa no banco

Remove e reinsere os sócios (mantendo consistência)

Exibe um resumo no terminal

✔️ Objetivo do projeto

A ideia deste desafio é mostrar:

manipulação de APIs externas

uso de Node.js no formato ESM

leitura de arquivos

tratamento de erros

persistência em banco relacional

transações no MySQL

uso de Docker para padronizar o ambiente
