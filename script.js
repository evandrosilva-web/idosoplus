// --- LÓGICA DA APLICAÇÃO ---

function definirPaciente() {
  const nome = prompt("Digite o nome do paciente:");
  if (nome && nome.trim() !== "") {
    document.getElementById("nome-paciente").textContent = nome.trim();
    localStorage.setItem("nome-paciente", nome.trim());
  }
}

let dados = {
  sinaisVitais: [],
  medicamentos: [],
  consultas: [],
  preenchimentoSaude: [],
};

let historioChat = [];

// --- FUNÇÕES DE RENDERIZAÇÃO ---

function renderizarSinaisVitais() {
  const listaEl = document.getElementById("lista-sinais-vitais");
  listaEl.innerHTML = "";
  
  if (dados.sinaisVitais.length === 0) {
    listaEl.innerHTML = `<p class="text-gray-500 text-center p-4">Nenhum registro encontrado.</p>`;
    return;
  }
  
  const dadosOrdenados = [...dados.sinaisVitais].sort((a, b) => {
    return new Date(b.data) - new Date(a.data);
  });

  dadosOrdenados.forEach((item) => {
    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(item.data));
    
    const itemEl = document.createElement("div");
    itemEl.className = "bg-gray-100 p-3 rounded-lg flex justify-between items-center";
    itemEl.innerHTML = `
      <div>
        <p class="font-semibold">PA: ${item.pressao} | FC: ${item.cardiaco}bpm | SpO₂: ${item.oxigenacao}%</p>
        <p class="text-sm text-gray-500">${dataFormatada}</p>
      </div>
      <button onclick="removerItem('sinaisVitais', ${item.id})" class="text-gray-400 hover:text-red-500 transition">
        <i data-lucide="trash-2" class="w-5 h-5"></i>
      </button>
    `;
    listaEl.appendChild(itemEl);
  });
  
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function renderizarMedicamentos() {
  const listaEl = document.getElementById("lista-medicamentos");
  listaEl.innerHTML = "";
  
  if (dados.medicamentos.length === 0) {
    listaEl.innerHTML = `<p class="text-gray-500 text-center p-4">Nenhum lembrete encontrado.</p>`;
    return;
  }
  
  const dadosOrdenados = [...dados.medicamentos].sort((a, b) =>
    a.hora.localeCompare(b.hora)
  );

  dadosOrdenados.forEach((item) => {
    const itemEl = document.createElement("div");
    itemEl.className = "bg-gray-100 p-3 rounded-lg flex justify-between items-center";
    itemEl.innerHTML = `
      <div>
        <p class="font-semibold">${item.nome} (${item.dosagem})</p>
        <p class="text-sm text-gray-500">Horário: ${item.hora}</p>
      </div>
      <button onclick="removerItem('medicamentos', ${item.id})" class="text-gray-400 hover:text-red-500 transition">
        <i data-lucide="trash-2" class="w-5 h-5"></i>
      </button>
    `;
    listaEl.appendChild(itemEl);
  });
  
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function renderizarConsultas() {
  const listaEl = document.getElementById("lista-consultas");
  listaEl.innerHTML = "";
  
  if (dados.consultas.length === 0) {
    listaEl.innerHTML = `<p class="text-gray-500 text-center p-4">Nenhuma consulta agendada.</p>`;
    return;
  }
  
  const dadosOrdenados = [...dados.consultas].sort((a, b) => {
    const dataA = new Date(`${a.data}T${a.hora}`);
    const dataB = new Date(`${b.data}T${b.hora}`);
    return dataA - dataB;
  });

  dadosOrdenados.forEach((item) => {
    const dataFormatada = new Intl.DateTimeFormat("pt-BR").format(
      new Date(`${item.data}T00:00:00`)
    );
    
    const itemEl = document.createElement("div");
    itemEl.className = "bg-gray-100 p-3 rounded-lg flex justify-between items-center";
    itemEl.innerHTML = `
      <div>
        <p class="font-semibold">${item.especialidade}</p>
        <p class="text-sm text-gray-500">Data: ${dataFormatada} às ${item.hora}</p>
      </div>
      <button onclick="removerItem('consultas', ${item.id})" class="text-gray-400 hover:text-red-500 transition">
        <i data-lucide="trash-2" class="w-5 h-5"></i>
      </button>
    `;
    listaEl.appendChild(itemEl);
  });
  
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function renderizarPreenchimentoSaude() {
  const listaEl = document.getElementById("lista-preenchimento-saude");
  listaEl.innerHTML = "";
  
  if (dados.preenchimentoSaude.length === 0) {
    listaEl.innerHTML = `<p class="text-gray-500 text-center p-4">Nenhum preenchimento encontrado.</p>`;
    return;
  }
  
  const dadosOrdenados = [...dados.preenchimentoSaude].sort((a, b) => {
    return new Date(b.data) - new Date(a.data);
  });

  dadosOrdenados.forEach((item) => {
    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(item.data));

    const traducoes = {
      "muito-bem": "Muito bem",
      "bem": "Bem",
      "neutro": "Neutro",
      "mal": "Mal",
      "muito-mal": "Muito mal",
      "nao": "Não",
      "leve": "Leve",
      "moderada": "Moderada",
      "severa": "Severa",
      "pouca": "Pouca",
      "muita": "Muita"
    };
    
    const itemEl = document.createElement("div");
    itemEl.className = "bg-orange-50 border border-orange-200 p-3 rounded-lg flex flex-col gap-2";
    itemEl.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex-grow">
          <p class="text-sm font-semibold text-orange-700">Saúde Geral: ${traducoes[item.sensacaoGeral] || item.sensacaoGeral}</p>
          <p class="text-sm font-semibold text-orange-700">Tonturas: ${traducoes[item.tonturas] || item.tonturas}</p>
          <p class="text-sm font-semibold text-orange-700">Sono: ${traducoes[item.sono] || item.sono}</p>
          <p class="text-sm font-bold text-red-600">Dor: ${item.dor}/10</p>
          ${item.observacoes ? `<p class="text-sm text-gray-600 mt-1"><strong>Obs:</strong> ${escapeHtml(item.observacoes)}</p>` : ''}
          <p class="text-xs text-gray-500 mt-2">${dataFormatada}</p>
        </div>
        <button onclick="removerItem('preenchimentoSaude', ${item.id})" class="text-gray-400 hover:text-red-500 transition ml-2">
          <i data-lucide="trash-2" class="w-5 h-5"></i>
        </button>
      </div>
    `;
    listaEl.appendChild(itemEl);
  });
  
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function adicionarMensagemChat(texto, tipo) {
  const chatContainer = document.getElementById("chat-container");

  if (historioChat.length === 0 && chatContainer.querySelector(".text-center")) {
    chatContainer.innerHTML = "";
  }

  const mensagemEl = document.createElement("div");
  mensagemEl.className =
    tipo === "usuario"
      ? "bg-indigo-100 p-3 rounded-lg text-right"
      : "bg-gray-100 p-3 rounded-lg text-left";

  mensagemEl.innerHTML = `<p class="text-sm" style="white-space: pre-wrap;">${escapeHtml(texto)}</p>`;
  chatContainer.appendChild(mensagemEl);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  historioChat.push({ tipo, texto });
  return mensagemEl;
}

function mostrarDigitando() {
  const chatContainer = document.getElementById("chat-container");
  const el = document.createElement("div");
  el.id = "chat-digitando";
  el.className = "bg-gray-100 p-3 rounded-lg text-left text-sm text-gray-400 italic";
  el.textContent = "Assistente está digitando...";
  chatContainer.appendChild(el);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removerDigitando() {
  const el = document.getElementById("chat-digitando");
  if (el) el.remove();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Mapa de opções numeradas do assistente IA
const opcoesMenuIA = {
  "1": "Qual é o resumo geral da minha saúde?",
  "2": "Como eu estou me sentindo hoje?",
  "3": "Quais são os meus medicamentos?",
  "4": "Como está minha pressão, frequência cardíaca e oxigenação?",
  "5": "Como está minha dor?",
  "6": "Quais são minhas próximas consultas?",
};

async function obterRespostaIA(pergunta) {
  // Verifica se o usuário digitou um número correspondente a uma opção do menu
  const entrada = pergunta.trim();
  const perguntaFinal = opcoesMenuIA[entrada] || pergunta;

  try {
    // Envia ao backend Gemini com histórico da conversa
    const resposta = await iaMedica.perguntarGemini(perguntaFinal, historioChat);
    return resposta;
  } catch (erro) {
    console.error("Erro ao contatar backend:", erro.message);

    if (erro.message.includes("Failed to fetch") || erro.message.includes("NetworkError") || erro.message.includes("Load failed")) {
      return "⏳ O servidor está acordando (pode levar até 1 minuto na primeira vez).\n\nAguarde alguns segundos e tente novamente!";
    }

    return `⚠️ Erro ao obter resposta: ${erro.message}`;
  }
}

// --- FUNÇÕES DE PERSISTÊNCIA ---

function carregarDados() {
  const dadosSalvos = localStorage.getItem("dados-paciente");
  if (dadosSalvos) {
    try {
      dados = JSON.parse(dadosSalvos);
      if (!dados.preenchimentoSaude) {
        dados.preenchimentoSaude = [];
      }
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
      dados = { sinaisVitais: [], medicamentos: [], consultas: [], preenchimentoSaude: [] };
    }
  }
}

function salvarDados() {
  localStorage.setItem("dados-paciente", JSON.stringify(dados));
  // Sincronizar a IA sempre que dados são salvos
  if (typeof iaMedica !== "undefined") {
    iaMedica.sincronizarComCards();
  }
}

function removerItem(tipo, id) {
  dados[tipo] = dados[tipo].filter((item) => item.id !== id);
  salvarDados();
  
  if (tipo === "sinaisVitais") renderizarSinaisVitais();
  if (tipo === "medicamentos") renderizarMedicamentos();
  if (tipo === "consultas") renderizarConsultas();
  if (tipo === "preenchimentoSaude") renderizarPreenchimentoSaude();
}

// --- LÓGICA DO MODAL DE ALERTA ---

const modalAlerta = document.getElementById("modal-alerta");

function mostrarModalAlerta() {
  modalAlerta.classList.remove("hidden");
  setTimeout(() => {
    modalAlerta.querySelector("div").classList.remove("scale-95");
  }, 50);
}

function fecharModalAlerta() {
  modalAlerta.querySelector("div").classList.add("scale-95");
  setTimeout(() => {
    modalAlerta.classList.add("hidden");
  }, 200);
}

// --- INICIALIZAÇÃO ---

carregarDados();

document.addEventListener("DOMContentLoaded", () => {
  console.log("Aplicação iniciada");

  const nomeSalvo = localStorage.getItem("nome-paciente");
  if (nomeSalvo) {
    document.getElementById("nome-paciente").textContent = nomeSalvo;
  }
  
  renderizarSinaisVitais();
  renderizarMedicamentos();
  renderizarConsultas();
  renderizarPreenchimentoSaude();

  // Sinais Vitais
  const formSinaisVitais = document.getElementById("form-sinais-vitais");
  if (formSinaisVitais) {
    formSinaisVitais.addEventListener("submit", function (e) {
      e.preventDefault();
      const novoItem = {
        id: Date.now(),
        pressao: document.getElementById("pressao").value,
        cardiaco: document.getElementById("cardiaco").value,
        oxigenacao: document.getElementById("oxigenacao").value,
        data: new Date().toISOString(),
      };
      dados.sinaisVitais.push(novoItem);
      salvarDados();
      renderizarSinaisVitais();
      this.reset();
    });
  }

  // Medicamentos
  const formMedicamentos = document.getElementById("form-medicamentos");
  if (formMedicamentos) {
    formMedicamentos.addEventListener("submit", function (e) {
      e.preventDefault();
      const novoItem = {
        id: Date.now(),
        nome: document.getElementById("nome-medicamento").value,
        dosagem: document.getElementById("dosagem-medicamento").value,
        hora: document.getElementById("hora-medicamento").value,
      };
      dados.medicamentos.push(novoItem);
      salvarDados();
      renderizarMedicamentos();
      this.reset();
    });
  }

  // Consultas
  const formConsultas = document.getElementById("form-consultas");
  if (formConsultas) {
    formConsultas.addEventListener("submit", function (e) {
      e.preventDefault();
      const novoItem = {
        id: Date.now(),
        especialidade: document.getElementById("especialidade-consulta").value,
        data: document.getElementById("data-consulta").value,
        hora: document.getElementById("hora-consulta").value,
      };
      dados.consultas.push(novoItem);
      salvarDados();
      renderizarConsultas();
      this.reset();
    });
  }

  // Preenchimento de Saúde
  const formPreenchimentoSaude = document.getElementById("form-preenchimento-saude");
  if (formPreenchimentoSaude) {
    formPreenchimentoSaude.addEventListener("submit", function (e) {
      e.preventDefault();
      
      const novoItem = {
        id: Date.now(),
        sensacaoGeral: document.getElementById("sensacao-geral").value,
        tonturas: document.getElementById("tonturas").value,
        sono: document.getElementById("sono").value,
        dor: document.getElementById("escala-dor").value,
        observacoes: document.getElementById("observacoes-saude").value,
        data: new Date().toISOString(),
      };
      
      dados.preenchimentoSaude.push(novoItem);
      salvarDados();
      renderizarPreenchimentoSaude();
      
      this.reset();
      document.getElementById("escala-dor").value = 0;
      document.getElementById("valor-dor").textContent = "0";
    });
  }

  // Chat com IA
  const formChat = document.getElementById("form-chat");
  if (formChat) {
    formChat.addEventListener("submit", async function (e) {
      e.preventDefault();
      const chatInput = document.getElementById("chat-input");
      const btnEnviar = formChat.querySelector("button[type='submit']");
      const mensagem = chatInput.value.trim();

      if (mensagem) {
        adicionarMensagemChat(mensagem, "usuario");
        chatInput.value = "";

        // Desabilita input enquanto aguarda resposta
        chatInput.disabled = true;
        btnEnviar.disabled = true;
        mostrarDigitando();

        try {
          const resposta = await obterRespostaIA(mensagem);
          removerDigitando();
          adicionarMensagemChat(resposta, "ia");
        } catch (err) {
          removerDigitando();
          adicionarMensagemChat("⚠️ Erro inesperado. Tente novamente.", "ia");
        } finally {
          chatInput.disabled = false;
          btnEnviar.disabled = false;
          chatInput.focus();
        }
      }
    });
  }

  // Escala de dor
  const escalaDorliderElement = document.getElementById("escala-dor");
  const valorDorElement = document.getElementById("valor-dor");
  
  if (escalaDorliderElement && valorDorElement) {
    escalaDorliderElement.addEventListener("input", function () {
      valorDorElement.textContent = this.value;
    });
  }

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});
