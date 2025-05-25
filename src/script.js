let modeloSelecionado = '';
let currentTexts = {};
let emailUsuarioLogado = null;

function carregarHistorico(email) {
  if (!email) {
    console.warn('Usuário não autenticado, não é possível carregar histórico.');
    return;
  }

  fetch(`https://certificados-production.up.railway.app/api/certificados?email=${encodeURIComponent(email)}`)
    .then(res => res.json())
    .then(certificados => {
      exibirHistorico(certificados);
    })
    .catch(err => console.error('Erro ao carregar histórico:', err));
}

function exibirHistorico(certificados) {
  const historicoList = document.getElementById('listaHistorico');

  if (!historicoList) {
    console.error("Elemento 'listaHistorico' não encontrado no DOM.");
    return;
  }

  historicoList.innerHTML = '';

  if (!certificados.length) {
    historicoList.innerHTML = '<p>Nenhum certificado encontrado.</p>';
    return;
  }

  certificados.forEach(cert => {
    const item = document.createElement('li');
    item.textContent = `${cert.curso} - ${cert.instituicao} (${new Date(cert.dataEnvio).toLocaleString()})`;
    historicoList.appendChild(item);
  });
}

addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection');
  const registerSection = document.getElementById('registerSection');
  const modelosSection = document.querySelector('.modelos');
  const formularioSection = document.querySelector('.formulario');
  const subtitulo = document.querySelector('.subtitulo');
  const certificadoProntoSection = document.getElementById('certificadoPronto');
  const historicoSection = document.getElementById('historicoCertificados');
  const historicoList = document.getElementById('historicoList'); // precisa de uma UL ou DIV no HTML

  const btnLogin = document.getElementById('loginBtn');
  const btnShowRegister = document.getElementById('showRegisterBtn');
  const btnShowLogin = document.getElementById('showLoginBtn');
  const btnContinueWithoutLogin = document.getElementById('continueWithoutLoginBtn');
  const btnLogout = document.getElementById('logoutBtn');
  const btnVerHistorico = document.getElementById('btnHistoricoForm');
  const btnVoltarHistorico = document.getElementById('btnVoltar');

  function mostrarLogin() {
    loginSection.style.display = 'block';
    registerSection.style.display = 'none';
    modelosSection.style.display = 'none';
    formularioSection.style.display = 'none';
    subtitulo.style.display = 'none';
    certificadoProntoSection.style.display = 'none';
    historicoSection.style.display = 'none';
    btnLogout.style.display = 'none';
    btnVerHistorico.style.display = 'none';
  }

  function mostrarConteudoLogado() {
    loginSection.style.display = 'none';
    registerSection.style.display = 'none';
    modelosSection.style.display = 'block';
    formularioSection.style.display = 'block';
    subtitulo.style.display = 'block';
    certificadoProntoSection.style.display = 'none';
    historicoSection.style.display = 'none';
    btnLogout.style.display = 'inline-block';
    btnVerHistorico.style.display = 'inline-block';
  }

  function mostrarConteudoSemLogin() {
    loginSection.style.display = 'none';
    registerSection.style.display = 'none';
    modelosSection.style.display = 'block';
    formularioSection.style.display = 'block';
    subtitulo.style.display = 'block';
    certificadoProntoSection.style.display = 'none';
    historicoSection.style.display = 'none';
    btnLogout.style.display = 'none';
    btnVerHistorico.style.display = 'none';
  }

  mostrarLogin();

  btnShowRegister.addEventListener('click', () => {
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
  });

  btnShowLogin.addEventListener('click', () => {
    mostrarLogin();
  });

  btnLogin.addEventListener('click', () => {
    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginPass').value.trim();
    if (!email || !senha) return alert('Preencha email e senha!');

    firebase.auth().signInWithEmailAndPassword(email, senha)
      .then(() => {
        emailUsuarioLogado = email;
        mostrarConteudoLogado();
        carregarHistorico(email);
      })
      .catch(error => alert('Erro ao entrar: ' + error.message));
  });

  document.getElementById('registerBtn').addEventListener('click', () => {
    const email = document.getElementById('registerEmail').value.trim();
    const senha = document.getElementById('registerPass').value.trim();
    if (!email || !senha) return alert('Preencha email e senha!');

    firebase.auth().createUserWithEmailAndPassword(email, senha)
      .then(() => {
        emailUsuarioLogado = email;
        mostrarConteudoLogado();
        carregarHistorico(email);
      })
      .catch(error => alert('Erro ao cadastrar: ' + error.message));
  });

  btnLogout.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
      document.getElementById('userMenu').style.display = 'none';
      document.getElementById('avatarLetter').textContent = '';
      document.getElementById('userEmail').textContent = '';
      emailUsuarioLogado = null;
      mostrarLogin();
    }).catch(error => {
      alert('Erro ao sair: ' + error.message);
    });
  });

  btnContinueWithoutLogin.addEventListener('click', () => {
    mostrarConteudoSemLogin();
  });

  btnVerHistorico.addEventListener('click', () => {
    modelosSection.style.display = 'none';
    formularioSection.style.display = 'none';
    subtitulo.style.display = 'none';
    certificadoProntoSection.style.display = 'none';
    historicoSection.style.display = 'block';
    carregarHistorico(emailUsuarioLogado);
  });

  btnVoltarHistorico.addEventListener('click', () => {
    historicoSection.style.display = 'none';
    modelosSection.style.display = 'block';
    formularioSection.style.display = 'block';
    subtitulo.style.display = 'block';
  });

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      const email = user.email;
      emailUsuarioLogado = email;
      document.getElementById('userMenu').style.display = 'flex';
      document.getElementById('avatarLetter').textContent = email.charAt(0).toUpperCase();
      document.getElementById('userEmail').textContent = email;
      mostrarConteudoLogado();
      carregarHistorico(email);
    } else {
      document.getElementById('userMenu').style.display = 'none';
      document.getElementById('avatarLetter').textContent = '';
      document.getElementById('userEmail').textContent = '';
      emailUsuarioLogado = null;
      mostrarLogin();
    }
  });

  // Selecionar modelo

  document.querySelectorAll('.modelo').forEach(img => {
    img.addEventListener('click', () => {
      document.querySelector('.formulario').style.display = 'block';
      document.querySelectorAll('.modelo').forEach(m => m.classList.remove('selecionado'));
      img.classList.add('selecionado');
      modeloSelecionado = img.getAttribute('src');
    });
  });

  // Linguagem
