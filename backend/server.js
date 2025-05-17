const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const app = express();
const PORT = 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));


app.use(express.json());
app.use(express.static(path.join(__dirname, '../src')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/lang', express.static(path.join(__dirname, '../lang')));
app.use('/libs', express.static(path.join(__dirname, '../src/libs')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/index.html'));
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
        console.error('Erro ao parsear JSON existente:', e);
        certificados = [];
      }
    }

    certificados.push(novoCertificado);

    fs.writeFile(arquivo, JSON.stringify(certificados, null, 2), err => {
      if (err) {
        console.error('Erro ao salvar certificado:', err);
        return res.status(500).json({ erro: 'Erro ao salvar certificado.' });
      }
      res.status(201).json({ mensagem: 'Certificado salvo com sucesso.' });
    });
  });
});

app.get('/api/certificados', (req, res) => {
  fs.readFile(arquivo, 'utf8', (err, data) => {
    if (err || !data) {
      return res.json([]);
    }

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
