# Processador de NF-e/NFC-e

Sistema completo para upload, processamento e visualização de dados de arquivos XML de NF-e/NFC-e, desenvolvido com React (frontend) e Node.js (backend).

## 🚀 Funcionalidades

- **Upload múltiplo**: Selecione e processe vários arquivos XML simultaneamente
- **Processamento automático**: Extração automática dos dados principais das notas fiscais
- **Visualização organizada**: Tabela detalhada com todas as notas processadas
- **Resumo por CFOP**: Cards coloridos mostrando totais agrupados por CFOP
- **Interface responsiva**: Layout adaptável para desktop e mobile usando Bootstrap 5

## 📋 Dados Extraídos

O sistema extrai os seguintes dados de cada arquivo XML:

- **Número da nota** (`nNF`)
- **Chave de acesso** (`chNFe`)
- **Valor total** (`vNF`)
- **CFOP** (`CFOP`)
- **Situação da nota** (`cStat`)
- **Data da emissão** (`dhEmi` ou `dEmi`)

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** + **Express**: Servidor web
- **multer**: Upload de arquivos
- **xml2js**: Processamento de XML
- **cors**: Habilitação de CORS

### Frontend
- **React**: Interface de usuário
- **Bootstrap 5**: Framework CSS
- **Vite**: Build tool
- **shadcn/ui**: Componentes de UI

## 📦 Estrutura do Projeto

```
nfe-processor/
├── backend/
│   ├── server.js          # Servidor Express
│   ├── package.json       # Dependências do backend
│   └── node_modules/
├── frontend/
│   └── nfe-frontend/
│       ├── src/
│       │   ├── App.jsx    # Componente principal
│       │   ├── App.css    # Estilos
│       │   └── main.jsx   # Ponto de entrada
│       ├── index.html     # HTML principal
│       ├── package.json   # Dependências do frontend
│       └── node_modules/
├── exemplo-nfe.xml        # Arquivo de exemplo 1
├── exemplo-nfe2.xml       # Arquivo de exemplo 2
└── README.md              # Esta documentação
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou pnpm

### 1. Instalar Dependências

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend/nfe-frontend
pnpm install
```

### 2. Executar o Projeto

#### Iniciar o Backend (Terminal 1)
```bash
cd backend
npm start
```
O servidor backend estará disponível em: `http://localhost:3001`

#### Iniciar o Frontend (Terminal 2)
```bash
cd frontend/nfe-frontend
pnpm run dev --host
```
A aplicação frontend estará disponível em: `http://localhost:5173`

### 3. Usar a Aplicação

1. Abra o navegador em `http://localhost:5173`
2. Clique em "Choose Files" para selecionar arquivos XML
3. Selecione um ou mais arquivos XML de NF-e/NFC-e
4. Clique em "Enviar" para processar
5. Visualize os resultados na tabela e nos cards de resumo

## 📄 Formato de Resposta da API

A API retorna um JSON no seguinte formato:

```json
{
  "notas": [
    {
      "numero": "1",
      "chave": "35200714200166000187550010000000001123456789",
      "valor": 100.00,
      "cfop": "5102",
      "situacao": "100",
      "data": "2024-01-15T10:30:00-03:00"
    }
  ],
  "resumoCFOP": {
    "5102": 100.00,
    "6108": 150.00
  }
}
```

## 🔧 API Endpoints

### POST `/upload`
- **Descrição**: Processa arquivos XML de NF-e/NFC-e
- **Content-Type**: `multipart/form-data`
- **Parâmetros**: `xmlFiles` (array de arquivos)
- **Resposta**: JSON com notas processadas e resumo por CFOP

### GET `/`
- **Descrição**: Endpoint de teste
- **Resposta**: `{ "message": "API NF-e/NFC-e Processor funcionando!" }`

## 🎨 Interface

### Componentes Principais

1. **Card de Upload**: Interface para seleção de arquivos XML
2. **Cards de Resumo**: Exibição dos totais por CFOP com cores diferentes
3. **Tabela de Notas**: Lista detalhada de todas as notas processadas

### Cores dos Cards CFOP

- Azul (Primary): Primeiro CFOP
- Verde (Success): Segundo CFOP
- Ciano (Info): Terceiro CFOP
- Amarelo (Warning): Quarto CFOP
- Vermelho (Danger): Quinto CFOP
- Cinza (Secondary): Sexto CFOP e subsequentes

## 🔍 Tratamento de Erros

- Arquivos XML malformados são tratados e marcados como "ERRO"
- Mensagens de erro são exibidas na interface
- Logs detalhados no console do servidor

## 📱 Responsividade

A interface é totalmente responsiva e funciona em:
- Desktop (telas grandes)
- Tablets (telas médias)
- Smartphones (telas pequenas)

## 🧪 Arquivos de Exemplo

O projeto inclui dois arquivos XML de exemplo:
- `exemplo-nfe.xml`: NF-e com CFOP 5102 e valor R$ 100,00
- `exemplo-nfe2.xml`: NF-e com CFOP 6108 e valor R$ 150,00

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Em caso de dúvidas ou problemas:

1. Verifique se as portas 3001 e 5173 estão livres
2. Confirme que as dependências foram instaladas corretamente
3. Verifique os logs do console para erros detalhados
4. Teste com os arquivos XML de exemplo fornecidos

# somador_xml_js
# nfe_processor