document.getElementById('btnLangPt').addEventListener('click', () => {
  setLanguage('pt');
  atualizarTextosNaTela();
});
document.getElementById('btnLangEn').addEventListener('click', () => {
  setLanguage('en');
  atualizarTextosNaTela();
});


  // Alternar campo de assinatura estilizada
  document.getElementById('assinaturaTextoBtn').addEventListener('click', () => {
    const campo = document.getElementById('assinaturaEstilizada');
    campo.style.display = campo.style.display === 'none' ? 'block' : 'none';
  });

  // Canvas da assinatura
  const canvas = document.getElementById('assinaturaCanvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let desenhando = false;

  // Desenho com mouse
canvas.addEventListener('mousedown', e => {
  desenhando = true;
  desenhar(e.clientX, e.clientY);
});

canvas.addEventListener('mousemove', e => {
  if (!desenhando) return;
  desenhar(e.clientX, e.clientY);
});

canvas.addEventListener('mouseup', () => {
  desenhando = false;
  ctx.beginPath();
});

// Desenho com toque (mobile)
canvas.addEventListener('touchstart', e => {
  e.preventDefault(); // evitar rolagem da tela
  desenhando = true;
  const touch = e.touches[0];
  desenhar(touch.clientX, touch.clientY);
});

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (!desenhando) return;
  const touch = e.touches[0];
  desenhar(touch.clientX, touch.clientY);
});

canvas.addEventListener('touchend', () => {
  desenhando = false;
  ctx.beginPath();
});

