const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Segurança com Helmet
app.use(helmet({
  contentSecurityPolicy: false
}));

// Permite requisições de qualquer origem (durante o desenvolvimento)
app.use(cors());

// Body parser e arquivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src')));
app.use('/assets', express.static(path.join(__dirname, 'src/assets')));
app.use('/lang', express.static(path.join(__dirname, 'src/lang')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/index.html'));
});

const arquivo = path.join(__dirname, 'certificados.json');
if (!fs.existsSync(arquivo)) fs.writeFileSync(arquivo, '[]', 'utf8');

app.post('/api/certificados', (req, res) => {
  const { aluno, curso, instituicao, carga, data1, data2, assinaturaTexto, modelo, dataEnvio } = req.body;

  if ([aluno, curso, instituicao, carga, modelo, dataEnvio].some(campo => !campo || campo.trim() === "")) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando ou vazios.' });
  }

  const novoCertificado = { aluno, curso, instituicao, carga, data1, data2, assinaturaTexto, modelo, dataEnvio };

  fs.readFile(arquivo, 'utf8', (err, data) => {
    let certificados = [];

    if (!err && data) {
      try {
        certificados = JSON.parse(data);
      } catch (e) {
        certificados = [];
      }
    }

    certificados.push(novoCertificado);

    fs.writeFile(arquivo, JSON.stringify(certificados, null, 2), err => {
      if (err) return res.status(500).json({ erro: 'Erro ao salvar certificado.' });
      res.status(201).json({ mensagem: 'Certificado salvo com sucesso.' });
    });
  });
});

app.get('/api/certificados', (req, res) => {
  fs.readFile(arquivo, 'utf8', (err, data) => {
    if (err || !data) return res.json([]);
    try {
      const certificados = JSON.parse(data);
      res.json(certificados);
    } catch (e) {
      res.status(500).json({ erro: 'Erro ao ler certificados.' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
