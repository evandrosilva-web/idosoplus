// --- LÓGICA DA APLICAÇÃO ---

function definirPaciente() {
  const nome = prompt("Digite o nome do paciente:");
  if (nome && nome.trim() !== "") {
    document.getElementById("nome-paciente").textContent = nome.trim();
    // Salvar no localStorage para manter após recarregar
    localStorage.setItem("nome-paciente", nome.trim());
  }
}

// Dados iniciais com persistência em localStorage
let dados = {
  sinaisVitais: [],
  medicamentos: [],
  consultas: [],
};

// Histórico de chat
let historioChat = [];

// --- FUNÇÕES DE RENDERIZAÇÃO ---

// Renderiza a lista de sinais vitais
function renderizarSinaisVitais() {
  const listaEl = document.getElementById("lista-sinais-vitais");
  listaEl.innerHTML = ""; // Limpa a lista antes de renderizar
  
  if (dados.sinaisVitais.length === 0) {
    listaEl.innerHTML = `<p class="text-gray-500 text-center p-4">Nenhum registro encontrado.</p>`;
    return;
  }
  
  // Ordena do mais recente para o mais antigo
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
  
  // Recarregar ícones após modificar o DOM
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// Renderiza a lista de medicamentos
function renderizarMedicamentos() {
  const listaEl = document.getElementById("lista-medicamentos");
  listaEl.innerHTML = "";
  
  if (dados.medicamentos.length === 0) {
    listaEl.innerHTML = `<p class="text-gray-500 text-center p-4">Nenhum lembrete encontrado.</p>`;
    return;
  }
  
  // Ordena por hora
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
  
  // Recarregar ícones após modificar o DOM
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// Renderiza a lista de consultas
function renderizarConsultas() {
  const listaEl = document.getElementById("lista-consultas");
  listaEl.innerHTML = "";
  
  if (dados.consultas.length === 0) {
    listaEl.innerHTML = `<p class="text-gray-500 text-center p-4">Nenhuma consulta agendada.</p>`;
    return;
  }
  
  // Ordena por data e hora
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
  
  // Recarregar ícones após modificar o DOM
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// Adiciona mensagem ao chat
function adicionarMensagemChat(texto, tipo) {
  const chatContainer = document.getElementById("chat-container");
  
  // Remove mensagem de boas-vindas se for a primeira mensagem
  if (historioChat.length === 0 && chatContainer.querySelector(".text-center")) {
    chatContainer.innerHTML = "";
  }
  
  const mensagemEl = document.createElement("div");
  mensagemEl.className = tipo === "usuario" 
    ? "bg-indigo-100 p-3 rounded-lg text-right"
    : "bg-gray-100 p-3 rounded-lg text-left";
  
  mensagemEl.innerHTML = `<p class="text-sm">${escapeHtml(texto)}</p>`;
  chatContainer.appendChild(mensagemEl);
  
  // Scroll para a última mensagem
  chatContainer.scrollTop = chatContainer.scrollHeight;
  
  historioChat.push({ tipo, texto });
}

// Função para escapar HTML e prevenir XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Respostas simuladas da IA sobre saúde
function obterRespostaIA(pergunta) {
  const perguntas = {
    pressão: "A pressão arterial normal é aproximadamente 120/80 mmHg. Se seus valores estão consistentemente altos, consulte um médico.",
    medicamento: "Sempre tome seus medicamentos nos horários prescritos. Se esqueceu uma dose, não duplique na próxima vez.",
    oxigenação: "A saturação de oxigênio normal está entre 95-100%. Valores abaixo de 95% podem indicar problemas respiratórios.",
    cardíaco: "A frequência cardíaca em repouso normal é entre 60-100 bpm. Aumentos significativos podem indicar atividade ou estresse.",
    saúde: "Cuide de sua saúde mantendo uma dieta equilibrada, praticando exercícios regularmente e dormindo bem.",
    ajuda: "Posso ajudá-lo com perguntas sobre seus sinais vitais, medicamentos, consultas e saúde geral.",
  };
  
  const perguntaLower = pergunta.toLowerCase();
  
  for (let chave in perguntas) {
    if (perguntaLower.includes(chave)) {
      return perguntas[chave];
    }
  }
  
  return "Desculpe, não entendi sua pergunta. Pergunte-me sobre pressão, frequência cardíaca, oxigenação, medicamentos, consultas ou saúde em geral.";
}

// --- FUNÇÕES DE PERSISTÊNCIA (localStorage) ---

function carregarDados() {
  const dadosSalvos = localStorage.getItem("dados-paciente");
  if (dadosSalvos) {
    try {
      dados = JSON.parse(dadosSalvos);
    } catch (e) {
      console.error("Erro ao carregar dados do localStorage:", e);
      dados = { sinaisVitais: [], medicamentos: [], consultas: [] };
    }
  }
}

function salvarDados() {
  localStorage.setItem("dados-paciente", JSON.stringify(dados));
}

// --- LÓGICA DE EVENTOS ---

// Adicionar Sinais Vitais
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("form-sinais-vitais")
    .addEventListener("submit", function (e) {
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
      e.target.reset();
    });

  // Adicionar Medicamento
  document
    .getElementById("form-medicamentos")
    .addEventListener("submit", function (e) {
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
      e.target.reset();
    });

  // Adicionar Consulta
  document
    .getElementById("form-consultas")
    .addEventListener("submit", function (e) {
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
      e.target.reset();
    });

  // Chat com IA
  document
    .getElementById("form-chat")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const chatInput = document.getElementById("chat-input");
      const mensagem = chatInput.value.trim();
      
      if (mensagem) {
        // Adiciona mensagem do usuário
        adicionarMensagemChat(mensagem, "usuario");
        
        // Simula delay da resposta da IA
        setTimeout(() => {
          const resposta = obterRespostaIA(mensagem);
          adicionarMensagemChat(resposta, "ia");
        }, 500);
        
        chatInput.value = "";
      }
    });
});

// Remover item genérico
function removerItem(tipo, id) {
  dados[tipo] = dados[tipo].filter((item) => item.id !== id);
  salvarDados();
  
  // Re-renderiza a lista específica
  if (tipo === "sinaisVitais") renderizarSinaisVitais();
  if (tipo === "medicamentos") renderizarMedicamentos();
  if (tipo === "consultas") renderizarConsultas();
}

// --- LÓGICA DO MODAL DE ALERTA ---

const modalAlerta = document.getElementById("modal-alerta");

function mostrarModalAlerta() {
  modalAlerta.classList.remove("hidden");
  // Para a animação de "zoom"
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

// --- INICIALIZAÇÃO DA APLICAÇÃO ---

// Carrega dados salvos antes de renderizar
carregarDados();

// Renderiza tudo quando a página carrega
document.addEventListener("DOMContentLoaded", () => {
  // Carregar nome do paciente salvo
  const nomeSalvo = localStorage.getItem("nome-paciente");
  if (nomeSalvo) {
    document.getElementById("nome-paciente").textContent = nomeSalvo;
  }
  
  // Renderizar todas as listas
  renderizarSinaisVitais();
  renderizarMedicamentos();
  renderizarConsultas();
  
  // Inicializar ícones Lucide
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});
