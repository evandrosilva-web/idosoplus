// --- IA MÉDICA AVANÇADA COM INTEGRAÇÃO DE DADOS ---

class AssistenteIAMedica {
  constructor() {
    this.historico = [];
    this.avisos = [];
    this.analiseAtiva = true;
  }

  /**
   * Coleta todos os dados médicos do paciente para análise
   */
  coletarDadosMedicos() {
    return {
      paciente: localStorage.getItem("nome-paciente") || "Paciente",
      sinaisVitais: dados.sinaisVitais.slice(-10), // Últimos 10 registros
      medicamentos: dados.medicamentos,
      consultas: dados.consultas,
      preenchimentoSaude: dados.preenchimentoSaude.slice(-5), // Últimos 5 registros
      ultimoPreenchimento: dados.preenchimentoSaude[dados.preenchimentoSaude.length - 1] || null,
    };
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

    // Verificar Pressão Arterial
    if (pressaoSis > 140 || pressaoDias > 90) {
      avisos.push({
        nivel: "ALTO",
        tipo: "Hipertensão",
        mensagem: `Pressão elevada detectada: ${ultimo.pressao} mmHg. Monitore regularmente.`,
        recomendacao: "Consulte um médico se persistir. Reduza sódio na dieta.",
      });
    } else if (pressaoSis < 90 || pressaoDias < 60) {
      avisos.push({
        nivel: "ALTO",
        tipo: "Hipotensão",
        mensagem: `Pressão baixa detectada: ${ultimo.pressao} mmHg.`,
        recomendacao: "Aumentar ingestão de líquidos e sal. Procure um médico.",
      });
    }

    // Verificar Frequência Cardíaca
    if (cardiaco > 100) {
      avisos.push({
        nivel: "MÉDIO",
        tipo: "Taquicardia",
        mensagem: `Frequência cardíaca elevada: ${cardiaco} bpm.`,
        recomendacao: "Descanse e respire profundamente. Se persistir, consulte um médico.",
      });
    } else if (cardiaco < 60) {
      avisos.push({
        nivel: "MÉDIO",
        tipo: "Bradicardia",
        mensagem: `Frequência cardíaca baixa: ${cardiaco} bpm.`,
        recomendacao: "Monitore e consulte um cardiologista se necessário.",
      });
    }

    // Verificar Oxigenação
    if (oxigenacao < 92) {
      avisos.push({
        nivel: "CRÍTICO",
        tipo: "Hipoxemia",
        mensagem: `Saturação de oxigênio baixa: ${oxigenacao}%. CRÍTICO!`,
        recomendacao: "Procure atendimento médico IMEDIATAMENTE.",
      });
    } else if (oxigenacao < 95) {
      avisos.push({
        nivel: "ALTO",
        tipo: "Oxigenação Baixa",
        mensagem: `Oxigenação reduzida: ${oxigenacao}%.`,
        recomendacao: "Monitore respiração. Consulte um médico se piorar.",
      });
    }

    return avisos;
  }

