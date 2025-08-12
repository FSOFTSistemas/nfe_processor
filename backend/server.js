const express = require('express');
const multer = require('multer');
const xml2js = require('xml2js');
const cors = require('cors');
const fs = require("fs");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 5510;

// Configurar CORS para permitir requisições do frontend
app.use(cors());

// Configurar multer para upload em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware para parsing JSON
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API NF-e/NFC-e Processor funcionando!' });
});

// Função para extrair dados do XML da NF-e/NFC-e
function extrairDadosNFe(xmlData) {
  try {
    const parser = new xml2js.Parser();
    let resultado = null;

    parser.parseString(xmlData, (err, result) => {
      if (err) {
        throw new Error('Erro ao fazer parse do XML: ' + err.message);
      }
      resultado = result;
    });

    

    // Navegar pela estrutura do XML para extrair os dados
    const nfeProc = resultado.nfeProc || resultado.NFe || resultado;
    const nfe = nfeProc.NFe ? nfeProc.NFe[0] : nfeProc;
    const infNFe = nfe.infNFe ? nfe.infNFe[0] : nfe;

    // Extrair dados da tag <ide>
    const ide = infNFe.ide[0];
    const numero = ide.nNF[0];
    const chave = infNFe.$.Id ? infNFe.$.Id.replace('NFe', '') : 'N/A';
    const dataEmissao = ide.dhEmi ? ide.dhEmi[0] : (ide.dEmi ? ide.dEmi[0] : 'N/A');

    // Extrair valor total
    const total = infNFe.total[0];
    const icmsTot = total.ICMSTot[0];
    const valorTotal = parseFloat(icmsTot.vNF[0]);

    const emit = infNFe.emit ? infNFe.emit[0] : null;
    const razaoSocial = emit && emit.xNome ? emit.xNome[0] : 'N/A';
    const cnpj = emit && emit.CNPJ ? emit.CNPJ[0] : '';
    const razaoSocialCnpj = cnpj ? `${cnpj} - ${razaoSocial}` : razaoSocial;

    // Extrair CFOP (pode estar em diferentes lugares)
    let cfop = 'N/A';
    if (infNFe.det && infNFe.det[0] && infNFe.det[0].prod && infNFe.det[0].prod[0].CFOP) {
      cfop = infNFe.det[0].prod[0].CFOP[0];
    }

    // Extrair situação da nota (cStat)
    let situacao = 'N/A';
    if (nfeProc.protNFe && nfeProc.protNFe[0] && nfeProc.protNFe[0].infProt && nfeProc.protNFe[0].infProt[0].cStat) {
      situacao = nfeProc.protNFe[0].infProt[0].cStat[0];
    }

    return {
      numero,
      data: dataEmissao,
      cfop,
      chave,
      situacao,
      razaoSocial: razaoSocialCnpj,
      valor: valorTotal,
    };

  } catch (error) {
    console.error('Erro ao processar XML:', error);
    throw error;
  }
}

// Rota para upload e processamento dos arquivos XML
app.post('/upload', upload.array('xmlFiles'), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    const notas = [];
    const resumoCFOP = {};

    // Processar cada arquivo XML
    req.files.forEach((file, index) => {
      try {
        const xmlContent = file.buffer.toString('utf8');
        const dadosNota = extrairDadosNFe(xmlContent);

        notas.push(dadosNota);

        // Agrupar por CFOP
        if (dadosNota.cfop !== 'N/A') {
          if (!resumoCFOP[dadosNota.cfop]) {
            resumoCFOP[dadosNota.cfop] = 0;
          }
          resumoCFOP[dadosNota.cfop] += dadosNota.valor;
        }

      } catch (error) {
        console.error(`Erro ao processar arquivo ${file.originalname}:`, error);
        // Adicionar nota com erro
        notas.push({
          numero: 'ERRO',
          chave: file.originalname,
          valor: 0,
          cfop: 'ERRO',
          situacao: 'ERRO',
          data: 'ERRO'
        });
      }
    });

    // Calcular o valor total das notas
    const valorTotalNotas = notas.reduce((acc, nota) => acc + nota.valor, 0);

    // Retornar resultado
    res.json({
      notas,
      resumoCFOP,
      valorTotalNotas
    });

  } catch (error) {
    console.error('Erro no processamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// // Iniciar servidor
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Servidor rodando na porta ${PORT}`);
// });


// Lendo os certificados SSL
const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/gestao-api.dev.br/privkey.pem"),
  cert: fs.readFileSync(
    "/etc/letsencrypt/live/gestao-api.dev.br/fullchain.pem"
  ),
};


// Função principal
(async () => {
  try {
    // Criando o servidor HTTPS
    https.createServer(options, app).listen(PORT, () => {
      console.log(`✅ Servidor rodando em HTTPS na porta ${PORT}`);
    });
  } catch (error) {
    console.error("🔴 Erro ao iniciar o servidor:", error);
  }
})();