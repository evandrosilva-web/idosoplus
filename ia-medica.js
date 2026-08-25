// --- IA MÉDICA AVANÇADA COM INTEGRAÇÃO COMPLETA DE DADOS ---

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
   * Chamado sempre que há atualização nos formulários
   */
  sincronizarComCards() {
    const dadosMedicos = this.coletarDadosMedicos();
    
    // Análise dos sinais vitais
    const avisosSinaisVitais = this.analisarSinaisVitais(dadosMedicos.sinaisVitais);
    
    // Análise do preenchimento de saúde
    const insightsSaude = this.sincronizarPreenchimentoComVitais(
      dadosMedicos.ultimoPreenchimento,
      dadosMedicos.sinaisVitais
    );
    
    // Análise de medicamentos
    const avisosMedicamentos = this.analisarMedicamentos(
      dadosMedicos.medicamentos,
      dadosMedicos.ultimoPreenchimento
    );
    
    // Sugestões de consultas
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
      dados: dadosMedicos
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

    const insights = {
      timestamp: new Date().toLocaleString("pt-BR"),
      relacoes: [],
    };

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

    if ((preenchimento.tonturas === "leve" || preenchimento.tonturas === "moderada") &&
        ultimo.pressao) {
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

      if ((nomeLower.includes("diurético") || nomeLower.includes("furosemida")) &&
          preenchimento && preenchimento.tonturas !== "nao") {
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
      .filter(c => new Date(`${c.data}T${c.hora}`) > new Date())
      .sort((a, b) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`));

    if (sinaisVitais.length > 0) {
      const ultimo = sinaisVitais[sinaisVitais.length - 1];
      const cardiaco = Number(ultimo.cardiaco);
      if (cardiaco > 100 || cardiaco < 60) {
        if (!consultasProximas.some(c => c.especialidade.toLowerCase().includes("cardiologia"))) {
          sugestoes.push({
            especialidade: "Cardiologia",
            motivo: `Frequência cardíaca anormal (${cardiaco} bpm)`,
            urgencia: "MÉDIA",
          });
        }
      }
    }

    if (preenchimento.tonturas !== "nao") {
      if (!consultasProximas.some(c => c.especialidade.toLowerCase().includes("neurologia"))) {
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
   * Gera resumo integrado de todos os dados sincronizados
   */
  gerarResumoIntegrado() {
    if (!this.ultimaAnaliseSincronizada) {
      this.sincronizarComCards();
    }

    const analise = this.ultimaAnaliseSincronizada;
    let resumo = `📋 RESUMO DE SAÚDE - ${analise.dados.paciente}\n`;
    resumo += `Atualizado em: ${analise.timestamp}\n`;
    resumo += `${'='.repeat(50)}\n\n`;

    // Sinais Vitais
    if (analise.dados.sinaisVitais.length > 0) {
      const ultimo = analise.dados.sinaisVitais[analise.dados.sinaisVitais.length - 1];
      resumo += `❤️ SINAIS VITAIS (ÚLTIMOS):\n`;
      resumo += `• Pressão: ${ultimo.pressao} mmHg\n`;
      resumo += `• Frequência Cardíaca: ${ultimo.cardiaco} bpm\n`;
      resumo += `• Oxigenação: ${ultimo.oxigenacao}%\n\n`;
    }

    // Preenchimento de Saúde
    if (analise.dados.ultimoPreenchimento) {
      const prev = analise.dados.ultimoPreenchimento;
      resumo += `📊 ESTADO DE SAÚDE:\n`;
      resumo += `• Saúde Geral: ${this.traducao(prev.sensacaoGeral)}\n`;
      resumo += `• Tonturas: ${this.traducao(prev.tonturas)}\n`;
      resumo += `• Sono: ${this.traducao(prev.sono)}\n`;
      resumo += `• Dor: ${prev.dor}/10\n`;
      if (prev.observacoes) {
        resumo += `• Observações: ${prev.observacoes}\n`;
      }
      resumo += `\n`;
    }

    // Avisos de Sinais Vitais
    if (analise.avisosSinaisVitais.length > 0) {
      resumo += `⚠️ ALERTAS DOS SINAIS VITAIS:\n`;
      analise.avisosSinaisVitais.forEach(aviso => {
        resumo += `• [${aviso.nivel}] ${aviso.tipo}: ${aviso.mensagem}\n`;
        resumo += `  → ${aviso.recomendacao}\n`;
      });
      resumo += `\n`;
    }

    // Insights de Correlação
    if (analise.insightsSaude && analise.insightsSaude.relacoes.length > 0) {
      resumo += `🔗 CORRELAÇÕES DETECTADAS:\n`;
      analise.insightsSaude.relacoes.forEach(rel => {
        resumo += `• ${rel.mensagem}\n`;
        resumo += `  → ${rel.sugestao}\n`;
      });
      resumo += `\n`;
    }

    // Avisos de Medicamentos
    if (analise.avisosMedicamentos.length > 0) {
      resumo += `💊 ATENÇÃO COM MEDICAMENTOS:\n`;
      analise.avisosMedicamentos.forEach(aviso => {
        resumo += `• ${aviso.mensagem}\n`;
      });
      resumo += `\n`;
    }

    // Medicamentos Agendados
    if (analise.dados.medicamentos.length > 0) {
      resumo += `💊 MEDICAMENTOS AGENDADOS:\n`;
      analise.dados.medicamentos.forEach((med, i) => {
        resumo += `${i + 1}. ${med.nome} (${med.dosagem}) - ${med.hora}\n`;
      });
      resumo += `\n`;
    }

    // Próximas Consultas
    if (analise.dados.consultas.length > 0) {
      const proximasConsultas = analise.dados.consultas
        .filter(c => new Date(`${c.data}T${c.hora}`) > new Date())
        .sort((a, b) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`))
        .slice(0, 3);

      if (proximasConsultas.length > 0) {
        resumo += `📅 PRÓXIMAS CONSULTAS:\n`;
        proximasConsultas.forEach((consulta, i) => {
          const data = new Date(`${consulta.data}T${consulta.hora}`).toLocaleDateString("pt-BR");
          resumo += `${i + 1}. ${consulta.especialidade} - ${data} às ${consulta.hora}\n`;
        });
        resumo += `\n`;
      }
    }

    // Sugestões de Consultas
    if (analise.sugestoes.length > 0) {
      resumo += `🏥 CONSULTAS RECOMENDADAS:\n`;
      analise.sugestoes.forEach(sugestao => {
        resumo += `• ${sugestao.especialidade} - ${sugestao.motivo} [${sugestao.urgencia}]\n`;
      });
      resumo += `\n`;
    }

    resumo += `${'='.repeat(50)}\n`;
    resumo += `Fique atento aos alertas acima!`;

    return resumo;
  }

  /**
   * Gera resposta contextualizada baseada em todos os dados
   */
  gerarRespostaContextualizada(pergunta, dadosMedicos) {
    const perguntaLower = pergunta.toLowerCase();
    let resposta = "";

    // Pergunta genérica: retorna resumo
    if (perguntaLower.includes("resumo") || perguntaLower.includes("situação") || 
        perguntaLower.includes("como vai") || perguntaLower === "status") {
      return this.gerarResumoIntegrado();
    }

    if (perguntaLower.includes("como") && perguntaLower.includes("sente")) {
      if (dadosMedicos.ultimoPreenchimento) {
        const prev = dadosMedicos.ultimoPreenchimento;
        resposta = `Baseado em seu último preenchimento:\n`;
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
    else if (perguntaLower.includes("medicamento")) {
      if (dadosMedicos.medicamentos.length === 0) {
        resposta = "Você não tem medicamentos registrados. Adicione na seção de Lembretes de Medicação.";
      } else {
        resposta = `Seus medicamentos agendados:\n`;
        dadosMedicos.medicamentos.slice(-5).forEach((med, i) => {
          resposta += `${i + 1}. ${med.nome} (${med.dosagem}) - ${med.hora}\n`;
        });
        resposta += `\nTome sempre nos horários prescritos.`;
      }
    }
    else if (perguntaLower.includes("consulta") || perguntaLower.includes("médico")) {
      const proximasConsultas = dadosMedicos.consultas
        .filter(c => new Date(`${c.data}T${c.hora}`) > new Date())
        .sort((a, b) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`))
        .slice(0, 3);

      if (proximasConsultas.length === 0) {
        resposta = "Você não tem consultas agendadas. Recomendo agendar uma consulta de rotina.";
      } else {
        resposta = `Suas próximas consultas:\n`;
        proximasConsultas.forEach((consulta, i) => {
          const data = new Date(`${consulta.data}T${consulta.hora}`).toLocaleDateString("pt-BR");
          resposta += `${i + 1}. ${consulta.especialidade} - ${data} às ${consulta.hora}\n`;
        });
      }
    }
    else if (perguntaLower.includes("pressão")) {
      if (dadosMedicos.sinaisVitais.length > 0) {
        const ultimo = dadosMedicos.sinaisVitais[dadosMedicos.sinaisVitais.length - 1];
        resposta = `Sua última pressão: ${ultimo.pressao} mmHg\n\n`;
        resposta += `Normal: 120/80 mmHg\n`;
        resposta += `Elevada: > 140/90 mmHg\n`;
        resposta += `Baixa: < 90/60 mmHg\n\n`;

        const [pressaoSis, pressaoDias] = ultimo.pressao.split("/").map(Number);
        if (pressaoSis > 140 || pressaoDias > 90) {
          resposta += `⚠️ Sua pressão está ELEVADA. Reduza sal e procure seu médico.`;
        } else if (pressaoSis < 90 || pressaoDias < 60) {
          resposta += `⚠️ Sua pressão está BAIXA. Aumente hidratação.`;
        } else {
          resposta += `✓ Sua pressão está normal. Parabéns!`;
        }
      }
    }
    else if (perguntaLower.includes("oxigênio") || perguntaLower.includes("spo2")) {
      if (dadosMedicos.sinaisVitais.length > 0) {
        const ultimo = dadosMedicos.sinaisVitais[dadosMedicos.sinaisVitais.length - 1];
        const oxigenacao = Number(ultimo.oxigenacao);
        resposta = `Sua oxigenação: ${oxigenacao}%\n\n`;
        resposta += `Normal: 95-100%\n\n`;

        if (oxigenacao < 92) {
          resposta += `🚨 CRÍTICO! Procure ATENDIMENTO MÉDICO IMEDIATAMENTE!`;
        } else if (oxigenacao < 95) {
          resposta += `⚠️ Oxigenação baixa. Monitore sua respiração.`;
        } else {
          resposta += `✓ Sua oxigenação está normal!`;
        }
      }
    }
    else if (perguntaLower.includes("dor")) {
      if (dadosMedicos.ultimoPreenchimento && dadosMedicos.ultimoPreenchimento.dor > 0) {
        resposta = `Você relatou dor nível ${dadosMedicos.ultimoPreenchimento.dor}/10\n\n`;
        resposta += `Leve (0-3): Gerenciável em casa\n`;
        resposta += `Moderada (4-6): Considere analgésico\n`;
        resposta += `Severa (7-10): Procure médico\n\n`;

        if (dadosMedicos.ultimoPreenchimento.dor >= 7) {
          resposta += `Sua dor está severa. Recomendo procurar um médico.`;
        } else if (dadosMedicos.ultimoPreenchimento.dor >= 4) {
          resposta += `Considere tomar um analgésico e descansar.`;
        }
      }
    }
    else {
      resposta = `Pergunte-me sobre:\n`;
      resposta += `• Status geral / Resumo\n`;
      resposta += `• Como você se sente?\n`;
      resposta += `• Seus medicamentos\n`;
      resposta += `• Pressão, frequência cardíaca ou oxigenação\n`;
      resposta += `• Sua dor\n`;
      resposta += `• Próximas consultas\n\n`;
      resposta += `Estou aqui para ajudar!`;
    }

    return resposta;
  }

  /**
   * Traduz valores para português
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
}

const iaMedica = new AssistenteIAMedica();