  /**
   * Sincroniza dados do Preenchimento de Saúde com Sinais Vitais
   */
  sincronizarPreenchimentoComVitais(preenchimento, sinaisVitais) {
    if (!preenchimento || sinaisVitais.length === 0) return null;

    const insights = {
      timestamp: new Date().toLocaleString("pt-BR"),
      relacoes: [],
    };

    const ultimo = sinaisVitais[sinaisVitais.length - 1];
    const cardiaco = Number(ultimo.cardiaco);

    // Correlação: Dor e Frequência Cardíaca
    if (preenchimento.dor > 5 && cardiaco > 85) {
      insights.relacoes.push({
        tipo: "correlacao",
        mensagem: "Sua dor e frequência cardíaca estão elevadas. Isso pode estar relacionado.",
        sugestao: "Relaxe, respire profundamente e considere analgésico se necessário.",
      });
    }

    // Correlação: Sono ruim e mal-estar
    if (preenchimento.sono === "moderada" || preenchimento.sono === "muita") {
      if (preenchimento.sensacaoGeral === "mal" || preenchimento.sensacaoGeral === "muito-mal") {
        insights.relacoes.push({
          tipo: "correlacao",
          mensagem: "Falta de sono e mal-estar estão interligados.",
          sugestao: "Tente manter uma rotina de sono consistente. Consulte um médico se persistir.",
        });
      }
    }

    // Correlação: Tonturas e pressão baixa
    if ((preenchimento.tonturas === "leve" || preenchimento.tonturas === "moderada") &&
        ultimo.pressao) {
      const [pressaoSis] = ultimo.pressao.split("/").map(Number);
      if (pressaoSis < 110) {
        insights.relacoes.push({
          tipo: "correlacao",
          mensagem: "Suas tonturas podem estar relacionadas à pressão arterial baixa.",
          sugestao: "Levante-se lentamente. Beba água. Consulte seu médico.",
        });
      }
    }

    return insights;
  }

  /**
   * Analisa medicamentos e possíveis interações com sintomas
   */
  analisarMedicamentos(medicamentos, preenchimento) {
    const avisos = [];

    if (!medicamentos || medicamentos.length === 0) return avisos;

    medicamentos.forEach((med) => {
      const nomeLower = med.nome.toLowerCase();

      // Diuréticos e pressão baixa
      if ((nomeLower.includes("diurético") || nomeLower.includes("furosemida")) &&
          preenchimento && preenchimento.tonturas !== "nao") {
        avisos.push({
          tipo: "medicamento",
          mensagem: `${med.nome}: Diuréticos podem causar tonturas. Monitore sua pressão.`,
        });
      }

      // Analgésicos e frequência de uso
      if ((nomeLower.includes("dipirona") || nomeLower.includes("paracetamol")) &&
          medicamentos.filter(m => m.nome.toLowerCase() === nomeLower).length > 2) {
        avisos.push({
          tipo: "medicamento",
          mensagem: `Atenção: ${med.nome} aparece múltiplas vezes. Evite sobredose.`,
        });
      }
    });

    return avisos;
  }

