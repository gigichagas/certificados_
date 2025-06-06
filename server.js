const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

const app = express();

// Forçar redirecionamento HTTP -> HTTPS
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

const PORT = process.env.PORT || 3000;


// Caminho absoluto da pasta 'src'
const srcPath = path.join(__dirname, 'src');

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// Serve toda a pasta 'src' como pública
app.use(express.static(srcPath));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(srcPath, 'index.html'));
});

// Caminho do JSON de certificados
const certificadosPath = path.join(__dirname, 'certificados.json');
if (!fs.existsSync(certificadosPath)) {
  fs.writeFileSync(certificadosPath, '[]', 'utf8');
}

// ✅ Rota para salvar certificados
app.post('/api/certificados', (req, res) => {
  const { aluno, curso, instituicao, carga, data1, data2, assinaturaTexto, modelo, dataEnvio, email } = req.body;

  if ([aluno, curso, instituicao, carga, modelo, dataEnvio, email].some(campo => !campo || campo.trim() === "")) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando ou vazios.' });
  }

  const novoCertificado = { aluno, curso, instituicao, carga, data1, data2, assinaturaTexto, modelo, dataEnvio, email };

  fs.readFile(certificadosPath, 'utf8', (err, data) => {
    let certificados = [];
    if (!err && data) {
      try {
        certificados = JSON.parse(data);
      } catch (e) {
        certificados = [];
      }
    }

    certificados.push(novoCertificado);

    fs.writeFile(certificadosPath, JSON.stringify(certificados, null, 2), err => {
      if (err) return res.status(500).json({ erro: 'Erro ao salvar certificado.' });
      res.status(201).json({ mensagem: 'Certificado salvo com sucesso.' });
    });
  });
});

// ✅ Rota para listar certificados
app.get('/api/certificados', (req, res) => {
  const email = req.query.email;
  fs.readFile(certificadosPath, 'utf8', (err, data) => {
    if (err || !data) return res.json([]);
    try {
      const certificados = JSON.parse(data);
      if (email) {
        const filtrados = certificados.filter(cert => cert.email === email);
        return res.json(filtrados);
      }
      res.json(certificados);
    } catch (e) {
      res.status(500).json({ erro: 'Erro ao ler certificados.' });
    }
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
