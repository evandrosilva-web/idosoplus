// --- LÓGICA DA APLICAÇÃO ---

function definirPaciente() {
  const nome = prompt("Digite o nome do paciente:");
  if (nome && nome.trim() !== "") {
    document.getElementById("nome-paciente").textContent = nome.trim();
    // Opcional: salvar no localStorage para manter após recarregar
    localStorage.setItem("nome-paciente", nome.trim());
  }
}

// Ao carregar a página, recupere o nome salvo (se houver)
document.addEventListener("DOMContentLoaded", () => {
  // ...existing code...
  const nomeSalvo = localStorage.getItem("nome-paciente");
  if (nomeSalvo) {
    document.getElementById("nome-paciente").textContent = nomeSalvo;
  }
});

// Dados iniciais (poderiam vir de um banco de dados no futuro)
let dados = {
  sinaisVitais: [
    {
      id: 1,
      pressao: "12/8",
      cardiaco: "75",
      oxigenacao: "98",
      data: new Date(),
    },
  ],
  medicamentos: [
    { id: 1, nome: "Losartana", dosagem: "50mg", hora: "08:00" },
    { id: 2, nome: "Vitamina D", dosagem: "1000 UI", hora: "12:00" },
  ],
  consultas: [
    {
      id: 1,
      especialidade: "Cardiologista",
      data: "2025-10-15",
      hora: "10:30",
    },
  ],
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
  const dadosOrdenados = [...dados.sinaisVitais].sort(
    (a, b) => b.data - a.data
  );

  dadosOrdenados.forEach((item) => {
    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(item.data);
    const itemEl = document.createElement("div");
    itemEl.className =
      "bg-gray-100 p-3 rounded-lg flex justify-between items-center";
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
  lucide.createIcons();
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
    itemEl.className =
      "bg-gray-100 p-3 rounded-lg flex justify-between items-center";
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
  lucide.createIcons();
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
    itemEl.className =
      "bg-gray-100 p-3 rounded-lg flex justify-between items-center";
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
  lucide.createIcons();
}

// --- LÓGICA DE EVENTOS ---

// Adicionar Sinais Vitais
document
  .getElementById("form-sinais-vitais")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const novoItem = {
      id: Date.now(), // ID único baseado no timestamp
      pressao: document.getElementById("pressao").value,
      cardiaco: document.getElementById("cardiaco").value,
      oxigenacao: document.getElementById("oxigenacao").value,
      data: new Date(),
    };
    dados.sinaisVitais.push(novoItem);
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
    renderizarConsultas();
    e.target.reset();
  });

// Remover item genérico
function removerItem(tipo, id) {
  dados[tipo] = dados[tipo].filter((item) => item.id !== id);
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
  setTimeout(
    () => modalAlerta.querySelector("div").classList.remove("scale-95"),
    50
  );
}

function fecharModalAlerta() {
  modalAlerta.querySelector("div").classList.add("scale-95");
  setTimeout(() => modalAlerta.classList.add("hidden"), 200);
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---

// Renderiza tudo quando a página carrega
document.addEventListener("DOMContentLoaded", () => {
  renderizarSinaisVitais();
  renderizarMedicamentos();
  renderizarConsultas();
  lucide.createIcons();
});
