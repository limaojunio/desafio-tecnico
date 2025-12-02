CREATE DATABASE IF NOT EXISTS casadosdados;
USE casadosdados;

CREATE TABLE IF NOT EXISTS empresas (
  cnpj VARCHAR(14) PRIMARY KEY,
  razao_social TEXT,
  nome_fantasia TEXT,
  data_abertura DATE,
  capital_social DECIMAL(18,2),
  situacao_cadastral VARCHAR(100),
  cep VARCHAR(10),
  logradouro VARCHAR(200),
  numero VARCHAR(50),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  municipio VARCHAR(100),
  uf VARCHAR(2),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS socios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cnpj VARCHAR(14),
  nome VARCHAR(255),
  documento VARCHAR(50),
  qualificacao_socio VARCHAR(255),
  data_entrada DATE,
  FOREIGN KEY (cnpj) REFERENCES empresas(cnpj) ON DELETE CASCADE
);
