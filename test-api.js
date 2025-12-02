
import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

const API_KEY = process.env.CASADOSDADOS_API_KEY;
if (!API_KEY) {
  console.error('Falta CASADOSDADOS_API_KEY no .env');
  process.exit(1);
}

const CNPJ = process.argv[2] || '12345678000199';

async function main() {
  try {
    const res = await axios.get(`https://api.casadosdados.com.br/v4/cnpj/${CNPJ}`, {
      headers: { 'api-key': API_KEY },
      timeout: 20000
    });
    // imprimir só o resumo
    const data = res.data;
    console.log('CNPJ:', data.cnpj);
    console.log('Razão social:', data.razao_social);
    console.log('Nome fantasia:', data.nome_fantasia);
    console.log('Data abertura:', data.data_abertura);
    // para ver o objeto completo:
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Erro da API:', err.response.status, err.response.data);
    } else {
      console.error('Erro:', err.message);
    }
  }
}

main();