  /**
   * Detecta próximas consultas relevantes baseado nos sintomas
   */
  sugerirConsultasRelevantes(consultas, preenchimento, sinaisVitais) {
    const sugestoes = [];

    if (!preenchimento) return sugestoes;

    const consultasProximas = consultas
      .filter(c => new Date(`${c.data}T${c.hora}`) > new Date())
      .sort((a, b) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`));

    // Sugerir consulta com cardiologista
    if (sinaisVitais.length > 0) {
      const ultimo = sinaisVitais[sinaisVitais.length - 1];
      const cardiaco = Number(ultimo.cardiaco);
      if (cardiaco > 100 || cardiaco < 60) {
        if (!consultasProximas.some(c => c.especialidade.toLowerCase().includes("cardiologia"))) {
          sugestoes.push({
            especialidade: "Cardiologia",
            motivo: `Frequência cardíaca anormal detectada (${cardiaco} bpm)`,
            urgencia: "MÉDIA",
          });
        }
      }
    }

    // Sugerir consulta com neurologista
    if (preenchimento.tonturas !== "nao") {
      if (!consultasProximas.some(c => c.especialidade.toLowerCase().includes("neurologia"))) {
        sugestoes.push({
          especialidade: "Neurologia",
          motivo: "Tonturas/vertigem relatadas",
          urgencia: "MÉDIA",
        });
      }
    }

    // Sugerir psicólogo/psiquiatra
    if (preenchimento.sono === "muita" || preenchimento.sensacaoGeral === "muito-mal") {
      if (!consultasProximas.some(c => c.especialidade.toLowerCase().includes("psicolog"))) {
        sugestoes.push({
          especialidade: "Psicologia/Psiquiatria",
          motivo: "Possíveis questões emocionais/sono afetado",
          urgencia: "BAIXA",
        });
      }
    }

    return sugestoes;
  }

  /**
   * Gera resposta contextualizada da IA baseada em todos os dados
   */
  gerarRespostaContextualizada(pergunta, dadosMedicos) {
    const perguntaLower = pergunta.toLowerCase();
    let resposta = "";
    let tempoProcessamento = 500;

    // Contexto: Como você se sente / Saúde Geral
    if (perguntaLower.includes("como") && perguntaLower.includes("sente")) {
      if (dadosMedicos.ultimoPreenchimento) {
        const prev = dadosMedicos.ultimoPreenchimento;
        resposta = `Baseado em seu último preenchimento de saúde:\n`;
        resposta += `• Saúde Geral: ${this.traducao(prev.sensacaoGeral)}\n`;
        resposta += `• Tonturas: ${this.traducao(prev.tonturas)}\n`;
        resposta += `• Dor: ${prev.dor}/10\n`;

        if (dadosMedicos.sinaisVitais.length > 0) {
          const ultimo = dadosMedicos.sinaisVitais[dadosMedicos.sinaisVitais.length - 1];
          resposta += `\nÚltimos Sinais Vitais:\n`;
          resposta += `• Pressão: ${ultimo.pressao} mmHg\n`;
          resposta += `• Frequência Cardíaca: ${ultimo.cardiaco} bpm\n`;
          resposta += `• Oxigenação: ${ultimo.oxigenacao}%`;
        }
      }
    }
    // Contexto: Medicamentos
    else if (perguntaLower.includes("medicamento")) {
      if (dadosMedicos.medicamentos.length === 0) {
        resposta = "Você não tem medicamentos registrados. Se toma algum, adicione à seção de Lembretes de Medicação.";
      } else {
        resposta = `Seus medicamentos agendados:\n`;
        dadosMedicos.medicamentos.slice(-5).forEach((med, i) => {
          resposta += `${i + 1}. ${med.nome} (${med.dosagem}) - ${med.hora}\n`;
        });
        resposta += `\nLembre-se: Tome sempre nos horários prescritos e não falte doses.`;
      }
    }
    // Contexto: Próximas Consultas
    else if (perguntaLower.includes("consulta") || perguntaLower.includes("médico")) {
      const proximasConsultas = dadosMedicos.consultas
        .filter(c => new Date(`${c.data}T${c.hora}`) > new Date())
        .sort((a, b) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`))
        .slice(0, 3);

