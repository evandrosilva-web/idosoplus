// --- IA MÉDICA COM INTEGRAÇÃO GEMINI API (BACKEND SEGURO) ---

// URL do backend: usa Render em produção, localhost em desenvolvimento
const BACKEND_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:3001"
  : "https://idosoplus-backend.onrender.com";

class AssistenteIAMedica {
  constructor() {
    this.historico = [];
    this.avisos = [];
    this.analiseAtiva = true;
    this.ultimaAnaliseSincronizada = null;
  }

  /**
   * Coleta todos os dados médicos do paciente para análise
   */
  coletarDadosMedicos() {
    return {
      paciente: localStorage.getItem("nome-paciente") || "Paciente",
      sinaisVitais: dados.sinaisVitais.slice(-10),
      medicamentos: dados.medicamentos,
      consultas: dados.consultas,
      preenchimentoSaude: dados.preenchimentoSaude.slice(-5),
      ultimoPreenchimento: dados.preenchimentoSaude[dados.preenchimentoSaude.length - 1] || null,
    };
  }

  /**
   * Sincroniza automaticamente a IA com os cards de saúde
   */
  sincronizarComCards() {
    const dadosMedicos = this.coletarDadosMedicos();

    const avisosSinaisVitais = this.analisarSinaisVitais(dadosMedicos.sinaisVitais);
    const insightsSaude = this.sincronizarPreenchimentoComVitais(
      dadosMedicos.ultimoPreenchimento,
      dadosMedicos.sinaisVitais
    );
    const avisosMedicamentos = this.analisarMedicamentos(
      dadosMedicos.medicamentos,
      dadosMedicos.ultimoPreenchimento
    );
    const sugestoes = this.sugerirConsultasRelevantes(
      dadosMedicos.consultas,
      dadosMedicos.ultimoPreenchimento,
      dadosMedicos.sinaisVitais
    );

    this.ultimaAnaliseSincronizada = {
      timestamp: new Date().toLocaleString("pt-BR"),
      avisosSinaisVitais,
      insightsSaude,
      avisosMedicamentos,
      sugestoes,
      dados: dadosMedicos,
    };

    return this.ultimaAnaliseSincronizada;
  }

  /**
   * Analisa sinais vitais e detecta padrões anormais
   */
  analisarSinaisVitais(sinaisVitais) {
    const avisos = [];
    if (sinaisVitais.length === 0) return avisos;

    const ultimo = sinaisVitais[sinaisVitais.length - 1];
    const [pressaoSis, pressaoDias] = ultimo.pressao.split("/").map(Number);
    const cardiaco = Number(ultimo.cardiaco);
    const oxigenacao = Number(ultimo.oxigenacao);

    if (pressaoSis > 140 || pressaoDias > 90) {
      avisos.push({
        nivel: "ALTO",
        tipo: "Hipertensão",
        mensagem: `Pressão elevada: ${ultimo.pressao} mmHg. Monitore regularmente.`,
        recomendacao: "Reduza sódio na dieta e procure seu médico.",
      });
    } else if (pressaoSis < 90 || pressaoDias < 60) {
      avisos.push({
        nivel: "ALTO",
        tipo: "Hipotensão",
        mensagem: `Pressão baixa: ${ultimo.pressao} mmHg.`,
        recomendacao: "Aumente hidratação e consulte um médico.",
      });
    }

    if (cardiaco > 100) {
      avisos.push({
        nivel: "MÉDIO",
        tipo: "Taquicardia",
        mensagem: `Frequência cardíaca elevada: ${cardiaco} bpm.`,
        recomendacao: "Descanse e respire profundamente.",
      });
    } else if (cardiaco < 60) {
      avisos.push({
        nivel: "MÉDIO",
        tipo: "Bradicardia",
        mensagem: `Frequência cardíaca baixa: ${cardiaco} bpm.`,
        recomendacao: "Monitore e consulte um cardiologista.",
      });
    }

    if (oxigenacao < 92) {
      avisos.push({
        nivel: "CRÍTICO",
        tipo: "Hipoxemia",
        mensagem: `Saturação CRÍTICA: ${oxigenacao}%!`,
        recomendacao: "PROCURE ATENDIMENTO MÉDICO IMEDIATAMENTE!",
      });
    } else if (oxigenacao < 95) {
      avisos.push({
        nivel: "ALTO",
        tipo: "Oxigenação Baixa",
        mensagem: `Oxigenação reduzida: ${oxigenacao}%.`,
        recomendacao: "Monitore sua respiração.",
      });
    }

    return avisos;
  }