// Função comum de desenho
function desenhar(x, y) {
  const rect = canvas.getBoundingClientRect();
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#000';
  ctx.lineTo(x - rect.left, y - rect.top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - rect.left, y - rect.top);
}

  document.getElementById('limparCanvas').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // Baixar PDF do certificado atual usando html2canvas + jsPDF
  document.getElementById('baixarPdf').addEventListener('click', () => {
    const certificado = document.querySelector('.certificado-gerado');
    if (!certificado) return alert("Certificado ainda não foi gerado.");

    // Usa html2canvas para transformar o certificado em imagem
    html2canvas(certificado, { scale: 3, useCORS: true }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: [1000, 700]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 1000, 700);
      pdf.save('certificado.pdf');
    }).catch(err => {
      console.error('Erro ao gerar PDF:', err);
      alert('Erro ao gerar PDF. Veja o console para mais detalhes.');
    });
  });

  // Submissão do formulário
  document.getElementById('certForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!modeloSelecionado) return alert('Selecione um modelo de certificado antes de continuar.');

    const aluno = document.getElementById('aluno').value.trim();
    const curso = document.getElementById('curso').value.trim();
    const instituicao = document.getElementById('instituicao').value.trim();
    const carga = document.getElementById('carga').value.trim();
    const data1 = document.getElementById('data1').value;
    const data2 = document.getElementById('data2').value;
    const assinaturaTexto = document.getElementById('assinaturaEstilizada').value;

    if (!aluno || !curso || !instituicao || !carga) return alert('Preencha todos os campos obrigatórios.');

    const formatarData = data => {
      if (!data) return '';
      const [ano, mes, dia] = data.split('-');
      return `${dia}/${mes}/${ano}`;
    };

    const datas = [formatarData(data1), formatarData(data2)].filter(Boolean).join(' - ');

    const certificado = document.createElement('div');
    certificado.className = 'certificado-gerado';
    certificado.className = 'certificado-gerado';
    certificado.style.backgroundImage = `url(${modeloSelecionado})`;


    certificado.innerHTML = `
      <h1 style="font-size: 56px; font-family: 'Merriweather', serif; margin-top: 50px; margin-bottom: 40px;">
        ${currentTexts.certTitle}
      </h1>
      <div style="margin-top: 50px;">
        <p style="font-size: 20px;">${currentTexts.certLine1}</p>
        <h3 style="font-size: 32px; margin: 10px 0;">${aluno}</h3>
        <p style="font-size: 18px;">${currentTexts.certLine2} <strong>${curso}</strong></p>
        <p style="font-size: 18px;">${currentTexts.certLine3} <strong>${carga} ${currentTexts.hours}</strong></p>
        <p style="font-size: 18px;">${currentTexts.certLine4}: ${datas}</p>
        <p style="font-size: 18px;"><strong>${instituicao}</strong></p>
      </div>`;

    const assinaturaDiv = document.createElement('div');
    assinaturaDiv.style.cssText = 'position: absolute; bottom: 100px; left: 0; right: 0; text-align: center;';

    if (assinaturaTexto) {
      const span = document.createElement('span');
      span.textContent = assinaturaTexto;
      span.style.fontFamily = "'Great Vibes', cursive";
      span.style.fontSize = '28px';
      assinaturaDiv.appendChild(span);
    } else {
      const img = new Image();
      img.src = canvas.toDataURL('image/png');
      img.style.height = '60px';
      assinaturaDiv.appendChild(img);
    }

    const linha = document.createElement('div');
    linha.style.cssText = 'width: 250px; margin: 10px auto 0; border-bottom: 1px solid #000;';
    assinaturaDiv.appendChild(linha);

    const responsavel = document.createElement('p');
    responsavel.textContent = currentTexts.responsavel;
    responsavel.style.fontSize = '18px';
    responsavel.style.marginTop = '5px';
    assinaturaDiv.appendChild(responsavel);

    certificado.appendChild(assinaturaDiv);

    const visualizacao = document.getElementById('certificadoVisualizacao');
    visualizacao.innerHTML = '';
    visualizacao.appendChild(certificado);
    ajustarCorTexto(certificado);
    document.getElementById('certificadoPronto').style.display = 'block';

    fetch('http://localhost:3000/api/certificados', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    aluno,
    curso,
    instituicao,
    carga,
    data1,
    data2,
    assinaturaTexto,
    modelo: modeloSelecionado,
    dataEnvio: new Date().toISOString(),
    email: emailUsuarioLogado  // ✅ Adiciona o email aqui
  })
})
.then(res => res.json())
.then(data => console.log('Certificado salvo:', data))
.catch(err => console.error('Erro ao enviar certificado:', err));

  });

  document.getElementById('btnHistoricoForm').addEventListener('click', mostrarHistorico);
  const btnVoltar = document.getElementById('btnVoltar');
  if (btnVoltar) btnVoltar.addEventListener('click', voltarFormulario);

  setLanguage('pt');
});

