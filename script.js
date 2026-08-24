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
