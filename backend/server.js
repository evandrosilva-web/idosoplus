// --- BACKEND SEGURO - IDOSO+ COM GEMINI API ---
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3001;

// --- MIDDLEWARES ---
const origensPermitidas = [
  "https://evandrosilva-web.github.io", // GitHub Pages (produção)
  "http://localhost:5500",              // Live Server (desenvolvimento)
  "http://127.0.0.1:5500",             // Live Server alternativo
  "http://localhost:3000",             // Outros servidores locais
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (ex: testes locais abrindo o HTML direto)
    if (!origin) return callback(null, true);
    if (origensPermitidas.includes(origin)) return callback(null, true);
    callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
  },
}));
app.use(express.json());

// --- INICIALIZAR GEMINI ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
  systemInstruction: `Você é um assistente de saúde virtual especializado no cuidado de idosos, 
integrado ao aplicativo Idoso+. Seu papel é:
- Analisar os dados de saúde do paciente (sinais vitais, medicamentos, consultas, bem-estar)
- Responder perguntas de forma clara, simples e acolhedora, adequada para idosos
- Alertar sobre situações que exijam atenção médica urgente
- Nunca substituir a consulta médica presencial
- Usar linguagem acessível, sem termos técnicos complexos
- Sempre incluir um lembrete de que dúvidas sérias devem ser levadas ao médico
- Responder SEMPRE em português do Brasil`,
});

// --- ENDPOINT DE SAÚDE DO SERVIDOR ---
app.get("/api/status", (req, res) => {
  res.json({ status: "online", message: "Backend Idoso+ funcionando!" });
});

// --- ENDPOINT PRINCIPAL DO CHAT ---
app.post("/api/chat", async (req, res) => {
  try {
    const { pergunta, dadosMedicos, historico } = req.body;

    if (!pergunta || typeof pergunta !== "string") {
      return res.status(400).json({ erro: "Pergunta inválida ou não informada." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        erro: "Chave da API não configurada. Verifique o arquivo .env no backend.",
      });
    }

    // Monta o contexto de saúde do paciente para enriquecer a resposta
    const contextoPaciente = montarContextoPaciente(dadosMedicos);

    // Monta histórico de conversa para o Gemini
    const historicoGemini = (historico || []).map((msg) => ({
      role: msg.tipo === "usuario" ? "user" : "model",
      parts: [{ text: msg.texto }],
    }));

    // Inicia chat com histórico
    const chat = model.startChat({ history: historicoGemini });

    // Envia pergunta com contexto de saúde embutido
    const mensagemCompleta = contextoPaciente
      ? `CONTEXTO DE SAÚDE DO PACIENTE:\n${contextoPaciente}\n\nPERGUNTA DO PACIENTE: ${pergunta}`
      : pergunta;

    const resultado = await chat.sendMessage(mensagemCompleta);
    const resposta = resultado.response.text();

    console.log("✅ Resposta Gemini gerada com sucesso.");
    res.json({ resposta });
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error.message);
    console.error("Stack:", error.stack);

    // Erros específicos da API Gemini
    if (error.message?.includes("API_KEY_INVALID")) {
      return res.status(401).json({ erro: "Chave da API inválida. Verifique seu arquivo .env." });
    }
    if (error.message?.includes("QUOTA_EXCEEDED")) {
      return res.status(429).json({ erro: "Limite de uso da API atingido. Tente novamente mais tarde." });
    }

    res.status(500).json({ erro: "Erro interno ao processar sua pergunta. Tente novamente." });
  }
});

// --- FUNÇÃO AUXILIAR: Monta contexto de saúde legível para o Gemini ---
function montarContextoPaciente(dadosMedicos) {
  if (!dadosMedicos) return null;

  const linhas = [];

  if (dadosMedicos.paciente) {
    linhas.push(`Paciente: ${dadosMedicos.paciente}`);
  }

  // Sinais vitais mais recentes
  if (dadosMedicos.sinaisVitais && dadosMedicos.sinaisVitais.length > 0) {
    const ultimo = dadosMedicos.sinaisVitais[dadosMedicos.sinaisVitais.length - 1];
    linhas.push(`Últimos sinais vitais:`);
    linhas.push(`  - Pressão arterial: ${ultimo.pressao} mmHg`);
    linhas.push(`  - Frequência cardíaca: ${ultimo.cardiaco} bpm`);
    linhas.push(`  - Oxigenação (SpO₂): ${ultimo.oxigenacao}%`);
  }

  // Último preenchimento de saúde
  if (dadosMedicos.ultimoPreenchimento) {
    const prev = dadosMedicos.ultimoPreenchimento;
    const traducoes = {
      "muito-bem": "Muito bem", "bem": "Bem", "neutro": "Neutro",
      "mal": "Mal", "muito-mal": "Muito mal", "nao": "Não",
      "leve": "Leve", "moderada": "Moderada", "severa": "Severa",
      "pouca": "Pouca", "muita": "Muita",
    };
    linhas.push(`Estado de saúde relatado:`);
    linhas.push(`  - Sensação geral: ${traducoes[prev.sensacaoGeral] || prev.sensacaoGeral}`);
    linhas.push(`  - Tonturas: ${traducoes[prev.tonturas] || prev.tonturas}`);
    linhas.push(`  - Dificuldade para dormir: ${traducoes[prev.sono] || prev.sono}`);
    linhas.push(`  - Nível de dor: ${prev.dor}/10`);
    if (prev.observacoes) {
      linhas.push(`  - Observações: ${prev.observacoes}`);
    }
  }

  // Medicamentos
  if (dadosMedicos.medicamentos && dadosMedicos.medicamentos.length > 0) {
    linhas.push(`Medicamentos em uso:`);
    dadosMedicos.medicamentos.forEach((med) => {
      linhas.push(`  - ${med.nome} (${med.dosagem}) às ${med.hora}`);
    });
  }

  // Próximas consultas
  if (dadosMedicos.consultas && dadosMedicos.consultas.length > 0) {
    const proximas = dadosMedicos.consultas
      .filter((c) => new Date(`${c.data}T${c.hora}`) > new Date())
      .sort((a, b) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`))
      .slice(0, 3);

    if (proximas.length > 0) {
      linhas.push(`Próximas consultas:`);
      proximas.forEach((c) => {
        const data = new Date(`${c.data}T00:00:00`).toLocaleDateString("pt-BR");
        linhas.push(`  - ${c.especialidade} em ${data} às ${c.hora}`);
      });
    }
  }

  return linhas.length > 0 ? linhas.join("\n") : null;
}

// --- INICIAR SERVIDOR ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor Idoso+ rodando na porta ${PORT}`);
  console.log(`📋 Status: http://localhost:${PORT}/api/status`);
});