function gerarPdfHistorico(cert) {
  const container = document.createElement('div');
  container.style.width = '1000px';
  container.style.height = '700px';
  container.style.backgroundImage = `url(${cert.modelo})`;
  container.style.backgroundSize = 'cover';
  container.style.backgroundPosition = 'center';
  container.style.padding = '50px';
  container.style.boxSizing = 'border-box';
  container.style.fontFamily = 'serif';
  container.style.textAlign = 'center';
  container.style.position = 'relative';

  const datas = [cert.data1, cert.data2].filter(Boolean).join(' - ');

  container.innerHTML = `
    <h1 style="font-size: 56px; font-family: 'Merriweather', serif; margin-top: 50px; margin-bottom: 40px;">
      ${currentTexts.certTitle}
    </h1>
    <div style="margin-top: 50px;">
      <p style="font-size: 20px;">${currentTexts.certLine1}</p>
      <h3 style="font-size: 32px; margin: 10px 0;">${cert.aluno}</h3>
      <p style="font-size: 18px;">${currentTexts.certLine2} <strong>${cert.curso}</strong></p>
      <p style="font-size: 18px;">${currentTexts.certLine3} <strong>${cert.carga} ${currentTexts.hours}</strong></p>
      <p style="font-size: 18px;">${currentTexts.certLine4}: ${datas}</p>
      <p style="font-size: 18px;"><strong>${cert.instituicao}</strong></p>
    </div>`;

  const assinaturaDiv = document.createElement('div');
  assinaturaDiv.style.cssText = 'position: absolute; bottom: 100px; left: 0; right: 0; text-align: center;';

  if (cert.assinaturaTexto) {
    const span = document.createElement('span');
    span.textContent = cert.assinaturaTexto;
    span.style.fontFamily = "'Great Vibes', cursive";
    span.style.fontSize = '28px';
    assinaturaDiv.appendChild(span);
  }

  const linha = document.createElement('div');
  linha.style.cssText = 'width: 250px; margin: 10px auto 0; border-bottom: 1px solid #000;';
  assinaturaDiv.appendChild(linha);

  const responsavel = document.createElement('p');
  responsavel.textContent = currentTexts.responsavel;
  responsavel.style.fontSize = '18px';
  responsavel.style.marginTop = '5px';
  assinaturaDiv.appendChild(responsavel);

  container.appendChild(assinaturaDiv);

  let tempContainer = document.getElementById('pdf-temp-container');
  if (!tempContainer) {
    tempContainer = document.createElement('div');
    tempContainer.id = 'pdf-temp-container';
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '1000px';
    tempContainer.style.height = '700px';
    document.body.appendChild(tempContainer);
  }

  tempContainer.innerHTML = '';
  tempContainer.appendChild(container);

  // Espera imagem de fundo carregar antes de gerar
  const img = new Image();
  img.src = cert.modelo;
  img.onload = () => {
    setTimeout(() => {
      html2canvas(container, { scale: 3, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'pt',
          format: [1000, 700]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, 1000, 700);
        pdf.save(`certificado_${cert.aluno.replace(/\s+/g, '_')}.pdf`);
        tempContainer.innerHTML = '';
      }).catch(err => {
        console.error('Erro ao gerar PDF do histórico:', err);
        alert('Erro ao gerar PDF do histórico.');
      });
    }, 300);
  };
}

