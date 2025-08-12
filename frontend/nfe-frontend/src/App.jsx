import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function App() {
  const [arquivos, setArquivos] = useState([])
  const [notas, setNotas] = useState([])
  const [resumoCFOP, setResumoCFOP] = useState({})
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [valorTotalNotas, setValorTotalNotas] = useState(0);
  const [filtro, setFiltro] = useState('');

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files)
    setArquivos(files)
    setErro('')
  }

  const handleUpload = async () => {
    if (arquivos.length === 0) {
      setErro('Por favor, selecione pelo menos um arquivo XML')
      return
    }

    setCarregando(true)
    setErro('')

    try {
      const formData = new FormData()
      arquivos.forEach(arquivo => {
        formData.append('xmlFiles', arquivo)
      })

      const response = await fetch('http://gestao-api.dev.br:5510/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Erro ao processar arquivos')
      }

      const data = await response.json()
      setNotas(data.notas)
      setResumoCFOP(data.resumoCFOP)
      setValorTotalNotas(data.valorTotalNotas || 0);
    } catch (error) {
      setErro('Erro ao processar arquivos: ' + error.message)
    } finally {
      setCarregando(false)
    }
  }

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarData = (data) => {
    if (!data || data === 'N/A' || data === 'ERRO') return data
    try {
      const date = new Date(data)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return data
    }
  }

  const getCoresCard = (index) => {
    const cores = [
      'bg-primary text-white',
      'bg-success text-white',
      'bg-info text-white',
      'bg-warning text-dark',
      'bg-danger text-white',
      'bg-secondary text-white'
    ]
    return cores[index % cores.length]
  }

  const gerarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Relatório de notas', 105, 15, { align: 'center' });

    doc.setFontSize(9);
    if (notas.length > 0 && notas[0].razaoSocial) {
      doc.text(`${notas[0].razaoSocial}`, 14, 22);
    }

    const dataHoraAtual = new Date().toLocaleString('pt-BR');
    doc.setFontSize(8);
    doc.text(`Emitido em: ${dataHoraAtual}`, 200, 22, { align: 'right' });

    // 2️⃣ Lista de Notas
    const notasData = notas.map(nota => [
      nota.numero,
      formatarData(nota.data),
      nota.cfop,
      nota.chave,
      nota.situacao,
      formatarValor(nota.valor),
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Número', 'Data Emissão', 'CFOP', 'Chave de Acesso', 'Situação', 'Valor Total']],
      body: notasData,
      styles: { fontSize: 9 },
      columnStyles: {
        3: { cellWidth: 50 }, // chave de acesso
      }
    });

    // Valor Total das Notas
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Valor Total das Notas']],
      body: [[formatarValor(valorTotalNotas)]],
      styles: { halign: 'center' }
    });

    // Resumo por CFOP
    const cfopData = Object.entries(resumoCFOP).map(([cfop, valor]) => [
      cfop,
      formatarValor(valor)
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['CFOP', 'Valor']],
      body: cfopData,
      styles: { halign: 'center' }
    });

    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(5);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text('Emitido por FSoft Sistemas', 14, 290, { align: 'left' });
    }

    // Abre em nova aba
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };

  const notasFiltradas = notas.filter(nota => {
    const filtroLower = filtro.toLowerCase();
    return (
      nota.chave.toLowerCase().includes(filtroLower) ||
      formatarData(nota.data).toLowerCase().includes(filtroLower) ||
      String(nota.numero).includes(filtroLower) ||
      formatarValor(nota.valor).toLowerCase().includes(filtroLower)
    );
  });

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-4">Processador de NF-e/NFC-e</h1>
          <div className="d-flex justify-content-center mb-4">
            <button className="btn btn-success" onClick={gerarPDF} disabled={notas.length === 0}>
              Gerar Relatório PDF
            </button>
          </div>
          {/* Seção de Upload */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Upload de Arquivos XML</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="xmlFiles" className="form-label">
                  Selecione os arquivos XML das NF-e/NFC-e:
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="xmlFiles"
                  multiple
                  accept=".xml"
                  onChange={handleFileChange}
                />
                {arquivos.length > 0 && (
                  <div className="form-text">
                    {arquivos.length} arquivo(s) selecionado(s)
                  </div>
                )}
              </div>

              <Button
                onClick={handleUpload}
                disabled={carregando || arquivos.length === 0}
                className="btn btn-primary"
              >
                {carregando ? 'Processando...' : 'Enviar'}
              </Button>

              {erro && (
                <div className="alert alert-danger mt-3" role="alert">
                  {erro}
                </div>
              )}
            </div>
          </div>

          {/* Cards de Resumo por CFOP e Valor Total das Notas */}
          {(valorTotalNotas > 0 || Object.keys(resumoCFOP).length > 0) && (
            <div className="mb-4">
              {valorTotalNotas > 0 && (
                <div className="mb-4">
                  <h5 className="mb-3">Valor Total das Notas</h5>
                  <div className="row">
                    <div className="col-md-4 col-lg-3 mb-3">
                      <div className="card bg-dark text-white">
                        <div className="card-body text-center">
                          <h6 className="card-title">Total</h6>
                          <h4 className="card-text">{formatarValor(valorTotalNotas)}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {Object.keys(resumoCFOP).length > 0 && (
                <div>
                  <h5 className="mb-3">Resumo por CFOP</h5>
                  <div className="row">
                    {Object.entries(resumoCFOP).map(([cfop, valor], index) => (
                      <div key={cfop} className="col-md-4 col-lg-3 mb-3">
                        <div className={`card ${getCoresCard(index)}`}>
                          <div className="card-body text-center">
                            <h6 className="card-title">CFOP {cfop}</h6>
                            <h4 className="card-text">{formatarValor(valor)}</h4>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tabela de Notas */}
          {notas.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Notas Processadas ({notas.length})</h5>
              </div>
              <div className="card-body">
                <input
                  type="text"
                  placeholder="Buscar por chave, data, número ou valor"
                  className="form-control mb-3"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Número</th>
                        <th>Data Emissão</th>
                        <th>CFOP</th>
                        <th>Chave de Acesso</th>
                        <th>Situação</th>
                        <th>Valor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notasFiltradas.map((nota, index) => (
                        <tr key={index}>
                          <td>{nota.numero}</td>
                          <td>{formatarData(nota.data)}</td>
                          <td>
                            <span className="badge bg-secondary">{nota.cfop}</span>
                          </td>
                          <td>
                            <small className="font-monospace">
                              {nota.chave.length > 44
                                ? `${nota.chave.substring(0, 44)}...`
                                : nota.chave
                              }
                            </small>
                          </td>
                          <td>
                            <span className={`badge ${nota.situacao === '100' ? 'bg-success' :
                              nota.situacao === 'ERRO' ? 'bg-danger' : 'bg-warning'
                              }`}>
                              {(() => {
                                switch (nota.situacao) {
                                  case '100': return 'Autorizada';
                                  case 'ERRO': return 'Erro';
                                  default: return 'Pendente';
                                }
                              })()}
                            </span>
                          </td>
                          <td>{formatarValor(nota.valor)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