  /**
   * Sincroniza dados do Preenchimento de Saúde com Sinais Vitais
   */
  sincronizarPreenchimentoComVitais(preenchimento, sinaisVitais) {
    if (!preenchimento || sinaisVitais.length === 0) return null;

    const insights = { timestamp: new Date().toLocaleString("pt-BR"), relacoes: [] };
    const ultimo = sinaisVitais[sinaisVitais.length - 1];
    const cardiaco = Number(ultimo.cardiaco);

    if (preenchimento.dor > 5 && cardiaco > 85) {
      insights.relacoes.push({
        tipo: "correlacao",
        mensagem: "Sua dor e frequência cardíaca estão elevadas.",
        sugestao: "Relaxe e considere analgésico se necessário.",
      });
    }

    if (preenchimento.sono === "moderada" || preenchimento.sono === "muita") {
      if (preenchimento.sensacaoGeral === "mal" || preenchimento.sensacaoGeral === "muito-mal") {
        insights.relacoes.push({
          tipo: "correlacao",
          mensagem: "Falta de sono e mal-estar estão interligados.",
          sugestao: "Mantenha rotina consistente de sono.",
        });
      }
    }

    if (
      (preenchimento.tonturas === "leve" || preenchimento.tonturas === "moderada") &&
      ultimo.pressao
    ) {
      const [pressaoSis] = ultimo.pressao.split("/").map(Number);
      if (pressaoSis < 110) {
        insights.relacoes.push({
          tipo: "correlacao",
          mensagem: "Tonturas podem estar relacionadas à pressão baixa.",
          sugestao: "Levante-se lentamente e beba água.",
        });
      }
    }

    return insights;
  }

  /**
   * Analisa medicamentos e possíveis interações
   */
  analisarMedicamentos(medicamentos, preenchimento) {
    const avisos = [];
    if (!medicamentos || medicamentos.length === 0) return avisos;

    medicamentos.forEach((med) => {
      const nomeLower = med.nome.toLowerCase();
      if (
        (nomeLower.includes("diurético") || nomeLower.includes("furosemida")) &&
        preenchimento &&
        preenchimento.tonturas !== "nao"
      ) {
        avisos.push({
          tipo: "medicamento",
          mensagem: `${med.nome}: Diuréticos podem causar tonturas.`,
        });
      }
    });

    return avisos;
  }

  /**
   * Detecta próximas consultas relevantes
   */
  sugerirConsultasRelevantes(consultas, preenchimento, sinaisVitais) {
    const sugestoes = [];
    if (!preenchimento) return sugestoes;

    const consultasProximas = consultas
      .filter((c) => new Date(`${c.data}T${c.hora}`) > new Date())
      .sort((a, b) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`));

    if (sinaisVitais.length > 0) {
      const ultimo = sinaisVitais[sinaisVitais.length - 1];
      const cardiaco = Number(ultimo.cardiaco);
      if (cardiaco > 100 || cardiaco < 60) {
        if (!consultasProximas.some((c) => c.especialidade.toLowerCase().includes("cardiologia"))) {
          sugestoes.push({
            especialidade: "Cardiologia",
            motivo: `Frequência cardíaca anormal (${cardiaco} bpm)`,
            urgencia: "MÉDIA",
          });
        }
      }
    }

    if (preenchimento.tonturas !== "nao") {
      if (!consultasProximas.some((c) => c.especialidade.toLowerCase().includes("neurologia"))) {
        sugestoes.push({
          especialidade: "Neurologia",
          motivo: "Tonturas/vertigem relatadas",
          urgencia: "MÉDIA",
        });
      }
    }

    return sugestoes;
  }

  /**
   * Envia pergunta ao backend com contexto de saúde e histórico
   * Retorna Promise<string>
   */
  async perguntarGemini(pergunta, historico) {
    const dadosMedicos = this.coletarDadosMedicos();
    this.sincronizarComCards();

    const payload = {
      pergunta,
      dadosMedicos,
      historico: historico || [],
    };

    const resposta = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      throw new Error(erro.erro || `Erro ${resposta.status} ao contatar o servidor.`);
    }

    const json = await resposta.json();
    return json.resposta;
  }

  /**
   * Traduz valores para português
   */
  traducao(valor) {
    const traducoes = {
      "muito-bem": "Muito bem ✓",
      bem: "Bem ✓",
      neutro: "Neutro",
      mal: "Mal ✗",
      "muito-mal": "Muito mal ✗",
      nao: "Não",
      leve: "Leve",
      moderada: "Moderada",
      severa: "Severa",
      pouca: "Pouca",
      muita: "Muita",
    };
    return traducoes[valor] || valor;
  }
}

const iaMedica = new AssistenteIAMedica();