function setLanguage(lang) {
  fetch(`lang/${lang}.json`)
    .then(res => res.json())
    .then(data => {
      currentTexts = data;
      atualizarTextosNaTela(); // garante que tudo é atualizado de forma consistente
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (data[key]) el.textContent = data[key];
      });
      document.getElementById('aluno').placeholder = data.aluno;
      document.getElementById('curso').placeholder = data.curso;
      document.getElementById('instituicao').placeholder = data.instituicao;
      document.getElementById('carga').placeholder = data.carga;
      document.getElementById('assinaturaEstilizada').placeholder = data.styledSignaturePlaceholder;
      document.getElementById('limparCanvas').textContent = data.clearSignatureBtn;
      document.getElementById('assinaturaTextoBtn').textContent = data.styledSignatureBtn;
      const logoutBtnEl = document.getElementById('logoutBtn');
      if (logoutBtnEl) logoutBtnEl.textContent = currentTexts.logout;

    });
}

function atualizarTextosNaTela() {
  // Título da página
  document.title = currentTexts.title;

  // Cabeçalho principal
  const tituloEl = document.querySelector('.titulo');
  if (tituloEl) tituloEl.textContent = currentTexts.title;

  const subtituloEl = document.querySelector('.subtitulo');
  if (subtituloEl) subtituloEl.textContent = currentTexts.subtitle;

  const tituloFormEl = document.getElementById('tituloForm');
  if (tituloFormEl) tituloFormEl.textContent = currentTexts.formTitle;

  const btnHistoricoFormEl = document.getElementById('btnHistoricoForm');
  if (btnHistoricoFormEl) btnHistoricoFormEl.textContent = currentTexts.viewHistory;

  const baixarPdfEl = document.getElementById('baixarPdf');
  if (baixarPdfEl) baixarPdfEl.textContent = currentTexts.downloadBtn;

  // Labels do formulário principal
  const alunoLabelEl = document.getElementById('alunoLabel');
  if (alunoLabelEl) alunoLabelEl.textContent = currentTexts.aluno;

  const cursoLabelEl = document.getElementById('cursoLabel');
  if (cursoLabelEl) cursoLabelEl.textContent = currentTexts.curso;

  const instituicaoLabelEl = document.getElementById('instituicaoLabel');
  if (instituicaoLabelEl) instituicaoLabelEl.textContent = currentTexts.instituicao;

  const cargaLabelEl = document.getElementById('cargaLabel');
  if (cargaLabelEl) cargaLabelEl.textContent = currentTexts.carga;

  const styledSignatureLabelEl = document.getElementById('styledSignatureLabel');
  if (styledSignatureLabelEl) styledSignatureLabelEl.textContent = currentTexts.signatureLabel;

  // Botões e inputs da assinatura
  const limparCanvasEl = document.getElementById('limparCanvas');
  if (limparCanvasEl) limparCanvasEl.textContent = currentTexts.clearSignatureBtn;

  const assinaturaTextoBtnEl = document.getElementById('assinaturaTextoBtn');
  if (assinaturaTextoBtnEl) assinaturaTextoBtnEl.textContent = currentTexts.styledSignatureBtn;

  const assinaturaEstilizadaEl = document.getElementById('assinaturaEstilizada');
  if (assinaturaEstilizadaEl) assinaturaEstilizadaEl.placeholder = currentTexts.styledSignaturePlaceholder;

// Login
const loginEmailEl = document.getElementById('loginEmail');
if (loginEmailEl) loginEmailEl.placeholder = currentTexts.login.emailPlaceholder;

const loginPassEl = document.getElementById('loginPass');
if (loginPassEl) loginPassEl.placeholder = currentTexts.login.passwordPlaceholder;

const loginBtnEl = document.getElementById('loginBtn');
if (loginBtnEl) loginBtnEl.textContent = currentTexts.login.button;

const showRegisterBtnEl = document.getElementById('showRegisterBtn');
if (showRegisterBtnEl) showRegisterBtnEl.textContent = currentTexts.login.registerLink;

const continueWithoutLoginBtnEl = document.getElementById('continueWithoutLoginBtn');
if (continueWithoutLoginBtnEl) continueWithoutLoginBtnEl.textContent = currentTexts.login.continueWithoutLogin;

const logoutBtnEl = document.getElementById('logoutBtn');
if (logoutBtnEl) logoutBtnEl.textContent = currentTexts.logout;

  // Cadastro
  const registerTituloEl = document.getElementById('registerTitulo');
  if (registerTituloEl) registerTituloEl.textContent = currentTexts.register.title;

  const registerEmailEl = document.getElementById('registerEmail');
  if (registerEmailEl) registerEmailEl.placeholder = currentTexts.register.emailPlaceholder;

  const registerPassEl = document.getElementById('registerPass');
  if (registerPassEl) registerPassEl.placeholder = currentTexts.register.passwordPlaceholder;

  const registerBtnEl = document.getElementById('registerBtn');
  if (registerBtnEl) registerBtnEl.textContent = currentTexts.register.button;

  const alreadyHaveAccountTextEl = document.getElementById('alreadyHaveAccountText');
  if (alreadyHaveAccountTextEl) alreadyHaveAccountTextEl.textContent = currentTexts.register.alreadyHaveAccount;

  const showLoginBtnEl = document.getElementById('showLoginBtn');
  if (showLoginBtnEl) showLoginBtnEl.textContent = currentTexts.register.loginLink;
}

