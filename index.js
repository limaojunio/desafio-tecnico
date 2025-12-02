import axios from "axios";
import dotenv from "dotenv";
import fs from "fs/promises";
import mysql from "mysql2/promise";
dotenv.config();

const API_BASE = "https://api.casadosdados.com.br/v4";
const API_KEY = process.env.CASADOSDADOS_API_KEY;
const DB_CONFIG = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "casadosdados",
  connectionLimit: 5,
};
const REQUEST_DELAY_MS = Number(process.env.REQUEST_DELAY_MS || 500);

if (!API_KEY) {
  console.error("ERRO: defina CASADOSDADOS_API_KEY no .env");
  process.exit(1);
}

/* limpa (remove caracteres especiais)*/
const clean = (s) => String(s || "").replace(/\D/g, "");

const isCNPJ = (s) => /^\d{14}$/.test(clean(s));

/* lê e filtra o arquivo: só retorna strings com 14 dígitos*/
async function readCnpjs(path = "cnpjs.txt") {
  try {
    const txt = await fs.readFile(path, "utf8");
    const lines = txt.split(/\r?\n/).map((l) => l.trim());
    const good = [];
    const skipped = [];
    for (const l of lines) {
      const c = clean(l);
      if (isCNPJ(c)) good.push(c);
      else if (l !== "") skipped.push(l); // se linha vazia, só ignora
    }
    if (skipped.length > 0) {
      console.warn(
        `Aviso: ${skipped.length} entradas inválidas no ${path} foram puladas.`
      );
    }
    return good;
  } catch {
    return [];
  }
}

/* consulta API */
async function fetchCnpj(cnpj) {
  const url = `${API_BASE}/cnpj/${cnpj}`;
  const res = await axios.get(url, {
    headers: { "api-key": API_KEY },
    timeout: 20000,
  });
  return res.data;
}

/* salva empresa, socios com transação curta */
async function saveToDb(pool, data) {
  const dataAbertura = data.data_abertura
    ? data.data_abertura.split("T")[0]
    : null;
  const capital =
    typeof data.capital_social === "string"
      ? Number(String(data.capital_social).replace(",", "."))
      : data.capital_social ?? null;
  const situ = data.situacao_cadastral?.situacao_atual ?? null;

  await pool.execute(
    `INSERT INTO empresas
     (cnpj, razao_social, nome_fantasia, data_abertura, capital_social, situacao_cadastral,
      cep, logradouro, numero, complemento, bairro, municipio, uf)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       razao_social=VALUES(razao_social),
       nome_fantasia=VALUES(nome_fantasia),
       data_abertura=VALUES(data_abertura),
       capital_social=VALUES(capital_social),
       situacao_cadastral=VALUES(situacao_cadastral),
       cep=VALUES(cep),
       logradouro=VALUES(logradouro),
       numero=VALUES(numero),
       complemento=VALUES(complemento),
       bairro=VALUES(bairro),
       municipio=VALUES(municipio),
       uf=VALUES(uf)`,
    [
      data.cnpj,
      data.razao_social ?? null,
      data.nome_fantasia ?? null,
      dataAbertura,
      capital,
      situ,
      data.endereco?.cep ?? null,
      data.endereco?.logradouro ?? null,
      data.endereco?.numero ?? null,
      data.endereco?.complemento ?? null,
      data.endereco?.bairro ?? null,
      data.endereco?.municipio ?? null,
      data.endereco?.uf ?? null,
    ]
  );

  if (
    Array.isArray(data.quadro_societario) &&
    data.quadro_societario.length > 0
  ) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute("DELETE FROM socios WHERE cnpj = ?", [data.cnpj]);
      for (const s of data.quadro_societario) {
        const entrada = s.data_entrada_sociedade
          ? s.data_entrada_sociedade.split("T")[0]
          : null;
        await conn.execute(
          "INSERT INTO socios (cnpj, nome, documento, qualificacao_socio, data_entrada) VALUES (?, ?, ?, ?, ?)",
          [
            data.cnpj,
            s.nome ?? null,
            s.documento ?? null,
            s.qualificacao_socio ?? null,
            entrada,
          ]
        );
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }
}

/* processa um CNPJ, valida, consulta e salva*/
async function processOne(pool, raw) {
  const cnpj = clean(raw);
  if (!isCNPJ(cnpj)) {
    console.warn("Pulando entrada inválida:", raw);
    return;
  }
  try {
    console.log("\nProcessando CNPJ:", cnpj);
    console.log("Consultando API para CNPJ:", cnpj);
    const data = await fetchCnpj(cnpj);
    console.log("\nResumo:");
    console.log({
      cnpj: data.cnpj,
      razao_social: data.razao_social,
      nome_fantasia: data.nome_fantasia,
      data_abertura: data.data_abertura,
      endereco: `${data.endereco?.municipio} - ${data.endereco?.uf}`,
    });
    await saveToDb(pool, data);
    console.log("\nSalvo no banco com sucesso:", cnpj);
  } catch (err) {
    // tratar 400 CNPJ inválido retornado pela API
    if (err.response && err.response.status === 400) {
      console.warn("API erro 400 (CNPJ inválido) para", cnpj);
      return;
    }
    if (err.response)
      console.error("API erro", err.response.status, err.response.data);
    else console.error("Erro:", err.message);
  }
}

/* --txt para processar arquivo, <cnpj> para consulta individual direta */
async function main() {
  const args = process.argv.slice(2);
  const pool = mysql.createPool(DB_CONFIG);
  try {
    if (args.length === 0) {
      console.log("Uso:\n  node index.js <CNPJ>\n  node index.js --txt");
      return;
    }
    if (args[0] === "--txt") {
      const list = await readCnpjs();
      if (!list.length) {
        console.error("cnpjs.txt vazio ou ausente");
        return;
      }
      console.log(
        `\n ${list.length} CNPJs válidos encontrados no arquivo. Processando...`
      );
      for (let i = 0; i < list.length; i++) {
        await processOne(pool, list[i]);
        if (i < list.length - 1)
          await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS));
      }
      return;
    }
    // CNPJ unico passado via argumento
    const argCnpj = clean(args[0]);
    if (!isCNPJ(argCnpj)) {
      console.error("CNPJ inválido fornecido como argumento:", args[0]);
      return;
    }
    await processOne(pool, argCnpj);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