      if (proximasConsultas.length === 0) {
        resposta = "Você não tem consultas agendadas. Recomendo agendar uma consulta de rotina com seu médico.";
      } else {
        resposta = `Suas próximas consultas:\n`;
        proximasConsultas.forEach((consulta, i) => {
          const data = new Date(`${consulta.data}T${consulta.hora}`).toLocaleDateString("pt-BR");
          resposta += `${i + 1}. ${consulta.especialidade} - ${data} às ${consulta.hora}\n`;
        });
      }
    }
    // Contexto: Pressão Arterial
    else if (perguntaLower.includes("pressão")) {
      if (dadosMedicos.sinaisVitais.length > 0) {
        const ultimo = dadosMedicos.sinaisVitais[dadosMedicos.sinaisVitais.length - 1];
        resposta = `Sua última pressão registrada: ${ultimo.pressao} mmHg\n\n`;
        resposta += `Referência Normal: 120/80 mmHg\n`;
        resposta += `Pressão elevada: > 140/90 mmHg\n`;
        resposta += `Pressão baixa: < 90/60 mmHg\n\n`;

        const [pressaoSis, pressaoDias] = ultimo.pressao.split("/").map(Number);
        if (pressaoSis > 140 || pressaoDias > 90) {
          resposta += `⚠️ Sua pressão está ELEVADA. Reduza sal, estresse e procure seu médico.`;
        } else if (pressaoSis < 90 || pressaoDias < 60) {
          resposta += `⚠️ Sua pressão está BAIXA. Aumente hidratação e consulte seu médico.`;
        } else {
          resposta += `✓ Sua pressão está dentro dos limites normais. Parabéns!`;
        }
      } else {
        resposta = "Você ainda não registrou dados de pressão arterial. Use o card de Sinais Vitais para adicionar.";
      }
    }
    // Contexto: Frequência Cardíaca
    else if (perguntaLower.includes("cardía") || perguntaLower.includes("coração") || perguntaLower.includes("bpm")) {
      if (dadosMedicos.sinaisVitais.length > 0) {
        const ultimo = dadosMedicos.sinaisVitais[dadosMedicos.sinaisVitais.length - 1];
        const cardiaco = Number(ultimo.cardiaco);
        resposta = `Sua última frequência cardíaca: ${cardiaco} bpm\n\n`;
        resposta += `Normal em repouso: 60-100 bpm\n\n`;

        if (cardiaco > 100) {
          resposta += `⚠️ Frequência elevada. Procure descansar e respirar profundamente.`;
        } else if (cardiaco < 60) {
          resposta += `⚠️ Frequência baixa. Monitore e consulte um cardiologista se persistir.`;
        } else {
          resposta += `✓ Sua frequência está normal. Ótimo!`;
        }
      }
    }
    // Contexto: Oxigenação
    else if (perguntaLower.includes("oxigênio") || perguntaLower.includes("spo2")) {
      if (dadosMedicos.sinaisVitais.length > 0) {
        const ultimo = dadosMedicos.sinaisVitais[dadosMedicos.sinaisVitais.length - 1];
        const oxigenacao = Number(ultimo.oxigenacao);
        resposta = `Sua última oxigenação (SpO₂): ${oxigenacao}%\n\n`;
        resposta += `Normal: 95-100%\n\n`;

        if (oxigenacao < 92) {
          resposta += `🚨 CRÍTICO! Sua oxigenação está muito baixa. PROCURE ATENDIMENTO MÉDICO IMEDIATAMENTE!`;
        } else if (oxigenacao < 95) {
          resposta += `⚠️ Sua oxigenação está um pouco baixa. Monitore sua respiração.`;
        } else {
          resposta += `✓ Sua oxigenação está normal. Tudo bem!`;
        }
      }
    }
    // Contexto: Dor
    else if (perguntaLower.includes("dor")) {
      if (dadosMedicos.ultimoPreenchimento && dadosMedicos.ultimoPreenchimento.dor > 0) {
        resposta = `Você relatou dor nível ${dadosMedicos.ultimoPreenchimento.dor}/10\n\n`;
        resposta += `Dor leve (0-3): Pode gerenciar em casa\n`;
        resposta += `Dor moderada (4-6): Considere analgésico\n`;
        resposta += `Dor severa (7-10): Procure atendimento médico\n\n`;

        if (dadosMedicos.ultimoPreenchimento.dor >= 7) {
          resposta += `Sua dor está severa. Recomendo procurar um médico.`;
        } else if (dadosMedicos.ultimoPreenchimento.dor >= 4) {
          resposta += `Considere tomar um analgésico e descansar.`;
        }
      } else {
        resposta = "Registre seu nível de dor no formulário de Preenchimento de Saúde para receber orientações.";
      }
    }
    // Respostas padrão para outros tópicos
    else if (perguntaLower.includes("ajuda")) {
      resposta = `Sou seu Assistente de Saúde IA. Posso ajudar com:\n`;
      resposta += `• Como você se sente?\n`;
      resposta += `• Seus medicamentos\n`;
      resposta += `• Próximas consultas\n`;
      resposta += `• Pressão arterial\n`;
      resposta += `• Frequência cardíaca\n`;
      resposta += `• Oxigenação\n`;
      resposta += `• Sua dor\n`;
      resposta += `• Saúde geral\n\n`;
      resposta += `Pergunte-me sobre qualquer desses tópicos!`;
    } else {
      resposta = `Desculpe, não entendi completamente sua pergunta.\n\n`;
      resposta += `Pergunte-me sobre:\n`;
      resposta += `• Como você se sente?\n`;
      resposta += `• Seus medicamentos\n`;
      resposta += `• Pressão, frequência cardíaca ou oxigenação\n`;
      resposta += `• Sua dor\n`;
      resposta += `• Próximas consultas\n\n`;
      resposta += `Estou aqui para ajudar!`;
      tempoProcessamento = 300;
    }

    return { resposta, tempoProcessamento };
  }

  /**
   * Função auxiliar para traduzir valores para português
   */
  traducao(valor) {
    const traducoes = {
      "muito-bem": "Muito bem ✓",
      "bem": "Bem ✓",
      "neutro": "Neutro",
      "mal": "Mal ✗",
      "muito-mal": "Muito mal ✗",
      "nao": "Não",
      "leve": "Leve",
      "moderada": "Moderada",
      "severa": "Severa",
      "pouca": "Pouca",
      "muita": "Muita",
    };
    return traducoes[valor] || valor;
  }

  /**
   * Gera relatório completo de saúde
   */
  gerarRelatorioSaude(dadosMedicos) {
    let relatorio = `📋 RELATÓRIO DE SAÚDE - ${dadosMedicos.paciente}\n`;
    relatorio += `Gerado em: ${new Date().toLocaleString("pt-BR")}\n\n`;

    // Sinais Vitais
    if (dadosMedicos.sinaisVitais.length > 0) {
      const ultimo = dadosMedicos.sinaisVitais[dadosMedicos.sinaisVitais.length - 1];
      relatorio += `💓 ÚLTIMOS SINAIS VITAIS:\n`;
      relatorio += `  • Pressão: ${ultimo.pressao} mmHg\n`;
      relatorio += `  • Frequência: ${ultimo.cardiaco} bpm\n`;
      relatorio += `  • Oxigenação: ${ultimo.oxigenacao}%\n\n`;
    }

    // Preenchimento de Saúde
    if (dadosMedicos.ultimoPreenchimento) {
      const prev = dadosMedicos.ultimoPreenchimento;
      relatorio += `😊 STATUS DE SAÚDE:\n`;
      relatorio += `  • Sensação: ${this.traducao(prev.sensacaoGeral)}\n`;
      relatorio += `  • Tonturas: ${this.traducao(prev.tonturas)}\n`;
      relatorio += `  • Sono: ${this.traducao(prev.sono)}\n`;
      relatorio += `  • Dor: ${prev.dor}/10\n`;
      if (prev.observacoes) {
        relatorio += `  • Obs: ${prev.observacoes}\n`;
      }
      relatorio += `\n`;
    }

    // Medicamentos
    if (dadosMedicos.medicamentos.length > 0) {
      relatorio += `💊 MEDICAMENTOS (${dadosMedicos.medicamentos.length}):\n`;
      dadosMedicos.medicamentos.forEach((med) => {
        relatorio += `  • ${med.nome} (${med.dosagem}) - ${med.hora}\n`;
      });
      relatorio += `\n`;
    }

    // Próximas Consultas
    if (dadosMedicos.consultas.length > 0) {
      const proximasConsultas = dadosMedicos.consultas
        .filter(c => new Date(`${c.data}T${c.hora}`) > new Date())
        .slice(0, 3);

      if (proximasConsultas.length > 0) {
        relatorio += `📅 PRÓXIMAS CONSULTAS:\n`;
        proximasConsultas.forEach((consulta) => {
          const data = new Date(`${consulta.data}T${consulta.hora}`).toLocaleDateString("pt-BR");
          relatorio += `  • ${consulta.especialidade} - ${data} às ${consulta.hora}\n`;
        });
      }
    }

    return relatorio;
  }
}

// Instância global da IA Médica
const iaMedica = new AssistenteIAMedica();
