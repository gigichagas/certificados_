let modeloSelecionado = null;
let currentTexts = {};

document.addEventListener('DOMContentLoaded', () => {
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
  document.getElementById('btnLangPt').addEventListener('click', () => setLanguage('pt'));
  document.getElementById('btnLangEn').addEventListener('click', () => setLanguage('en'));

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
    certificado.style.cssText = `
      width: 1000px; height: 700px; background-image: url(${modeloSelecionado});
      background-size: cover; background-position: center; margin: 0 auto; padding: 50px;
      box-sizing: border-box; position: relative; font-family: serif; text-align: center;
    `;

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
      body: JSON.stringify({ aluno, curso, instituicao, carga, data1, data2, assinaturaTexto, modelo: modeloSelecionado, dataEnvio: new Date().toISOString() })
    }).catch(err => console.error('Erro ao enviar certificado:', err));
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
  fetch(`/lang/${lang}.json`)
    .then(res => res.json())
    .then(data => {
      currentTexts = data;
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
    });
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

  fetch('http://localhost:3000/api/certificados')
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

      document.querySelectorAll('.baixarPdfHistoricoBtn').forEach(button => {
        button.addEventListener('click', e => {
          const idx = e.target.getAttribute('data-index');
          fetch('http://localhost:3000/api/certificados')
            .then(res => res.json())
            .then(certificadosAtualizados => {
              gerarPdfHistorico(certificadosAtualizados[certificadosAtualizados.length - 1 - idx]);
            });
        });
      });
    });
}