function ajustarCorTexto(certificado) {
  const canvas = document.createElement('canvas');
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = modeloSelecionado;
  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const pixelData = ctx.getImageData(img.width / 2, img.height / 2, 1, 1).data;
    const luminancia = getLuminance(pixelData[0], pixelData[1], pixelData[2]);
    certificado.style.color = luminancia > 0.5 ? '#000000' : '#ffffff';
  };
}

function getLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function voltarFormulario() {
  document.getElementById('historicoCertificados').style.display = 'none';
  document.querySelector('.formulario').style.display = 'block';
}

function mostrarHistorico() {
  document.querySelector('.formulario').style.display = 'none';
  document.getElementById('certificadoPronto').style.display = 'none';
  document.getElementById('historicoCertificados').style.display = 'block';

  const lista = document.getElementById('listaHistorico');
  lista.innerHTML = '';

  const user = firebase.auth().currentUser;
  const email = user ? user.email : null;

  if (!email) {
    lista.innerHTML = '<p>Usuário não autenticado.</p>';
    return;
  }

  fetch(`https://certificados-production.up.railway.app/api/certificados?email=${encodeURIComponent(email)}`)
    .then(res => res.json())
    .then(certificados => {
      if (!certificados.length) {
        lista.innerHTML = `<p>${currentTexts.nenhumCertificado}</p>`;
        return;
      }

      certificados.reverse().forEach((cert, index) => {
        const item = document.createElement('div');
        item.className = 'historico-item';
        item.style.border = '1px solid #ccc';
        item.style.padding = '10px';
        item.style.marginBottom = '10px';

        item.innerHTML = `
          <p><strong>${currentTexts.alunoLabel}:</strong> ${cert.aluno}</p>
          <p><strong>${currentTexts.cursoLabel}:</strong> ${cert.curso}</p>
          <p><strong>${currentTexts.instituicaoLabel}:</strong> ${cert.instituicao}</p>
          <p><strong>${currentTexts.cargaLabel}:</strong> ${cert.carga}</p>
          <p><strong>${currentTexts.periodoLabel}:</strong> ${cert.data1}${cert.data2 ? ' - ' + cert.data2 : ''}</p>
          <p><strong>${currentTexts.dataEnvioLabel}:</strong> ${new Date(cert.dataEnvio).toLocaleString()}</p>
          <button type="button" class="baixarPdfHistoricoBtn" data-index="${index}">${currentTexts.downloadBtn}</button>
        `;

        lista.appendChild(item);
      });

      // Botões de PDF
      document.querySelectorAll('.baixarPdfHistoricoBtn').forEach(button => {
        button.addEventListener('click', e => {
          const idx = e.target.getAttribute('data-index');
          gerarPdfHistorico(certificados[certificados.length - 1 - idx]);
        });
      });
    })
    .catch(err => console.error('Erro ao carregar histórico:', err));
}

